import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

counter = 0
scraped_data = []
while(True):
  if (counter == 4):
    break
  URL = "https://ethresear.ch/latest?no_definitions=true&page=" + str(counter)
  counter += 1
  r = requests.get(URL)
  soup = BeautifulSoup(r.content, 'html.parser')
  div = soup.findAll("tr", class_ = "topic-list-item")
  for i, di in enumerate(div):
    if (i == 0):
      continue
    link = di.find("a").get("href")
    title = di.find("a").text
    try:
      category = di.find("span", class_ = "category-name").text
    except:
      category = None
    try:
      discourse = di.findAll("a", class_ = "discourse-tag")
      tags = []
      for dis in discourse:
        tags.append(dis.text)
      discourse = tags
    except:
      try:
        discourse = di.find("a", class_ = "discourse-tag").text
      except:
        discourse = None
    print(link, title)
    url2 = link
    r2 = requests.get(url2)
    soup2 = BeautifulSoup(r2.content, 'html.parser')
    try:
      category = soup2.findAll("span", class_ = "category-name")
      badge_category = []
      for cat in category:
        badge_category.append(cat.text)
      category = badge_category
    except:
      try:
        category = soup2.find("span", class_ = "category-name").text
      except:
        category = None
    #Tags
    try:
      discourse = di.findAll("a", class_ = "discourse-tag")
      tags = []
      for dis in discourse:
        tags.append(dis.text)
      discourse = tags
    except:
      try:
        discourse = di.find("a", class_ = "discourse-tag").text
      except:
        discourse = None
    div = soup2.find("div", class_ = "post")
    #print(div)
    div1 = div.findAll("p")
    article = ""
    for d in div1:
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
    print(category,discourse)
    #print(article)
    scraped_data.append({
      "title": title,
      "link": link,
      "article": article,
      "category": category,
      "discourse": discourse
    }) 
    
try:
  with open('../jsons/scraped_data_Ethsear.json', 'w', encoding='utf-8') as file:
          json.dump(scraped_data, file, ensure_ascii=False, indent=4)

  print("Data successfully saved to nested_scraped_data_Ethsear.json")
except:
    print("Saving issue")