import requests
import json
from datetime import datetime
import time
import random

class SemanticScolarScraper:
    def __init__(self, 
                 query='Ethereum', 
                 max_papers=100, 
                 start_date='2021-09-01'):
        self.base_url = "https://api.semanticscholar.org/graph/v1/paper/search"
        self.query = query
        self.max_papers = max_papers
        self.start_date = start_date
        self.filtered_papers = []

    def scrape_papers(self):
        try:
            # Parameters for the API request
            params = {
                'query': f'title:"{self.query}"',
                'limit': self.max_papers,
                'fields': 'title,authors,year,abstract,url,citationCount,venue'
            }

            # Make the API request
            response = requests.get(self.base_url, params=params)
            
            # Check if request was successful
            if response.status_code != 200:
                print(f"Error: Received status code {response.status_code}")
                return

            # Parse the JSON response
            data = response.json()

            # Filter and process papers
            for paper in data.get('data', []):
                # Convert publication year to datetime
                pub_year = paper.get('year')
                
                if pub_year:
                    pub_date = datetime(int(pub_year), 1, 1)
                    
                    # Check if paper was published after September 2021
                    if pub_date > datetime(2021, 9, 1):
                        paper_dict = {
                            "title": paper.get('title', 'N/A'),
                            "authors": [
                                author.get('name', 'Unknown') 
                                for author in paper.get('authors', [])
                            ],
                            "published_year": pub_year,
                            "abstract": paper.get('abstract', 'N/A'),
                            "url": paper.get('url', 'N/A'),
                            "citations": paper.get('citationCount', 0),
                            "venue": paper.get('venue', 'N/A')
                        }
                        
                        self.filtered_papers.append(paper_dict)
                        print(f"Found paper {len(self.filtered_papers)}: {paper_dict['title']}")
                        
                        # Break if we've reached max papers
                        if len(self.filtered_papers) >= self.max_papers:
                            break

            # Save to JSON file
            self.save_to_json()
            
            # Print summary
            self.print_summary()

        except Exception as e:
            print(f"An error occurred: {str(e)}")

    def save_to_json(self):
        """Save filtered papers to JSON file"""
        with open("../jsons/ethereum_papers_semantic_scholar.json", "w", encoding="utf-8") as f:
            json.dump(self.filtered_papers, f, ensure_ascii=False, indent=4)

    def print_summary(self):
        """Print summary of scraped papers"""
        print(f"\nSuccessfully scraped {len(self.filtered_papers)} papers and saved to ethereum_papers_semantic_scholar.json")
        
        print("\nMost recent papers:")
        for paper in self.filtered_papers[:3]:  # Show first 3 papers
            print(f"\nTitle: {paper['title']}")
            print(f"Published Year: {paper['published_year']}")
            print(f"Authors: {', '.join(paper['authors'])}")
            print("-" * 80)

def main():
    scraper = SemanticScolarScraper()
    scraper.scrape_papers()

if __name__ == "__main__":
    # Install required library first:
    # pip install requests
    main()