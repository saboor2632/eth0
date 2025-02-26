import requests

def test_api():
    base_url = "http://localhost:8000/api/query"
    
    # Test cases for each chat type
    test_cases = [
        {
            "question": "What do you think about Layer 2 scaling?",
            "chat_type": "vitalik",
            "num_chunks": 30
        },
        {
            "question": "What are common security vulnerabilities in DeFi?",
            "chat_type": "rekt",
            "num_chunks": 30
        }
    ]
    
    for test_case in test_cases:
        print(f"\nTesting {test_case['chat_type']} chat...")
        print(f"Question: {test_case['question']}")
        
        try:
            response = requests.post(base_url, json=test_case)
            
            if response.status_code == 200:
                data = response.json()
                print("\nSuccess!")
                print(f"Answer: {data['Answer'][:200]}...")  # Print first 200 chars
                print(f"Collection: {data['Collection']}")
                print(f"Number of sources: {len(data['Sources'])}")
            else:
                print(f"Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
        
        print("-" * 80)  # Separator line

if __name__ == "__main__":
    # First make sure your FastAPI server is running
    print("Testing API endpoints...")
    print("Make sure your FastAPI server is running on http://localhost:8000")
    test_api() 