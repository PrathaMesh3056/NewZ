import os
import logging
from functools import lru_cache
from sentence_transformers import SentenceTransformer
from pymilvus import connections, utility, Collection, FieldSchema, CollectionSchema, DataType

logger = logging.getLogger("uvicorn")

# --- MODIFIED: Read Zilliz Cloud credentials from environment variables ---
MILVUS_URI = os.getenv("MILVUS_URI")
MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")
# --- End of Modification ---

COLLECTION_NAME = "news_articles"
embedding_dimension = 384


@lru_cache(maxsize=1)
def get_embedding_model():
    """Loads and returns the sentence-transformer model."""
    logger.info("Loading sentence-transformer model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Embedding model loaded successfully.")
    return model

# --- MODIFIED: This function now connects to Zilliz Cloud ---
def get_milvus_connection():
    """Establishes a connection to Milvus if one doesn't exist."""
    if not connections.has_connection("default"):
        logger.info(f"Connecting to Milvus at {MILVUS_URI}...")
        if not MILVUS_URI or not MILVUS_TOKEN:
            logger.error("FATAL: MILVUS_URI and MILVUS_TOKEN environment variables must be set.")
            raise ValueError("Milvus credentials are not configured on the server.")
        
        connections.connect("default", uri=MILVUS_URI, token=MILVUS_TOKEN)
        logger.info("Successfully connected to Milvus.")
# --- End of Modification ---


def create_milvus_collection_if_not_exists():
    """Checks if the collection exists and creates it if it doesn't."""
    get_milvus_connection()
    if not utility.has_collection(COLLECTION_NAME):
        logger.info(f"Collection '{COLLECTION_NAME}' not found. Creating new collection...")

        fields = [
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
            FieldSchema(name="article_text", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="source_url", dtype=DataType.VARCHAR, max_length=1024, is_primary=True),
            FieldSchema(name="author", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="published_at", dtype=DataType.VARCHAR, max_length=64),
            FieldSchema(name="source_name", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384)
        ]
        schema = CollectionSchema(fields, description="A collection for storing news article embeddings", primary_field="source_url")

        collection = Collection(name=COLLECTION_NAME, schema=schema)
        index_params = {
            "metric_type": "L2",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
        collection.create_index(field_name="embedding", index_params=index_params)
        logger.info(f"Collection '{COLLECTION_NAME}' created and indexed successfully.")
    else:
        logger.info(f"Collection '{COLLECTION_NAME}' already exists.")

    collection = Collection(name=COLLECTION_NAME)
    collection.load()
    return collection


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generates vector embeddings for a list of texts."""
    model = get_embedding_model()
    return model.encode(texts, convert_to_tensor=False).tolist()

def insert_articles(articles: list[dict]):
    """
    Inserts a batch of articles into the Milvus collection.
    Each article must be a dict with keys: title, article_text, source_url.
    Embeddings will be generated automatically.
    """
    if not articles:
        logger.warning("No articles provided for insertion.")
        return

    collection = create_milvus_collection_if_not_exists()

    texts = [item["article_text"] for item in articles]
    embeddings = generate_embeddings(texts)
 
    entities = [
        {
            "title": item.get("title", "No Title"),
            "article_text": item.get("article_text"),
            "source_url": item.get("source_url"),
            "author": item.get("author", "Unknown"),
            "published_at": item.get("published_at", ""),
            "source_name": item.get("source_name", "Unknown"),
            "embedding": emb
        }
        for item, emb in zip(articles, embeddings)
    ]

    try:
        collection.upsert(entities)
        collection.flush()
        logger.info(f"Upserted {len(articles)} articles into Milvus.")
    except Exception as e:
        logger.error(f"Failed to upsert articles into Milvus: {e}")


def search_similar_articles(query_text: str, top_k: int = 3, expr: str = None) -> list:
    """Searches Milvus for articles similar to the query text with an optional filter."""
    collection = Collection(name=COLLECTION_NAME)
    collection.load()
    query_embedding = generate_embeddings([query_text])[0]

    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}

    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        expr=expr,
        output_fields=["title", "article_text", "source_url", "published_at"]
    )

    retrieved_articles = []
    for hit in results[0]:
        retrieved_articles.append({
            "title": hit.entity.get('title'),
            "content": hit.entity.get('article_text'),
            "url": hit.entity.get('source_url'),
            "published_at": hit.entity.get('published_at'),
            "similarity_score": hit.distance
        })
    return retrieved_articles