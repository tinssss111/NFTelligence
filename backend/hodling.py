import os
import re
from dotenv import load_dotenv 
from flask import Blueprint, Flask, jsonify
import requests
from googleapiclient.discovery import build
from groq import Groq
from flask_cors import CORS

load_dotenv(dotenv_path=".env")
# Flask app
hodling_bp = Blueprint('hodling_bp', __name__)

# API keys
gg_api_key = os.getenv("GG_API_KEY")
cse_id = os.getenv("CSE_ID")
client = Groq(
    api_key=os.getenv("GROQ_API_KEY_3"),
)


def fetch_coin_info():
    """Fetch information about major cryptocurrencies from CoinGecko API."""
    coins = ["bitcoin", "ethereum", "cardano", "polkadot", "solana"]
    coin_data = {}

    for coin in coins:
        url = f"https://api.coingecko.com/api/v3/coins/{coin}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                coin_data[coin] = {
                    "name": data["name"],
                    "symbol": data["symbol"],
                    "price": data["market_data"]["current_price"]["usd"],
                    "volume": data["market_data"]["total_volume"]["usd"],
                    "market_cap": data["market_data"]["market_cap"]["usd"],
                    "price_change_24h": data["market_data"]["price_change_percentage_24h"],
                }
        except Exception as e:
            print(f"Error fetching data for {coin}: {e}")
    return coin_data


def search_market_trends():
    """Search for the latest market trends using Google Custom Search API."""
    service = build("customsearch", "v1", developerKey=gg_api_key)
    try:
        results = service.cse().list(
            q="best cryptocurrencies for long term investment 2024", cx=cse_id, num=5
        ).execute()
        return [
            {"title": item["title"], "link": item["link"], "snippet": item["snippet"]}
            for item in results.get("items", [])
        ]
    except Exception as e:
        print(f"Error fetching market trends: {e}")
        return []


def analyze_coin_market(coin_data, trends):
    """Analyze cryptocurrency data and trends to make a recommendation."""
    prompt = f"""Analyze the following cryptocurrency data and market trends. Recommend the best cryptocurrency for long-term investment.
    Cryptocurrency Data: {coin_data}
    Trends: {trends}

    Include in the analysis:
    1. Current market conditions (price, market cap, volume).
    2. Growth potential based on market trends.
    3. Risks and opportunities.

    Return the result in this JSON format:
    {{
      "analysis": "<detailed analysis>",
      "final_decision": {{
        "token_name": "<best_coin>",
        "decision": <true/false>,
        "reason": "<justification>"
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


@hodling_bp.route("/", methods=["GET"],strict_slashes=False)
def investment_analysis():
    """Endpoint to analyze and recommend cryptocurrency for long-term investment."""
    coin_data = fetch_coin_info()
    trends = search_market_trends()
    analysis = analyze_coin_market(coin_data, trends)

    # Extract token_name and decision from analysis if provided
    match = re.search(
        r'"final_decision":\s*{\s*"token_name":\s*"([^"]+)",\s*"decision":\s*(true|false),\s*"reason":\s*"([^"]+)"',
        analysis if analysis else "",
    )
    if match:
        token_name = match.group(1)
        decision = match.group(2).lower() == "true"
        reason = match.group(3)
    else:
        token_name = "None"
        decision = False
        reason = "No data available."

    return jsonify(
        {
            "analysis": analysis if analysis else "Không thể phân tích dữ liệu.",
            "final_decision": {
                "token_name": token_name,
                "decision": decision,
                "reason": reason,
            },
        }
    )

