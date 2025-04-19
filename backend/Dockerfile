FROM nikolaik/python-nodejs:python3.9-nodejs18

WORKDIR /app

# Copy dependency files first
COPY requirements.txt ./
COPY package*.json ./

# Install Python and Node.js dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN npm ci

# Copy the rest of code
COPY . .

# Set environment variable
ENV PORT=5000

# Expose both ports
EXPOSE 3000
EXPOSE 5000

# Start both servers: Flask (ocr_server.py) and Node.js (server.js)
CMD ["sh", "-c", "python3 ocr_server.py & node server.js"]
