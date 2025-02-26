import os
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

def get_latest_videos():
    # Build YouTube API client
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    # Get channel ID for ETHGlobal
    channel_request = youtube.search().list(
        q="ETHGlobal",
        type="channel",
        part="id",
        maxResults=1
    )
    channel_response = channel_request.execute()
    channel_id = channel_response['items'][0]['id']['channelId']
    
    # Get latest videos from channel
    videos_request = youtube.search().list(
        channelId=channel_id,
        order="date",
        part="snippet",
        type="video",
        maxResults=15
    )
    videos_response = videos_request.execute()
    
    return videos_response['items']

def get_video_transcripts():
    videos = get_latest_videos()
    transcripts = []
    
    for video in videos:
        video_id = video['id']['videoId']
        video_title = video['snippet']['title']
        
        try:
            # Get transcript for each video
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Combine transcript text
            full_transcript = ' '.join([entry['text'] for entry in transcript])
            
            transcripts.append({
                'title': video_title,
                'video_id': video_id,
                'transcript': full_transcript
            })
            
            print(f"Successfully retrieved transcript for: {video_title}")
            
        except Exception as e:
            print(f"Could not retrieve transcript for video {video_title}: {str(e)}")
    
    return transcripts

if __name__ == "__main__":
    transcripts = get_video_transcripts()
    
    # Save transcripts to JSON file
    output_file = "../jsons/agentic_youtube.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transcripts, f, ensure_ascii=False, indent=4)
    
    print(f"\nSaved {len(transcripts)} transcripts to {output_file}")
    print("Preview of saved data:")
    for t in transcripts[:2]:  # Show preview of first 2 transcripts
        print(f"\nVideo: {t['title']}")
        print(f"ID: {t['video_id']}")
        print(f"Transcript preview: {t['transcript'][:200]}...")
