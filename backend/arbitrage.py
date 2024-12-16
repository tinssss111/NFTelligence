import os
import ccxt
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from groq import Groq  # Thư viện Groq cho AI phân tích

# Cấu hình Flask app
app = Flask(__name__)
CORS(app)

load_dotenv(dotenv_path=".env")
# Groq API Key
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY_2"),)

# Danh sách các sàn giao dịch được hỗ trợ
EXCHANGES = {
    "binance": ccxt.binance(),
    "kraken": ccxt.kraken(),
    "coinbase": ccxt.coinbase(),
    "bitfinex": ccxt.bitfinex(),
    "bitmex": ccxt.bitmex(),
}

def fetch_prices(symbol):
    """Lấy giá từ các sàn giao dịch."""
    prices = {}
    for exchange_name, exchange in EXCHANGES.items():
        try:
            ticker = exchange.fetch_ticker(symbol)
            prices[exchange_name] = ticker["last"]
        except Exception as e:
            print(f"Error fetching data from {exchange_name}: {e}")
    return prices

def analyze_arbitrage_with_groq(prices):
    """Sử dụng AI Groq để phân tích và đưa ra lời khuyên giao dịch arbitrage."""
    prompt = f"""
    You are a financial expert specializing in cryptocurrency arbitrage. Analyze the following cryptocurrency prices across multiple exchanges:

    {prices}

    Provide a detailed analysis that includes:
    1. The exchange with the lowest price for buying Bitcoin.
    2. The exchange with the highest price for selling Bitcoin.
    3. The calculated profit margin based on the difference between the buying and selling prices.
    4. Any significant observations about the price differences across exchanges.
    5. A final recommendation: Should the user proceed with an arbitrage trade, considering the profit margin, trading fees (assume 0.2% per trade), and any other potential risks? Justify your recommendation.

    Return your response in this structure:
    {{
      "analysis": "<Your detailed analysis>",
      "final_recommendation": {{
        "buy_exchange": "<exchange_name>",
        "sell_exchange": "<exchange_name>",
        "buy_price": <price>,
        "sell_price": <price>,
        "profit_margin": <percentage>,
        "should_proceed": <true/false>,
        "reason": "<justification for the recommendation>"
      }}
    }}
    """
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192"
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error using Groq AI: {e}")
        return "Unable to analyze arbitrage opportunities using Groq."


@app.route("/arbitrage", methods=["GET"])
def arbitrage():
    """API kiểm tra cơ hội arbitrage."""
    # Mặc định sử dụng ADA/USDT nếu không có đồng tiền cụ thể
    symbol_with_currency = "ADA/USDT"
    prices = fetch_prices(symbol_with_currency)
    
    # Phân tích dữ liệu bằng AI Groq
    ai_analysis = analyze_arbitrage_with_groq(prices)

    return jsonify({
        "prices": prices,
        "ai_analysis": ai_analysis
    })


if __name__ == "__main__":
    print("Arbitrage Trading Bot with AI is running...")
    app.run(debug=True, port=5002)
