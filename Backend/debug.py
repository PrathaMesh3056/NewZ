from pymilvus import utility

@app.get("/api/debug-count")
def debug_count():
    return {"stats": utility.get_collection_stats("news_articles")}
