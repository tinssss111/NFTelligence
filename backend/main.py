from flask import Flask, jsonify
from flask_cors import CORS
import os

# Import các hàm từ các file khác
from app import app_bp
from btc import btc_bp
from hodling import hodling_bp
from arbitrage import arbitrage_bp

# Khởi tạo Flask server
app = Flask(__name__)
CORS(app)

# Đăng ký các route từ các file
app.register_blueprint(app_bp, url_prefix="/trend")
app.register_blueprint(btc_bp, url_prefix="/btc")
app.register_blueprint(hodling_bp, url_prefix="/investment")
app.register_blueprint(arbitrage_bp, url_prefix="/arbitrage")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Lấy cổng từ biến PORT
    app.run(debug=True, host='0.0.0.0', port=port)
