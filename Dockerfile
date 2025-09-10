# Use official Node.js 20 base image (Debian-based)
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Install system dependencies: poppler-utils (for pdftoppm) and tesseract-ocr
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        poppler-utils \
        tesseract-ocr \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# Optional: Confirm pdftoppm location
RUN which pdftoppm && pdftoppm -v || true

# Copy package.json, package-lock.json (if exists), and patches folder BEFORE npm install
COPY package*.json ./ 
COPY patches ./patches

# Install all dependencies (omit optional ones if not needed)
RUN npm install 

# Copy rest of the app files
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the app port if needed (optional)
EXPOSE 3000

# Start the app (runs dist/index.js)
CMD ["npm", "start"]
