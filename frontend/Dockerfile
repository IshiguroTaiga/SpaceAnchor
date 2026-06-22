# SpaceAnchor Frontend Dockerfile
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# Vite must bind to 0.0.0.0 to listen on all interfaces within Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
