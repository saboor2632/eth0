import tweepy
import json
import os
from datetime import datetime
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class TwitterScraper:
    def __init__(self):
        # Set up logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        
        # Initialize Twitter API v2 client
        self.client = tweepy.Client(
            bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
            consumer_key=os.getenv('TWITTER_API_KEY'),
            consumer_secret=os.getenv('TWITTER_API_SECRET'),
            access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
            access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            wait_on_rate_limit=True
        )
        
        self.tweets = []
        
    def get_user_tweets(self, username="vitalikbuterin", max_tweets=100):
        """Fetch tweets from a specific user"""
        try:
            # Get user ID first
            user = self.client.get_user(username=username)
            if not user.data:
                self.logger.error(f"User {username} not found")
                return []
            
            user_id = user.data.id
            
            # Keep track of seen tweets to avoid duplicates
            seen_tweets = set()
            
            # Get tweets with pagination
            pagination_token = None
            while len(self.tweets) < max_tweets:
                # Fetch tweets
                response = self.client.get_users_tweets(
                    user_id,
                    max_results=min(100, max_tweets - len(self.tweets)),
                    pagination_token=pagination_token,
                    tweet_fields=['created_at', 'public_metrics', 'context_annotations', 'entities'],
                    exclude=['retweets', 'replies']
                )
                
                if not response.data:
                    break
                
                # Process tweets
                for tweet in response.data:
                    if tweet.id in seen_tweets:
                        continue
                        
                    seen_tweets.add(tweet.id)
                    
                    # Extract hashtags and mentions
                    hashtags = []
                    mentions = []
                    if hasattr(tweet, 'entities'):
                        if 'hashtags' in tweet.entities:
                            hashtags = [tag['tag'] for tag in tweet.entities['hashtags']]
                        if 'mentions' in tweet.entities:
                            mentions = [mention['username'] for mention in tweet.entities['mentions']]
                    
                    # Extract topics if available
                    topics = []
                    if hasattr(tweet, 'context_annotations'):
                        for context in tweet.context_annotations:
                            if 'domain' in context:
                                topics.append(context['domain'].get('name', ''))
                    
                    tweet_data = {
                        "id": tweet.id,
                        "text": tweet.text,
                        "created_at": tweet.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                        "metrics": {
                            "retweets": tweet.public_metrics['retweet_count'],
                            "likes": tweet.public_metrics['like_count'],
                            "replies": tweet.public_metrics['reply_count'],
                            "quotes": tweet.public_metrics['quote_count']
                        },
                        "hashtags": hashtags,
                        "mentions": mentions,
                        "topics": topics,
                        "url": f"https://twitter.com/{username}/status/{tweet.id}"
                    }
                    
                    self.tweets.append(tweet_data)
                    
                # Check if we need to paginate
                if 'next_token' in response.meta:
                    pagination_token = response.meta['next_token']
                else:
                    break
                    
            self.logger.info(f"Successfully fetched {len(self.tweets)} tweets from {username}")
            return self.tweets
            
        except Exception as e:
            self.logger.error(f"Error fetching tweets: {str(e)}")
            return []
    
    def save_tweets(self, filename="vitalik_tweets.json"):
        """Save tweets to JSON file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.tweets, f, ensure_ascii=False, indent=2)
            self.logger.info(f"Successfully saved tweets to {filename}")
        except Exception as e:
            self.logger.error(f"Error saving tweets: {str(e)}")

def main():
    scraper = TwitterScraper()
    tweets = scraper.get_user_tweets(max_tweets=200)  # Fetch 200 tweets
    scraper.save_tweets("data/vitalik_tweets.json")

if __name__ == "__main__":
    main()