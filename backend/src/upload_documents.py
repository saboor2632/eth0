import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from qdrant_client import QdrantClient
from langchain_qdrant import Qdrant
import json
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get configuration from environment variables
API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not all([API_KEY, QDRANT_URL, QDRANT_API_KEY]):
    raise ValueError("Missing required environment variables. Please check your .env file.")

genai.configure(api_key=API_KEY)

def get_collection_name(data_type, embedding_type):
    """Get collection name based on data type and embedding model"""
    if data_type.lower() == "bangkok":
        return f"rag_collection_bangkok_{embedding_type}"
    elif data_type.lower() == "agentic":
        return f"rag_collection_agentic_{embedding_type}"
    elif data_type.lower() == "rekt":
        return f"rag_collection_rekt_{embedding_type}"
    elif data_type.lower() == "vitalik_agent":
        return f"rag_collection_vitalik_{embedding_type}"
    elif data_type.lower() == "global_bounties":
        return "global_bounties_rag"  # Fixed collection name since we only use BGE
    else:
        raise ValueError("Invalid data type. Choose 'bangkok', 'agentic', 'rekt', 'vitalik_agent', or 'global_bounties'")

def get_embeddings_model(model_choice):
    """Initialize embeddings model based on user choice"""
    from langchain_huggingface import HuggingFaceEmbeddings
    
    if model_choice.lower() == "mpnet":
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'}
        )
    elif model_choice.lower() == "bge":
        return HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",  # Updated to large version
            model_kwargs={'device': 'cpu'}
        )
    else:
        raise ValueError("Invalid model choice. Choose 'mpnet' or 'bge'")
    
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    prefer_grpc=True,
    timeout=60
)

def format_rekt_data(item, source_type):
    """Format rekt data into a readable string."""
    result = f"Source: {source_type}\n"
    
    if source_type == "rekt_news":
        result += f"Title: {item.get('title', '')}\n"
        result += f"Link: {item.get('link', '')}\n"
        result += f"Date: {item.get('date', '')}\n"
        result += f"Audit Status: {item.get('audit_staus', '')}\n"
        result += f"Price: {item.get('price', '')}\n"
        result += f"Article: {item.get('article', '')}\n"
    
    elif source_type == "rekt_database":
        result += f"Title: {item.get('title', '')}\n"
        result += f"Project Name: {item.get('project_name', '')}\n"
        result += f"Date: {item.get('date', '')}\n"
        result += f"Funds Lost: ${item.get('funds_lost', 0):,.2f}\n"
        result += f"Funds Returned: ${item.get('funds_returned', 0):,.2f}\n"
        result += f"Description: {item.get('description', '')}\n"
    
    return result

def format_dict(data, indent=0, source_type=""):
    """Recursively format a dictionary into a readable string with source information."""
    result = f"Source: {source_type}\n"
    
    if isinstance(data, dict):
        # Special handling for ETH Research format
        if source_type == "ETH Research":
            result += f"Title: {data.get('title', '')}\n"
            result += f"Link: {data.get('link', '')}\n"
            result += f"Article: {data.get('article', '')}\n"
            if 'category' in data:
                result += "Categories: " + ", ".join(data['category']) + "\n"
            if 'discourse' in data:
                result += "Topics: " + ", ".join(data['discourse']) + "\n"
            
        # Special handling for Vitalik's Blog format
        elif source_type == "Vitalik's Blog":
            result += f"Title: {data.get('title', '').strip()}\n"
            result += f"Link: {data.get('link', '')}\n"
            result += f"Date: {data.get('date', '')}\n"
            result += f"Article: {data.get('article', '')}\n"
            
        # Special handling for Semantic Scholar format
        elif source_type == "Semantic Scholar":
            result += f"Title: {data.get('title', '')}\n"
            result += f"Authors: {', '.join(data.get('authors', []))}\n"
            result += f"Year: {data.get('published_year', '')}\n"
            result += f"Venue: {data.get('venue', '')}\n"
            result += f"Citations: {data.get('citations', '')}\n"
            result += f"Abstract: {data.get('abstract', '')}\n"
            result += f"URL: {data.get('url', '')}\n"

        # Special handling for arXiv format
        elif source_type == "arXiv":
            result += f"Title: {data.get('title', '')}\n"
            result += f"Authors: {', '.join(data.get('authors', []))}\n"
            result += f"Date: {data.get('published_date', '')}\n"
            result += f"Categories: {', '.join(data.get('categories', []))}\n"
            result += f"Abstract: {data.get('abstract', '')}\n"
            result += f"Paper URL: {data.get('paper_url', '')}\n"
            result += f"PDF URL: {data.get('pdf_url', '')}\n"

        # Special handling for YouTube format
        elif source_type == "YouTube":
            result += f"Title: {data.get('title', '')}\n"
            result += f"Channel: {data.get('channel', '')}\n"
            result += f"Published Date: {data.get('published_date', '')}\n"
            result += f"URL: {data.get('url', '')}\n"
            if data.get('transcript'):
                transcript_text = ' '.join([t.get('text', '') for t in data['transcript']])
                result += f"Transcript: {transcript_text}\n"
            
        # Original format handling
        else:
            for key, value in data.items():
                if isinstance(value, dict):
                    result += " " * indent + f"{key}:\n" + format_dict(value, indent + 4, source_type)
                elif isinstance(value, list):
                    result += " " * indent + f"{key}:\n"
                    for item in value:
                        if isinstance(item, dict):
                            result += format_dict(item, indent + 4, source_type)
                        else:
                            result += " " * (indent + 4) + f"- {item}\n"
                else:
                    result += " " * indent + f"{key}: {value}\n"
    else:
        result += str(data) + "\n"
    
    return result

