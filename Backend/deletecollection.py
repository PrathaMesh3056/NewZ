from pymilvus import utility, connections

# --- Configuration ---
MILVUS_HOST = "localhost"
MILVUS_PORT = "19530"
COLLECTION_NAME = "news_articles"

# --- Main script ---
try:
    print(f"Connecting to Milvus at {MILVUS_HOST}:{MILVUS_PORT}...")
    connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
    print("Successfully connected to Milvus.")

    if utility.has_collection(COLLECTION_NAME):
        print(f"Found collection '{COLLECTION_NAME}'. Proceeding to delete...")
        utility.drop_collection(COLLECTION_NAME)
        print(f"Successfully deleted collection '{COLLECTION_NAME}'.")
    else:
        print(f"Collection '{COLLECTION_NAME}' does not exist. No action needed.")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    connections.disconnect("default")
    print("Disconnected from Milvus.")