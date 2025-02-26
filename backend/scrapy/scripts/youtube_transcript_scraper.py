import os
import json
import logging
from datetime import datetime, timedelta
import isodate
import googleapiclient.discovery
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv

load_dotenv()  # Load environment variables
api_key = os.getenv('YOUTUBE_API_KEY')

class YouTubeTranscriptScraper:
    def __init__(self, 
                 query=['vitalik buterin podcast', 'vitalik buterin talk', 'vitalik buterin interview'], 
                 max_videos=100,  # This is now videos with transcripts
                 start_date='2021-09-01'):
        # Configure logging
        logging.basicConfig(
            level=logging.INFO, 
            format='%(asctime)s - %(levelname)s: %(message)s'
        )
        self.logger = logging.getLogger(__name__)

        # YouTube Data API setup
        self.api_service_name = "youtube"
        self.api_version = "v3"
        
        # Get API key from environment variable
        self.api_key = os.getenv('YOUTUBE_API_KEY')
        if not self.api_key:
            raise ValueError("YouTube API key not found. Set YOUTUBE_API_KEY environment variable.")
        
        # Initialize YouTube API client
        self.youtube = googleapiclient.discovery.build(
            self.api_service_name, 
            self.api_version, 
            developerKey=self.api_key
        )

        self.query = query
        self.max_videos = max_videos  # Target number of videos with transcripts
        self.start_date = datetime.strptime(start_date, '%Y-%m-%d')
        self.filtered_videos = []
        self.videos_checked = 0
        self.max_api_results = 50  # Maximum results per API request

    def search_videos(self):
        """
        Search for videos containing keywords and transcripts
        """
        try:
            # Set to store unique titles to prevent duplicates
            unique_titles = set()
            
            # Continue searching until we have enough videos with transcripts
            while len(self.filtered_videos) < self.max_videos:
                # Combine search for multiple keywords
                for search_term in self.query:
                    self.logger.info(f"Searching for '{search_term}' videos...")
                    
                    # Calculate how many more videos we need
                    videos_needed = self.max_videos - len(self.filtered_videos)
                    if videos_needed <= 0:
                        break

                    # Search request parameters
                    request = self.youtube.search().list(
                        part="snippet",
                        q=search_term,
                        type="video",
                        order="date",
                        maxResults=min(self.max_api_results, videos_needed * 2),
                        publishedAfter=(self.start_date.isoformat() + 'Z')
                    )

                    # Execute search
                    response = request.execute()

                    # Process each video
                    for item in response.get('items', []):
                        try:
                            video_id = item['id']['videoId']
                            title = item['snippet']['title']
                            
                            # Skip if title already exists
                            if title in unique_titles:
                                self.logger.debug(f"Skipping duplicate title: {title}")
                                continue
                            
                            # Check for transcript first
                            try:
                                transcript = self.get_transcript(video_id)
                                if not transcript:  # Skip if no transcript
                                    continue
                            except Exception as transcript_error:
                                self.logger.debug(f"No transcript for {video_id}: {transcript_error}")
                                continue

                            # If we have a transcript, extract other video details
                            published_at = item['snippet']['publishedAt']
                            channel_title = item['snippet']['channelTitle']

                            # Parse publication date
                            pub_date = datetime.fromisoformat(
                                published_at.replace('Z', '+00:00')
                            )

                            # Create video dictionary
                            video_dict = {
                                "video_id": video_id,
                                "title": title,
                                "channel": channel_title,
                                "published_date": pub_date.strftime('%Y-%m-%d'),
                                "transcript": transcript,
                                "url": f"https://www.youtube.com/watch?v={video_id}"
                            }

                            # Add title to unique set and video to filtered list
                            unique_titles.add(title)
                            self.filtered_videos.append(video_dict)
                            self.logger.info(f"Found video with transcript ({len(self.filtered_videos)}/{self.max_videos}): {title}")

                            # Break if we've reached max videos
                            if len(self.filtered_videos) >= self.max_videos:
                                break

                        except Exception as video_error:
                            self.logger.error(f"Error processing video: {video_error}")

                    # Break if we've reached max videos
                    if len(self.filtered_videos) >= self.max_videos:
                        break

                    # Update start date if we need more videos
                    if len(self.filtered_videos) < self.max_videos:
                        self.start_date = self.start_date - timedelta(days=30)
                        self.logger.info(f"Extending search to {self.start_date.strftime('%Y-%m-%d')}")

        except Exception as e:
            self.logger.error(f"Search error: {e}")

    def get_transcript(self, video_id):
        """
        Retrieve transcript for a given video
        """
        try:
            # Fetch transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Process transcript
            processed_transcript = []
            for entry in transcript_list:
                processed_transcript.append({
                    'text': entry['text'],
                    'start_time': entry['start']
                })
            
            return processed_transcript

        except Exception as e:
            self.logger.debug(f"Transcript retrieval failed for {video_id}: {e}")
            return None

    def save_to_json(self):
        """Save filtered videos to JSON file"""
        os.makedirs('../jsons', exist_ok=True)  # Create directory if it doesn't exist
        with open("../jsons/youtube_vitalik_transcripts.json", "w", encoding="utf-8") as f:
            json.dump(self.filtered_videos, f, ensure_ascii=False, indent=4)

    def print_summary(self):
        """Print summary of scraped videos"""
        self.logger.info(f"\nSuccessfully scraped {len(self.filtered_videos)} videos with transcripts")
        
        for video in self.filtered_videos[:3]:
            self.logger.info(f"\nTitle: {video['title']}")
            self.logger.info(f"Channel: {video['channel']}")
            self.logger.info(f"Published Date: {video['published_date']}")
            self.logger.info(f"Transcript Length: {len(video['transcript'])} entries")

    def run(self):
        """Execute full scraping process"""
        self.search_videos()
        self.save_to_json()
        self.print_summary()

def main():
    scraper = YouTubeTranscriptScraper()
    scraper.run()

if __name__ == "__main__":
    main() 