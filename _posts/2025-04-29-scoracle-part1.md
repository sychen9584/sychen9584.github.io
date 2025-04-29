---
title: 'Building a RAG-Powered AI Chatbot for Single-Cell Analysis - Part 1: Foundations'
date: 2025-04-29
permalink: /posts/2025/04/rag-part1/
tags:
  - bioinformatics
  - single-cell
  - ml/ai
  - rag
---
## Motivation
AI applications like ChatGPT have acted as capable personal assistants during my single-cell analysis projects, whether helping me debug a Scanpy error at midnight or brainstorming strategies for integrating scRNA and scATAC-seq data. 

However, despite their versatility, hallucination is still a major problem for base LLM applications. Here's a real example (abbreviated) I encountered:
Q: How can I compute a gene activity matrix from a scATAC-seq dataset in scanpy/muon ecosystem?
A: You can use ComputeGeneActivity() from `mu.atac` module. => *this function doesn't exist anywhere in the codebase or documentation!*

Imagine trusting a nonexistant function in a pipeline and wasting hour debugging it... Therefore, this inspired me to build **scOracle**, a domain-specific assistant powered by **Retrieval-Augmented Generation (RAG)** and **enriched with a knowledge base** of curated single-cell documentation, tutorials, and source code. By grounding LLM responses on real, trusted documents, scOracle aims to eliminate hallucinations and deliver verifiable, context-aware answers.

## Intended features
- Target audience: Scientists or students navigating single-cell workflows
- Ingests real docs, notebooks, and repo source code
- Responds to natural language questions (e.g., "How do I run Leiden clustering?")
- Offers code snippets, parameter guidance, and troubleshooting tips based on ingested knowledge
- Modular backend: ability to swap models, tune parameters, and filter retrieved knowledge

## App Structure
<center><img src='/images/scoracle_mermaid.png'> </center> <br/>

## Single Cell packages to include in the knowledge base
- Umbrella analysis framework: Scanpy & Seurat ==> MVP for first iteration
  - Can be extended to whole [scVerse ecosystem](https://scverse.org/)
- Upstream processing: Cell Ranger, Alevin-Fry, and NF-Core
- scATAC-seq analysis: Signac & ArchR
- Gene regulatory network inference: SCENIC & scPRINT
- Spatial Transcriptomics: squidpy
- Awesome Single Cell [repo](https://github.com/seandavi/awesome-single-cell) and much more!

## Planned Tech Stack

|---
| Component | Choice | Function 
|:-:|:-:|:-:
| LLM API | GPT-4o mini | Generates natural language responses conditioned on retrieved context
| Retrieval | LlamaIndex | Manages document ingestion, chunking, indexing, and context retrieval for RAG
| Embedding | all-MiniLM-L6-v2 (SBERT) | Converts text into dense vector representations for semantic search
| Vector DB | Chroma | Stores and retrieves embeddings efficiently to support fast similarity search
| UI | Streamlit | Provides a simple, interactive web interface for user input and chatbot output

The modular design allows easy upgrades, such as swapping to better embedding models or scaling with a production-grade vector store like Qdrant.