def format_vitalik_content(data):
    """Format Vitalik's content data into a readable string."""
    result = "Source: Vitalik Content\n"
    result += f"Type: {data.get('type', '')}\n"
    
    # Handle tweets differently
    if data.get('type') == 'tweet':
        result += f"Content: {data.get('content', '')}\n"
        result += f"Date: {data.get('date', '')}\n"
        result += f"URL: {data.get('url', '')}\n"
        
        # Add metrics if available
        metrics = data.get('metrics', {})
        if metrics:
            result += "Metrics:\n"
            result += f"  Likes: {metrics.get('likes', 0)}\n"
            result += f"  Retweets: {metrics.get('retweets', 0)}\n"
            result += f"  Replies: {metrics.get('replies', 0)}\n"
            result += f"  Views: {metrics.get('views', 0)}\n"
    
    # Handle other content types (blogs, videos, etc.)
    else:
        result += f"Title: {data.get('title', '')}\n"
        result += f"Content Type: {data.get('content_type', '')}\n"
        result += f"Source: {data.get('source', '')}\n"
        result += f"Date: {data.get('date', '')}\n"
        result += f"Link: {data.get('link', '')}\n"
        
        if data.get('channel'):
            result += f"Channel: {data.get('channel', '')}\n"
        
        if data.get('themes'):
            result += "Themes: " + ", ".join(data.get('themes', [])) + "\n"
        
        result += f"Content:\n{data.get('content', '')}\n"
    
    return result

