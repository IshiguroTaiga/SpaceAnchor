# SpaceAnchor Backend Dockerfile
FROM node:22

WORKDIR /app

# Install native compilation dependencies for SQLite better-sqlite3 library
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# Seed demo data and start the server node
CMD node seed_demo.js && npm start
