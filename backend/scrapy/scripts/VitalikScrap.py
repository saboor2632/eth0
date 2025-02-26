import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

#target URL
URL = "https://vitalik.eth.limo/"
r = requests.get(URL)
r.status_code

soup = BeautifulSoup(r.content, 'html.parser')
div = soup.find("ul", class_ = "post-list")
div = div.findAll("li")
scraped_data = []
for di in div:
  title = di.find("h3").text
  link = URL + di.find("a").get("href")
  date = di.find("span").text
  if(date[:4] != "2024"):
    break
  url2 = link
  r2 = requests.get(url2)
  soup2 = BeautifulSoup(r2.content, 'html.parser')
  div1 = soup2.find("div", id = "doc")
  div2 = div1.findAll("p")
  article = ""
  for d in div2:
    previous_sibling = d.find_previous_sibling()
    if previous_sibling and previous_sibling.name == "h2":
        h2_tag = previous_sibling
        article += h2_tag.text.strip() + "\n"
    else:
      if previous_sibling and previous_sibling.name == "h3":  # If an <h3> tag exists
        h3_tag = previous_sibling
        article += h3_tag.text.strip() + "\n"
    article += d.text + "\n"
    next_sibling = d.find_next_sibling()
    if next_sibling and next_sibling.name == "ul":
        li_tags = next_sibling.findAll("li")
        for li in li_tags:
            article += li.text + "\n"
    if next_sibling and next_sibling.name == "h2":
        h2_tag = next_sibling
        next_sibling2 = h2_tag.find_next_sibling()
        if next_sibling2 and next_sibling2.name == "ul":
            article += h2_tag.text.strip() + "\n"
            li_tags = next_sibling2.findAll("li")
            for li in li_tags:
                article += li.text + "\n"
    if next_sibling and next_sibling.name == "h3":
        h3_tag = next_sibling
        next_sibling2 = h3_tag.find_next_sibling()
        if next_sibling2 and next_sibling2.name == "ul":
            article += h3_tag.text.strip() + "\n"
            li_tags = next_sibling2.findAll("li")
            for li in li_tags:
                article += li.text + "\n"
    if next_sibling and next_sibling.name == "ol":
        li_tags = next_sibling.findAll("li")
        for li in li_tags:
            article += li.text + "\n"
  print(title)
  scraped_data.append({
      "title": title,
      "link": link,
      "date": date,
      "article": article
  })

try:
  with open('../jsons/scraped_data_Vitalik.json', 'w', encoding='utf-8') as file:
          json.dump(scraped_data, file, ensure_ascii=False, indent=4)

  print("Data successfully saved to scraped_data_Vitalik.json")
except:
    print("Saving issue")