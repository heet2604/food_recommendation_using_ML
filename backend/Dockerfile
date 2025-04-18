FROM nikolaik/python-nodejs:python3.9-nodejs18

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements files for better caching
COPY backend/requirements.txt backend/package.json backend/package-lock.json ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
RUN npm ci

# Copy the rest of the application files (including server.js) to /app
COPY . .

# Set environment variables
ENV PORT=5000

# Expose the port
EXPOSE $PORT

# Command to run the application
CMD ["node", "/app/server.js"]
