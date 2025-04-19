FROM nikolaik/python-nodejs:python3.9-nodejs18

WORKDIR /app

# Copy only the necessary files for dependencies first
COPY requirements.txt ./
COPY package*.json ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN npm ci

# Now copy the rest of the application files
COPY . .

# Set environment variables
ENV PORT=5000

# Expose the port
EXPOSE $PORT

# Command to run the application
CMD ["node", "server.js"]