import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

# target URL
URL = "https://ethglobal.com/events/agents/prizes"
r = requests.get(URL)
r.status_code

soup = BeautifulSoup(r.content, 'html.parser')
div = soup.find("div", class_="col-span-0 sticky top-0 hidden h-screen overflow-auto md:col-span-4 md:block")
names = div.findAll("li")

scraped_data = []

for n in names:
    idi = n.find("p").text.strip()
    idi = idi.lower().replace(' ', '-')
    idi = idi.lower().replace('.', '-')
    ndiv = soup.find("div", id=idi)
    try:
        name = ndiv.find("h2").text
    except:
        name = "Not found"
    print(name)
    try:
        prize = ndiv.find("p").text
    except:
        prize = "Not found"
    print(prize)
    try:
        about = ndiv.find("h3").find_next_sibling(text=True).strip()
    except:
        about = "Not found"
    print(about)
    try:
        prizes = ndiv.findAll("div", class_="mb-2 flex mr-1")
    except:
        prizes = "Not found"
    print(prizes)
    resource_link_data = []
    try:
        resource_link = ndiv.find('div', class_='grid grid-cols-2 gap-2')
        resource_link = resource_link.findAll("a")
        for r in resource_link:
            resource_link_address = (r.get("href"))
            resource_link_title = (r.find("div", class_="text-sm text-black font-base").text.strip())
            print(resource_link_title)
            print(resource_link_address)
            resource_link_data.append({
                "Resource_title": resource_link_title,
                "Resource_link": resource_link_address
            })
    except:
        print("Resource link Not found")
    try:
        workshop_timings = ndiv.find('div', class_="px-4 mb-8").find("a").text
        workshop_title = ndiv.find('div', class_="px-4 mb-8").find("h3", class_='mt-2 text-md font-semibold leading-6 text-gray-900')
        workshop_title = workshop_title.find("div").text.strip()
        workshop_description = ndiv.find('div', class_="px-4 mb-8").find("p").text
        print(workshop_title)
        print(workshop_description)
        print(workshop_timings)
    except:
        workshop_title = "Not found"
        workshop_description = "Not found"
        workshop_timings = "Not found"
        print("Workshop Not found")

    prizes_data = []
    qualification_requirements = "Not found"  # Initialize variable
    for p in prizes:
        try:
            individual_prizes = p.find("div", class_="pt-1").findAll("span")
        except:
            individual_prizes = "Not found"
        try:
            prize_name = individual_prizes[0].text
        except:
            prize_name = "Not found"
        print(prize_name)
        try:
            total_prize_amount = individual_prizes[1].text
        except:
            total_prize_amount = "Not found"
        print(total_prize_amount)
        prize_info = []
        try:
            individual_prizes_extension = p.findAll("div", class_="flex gap-x-1")
            for i in individual_prizes_extension:
                indivi = i.find("div", class_="flex flex-col").findAll("div")
                for b in indivi:
                    print(b.text)
                    prize_info.append(b.text)
        except:
            individual_prizes_extension = "Not found"
            print("Not found")
        individual_prizes_ext = ""
        try:
            individual_prizes_ext = p.find("div", class_="group flex text-md w-fit mt-2 mb-1 font-medium text-gray-900 pl-2 pr-3 py-0.5 bg-gray-100 border border-gray-300 rounded-lg").text.strip()
            print(individual_prizes_ext)
        except:
            individual_prizes_ext = "Not found"
            print("Not found specific")

        try:
            prize_description = p.find("div", class_="text-lg mt-1.5 mb-2 break-words whitespace-pre-line leading-normal").text
            print(prize_description)
        except:
            prize_description = "Not found"
            print("Not found description")
        try:
            qualification_requirements = p.find("div", class_="rounded-md bg-yellow-50 border border-yellow-300 px-3 py-2 mb-3").find("p").text
            print(qualification_requirements)
        except:
            qualification_requirements = "Not found"
            print("Not found qualification")
        links_data = []
        try:
            links = p.find('div', class_='grid grid-cols-2 gap-2')
            links = links.findAll("a")
            for l in links:
                link_address = (l.get("href"))
                link_title = (l.find("div", class_="text-sm text-black font-base").text.strip())
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
    with open('../jsons/scraped_data_EthGlobal_agentic.json'
, 'w', encoding='utf-8') as file:
        json.dump(scraped_data, file, ensure_ascii=False, indent=4)

    print("Data successfully saved to nested_scraped_data.json")
except:
    print("Saving issue")