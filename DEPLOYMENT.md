# Production Deployment Guide — SpaceAnchor Node 🌐🚀

To host **SpaceAnchor** permanently on the web so that others can access it without running it locally, follow this production deployment blueprint.

---

## Option A: Full Cloud Deployment (Render.com + Vercel)

This is the standard, free/low-cost setup for full-stack React + Express applications.

### 1. Backend Deployment (Render.com)
Render is an excellent free hosting platform for Node.js servers.

1.  **Prepare a Git Repository:**
    *   Create a repository on GitHub (e.g. `github.com/yourusername/spaceanchor`).
    *   Push your `SpaceAnchor` project directory.
2.  **Create a Render Web Service:**
    *   Log into [Render.com](https://render.com) and click **New** → **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure Service Settings:**
    *   **Name:** `space-anchor-api`
    *   **Root Directory:** `backend`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
4.  **Environment Variables:**
    Add the following variables in the **Environment** tab:
    *   `PORT`: `10000` (or leave default)
    *   `JWT_SECRET`: a secure random string
    *   `CLIENT_URL`: The URL of your Vercel frontend (e.g., `https://spaceanchor.vercel.app`)
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SENDER_EMAIL` (your Brevo credentials)
5.  **Disk Storage (For SQLite persistence):**
    *   Since Render's file system is ephemeral, add a **Persistent Disk** mount to prevent SQLite database resets.
    *   Under **Disks** click **Add Disk**.
    *   **Name:** `sqlite-data`
    *   **Mount Path:** `/data`
    *   **Size:** `1 GB` (free tier)
    *   Add an Environment Variable: `NODE_ENV=docker` (toggles `db.js` to write the database inside the `/data` mount folder).

---

### 2. Frontend Deployment (Vercel)
Vercel is the premier hosting platform for React and Vite frontends.

1.  **Configure API Proxies for Production:**
    In production, Vite's local dev server proxy does not run. We must direct Axios to hit the Render backend API directly.
    *   Create a file `SpaceAnchor/frontend/src/config.js`:
        ```javascript
        import axios from 'axios';
        // In production, use the Render URL, otherwise use relative path (proxied in local dev)
        const API_URL = import.meta.env.PROD 
          ? 'https://space-anchor-api.onrender.com' 
          : '';
        axios.defaults.baseURL = API_URL;
        ```
    *   Import this config at the top of `SpaceAnchor/frontend/src/main.jsx`.
2.  **Deploy to Vercel:**
    *   Log into [Vercel.com](https://vercel.com) and click **Add New** → **Project**.
    *   Select your GitHub repository.
    *   **Root Directory:** `frontend`
    *   **Framework Preset:** `Vite`
    *   Click **Deploy**.
3.  **Routing Fallback:**
    To support React Router single-page navigation if added later, add a `vercel.json` file in `frontend/`:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```

---

## Option B: Single-Server VPS Deployment (Docker Compose)

If you have a Linux VPS (DigitalOcean, AWS EC2, Linode), you can run the entire stack inside Docker. We have included a root `docker-compose.yml` model below.

### 1. Root `docker-compose.yml`
Save this file in `SpaceAnchor/docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: spaceanchor_backend
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - JWT_SECRET=change_me_in_production
      - CLIENT_URL=http://your-domain.com
      - NODE_ENV=docker
    volumes:
      - sqlite_data:/data
    restart: always

  frontend:
    build: ./frontend
    container_name: spaceanchor_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  sqlite_data:
```

### 2. Docker Files
*   For the **Backend** (`backend/Dockerfile`):
    ```dockerfile
    FROM node:20-alpine
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 4000
    CMD ["node", "index.js"]
    ```
*   For the **Frontend** (`frontend/Dockerfile`):
    In production, compile the Vite app and serve it using Nginx.
    ```dockerfile
    # Build stage
    FROM node:20-alpine as build-stage
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Production stage
    FROM nginx:stable-alpine as production-stage
    COPY --from=build-stage /app/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    ```

Run `docker-compose up --build -d` on your VPS to launch!