def create_upload_file(data_type, embedding_type):
    """Create and upload documents with specified data type and embeddings"""
    embeddings_model = get_embeddings_model(embedding_type)
    collection_name = get_collection_name(data_type, embedding_type)
    all_documents = []
    
    # Define the files and their source types based on data_type
    if data_type.lower() == "global_bounties":
        files_to_process = [
            # Bangkok sources
            ("../scrapy/jsons/scraped_data_EthGlobal.json", "EthGlobal"),
            ("../scrapy/jsons/scraped_data_Ethsear.json", "ETH Research"),
            ("../scrapy/jsons/scraped_data_Vitalik.json", "Vitalik's Blog"),
            ("../scrapy/jsons/ethereum_papers_semantic_scholar.json", "Semantic Scholar"),
            ("../scrapy/jsons/ethereum_papers_arxiv.json", "arXiv"),
            ("../scrapy/jsons/youtube_ethereum_transcripts.json", "YouTube"),
            # Agentic sources
            ("../scrapy/jsons/scraped_data_EthGlobal_agentic.json", "EthGlobal_agentic"),
            ("../scrapy/jsons/agentic_youtube.json", "YouTube Transcript")
        ]
    elif data_type.lower() == "bangkok":
        files_to_process = [
            ("../scrapy/jsons/scraped_data_EthGlobal.json", "EthGlobal"),
            ("../scrapy/jsons/scraped_data_Ethsear.json", "ETH Research"),
            ("../scrapy/jsons/scraped_data_Vitalik.json", "Vitalik's Blog"),
            ("../scrapy/jsons/ethereum_papers_semantic_scholar.json", "Semantic Scholar"),
            ("../scrapy/jsons/ethereum_papers_arxiv.json", "arXiv"),
            ("../scrapy/jsons/youtube_ethereum_transcripts.json", "YouTube")
        ]
    elif data_type.lower() == "vitalik_agent":
        files_to_process = [
            ("../scrapy/jsons/processed_vitalik_content.json", "Vitalik Content")
        ]
    elif data_type.lower() == "agentic":
        files_to_process = [
            ("../scrapy/jsons/scraped_data_EthGlobal_agentic.json", "EthGlobal_agentic"),
            ("../scrapy/jsons/scraped_data_Ethsear.json", "ETH Research"),
            ("../scrapy/jsons/scraped_data_Vitalik.json", "Vitalik's Blog"),
            ("../scrapy/jsons/ethereum_papers_semantic_scholar.json", "Semantic Scholar"),
            ("../scrapy/jsons/ethereum_papers_arxiv.json", "arXiv"),
            ("../scrapy/jsons/agentic_youtube.json", "YouTube Transcript"),
            ("../scrapy/jsons/youtube_ethereum_transcripts.json", "YouTube")
        ]
    else:  # rekt
        files_to_process = [
            ("../scrapy/jsons/rekt_news_scraped.json", "rekt_news"),
            ("../scrapy/jsons/rekt_database_scraped.json", "rekt_database")
        ]

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=250,
        chunk_overlap=50,
        length_function=len,
        is_separator_regex=False,
    )

    # Process files and create documents
    for file_name, source_type in files_to_process:
        file_path = Path(file_name)
        if not file_path.exists():
            print(f"Warning: {file_name} not found. Skipping...")
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                if source_type == "YouTube Transcript":
                    data = json.load(f)
                    for item in data:
                        formatted_text = item['transcript']
                        document = Document(
                            page_content=formatted_text,
                            metadata={
                                "source": source_type,
                                "file_name": file_name,
                                "data_type": data_type,
                                "embedding_type": embedding_type,
                                "title": item.get("title"),
                                "video_id": item.get("video_id")
                            }
                        )
                        all_documents.append(document)
                else:
                    data = json.load(f)
                    if isinstance(data, list):
                        if source_type == "Vitalik Content":
                            # Special handling for Vitalik Content
                            for item in data:
                                formatted_text = format_vitalik_content(item)
                                texts = text_splitter.split_text(formatted_text)
                                for text in texts:
                                    document = Document(
                                        page_content=text,
                                        metadata={
                                            "source": source_type,
                                            "file_name": file_name,
                                            "data_type": data_type,
                                            "embedding_type": embedding_type,
                                            "content_type": item.get("content_type"),
                                            "themes": item.get("themes", []),
                                            "type": item.get("type"),
                                            "title": item.get("title"),
                                            "link": item.get("link")
                                        }
                                    )
                                    all_documents.append(document)
                        elif source_type in ["rekt_news", "rekt_database"]:
                            formatted_data = [format_rekt_data(item, source_type) for item in data]
                        else:
                            formatted_data = [format_dict(item, source_type=source_type) for item in data]
                        
                        # Process non-Vitalik content
                        if source_type != "Vitalik Content":
                            for content in formatted_data:
                                texts = text_splitter.split_text(content)
                                for text in texts:
                                    document = Document(
                                        page_content=text,
                                        metadata={
                                            "source": source_type,
                                            "file_name": file_name,
                                            "data_type": data_type,
                                            "embedding_type": embedding_type
                                        }
                                    )
                                    all_documents.append(document)
                    else:
                        if source_type in ["rekt_news", "rekt_database"]:
                            formatted_data = [format_rekt_data(data, source_type)]
                        else:
                            formatted_data = [format_dict(data, source_type=source_type)]
                        
                        for content in formatted_data:
                            texts = text_splitter.split_text(content)
                            for text in texts:
                                document = Document(
                                    page_content=text,
                                    metadata={
                                        "source": source_type,
                                        "file_name": file_name,
                                        "data_type": data_type,
                                        "embedding_type": embedding_type
                                    }
                                )
                                all_documents.append(document)

        except Exception as e:
            print(f"Error processing {file_name}: {str(e)}")
            continue

    # Upload to Qdrant in batches
    if all_documents:
        batch_size = 100
        for i in range(0, len(all_documents), batch_size):
            batch = all_documents[i:i + batch_size]
            try:
                qdrant = Qdrant.from_documents(
                    batch,
                    embeddings_model,
                    url=QDRANT_URL,
                    prefer_grpc=True,
                    collection_name=collection_name,
                    api_key=QDRANT_API_KEY,
                    timeout=60,
                )
                print(f"Successfully uploaded batch {i//batch_size + 1} ({len(batch)} documents)")
            except Exception as e:
                print(f"Error uploading batch {i//batch_size + 1}: {str(e)}")
                continue
        
        return {"message": f"Finished processing {len(all_documents)} documents for {collection_name}"}
    else:
        return {"message": "No documents were processed"}

if __name__ == "__main__":
    print("Choose data type (bangkok/agentic/rekt/vitalik_agent/global_bounties):")
    data_type = input().strip()
    
    print("Choose embeddings type (mpnet/bge):")
    embedding_type = input().strip()
    
    if data_type.lower() not in ["bangkok", "agentic", "rekt", "vitalik_agent", "global_bounties"]:
        print("Invalid data type. Must be 'bangkok', 'agentic', 'rekt', 'vitalik_agent', or 'global_bounties'")
    elif embedding_type.lower() not in ["mpnet", "bge"]:
        print("Invalid embedding type. Must be 'mpnet' or 'bge'")
    else:
        # Force BGE embeddings for global_bounties
        if data_type.lower() == "global_bounties":
            embedding_type = "bge"
        result = create_upload_file(data_type, embedding_type)
        print(result["message"])