from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import os

# Set up ChromeDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Initialize an empty list to store all data
all_data = []

# Initialize page counter
page = 1
has_more_pages = True

while has_more_pages:
    try:
        # Construct URL with page number
        url = f"https://api.de.fi/v1/rekt/list?sortField=fundsLost&sort=desc&sortDirection=desc&limit=10&page={page}"
        
        print(f"Fetching page {page}...")  # Debug print
        
        # Open the webpage
        driver.get(url)
        
        # Wait for content to load
        time.sleep(5)
        
        try:
            # Get JSON content
            json_element = driver.find_element(By.TAG_NAME, "pre")
            json_text = json_element.text
            
            # Parse JSON
            page_data = json.loads(json_text)
            
            # Check if there's data in the response (using 'items' instead of 'data')
            if 'items' in page_data and page_data['items']:
                #print(f"Data found on page {page}: {len(page_data['items'])} items")
                all_data.extend(page_data['items'])
                print(f"Successfully scraped page {page}")
                
                # Check if we've reached the last page
                if page >= page_data.get('lastPage', 1):
                    print(f"Reached last page ({page})")
                    has_more_pages = False
                else:
                    page += 1
            else:
                print(f"No items found on page {page}")
                has_more_pages = False
                
        except Exception as e:
            print(f"Error processing page {page}: {str(e)}")
            has_more_pages = False
            break
            
    except Exception as e:
        print(f"Error loading page {page}: {str(e)}")
        has_more_pages = False
        break

# Close the browser
driver.quit()

# Save all data to a JSON file if we have collected any
if all_data:
    try:
        # Create directory if it doesn't exist
        os.makedirs('../jsons', exist_ok=True)
        
        # Save to JSON file
        with open('../jsons/rekt_database_scraped.json', 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=4)
        print(f"Data successfully saved to rekt_database_scraped.json")
        print(f"Total pages scraped: {page}")
        print(f"Total items collected: {len(all_data)}")
    except Exception as e:
        print(f"Error saving data: {str(e)}")
else:
    print("No data was collected to save")