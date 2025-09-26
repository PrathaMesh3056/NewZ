from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from deep_translator import GoogleTranslator
from gtts import gTTS
from dotenv import load_dotenv
from pydantic import BaseModel
from pymilvus import Collection
import os, requests, json, logging, io, re
import google.generativeai as genai
from datetime import datetime, timedelta
from typing import Optional

from Milvus import (
    create_milvus_collection_if_not_exists,
    search_similar_articles,
    insert_articles
)

load_dotenv()

# --- Config ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
REACT_BUILD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

LANGUAGE_MAP = {
    'en': 'English',
    'hi': 'Hindi',
    'mr': 'Marathi',
    'es': 'Spanish',
    'fr': 'French'
}

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

logger = logging.getLogger("uvicorn")

app = FastAPI(
    title="News API",
    description="A news API service with summarization, translation, and RAG search",
    version="2.0.0",
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Pydantic Models ---
class TranslationRequest(BaseModel):
    texts: list[str]
    targetLang: str

class SummaryRequest(BaseModel):
    text: str
    language: str = "en"

class TTSRequest(BaseModel):
    title: str = ""
    summary: str = ""
    language: str = "en"

class RAGSearchRequest(BaseModel):
    query: str

# --- Helper Functions ---
def process_articles_for_indexing(news_data):
    articles_to_index = []
    if news_data and "articles" in news_data:
        for article_data in news_data["articles"]:
            content = article_data.get("content") or article_data.get("description")
            if not content:
                continue
            if "[+" in content:
                content = content.split("[+")[0].strip()
            articles_to_index.append({
                "title": article_data.get("title", "No Title"),
                "article_text": content,
                "source_url": article_data.get("url"),
                "author": article_data.get("author") or "Unknown",
                "published_at": article_data.get("publishedAt") or "Unknown",
                "source_name": article_data.get("source", {}).get("name", "Unknown"),
                "category": article_data.get("category", "general")
            })
    return articles_to_index

# --- NEW: Refactored logic for fetching and indexing news ---
def fetch_and_index_news(background_tasks: BackgroundTasks, category: str = "general", country: Optional[str] = None, lang: Optional[str] = 'en'):
    if not NEWS_API_KEY:
        raise HTTPException(status_code=500, detail="NEWS_API_KEY is not configured.")
    api_params = {"apiKey": NEWS_API_KEY, "category": category}
    if country:
        api_params['country'] = country
    if lang:
        api_params['language'] = lang
    
    try:
        response = requests.get("https://newsapi.org/v2/top-headlines", params=api_params)
        response.raise_for_status()
        news_data = response.json()
        articles_to_index = process_articles_for_indexing(news_data)
        if articles_to_index:
            background_tasks.add_task(insert_articles, articles_to_index)
            logger.info(f"Queued {len(articles_to_index)} articles from '{category}' for background indexing.")
        return news_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch news from NewsAPI: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch news from the provider.")

# --- Startup ---
@app.on_event("startup")
async def startup_event():
    logger.info("=== FastAPI App Starting ===")
    try:
        create_milvus_collection_if_not_exists()
    except Exception as e:
        logger.error(f"Startup init failed: {e}")
    logger.info("Application startup complete.")

# --- API Routes ---
@app.post("/api/translate")
async def translate_texts(request_data: TranslationRequest):
    try:
        translator = GoogleTranslator(source='auto', target=request_data.targetLang)
        translated_texts = translator.translate_batch(request_data.texts)
        final_translations = [t if t else original for t, original in zip(translated_texts, request_data.texts)]
        return {"translations": final_translations}
    except Exception as e:
        logger.error(f"Translation API error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# --- NEW ENDPOINT: Dedicated endpoint for triggering indexing ---
@app.post("/api/trigger-indexing")
async def trigger_indexing(background_tasks: BackgroundTasks):
    try:
        # You can customize this, e.g., fetch from multiple categories
        fetch_and_index_news(background_tasks, category="general", country="us")
        return {"message": "Article indexing process started successfully."}
    except Exception as e:
        logger.error(f"Failed to trigger indexing: {e}")
        # Check if the exception is an HTTPException and re-raise it
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to trigger indexing.")

@app.get("/api/news")
def get_news(
    background_tasks: BackgroundTasks,
    category: str = "general",
    page: int = 1,
    pageSize: int = 8,
    country: Optional[str] = None,
    lang: Optional[str] = 'en'
):
    # This endpoint now uses the refactored function
    news_data = fetch_and_index_news(background_tasks, category, country, lang)
    
    # Pagination is handled here, after fetching
    articles = news_data.get("articles", [])
    start = (page - 1) * pageSize
    end = start + pageSize
    paginated_articles = articles[start:end]

    return {
        "articles": paginated_articles,
        "totalResults": news_data.get("totalResults", 0)
    }

@app.post("/api/summary")
async def summarize(request_data: SummaryRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    if not request_data.text:
        return {"summary": "No text provided"}

    language_name = LANGUAGE_MAP.get(request_data.language, 'English')

    prompt = (
        f"You are an expert news analyst. Analyze the following article and return a single, valid JSON object. "
        f"The content/values in the JSON MUST be in {language_name}. "
        "The keys of the JSON object MUST be in English and use camelCase.\n\n"
        "Required keys: summary, background, sentiment, bias, confidence, readTime, context, relevance, nextSteps, wordCount.\n\n"
        f"Article Text: \"{request_data.text}\""
    )
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        gemini_response = model.generate_content(prompt)
        summary_text = gemini_response.text.strip()
        
        json_match = re.search(r'\{.*\}', summary_text, re.DOTALL)
        
        if not json_match:
            logger.error(f"Gemini response did not contain valid JSON. Full response: '{summary_text}'")
            raise ValueError(f"The AI model did not return a valid summary. Response: {summary_text}")
            
        return json.loads(json_match.group(0))

    except ValueError as ve:
        logger.error(f"Summarization ValueError: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
        
    except Exception as e:
        logger.error(f"Generic Summarization error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the summary.")

@app.post("/api/tts")
async def text_to_speech(request_data: TTSRequest):
    try:
        if not request_data.title and not request_data.summary:
            raise HTTPException(status_code=400, detail="No title or summary provided")
        speech_text = f"Headline: {request_data.title}. Summary: {request_data.summary}"
        mp3_fp = io.BytesIO()
        gTTS(text=speech_text, lang=request_data.language).write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.post("/api/rag-search")
async def rag_search(request_data: RAGSearchRequest):
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")

        query = request_data.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")

        search_expr = None
        clean_query = query.lower()
        
        if "past month" in clean_query:
            one_month_ago = datetime.now() - timedelta(days=30)
            search_expr = f"published_at >= '{one_month_ago.isoformat()}'"
            clean_query = clean_query.replace("past month", "").strip()
        elif "past week" in clean_query:
            one_week_ago = datetime.now() - timedelta(days=7)
            search_expr = f"published_at >= '{one_week_ago.isoformat()}'"
            clean_query = clean_query.replace("past week", "").strip()

        if not clean_query:
             clean_query = request_data.query.strip()
        
        retrieved_articles = search_similar_articles(clean_query, top_k=5, expr=search_expr)

        if not retrieved_articles:
            return {"answer": "I cannot find relevant articles matching your criteria.", "sources": []}

        unique_articles = {a.get('url', f"no_url_{i}"): a for i, a in enumerate(retrieved_articles)}.values()

        context = "\n\n".join([
            f"{a.get('title', 'No Title')}: {a.get('content', a.get('description', 'No content'))}"
            for a in unique_articles
        ])

        if not context.strip():
            return {"answer": "Retrieved articles do not have content.", "sources": list(unique_articles)}

        prompt = f"Answer the question based only on the following context. If the context is not sufficient, say so.\n\nContext:\n{context}\n\nQuestion: {request_data.query}\nAnswer:"

        model = genai.GenerativeModel('gemini-2.0-flash')
        answer = model.generate_content(prompt).text.strip()

        return {"answer": answer, "sources": list(unique_articles)}

    except Exception as e:
        logger.error(f"RAG search failed: {e}")
        return {
            "answer": "An error occurred during the search. Please try again.",
            "sources": [],
            "error": str(e)
        }

@app.get("/api/debug-count")
def debug_count():
    try:
        collection = Collection("news_articles")
        collection.load()
        return {"row_count": collection.num_entities}
    except Exception as e:
        return {"error": str(e)}

# --- React Frontend Serving ---
# app.mount("/assets", StaticFiles(directory=os.path.join(REACT_BUILD_DIR, "assets")), name="assets")

# @app.get("/{full_path:path}")
# def serve_react_routes(full_path: str):
#     if full_path.startswith("api/"):
#         raise HTTPException(status_code=404, detail="API route not found")
#     file_path = os.path.join(REACT_BUILD_DIR, full_path)
#     if os.path.isfile(file_path):
#         return FileResponse(file_path)
#     return FileResponse(os.path.join(REACT_BUILD_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)