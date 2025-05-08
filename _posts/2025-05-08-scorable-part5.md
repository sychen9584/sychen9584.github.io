---
title: 'Building a RAG-Powered AI Chatbot for Single-Cell Analysis - Part 5: Scaling Up & Cloud hosting'
date: 2025-05-07
permalink: /posts/2025/05/rag-part5/
tags:
  - bioinformatics
  - single-cell
  - ml/ai
  - rag
---

In this post, I will push scOracle to the cloud, making it fully accesible via a browser-based interface.

## Swapping local Chroma vector store for Qdrant
Chroma stores indexed vectors locally, which makes it unsuitable for cloud deployment via Streamlit. In contrast, [Qdrant](https://qdrant.tech/) offers a scalable, production-ready alternative with built-in cloud persistence through its Qdrant Cloud service. It also includes a free tier, allowing you to spin up a 1GB cluster, which is perfect for lightweight applications like scOracle. Swapping from Chroma to Qdrant only involves a few lines of codes in LlamaIndex.

Original code using local ChromaDB:
```python
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext

CHROMA_PATH = "../chroma_db"
COLLECTION_NAME = "scoracle_index"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(COLLECTION_NAME)
vector_store = ChromaVectorStore(chroma_collection=collection)
index = VectorStoreIndex.from_vector_store(vector_store)
```

Updated code using Qdrant Cloud:
```python
import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore

COLLECTION_NAME = "scoracle_index"

QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
if not QDRANT_API_KEY:
    raise EnvironmentError("QDRANT_API_KEY not set in environment variables.")

client = qdrant_client.QdrantClient(
    "https://<your-qdrant-host>.qdrant.io",
    api_key=QDRANT_API_KEY
)
vector_store = QdrantVectorStore(client=client, collection_name=COLLECTION_NAME)
index = VectorStoreIndex.from_vector_store(vector_store)
```
The procedures for ingesting and indexing documents remains the same, as described in [Part 2](https://sychen9584.github.io/posts/2025/05/rag-part2/) of this series.

## Deploying to Steamlit Cloud
With the vector store now hosted on Qdrant, the next step is making **scOracle** accessible via a browser. [Streamlit Community Cloud](https://streamlit.io/cloud) offers a simple, zero-config way to deploy Python apps directly from GitHub. 

<img src='/images/scoracle_stcloud.png'> 

There are only three basic requirements to cloud-host a Streamlit app from a GitHub repo:
1. A Python entry-point file (typically named *app.py*)
2. A dependency file such as *requirements.txt* or *uv.lock*
3. API keys for OpenAI + Qdrant, which can be securely configured via the app’s Settings tab or stored in *.streamlit/secrets.toml* within the repo

```bash
# .streamlit/secrets.toml example
OPENAI_API_KEY = "..."
QDRANT_API_KEY = "..."
```
And just like that, scOracle is live at https://scoracle-syc.streamlit.app/! Feel free to try it out, just bring your own OpenAI API key and start exploring single-cell insights through AI-powered search.

## Future improvements for scOracle
1. **Scaling up the knowledge base**

   Currently, scOracle only contains documentation for Scanpy, Seurat, and package recommendations from Awesome-Single-Cell. The next step is to ingest source code, API docs, and tutorials from other widely used single-cell analysis packages, such as Cell Ranger and Alevin-Fry.

2. **Improve document chunking strategy**

   Documents are currently split using *TextSplitter* or *CodeSplitter* with default parameters, which may cutoff important context (e.g., function definitions, Markdown headers, or parameter descriptions). A more intelligent chunking strategy, such as header-aware splitting for Markdown and function-level parsing for code, would preserve semantic boundaries and improve retreival accuracy.

3. **Decouple backend and frontend services**

   Deploy the LLM and vector store backend as an API (e.g., FastAPI) and keep Streamlit as a stateless frontend. This improves modularity, scalability, and enables multi-user session handling or access control.

4. **Adapter-based fine-tuning or embedding optimization**

   Experiment with retrieval-tuned sentence embeddings or LoRA adapters to align the LLM more closely with domain-specific terminology and reasoning patterns, especially for complex or ambiguous biological queries.
