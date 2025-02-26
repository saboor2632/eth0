import requests
import json
from datetime import datetime
import time
import xml.etree.ElementTree as ET

def scrape_ethereum_papers():
    # ArXiv API endpoint
    base_url = 'http://export.arxiv.org/api/query?'
    
    # Search parameters
    search_query = 'ti:Ethereum'
    start = 0
    max_results = 150
    
    # Format the query URL
    query = f'{base_url}search_query={search_query}&start={start}&max_results={max_results}&sortBy=submittedDate&sortOrder=descending'
    
    # Filter date: September 1, 2021
    target_date = datetime(2021, 9, 1)
    
    # List to store filtered papers
    filtered_papers = []
    
    try:
        # Make the API request
        response = requests.get(query)
        
        # Parse the XML response
        root = ET.fromstring(response.text)
        
        # Define namespace
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        # Process each entry
        for entry in root.findall('atom:entry', ns):
            # Parse the published date
            published_str = entry.find('atom:published', ns).text
            published_date = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%SZ')
            
            # Check if paper was published after September 2021
            if published_date > target_date:
                # Extract paper details
                paper_dict = {
                    "title": entry.find('atom:title', ns).text.strip(),
                    "authors": [author.find('atom:name', ns).text for author in entry.findall('atom:author', ns)],
                    "published_date": published_str,
                    "abstract": entry.find('atom:summary', ns).text.strip(),
                    "paper_url": entry.find('atom:id', ns).text,
                    "pdf_url": next((link.get('href') for link in entry.findall('atom:link', ns) 
                                   if link.get('title') == 'pdf'), None),
                    "categories": [cat.get('term') for cat in entry.findall('atom:category', ns)]
                }
                filtered_papers.append(paper_dict)
            else:
                # Since results are sorted by date, we can break once we hit older papers
                break
                
        # Save to JSON file
        with open("../jsons/ethereum_papers_arxiv.json", "w", encoding="utf-8") as f:
            json.dump(filtered_papers, f, ensure_ascii=False, indent=4)
            
        print(f"Successfully scraped {len(filtered_papers)} papers and saved to ethereum_papers_arxiv.json")
        
        # Print some basic statistics
        print("\nMost recent papers:")
        for paper in filtered_papers[:3]:  # Show first 3 papers
            print(f"\nTitle: {paper['title']}")
            print(f"Published: {paper['published_date']}")
            print(f"Authors: {', '.join(paper['authors'])}")
            print("-" * 80)
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    # Only requires requests library
    # pip install requests
    scrape_ethereum_papers()