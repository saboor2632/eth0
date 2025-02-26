import json
import os
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path

class VitalikDataProcessor:
    def __init__(self):
        self.blog_data = []
        self.youtube_data = []
        self.processed_data = []
        self.unique_contents = set()
        
    def load_data(self):
        """Load data from both blog posts and YouTube transcripts"""
        try:
            # Load blog posts
            blog_path = Path("../scrapy/jsons/scraped_data_Vitalik.json")
            with open(blog_path, 'r', encoding='utf-8') as f:
                self.blog_data = json.load(f)
            
            # Load YouTube transcripts
            youtube_path = Path("../scrapy/jsons/youtube_vitalik_transcripts.json")
            with open(youtube_path, 'r', encoding='utf-8') as f:
                self.youtube_data = json.load(f)
                
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            return False
        return True

    def process_blog_post(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single blog post"""
        return {
            "type": "blog",
            "title": post.get("title", "").strip(),
            "content": post.get("article", "").strip(),
            "date": post.get("date", ""),
            "link": post.get("link", ""),
            "source": "vitalik.eth.limo",
            "content_type": "long_form",
            "themes": self._extract_themes(post.get("article", "")),
        }

    def process_youtube_transcript(self, video: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single YouTube transcript"""
        # Combine transcript entries into a single text
        full_transcript = " ".join([entry["text"] for entry in video.get("transcript", [])])
        
        return {
            "type": "video",
            "title": video.get("title", "").strip(),
            "content": full_transcript.strip(),
            "date": video.get("published_date", ""),
            "link": video.get("url", ""),
            "source": "YouTube",
            "channel": video.get("channel", ""),
            "content_type": "speech",
            "themes": self._extract_themes(full_transcript),
        }

    def _extract_themes(self, content: str) -> List[str]:
        """Extract key themes from content"""
        # Basic theme detection - can be enhanced with NLP
        themes = []
        key_terms = {
            "ethereum": "blockchain",
            "scaling": "technology",
            "proof of stake": "consensus",
            "layer 2": "scaling",
            "rollup": "scaling",
            "governance": "politics",
            "privacy": "security",
            "security": "security",
            "cryptography": "technology",
            "zk": "cryptography",
        }
        
        content_lower = content.lower()
        for term, category in key_terms.items():
            if term in content_lower and category not in themes:
                themes.append(category)
        
        return themes

    def process_twitter_data(self):
        """Process Twitter data from JSON file"""
        twitter_path = Path("../scrapy/jsons/vitalik_tweets.json")
        try:
            with open(twitter_path, 'r', encoding='utf-8') as f:
                tweets = json.load(f)
            
            for tweet in tweets:
                # Only process tweets from VitalikButerin and that have text content
                if (tweet.get("username") == "@VitalikButerin" and 
                    "text" in tweet and 
                    not tweet.get("isRetweet", False)):
                    
                    processed_tweet = {
                        "type": "tweet",
                        "content": tweet["text"],
                        "date": tweet["timestamp"].split("T")[0],  # Extract date part
                        "url": tweet["url"],
                        "themes": [],  # You might want to add theme detection later
                        "metrics": {
                            "likes": tweet.get("likes", 0),
                            "retweets": tweet.get("retweets", 0),
                            "replies": tweet.get("replies", 0),
                            "views": tweet.get("totalViews", 0)
                        }
                    }
                    
                    # Add to processed data if content is unique
                    content_identifier = f"tweet_{tweet['id']}"
                    if content_identifier not in self.unique_contents:
                        self.unique_contents.add(content_identifier)
                        self.processed_data.append(processed_tweet)
                        
        except Exception as e:
            print(f"Error processing Twitter data: {str(e)}")

    def process_all_data(self):
        """Process all available data sources"""
        # Process blog posts
        for post in self.blog_data:
            processed_post = self.process_blog_post(post)
            content_identifier = processed_post["content"]  # Unique identifier for content
            
            if content_identifier not in self.unique_contents:
                self.unique_contents.add(content_identifier)
                self.processed_data.append(processed_post)
        
        # Process YouTube transcripts
        for video in self.youtube_data:
            processed_video = self.process_youtube_transcript(video)
            content_identifier = processed_video["content"]  # Unique identifier for content
            
            if content_identifier not in self.unique_contents:
                self.unique_contents.add(content_identifier)
                self.processed_data.append(processed_video)
        
        # Process tweets
        self.process_twitter_data()
        
        # Sort by date
        def parse_date(date_str):
            """Parse date string into a datetime object, handling different formats."""
            try:
                return datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                try:
                    return datetime.strptime(date_str, "%Y %b %d")
                except ValueError:
                    return datetime.strptime(date_str, "%Y")

        self.processed_data.sort(
            key=lambda x: parse_date(x["date"]),
            reverse=True
        )

    def save_processed_data(self):
        """Save processed data to JSON file"""
        #output_dir = Path("data")
        #output_dir.mkdir(parents=True, exist_ok=True)
        output_path = Path("../scrapy/jsons/processed_vitalik_content.json")
        #output_path = output_dir / "processed_vitalik_content.json"
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.processed_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved processed data to {output_path}")
        except Exception as e:
            print(f"Error saving processed data: {str(e)}")

    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the processed data"""
        
        stats = {
            "total_items": len(self.processed_data),
            "blog_posts": len([x for x in self.processed_data if x["type"] == "blog"]),
            "videos": len([x for x in self.processed_data if x["type"] == "video"]),
            "tweets": len([x for x in self.processed_data if x["type"] == "tweet"]),
            "themes": {},
            "date_range": {
                "earliest": min(x["date"] for x in self.processed_data),
                "latest": max(x["date"] for x in self.processed_data)
            }
        }
        
        # Count themes
        for item in self.processed_data:
            for theme in item["themes"]:
                stats["themes"][theme] = stats["themes"].get(theme, 0) + 1
                
        return stats

def main():
    processor = VitalikDataProcessor()
    
    # Load data
    if not processor.load_data():
        print("Failed to load data. Exiting...")
        return
    
    # Process data
    processor.process_all_data()
    
    # Save processed data
    processor.save_processed_data()
    
    # Print statistics
    stats = processor.get_statistics()
    print("\nData Processing Statistics:")
    print(f"Total items processed: {stats['total_items']}")
    print(f"Blog posts: {stats['blog_posts']}")
    print(f"Videos: {stats['videos']}")
    print(f"Tweets: {stats['tweets']}")
    print("\nThemes found:")
    for theme, count in stats['themes'].items():
        print(f"- {theme}: {count} items")
    print(f"\nDate range: {stats['date_range']['earliest']} to {stats['date_range']['latest']}")

if __name__ == "__main__":
    main()