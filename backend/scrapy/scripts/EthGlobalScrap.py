import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

#target URL
URL = "http://ethglobal.com/events/bangkok/prizes"
r = requests.get(URL)
r.status_code

soup = BeautifulSoup(r.content, 'html.parser')
div = soup.find("div", class_="col-span-0 sticky top-0 hidden h-screen overflow-auto md:col-span-4 md:block")
names = div.findAll("li")

scraped_data = []

for n in names:
    idi = n.find("p").text.strip()
    idi = idi.lower().replace(' ', '-')
    ndiv = soup.find("div", id = idi)
    name = ndiv.find("h2").text
    print(name)
    prize = ndiv.find("p").text
    print(prize)
    about = ndiv.find("h3").find_next_sibling(text=True).strip()
    print(about)
    prizes = ndiv.findAll("div", class_ = "mb-2 flex mr-1")
    resource_link_data = []
    try:
      resource_link = ndiv.find('div', class_='grid grid-cols-2 gap-2')
      resource_link = resource_link.findAll("a")
      for r in resource_link:
        resource_link_address = (r.get("href"))
        resource_link_title = (r.find("div", class_ = "text-sm text-black font-base").text.strip())
        print(resource_link_title)
        print(resource_link_address)
        resource_link_data.append({
          "Resource_title": resource_link_title,
          "Resource_link": resource_link_address
        })
    except:
        print("Resource link Not found")
    try:
      workshop_timings = ndiv.find('div', class_ ="px-4 mb-8").find("a").text
      workshop_title = ndiv.find('div', class_ ="px-4 mb-8").find("h3", class_ ='mt-2 text-md font-semibold leading-6 text-gray-900')
      workshop_title = workshop_title.find("div").text.strip()
      workshop_description = ndiv.find('div', class_ ="px-4 mb-8").find("p").text
      print(workshop_title)
      print(workshop_description)
      print(workshop_timings)
    except:
      workshop_title = "Not found"
      workshop_description = "Not found"
      workshop_timings = "Not found"
      print("Workshop Not found")

    prizes_data = []
    for p in prizes:
        individual_prizes = p.find("div", class_ = "pt-1").findAll("span")
        #for a in individual_prizes:
        prize_name = individual_prizes[0].text
        print(prize_name)
        total_prize_amount = individual_prizes[2].text
        print(total_prize_amount)
        #print(a.text)
        #b = p.find("div", class_ ="flex gap-x-1").findAll("div")
        #print(b[0].text)
        #print(b[1].text)
        prize_info = []
        try:
          individual_prizes_extension = p.findAll("div", class_ ="flex gap-x-1")
          for i in individual_prizes_extension:
            indivi = i.find("div", class_ ="flex flex-col").findAll("div")
            for b in indivi:
              print(b.text)
              prize_info.append(b.text)
        except:
          print("Not found")
        individual_prizes_ext = ""
        try:
          individual_prizes_ext = p.find("div", class_="group flex text-md w-fit mt-2 mb-1 font-medium text-gray-900 pl-2 pr-3 py-0.5 bg-gray-100 border border-gray-300 rounded-lg").text.strip()
          print(individual_prizes_ext)
        except:
          print("Not found specific")

        try:
          prize_description = p.find("div", class_="text-lg mt-1.5 mb-2 break-words whitespace-pre-line leading-normal").text
          print(prize_description)
        except:
          print("Not found description")
        try:
          qualification_requirements = p.find("div", class_ ="rounded-md bg-yellow-50 border border-yellow-300 px-3 py-2 mb-3").find("p").text
          print(qualification_requirements)
        except:
          print("Not found qualification")
        links_data = []
        try:
          links = p.find('div', class_='grid grid-cols-2 gap-2')
          links = links.findAll("a")
          for l in links:
            link_address = (l.get("href"))
            link_title = (l.find("div", class_ = "text-sm text-black font-base").text.strip())
            links_data.append({
              "Prize_information_Link_title": link_title,
              "Link_information_link_address": link_address
            })
        except:
          print("Not found links")
          
        prizes_data.append({
            "Prize_Name": prize_name,
            "Total_Prize_Amount": total_prize_amount,
            "Prize_Description": prize_description,
            "Qualification_Requirements": qualification_requirements,
            "Prize_information_links": links_data,
            "Prize_Information": prize_info,
            "Prize_Information_extended": individual_prizes_ext
        })

    scraped_data.append({
        "title": name,
        "Total_Prize": prize,
        "About": about,
        "Workshop_title": workshop_title,
        "Workshop_Description": workshop_description,
        "Workshop_timings": workshop_timings,
        "Qualification_Requirements": qualification_requirements,
        "Prizes": prizes_data,
        "Resource_links": resource_link_data
    })

try:
  with open('../jsons/scraped_data_EthGlobal.json', 'w', encoding='utf-8') as file:
          json.dump(scraped_data, file, ensure_ascii=False, indent=4)

  print("Data successfully saved to nested_scraped_data.json")
except:
    print("Saving issue")
