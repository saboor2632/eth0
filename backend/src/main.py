# # backend/main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from query_documents import query
# from pydantic import BaseModel

# app = FastAPI()

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # Adjust this to your frontend URL
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "OPTIONS"],  # Ensure OPTIONS is included
#     allow_headers=["*"],  # Allow all headers
# )

# class QueryRequest(BaseModel):
#     question: str

# @app.post("/api/query")
# async def get_query_response(request: QueryRequest):
#     try:
#         response = query(
#             question=request.question,
#             data_type="agentic",
#             embedding_type="bge",
#             num_chunks=30
#         )
#         return response
#     except Exception as e:
#         return {"error": str(e)}, 500

# 

# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from query_documents import query
from pydantic import BaseModel

app = FastAPI()

# Configure CORS with additional origins
origins = [
    "http://localhost:5173",    # Vite default
    "http://127.0.0.1:5173",   
    "http://localhost:8080",    # Added for your frontend
    "http://127.0.0.1:8080",   
    "http://localhost:3000",    
    "http://127.0.0.1:3000",
    "https://eth0.ai",           # Your domain
    "http://eth0.ai",           # HTTP version
    "http://137.184.233.246",   # Your droplet IP
    "https://137.184.233.246",  # HTTPS version
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # List of allowed origins
    allow_credentials=True,     
    allow_methods=["GET", "POST", "OPTIONS"],  
    allow_headers=["*"],        
)

class QueryRequest(BaseModel):
    question: str
    chat_type: str  # "bounties", "vitalik", "rekt", or "ethdenver"
    num_chunks: int = 30

@app.post("/api/query")
async def handle_query(request: QueryRequest):
    try:
        if request.chat_type == "bounties":
            response = query(
                question=request.question,
                data_type="global_bounties",
                embedding_type="bge",
                num_chunks=request.num_chunks
            )
            return response
        
        elif request.chat_type == "vitalik":
            response = query(
                question=request.question,
                data_type="vitalik_agent",
                embedding_type="bge",
                num_chunks=request.num_chunks
            )
            return response
        
        elif request.chat_type == "rekt":
            response = query(
                question=request.question,
                data_type="rekt",
                embedding_type="bge",
                num_chunks=request.num_chunks
            )
            return response
        
        elif request.chat_type == "ethdenver":
            response = query(
                question=request.question,
                data_type="ethdenver",
                embedding_type="bge",
                num_chunks=request.num_chunks
            )
            return response
        
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid chat_type: {request.chat_type}. Must be 'bounties', 'vitalik', 'rekt', or 'ethdenver'"
            )
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Add an OPTIONS endpoint to handle preflight requests
@app.options("/api/query")
async def options_query():
    return {}
