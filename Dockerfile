# Sử dụng Python 3.13 làm base image
FROM python:3.11

# Chỉ định thư mục làm việc trong container
WORKDIR /app

# Copy toàn bộ code vào container
COPY . .

# Cài đặt dependencies từ requirements.txt (nếu có)
RUN pip install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Chạy các file Python backend
CMD ["sh", "-c", "python backend/app.py & python backend/btc.py & python backend/arbitrage.py & python backend/hodling.py"]
