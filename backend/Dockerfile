FROM nikolaik/python-nodejs:python3.9-nodejs18

WORKDIR /app

# Copy requirements files first for better caching
COPY requirements.txt package.json package-lock.json ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=5000

# Expose the port
EXPOSE $PORT

# Command to run the application
CMD ["node", "server.js"]