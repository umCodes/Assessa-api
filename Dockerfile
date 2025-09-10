# Use an official Node 18 LTS image
FROM node:18-slim

# Install system dependencies required by poppler & tesseract
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build TypeScript to dist/
RUN npm run build

# Expose port (Render sets PORT env anyway, but good practice)
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
