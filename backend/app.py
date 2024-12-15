import os
import re
from dotenv import load_dotenv
from flask import Flask, jsonify
import requests
from googleapiclient.discovery import build
from groq import Groq
from flask_cors import CORS

# Flask app
app = Flask(__name__)
CORS(app)
# API keys
load_dotenv()
gg_api_key = os.getenv("GG_API_KEY")
cse_id = os.getenv("CSE_ID")
client = Groq(
    api_key=os.getenv("GROQ_API_KEY_1"),
)

def fetch_memecoin_info():
    """Fetch information about popular memecoins from CoinGecko API."""
    memecoins = ["dogecoin", "shiba-inu", "pepe", "floki", "bonk"]
    memecoin_data = {}

    for coin in memecoins:
        url = f"https://api.coingecko.com/api/v3/coins/{coin}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                memecoin_data[coin] = {
                    "name": data["name"],
                    "symbol": data["symbol"],
                    "price": data["market_data"]["current_price"]["usd"],
                    "volume": data["market_data"]["total_volume"]["usd"],
                    "market_cap": data["market_data"]["market_cap"]["usd"],
                    "price_change_24h": data["market_data"]["price_change_percentage_24h"],
                }
        except Exception as e:
            print(f"Error fetching data for {coin}: {e}")
    return memecoin_data

def search_trends():
    """Search for the latest trends using Google Custom Search API."""
    service = build("customsearch", "v1", developerKey=gg_api_key)
    try:
        results = service.cse().list(q="latest meme trends cryptocurrency", cx=cse_id, num=5).execute()
        return [
            {"title": item["title"], "link": item["link"], "snippet": item["snippet"]}
            for item in results.get("items", [])
        ]
    except Exception as e:
        print(f"Error fetching trends: {e}")
        return []

def analyze_market(memecoin_data, trends):
    """Analyze memecoin data and trends to make a decision."""
    prompt = f"""Analyze the following memecoin data and trends. Recommend the best coin to buy or sell.
    Memecoin Data: {memecoin_data}
    Trends: {trends}

    Return the result in this format:
    {{
      "analysis": "<detailed analysis>",
      "final_decision": {{
        "token_name": "<best_token>",
        "decision": <true/false>
      }}
    }}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error analyzing market: {e}")
        return None


@app.route('/trend', methods=['GET'])
def main():
    """Main endpoint to get market analysis and recommendation."""
    memecoin_data = fetch_memecoin_info()
    trends = search_trends()
    analysis = analyze_market(memecoin_data, trends)

    # Extract token_name and decision from analysis if provided
    match = re.search(r'"final_decision":\s*{\s*"token_name":\s*"([^"]+)",\s*"decision":\s*(true|false)', analysis if analysis else "")
    if match:
        token_name = match.group(1)
        decision = match.group(2).lower() == 'true'
    else:
        token_name = "None"
        decision = False

    # Trả về chỉ hai giá trị yêu cầu
    return jsonify({
        "analysis": analysis if analysis else "Không thể phân tích dữ liệu.",
        "final_decision": {
            "token_name": token_name,
            "decision": decision
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
