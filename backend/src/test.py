import requests
import json

def test_api(question, data_type="agentic"):
    url = "http://localhost:8000/api/query"
    
    payload = {
        "question": question,
        "data_type": data_type,
        "embedding_type": "bge",
        "num_chunks": 30
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

# Test different scenarios
questions = [
    "What are some innovative DeFi ideas?",
    "How can we improve scalability in Ethereum?",
    "What are common security vulnerabilities in smart contracts?"
]

data_types = ["agentic", "vitalik", "rekt", "vitalik_rekt"]

# Run tests
for question in questions:
    for data_type in data_types:
        print(f"\nTesting with data_type: {data_type}")
        print(f"Question: {question}")
        print("-" * 50)
        test_api(question, data_type)
        print("=" * 50)