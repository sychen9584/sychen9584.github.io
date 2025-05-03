---
title: 'Building a RAG-Powered AI Chatbot for Single-Cell Analysis - Part 2: Data Ingestion & Indexing'
date: 2025-05-03
permalink: /posts/2025/05/rag-part2/
tags:
  - bioinformatics
  - single-cell
  - ml/ai
  - rag
---

## Download Scanpy source code & documentation
For a minimum viable product (MVP), I limited document ingestion to [**Scanpy**](https://scanpy.readthedocs.io/en/stable/), a leading Python-based framework for analyzing scRNA-seq data.

I downloaded:
- Source code -> *limit to .py files*
```bash
git clone https://github.com/scverse/scanpy.git
```
- Web documentation -> *limit to .html files*
```bash
wget -r -np -k -E -p -e robots=off https://scanpy.readthedocs.io/en/stable
```
- Tutorial notebooks -> *limit to .ipynb files*
```bash
git clone https://github.com/scverse/scanpy-tutorials.git
```

The documents were wrangled into the following directory structure:

```
scoracle  
│
└───data
│   │
│   └───scanpy_docs
│   |   │   file1.html
│   |   │   file2.html
|   |   |   ...
|   |   
│   └───scanpy_src
|       |
|       └───core
|       |   │   file1.py
|       |   │   file2.py
|       |   │   ...
|       |
|       └───tutorials
|           |   notebook1.ipynb
|           |   notebook2.ipynb
|           |   ...  
└───... 
```

## Set up vector store with ChromaDB
**Chroma DB** is an open-source vector database optimized for fast, local knowledge retrieval. It stores embeddings derived from ingested documents and enables efficient similarity search, making it ideal for RAG applications.

```python
#### build_index.py
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext

CHROMA_PATH = "../chroma_db"
COLLECTION_NAME = "scoracle_index"

# === Set up Chroma vector store ===
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
chroma_collection = chroma_client.get_or_create_collection(COLLECTION_NAME)
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
```

## Document chunking & indexing with LlamaIndex
**LlamaIndex** is a data framework for connecting external information to LLMs. It powers RAG workflows by indexing ingested documents and enabling LLMs to query them with contextual awareness. Under the hood, LlamaIndex abstracts the complexity of chunking, embedding, vector storage, and querying - distilling these steps into just a few lines of code.

### Loading documents
```python
##### build_index.py
from llama_index.core import SimpleDirectoryReader

DATA_DIR_DOCS = "../data/scanpy_docs" # html documentation
DATA_DIR_CODE = "../data/scanpy_src/core" # source code
DATA_DIR_TUTORIALs = "../data/scanpy_src/tutorials" # tutorial notebooks

# === Load code files (.py) ===
code_loader = SimpleDirectoryReader(
    input_dir=DATA_DIR_CODE,
    recursive=True,
    required_exts=[".py"],
)
code_docs = code_loader.load_data()
for doc in code_docs:
    doc.metadata["type"] = "code"
    
## === Load tutorial files (.ipynb) ===
notebook_loader = SimpleDirectoryReader(
    input_dir=DATA_DIR_TUTORIALs,
    recursive=True,
    required_exts=[".ipynb"],
)
notebook_docs = notebook_loader.load_data()
for doc in notebook_docs:
    doc.metadata["type"] = "tutorial"
```
I loaded source code and tutorial notebooks separately to apply different chunking strategies—specifically, line-based splitting for Python files and sentence-level splitting for narrative content.

For loading html files, a custom parser function that utilizes *BeautifulSoup* was needed:
```python
#### html_doc_loader.py
import os
from bs4 import BeautifulSoup
from llama_index.core.schema import Document

def extract_text_from_html(file_path) -> str:
    """
    Extract text from an HTML file.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')
        
        # Remove navigation, scripts, and footers
        for tag in soup(['nav', 'footer', 'script', 'style', 'head']):
            tag.decompose()
            
        # Target the main content area
        main = soup.find("div", {"role": "main"}) or soup.body
        return main.get_text(separator="\n", strip=True) if main else ""

def load_html_documents(directory: str) -> list[Document]:
    """
    Load HTML documents from a directory and extract text.
    """
    documents = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                try:
                    text = extract_text_from_html(path)
                    if text:
                        rel_path = os.path.relpath(path, directory)
                        documents.append(Document(
                            text=text,
                            metadata={
                                "source": rel_path,
                                "type": "html_doc",
                            }
                        ))
                except Exception as e:
                    print(f"[WARN] Failed to process {path}: {e}")
                    
    print(f"[INFO] Loaded {len(documents)} HTML documents from {directory}")
    return documents
```

```python
#### build_index.py
from html_doc_loader import load_html_documents

# === Load documentation files (.html) ===
html_docs = load_html_documents(DATA_DIR_DOCS)
```

### Configure embedding model
For this MVP, I wanted to prioritize fast indexing and deployment over state-of-the-art accuracy. Therefore, I used the **all-MiniLM-L6-v2** model from Sentence transformers to embed the documents. It is compact (~22M parameters) but competitive for semantic similarity tasks, offering a strong tradeoff between speed, accuracy, and resource efficiency. 

```python
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings

# === Set up embedding model ===
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embed_model = HuggingFaceEmbedding(model_name=EMBED_MODEL)
Settings.embed_model = embed_model
```

### Document chunking and indexing

To prepare the data for retrieval, I applied different chunking strategies to text and code documents using LlamaIndex’s *SentenceSplitter* and *CodeSplitter*. HTML documentation and Jupyter notebooks were split into semantically meaningful chunks, while Python source files were split by lines of code. The chunked documents were then embedded using the configured model and ingested into the Chroma vector store, making them retrievable via semantic similarity search.

```python
from llama_index.core.node_parser import SentenceSplitter, CodeSplitter

# === Combine all text docs ===
text_docs = html_docs + notebook_docs

# === Index docs + notebooks with SentenceSplitter ===
Settings.node_parser = SentenceSplitter(chunk_size=500, chunk_overlap=100)
index_docs = VectorStoreIndex.from_documents(
    documents=text_docs,
    storage_context=storage_context,
    show_progress=True
)

# === Index code with CodeSplitter ===
Settings.node_parser = CodeSplitter(chunk_lines=40, chunk_lines_overlap=15, language="python")
index_code = VectorStoreIndex.from_documents(
    documents=code_docs,
    storage_context=storage_context,
    show_progress=True
)

# === Persist index ===
storage_context.persist()
print(f"Index built and stored at {CHROMA_PATH}")
```

With all documents indexed and embedded into Chroma, the knowledge base is ready for LLM-powered retrieval. In Part 3, I’ll show how to connect this vector store to an interactive query interface using LlamaIndex’s QueryEngine, starting with a simple command-line interface.