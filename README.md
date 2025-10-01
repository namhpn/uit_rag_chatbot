# uit_rag_chatbot
School Project
## Based on
Node.js, Express.js, HTML, CSS (got some help from chatgpt hehe), GoogleGenAI (embedding & text-gen), Pinecone (VectorDB retrieval), crawl4ai (crawl data from UIT)
## Process
- Crawled from tuyensinh.uit (from sitemap) and daa.uit (recursive crawl)
- Data filtered using https://colab.research.google.com/drive/15CPXfKG9KBkFt6PgP3sMEIgGaRVQhm7p?usp=sharing
- Embedded using "gemini-embedding-001" and saved to Pinecone index