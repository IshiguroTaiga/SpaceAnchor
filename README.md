# SpaceAnchor 🛰️✨
### Madame Herta's Dynamic Link Redirection & Telemetry Hub

**SpaceAnchor** is a secure, multi-domain link shortener and real-time click telemetry dashboard. Themed around Honkai: Star Rail's Herta Space Station and the Simulated Universe, the system is designed to act as a digital "Space Anchor" (teleportation node) that routes incoming client paths to target destinations while tracking detailed user-agent, temporal, and geographic metrics.

Developed as a modern, premium full-stack solution, it combines high-performance link mapping with advanced analytics filters, administrative user deployment, and Brevo/SMTP email dispatch systems.

---

## 🌌 System Architecture & Features

### 1. **Genius Shortener Core**
*   **Instant Warp Anchors:** Paste any destination URL, and the system generates a stable base-36 path token (e.g. `/x8b2q9`).
*   **Custom Domain Branding:** Only the domain part can be customizable—the web address remains auto-shortened. Users can select from whitelisted brand domains (e.g., `herta.station`, `spaceanchor.io`, `genius.wiki`) in the dropdown list, and the short link updates in real-time.
*   **Branded QR Code Generator:** Instantly draws styled QR codes matching the shortened address for physical or digital dispatch.

### 2. **Access Security Controls (Warp Rules)**
*   **Decryption Passcode:** Secure individual links with password authentication. Visitors accessing the link are met with a beautiful cybernetic password verification screen before they are redirected.
*   **Validity Lifespans (Expiration Date):** Set temporal limits on Space Anchors; links automatically return `410 Expired` once the deadline passes.
*   **Warp Budgets (Max Click Limits):** Limit the total redirection volume. Once clicks reach the quota, redirection is deactivated.

### 3. **Index of Curiosities (Analytics Dashboard)**
*   **Dynamic SVG Time Charting:** Interactive, glowing timeline charts plot traffic volume over hours, days, or months.
*   **Granular Metrics:** Automatically captures and graphs:
    *   *Total Visits* (aggregate volume)
    *   *Pathfinding Referrers* (Direct, Google, GitHub, Twitter, Reddit, HoyoLab, etc.)
    *   *Geographic Distribution* (Country lookup with local development simulation)
    *   *Browser Layout Engines* (Chrome, Firefox, Safari, Edge, Opera)
    *   *Operating Systems* (Windows, macOS, Android, iOS, Linux)
    *   *Device Classes* (Desktop, Mobile, Tablet)
*   **Telemetry Filtering:** Supports filtering overall stats by day, week, month, year, or custom dates, as well as narrowing statistics down to a **single specific link**.

### 4. **Genius Society identity Clearance (User Management)**
*   **Researcher Invitations:** Administrators can invite new researchers, specifying their roles (Standard Researcher vs Curator/Admin).
*   **Brevo-Powered Mail Dispatch:** Automatically builds and emails invite credentials (including generated temporary passwords) using standard SMTP (Brevo API friendly).
*   **Passcode Compliance Guard:** When a new user logs in for the first time, the security guard forces them to change their temporary password before accessing the system.
*   **Clearance Controls:** Reset passwords or purge researcher profiles directly from the panel.

---

## 🛠️ Technology Stack
*   **Frontend:** React 19, Vite, Lucide React, Axios. Styled entirely with custom glassmorphism Vanilla CSS (deep indigo gradients, cyber cyan highlights, glowing drop shadows, and modern typography).
*   **Backend:** Node.js, Express, JWT Authentication, CORS.
*   **Database:** SQLite via `better-sqlite3`, structured to mirror PostgreSQL pool queries for simple database migration.
*   **Notifications:** Nodemailer (integrated for SMTP/Brevo transactions).

---

## 🚀 Getting Started

### 1. Installation
Ensure you have Node.js installed, then install all dependencies for root, backend, and frontend at once:
```bash
npm run install-all
```

### 2. Seeding Telemetry Data
To populate the statistics graphs immediately with over 200+ detailed click records distributed across dates, devices, and countries:
```bash
npm run seed
```
This also seeds the default Administrator account:
*   **Email:** `herta@spaceanchor.io`
*   **Password:** `adminpassword`

### 3. Running Locally
Spin up both the Express backend (port 4040) and Vite frontend (port 5180) concurrently:
```bash
npm run dev
```
Open [http://localhost:5180](http://localhost:5180) in your browser.

### 4. Running with Docker Compose (Isolated Environment)
If you prefer running the entire system inside container nodes (matching the architecture of DOST Replica and GachaAcademy):
1. Ensure Docker Desktop is installed and running.
2. From the root directory (`SpaceAnchor/`), run:
   ```bash
   docker-compose up --build
   ```
3. Docker will compile the images, automatically execute the SQLite seed script, map folders for hot-reloads, and bind backend/frontend nodes.
4. Access the Curator client terminal at [http://localhost:5180](http://localhost:5180).

---


## 🌐 Sharing / Exposing Externally (No Localized Hosting)
If you want to host your project online for defense panels or external testing without deploying to paid cloud servers, you can run:
```bash
npm run tunnel
```
This spins up a secure public HTTP tunnel mapping `http://localhost:4040` to a custom web link (e.g. `https://glowing-anchor-node.localltunnel.me`). 

Anyone in the world can then access your server, shorten links, click them, and watch geographic and user-agent analytics update in real-time on your dashboard!

---

## 🛡️ Thesis Defensive Highlights
1. **Telemetry Pipeline & Client Telemetry:** Explains the design of parsing raw HTTP `User-Agent` strings and request geolocators into clean, actionable analytical records without heavy external NPM dependencies.
2. **Identity Clearance (Role-Based Access Control):** Explains how token verification and invitation security compliance are handled from backend guards down to the password recalibration routing.
3. **Dynamic Routing Engine:** Explains how custom domain header resolution works at the webserver routing level using HTTP Host bindings to maintain a single deployment serving multiple branded links.
