import google.generativeai as genai
from qdrant_client import QdrantClient
from langchain_qdrant import Qdrant
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage

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

def get_collection_name(data_type, embedding_type):
    """Get collection name based on data type and embedding model"""
    if data_type.lower() == "global_bounties":
        return "global_bounties_rag"
    elif data_type.lower() == "vitalik_agent":
        return "vitalik_agent_bge"
    elif data_type.lower() == "rekt":
        return f"rag_collection_rekt_{embedding_type}"
    elif data_type.lower() == "ethdenver":
        return f"rag_collection_ethdenver_{embedding_type}"
    else:
        raise ValueError("Invalid data type. Choose 'global_bounties', 'vitalik_agent', 'rekt', or 'ethdenver'")

def get_embeddings_model(model_choice, data_type=None):
    """Initialize embeddings model based on user choice and data type"""
    from langchain_huggingface import HuggingFaceEmbeddings
    
    if model_choice.lower() == "mpnet":
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'}
        )
    elif model_choice.lower() == "bge":
        # Use BGE-Large specifically for Vitalik agent
        if data_type and data_type.lower() == "vitalik_agent":
            return HuggingFaceEmbeddings(
                model_name="BAAI/bge-small-en-v1.5",
                model_kwargs={'device': 'cpu'}
            )
        # Use BGE-Small for other collections
        else:
            return HuggingFaceEmbeddings(
                model_name="BAAI/bge-small-en-v1.5",
                model_kwargs={'device': 'cpu'}
            )
    else:
        raise ValueError("Invalid model choice. Choose 'mpnet' or 'bge'")

genai.configure(api_key=API_KEY)


qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    prefer_grpc=True,
    timeout=60
)

# Add memory instance at the module level
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

def display_memory():
    """Display the current conversation memory."""
    chat_history = memory.load_memory_variables({})["chat_history"]
    if chat_history:
        print("Current Conversation Memory:")
        for msg in chat_history:
            role = "Human" if isinstance(msg, HumanMessage) else "Assistant"
            print(f"{role}: {msg.content}")
    else:
        print("No conversation memory available.")

def query(question: str, data_type: str, embedding_type: str, num_chunks: int):
    """Query the specified collection using the chosen embedding model"""
    embeddings_model = get_embeddings_model(embedding_type, data_type)
    collection_name = get_collection_name(data_type, embedding_type)
    
    # Get chat history
    chat_history = memory.load_memory_variables({})["chat_history"]
    chat_history_str = "\n".join([
        f"Human: {msg.content}" if isinstance(msg, HumanMessage) else f"Assistant: {msg.content}"
        for msg in chat_history
    ])
    
    retriever = Qdrant(
        client=qdrant_client,
        collection_name=collection_name,
        embeddings=embeddings_model
    ).as_retriever(search_type="similarity", search_kwargs={"k": num_chunks})

    search_results = retriever.get_relevant_documents(question)

    relevant_texts = "\n".join([
        f"From {doc.metadata['source']}:\n{doc.page_content}"
        for doc in search_results
    ])

    if data_type.lower() == "vitalik_agent":
        combined_text = (
            "You are Vitalik Buterin. Using the provided context of your past content, "
            "analyze and enhance the following question with your unique perspective "
            "and deep understanding of blockchain technology.\n\n"
            f"Previous conversation:\n{chat_history_str}\n\n"
            f"Context from your past content:\n{relevant_texts}\n\n"
            f"Question: {question}\n\n"
            "Please provide a comprehensive response that combines technical depth with practical considerations."
        )
    elif data_type.lower() == "rekt":
        combined_text = (
            "You are a security expert from Rekt. Using the provided context of past security incidents, "
            "analyze and provide insights about security considerations and potential risks.\n\n"
            f"Previous conversation:\n{chat_history_str}\n\n"
            f"Context from security incidents:\n{relevant_texts}\n\n"
            f"Question: {question}\n\n"
            "Please provide a detailed security analysis and recommendations."
        )
    elif data_type.lower() == "ethdenver":
        combined_text = (
            "You are an expert on ETHDenver hackathon. Using the provided context, "
            "help answer questions about the hackathon, including prizes, sponsors, schedule,idea generation and requirements.The hackathon is of total 8 days from 23rd of february to 2nd of march.\n\n"
            f"Previous conversation:\n{chat_history_str}\n\n"
            f"Context from ETHDenver:\n{relevant_texts}\n\n"
            f"Question: {question}\n\n"
            "Please provide a detailed and creative response based on the official ETHDenver information. "
            "Be natural in your response without explicitly refrencing sources or saying that based on text."
        )
    else:  # global_bounties
        combined_text = (
            "You are an expert on Ethereum hackathons and bounties. Using the provided context, "
            "help answer questions about hackathon projects, bounties, and technical implementations.\n\n"
            f"Previous conversation:\n{chat_history_str}\n\n"
            f"Question: {question}\n"
            f"Context from multiple sources:\n{relevant_texts}\n\n"
            "Please provide a comprehensive answer based on the above context and previous conversation. "
            "Be natural in your response without explicitly referencing the sources."
        )

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(combined_text, generation_config=genai.GenerationConfig(
        temperature=1.5,
    ))

    # Save the interaction to memory
    memory.save_context(
        {"input": question},
        {"output": response.text}
    )

    return {
        "Question": question,
        "Answer": response.text,
        "Sources": [doc.metadata['source'] for doc in search_results],
        "Collection": collection_name
    }

# Modify the main execution block
if __name__ == "__main__":
    print("Choose query type:")
    print("1. Single Agent Query")
    print("2. Collaborative Brainstorming with Vitalik (Agentic + Vitalik)")
    print("3. Security Analysis with Rekt (Agentic + Rekt)")
    print("4. ETHDenver Information")
    query_type = input().strip()
    
    print("Enter the number of chunks to retrieve:")
    num_chunks = int(input().strip())
    
    print("Enter your question:")
    question = input().strip()
    
    if query_type == "1":
        # ... existing single agent query code ...
        pass
    
    elif query_type == "2":
        response = query(question, "vitalik_agent", "bge", num_chunks)
        print("\nCollaborative Response:")
        print(f"Question: {response['Question']}")
        print(f"\nAnswer:\n{response['Answer']}")
        print(f"\nSources Used:")
        print(f"Sources: {response['Sources']}")
    
    elif query_type == "3":
        response = query(question, "rekt", "bge", num_chunks)
        print("\nSecurity Analysis Response:")
        print(f"Question: {response['Question']}")
        print(f"\nAnswer:\n{response['Answer']}")
        print(f"\nSources Used:")
        print(f"Sources: {response['Sources']}")
    
    elif query_type == "4":
        response = query(question, "ethdenver", "bge", num_chunks)
        print("\nETHDenver Information:")
        print(f"Question: {response['Question']}")
        print(f"\nAnswer:\n{response['Answer']}")
        print(f"\nSources Used:")
        print(f"Sources: {response['Sources']}")
    
    # Display the current memory
    display_memory()
