import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import re

#target URL
URL = "https://rekt.news/leaderboard/"
r = requests.get(URL)

soup = BeautifulSoup(r.content, 'html.parser')
div = soup.find("ol", class_="leaderboard-content")
div = div.findAll("li")
scraped_data = []
for d in div:
  link = "https://rekt.news" + d.find("a").get("href")
  title = d.find("a").text
  audit_status = d.find("span",class_ = "leaderboard-audit").text
  price, date = d.find("div", class_ = "leaderboard-row-details").text.split(" | ")
  print(title, link, audit_status, price, date)
  url2 = link
  r2 = requests.get(url2)
  soup2 = BeautifulSoup(r2.content, 'html.parser')
  article = soup2.find("section", class_ = "post-content")
  article = article.findAll("p")
  article_text = []
  for a in article:
    text = a.get_text()
    article_text.append(text)
  
  full_article = '\n'.join(article_text)
  print(full_article)
  scraped_data.append({
      "title": title,
      "link": link,
      "date": date,
      "audit_staus" : audit_status,
      "price": price,
      "article": full_article
  })

try:
  with open('../jsons/rekt_news_scraped.json', 'w', encoding='utf-8') as file:
          json.dump(scraped_data, file, ensure_ascii=False, indent=4)

  print("Data successfully saved to rekt_news_scraped.json")
except:
    print("Saving issue")