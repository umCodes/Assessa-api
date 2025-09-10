FROM node:18

# Install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
