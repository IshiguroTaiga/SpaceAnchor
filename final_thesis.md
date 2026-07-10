# Proposed BSCS Thesis Ideas

This document outlines the proposed Bachelor of Science in Computer Science (BSCS) thesis topics. Each topic is structured to emphasize its computing core, alignment with the curriculum, and social impact.

---

### 1. MMSU LinkCast (URL Shortener)
* **TITLE:** MMSU LinkCast: A Secure Institutional URL Shortener with Real-Time Heuristic Phishing Detection and Asynchronous Telemetry Ingestion
* **PROBLEM STATEMENT:** Faculty and students frequently share long registration links, grade portals, and surveys using public URL shorteners (e.g., `bit.ly`, `tinyurl.com`). These external links look unprofessional, obscure the true destination, and can easily be exploited by malicious actors to mask phishing sites designed to harvest university credentials.
* **OBJECTIVE:** To design and implement a secure, university-branded URL shortening platform that actively scans destination URLs for phishing indicators and gathers real-time visitor analytics without introducing latency to the redirection process.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Heuristic Detection Engine:** Program an inline scanning module that screens destination links against malicious patterns, checking for homograph attacks (character substitutions in domains) and lookalike keywords.
    * **Asynchronous Processing Queue:** Implement an asynchronous messaging or memory queue (e.g., Redis or local worker threads) to handle visitor telemetry ingestion (OS, browser type, location estimates) instantly, ensuring the redirect loop completes in milliseconds.
    * **Role-Based Access Control (RBAC):** Restrict link creation to verified institutional emails (`@mmsu.edu.ph`) using OAuth2 authentication.
* **SGD COVERED:** SDG 9: Industry, Innovation, and Infrastructure & SDG 16: Peace, Justice, and Strong Institutions (Sub-target: Cyber Security and Institutional Data Integrity).
* **EXPECTED OUTPUT:** A fully functional web platform (`links.mmsu.ph`) containing an administrator dashboard for real-time traffic mapping, an automated safety verification gateway, and a secure short-link generator interface.

---

### 2. MMSU Guardian (Campus Emergency & Hazard Map)
* **TITLE:** MMSU Guardian: A Micro-GIS Campus Hazard Reporting and Escalation System with Automated NLP Brief Consolidation
* **PROBLEM STATEMENT:** Reporting infrastructure failures, safety hazards, or utility issues across multiple university campuses currently relies on slow, paper-based forms or unmonitored email channels. Administrators lack a central visual map to track active hazards, analyze responder dispatch delays, or securely track regional reporting workflows.
* **OBJECTIVE:** To engineer a real-time micro-GIS reporting and alert system that maps localized university safety events, automates custom hierarchical organizational workflows, and consolidates scattered reporting data using Natural Language Processing.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Micro-GIS Canvas:** Construct interactive maps using Leaflet.js overlaid with custom indoor and outdoor GeoJSON campus layers to plot exact coordinate pins.
    * **Hierarchical State Engine:** Write a time-sensitive state machine that manages report ownership boundaries and automates escalation pathways (e.g., Student $\rightarrow$ Guard $\rightarrow$ Campus Director) if response timers expire.
    * **NLP Text Aggregation Pipeline:** Implement a lightweight text-processing pipeline (using TF-IDF or transformer-based embedding clusters) to filter out redundant reports of the same incident and merge them into a single summary.
* **SGD COVERED:** SDG 11: Sustainable Cities and Communities (Sub-target: Safe, Resilient, and Sustainable Campus Infrastructure) & SDG 3: Good Health and Well-being.
* **EXPECTED OUTPUT:** A cross-platform web and mobile application featuring a geolocation-based reporter interface for students, a live spatial alert console for campus maintenance units, and an automated weekly administrative report briefing builder.

---

### 3. GeoSync-SitRep (Offline-First Disaster Reporter)
* **TITLE:** GeoSync-SitRep: An Offline-First Situational Report Aggregator with Ray-Casting Boundary Validation and Delta-Synchronization
* **PROBLEM STATEMENT:** During major natural disasters (typhoons, earthquakes), local cellular networks and internet services often collapse entirely. First responders in isolated zones cannot transmit critical situational reports (damage counts, casualties, evacuation needs) to central disaster offices, resulting in outdated regional tracking databases and delayed relief operations.
* **OBJECTIVE:** To build an offline-first disaster reporting system that allows field teams to compile structured situational data without internet connectivity, mathematically validates operational limits locally, and synchronizes records conflict-free once network connectivity is restored.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Offline Delta-Synchronization Architecture:** Utilize a local embedded client database (such as IndexedDB or SQLite) to log records locally. Program a custom replication algorithm that isolates database updates (deltas) and applies strict logical rules (e.g., timestamp comparison) to resolve merge conflicts automatically upon reconnection.
    * **Localized Ray-Casting Algorithm:** Implement a client-side ray-casting algorithm to test hardware GPS coordinates against pre-loaded local boundary polygons, guaranteeing data integrity prior to local caching.
* **SGD COVERED:** SDG 13: Climate Action & SDG 11: Sustainable Cities and Communities (Sub-target: Disaster Resilience and Risk Mitigation).
* **EXPECTED OUTPUT:** An offline-capable Progressive Web Application (PWA) with automated data sync modules, an embedded spatial boundary validator, and a centralized server synchronization dashboard for regional command centers.

---

### 4. UniSched-Opt (Algorithmic Class & Room Scheduler)
* **TITLE:** UniSched-Opt: An Automated University Course and Room Scheduling Generator Using Genetic Optimization Algorithms
* **PROBLEM STATEMENT:** University class and room assignment configuration is a classic NP-complete mathematical challenge. Manual scheduling takes departments weeks to complete and frequently leads to severe conflicts, including room double-bookings, professor schedule clashes, and students being assigned classes on separate campuses within unrealistic timeframes.
* **OBJECTIVE:** To implement an optimization engine that automatically generates conflict-free, multi-department academic timetables that satisfy institutional rules and individual faculty constraints simultaneously.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Genetic Algorithm (GA) Optimization:** Program a metaheuristic engine with custom chromosome representations for class sessions. Code mathematical fitness evaluation scores based on strict constraints (hard rules: room capacities, schedule clashes) and qualitative choices (soft rules: professor preferences, travel windows between campuses).
    * **Iterative Evolution Engine:** Implement tournament selection, multi-point crossovers, and adaptive mutation parameters to iterate through schedule variations, evolving optimal configurations.
* **SGD COVERED:** SDG 4: Quality Education (Sub-target: Effective, Efficient, and Optimized Learning Environments).
* **EXPECTED OUTPUT:** A scheduling software platform containing CSV/Excel template data importers, an asynchronous optimization engine, and an interactive, color-coded calendar grid interface for department chairs.

---

### 5. CryptoDoc (Forgery-Proof Document Approvals)
* **TITLE:** CryptoDoc: A Decentralized Academic Clearance and Routing Platform Utilizing Asymmetric Cryptography and Cryptographic Chaining
* **PROBLEM STATEMENT:** Traditional university document clearance procedures (graduation checklists, thesis clearance forms) rely on physical signatures that are easily forged, lost, or delayed. Furthermore, simple digital signature methods (like drawing an image over a PDF) can easily be manipulated or detached from the document metadata, leaving digital records vulnerable to fraud.
* **OBJECTIVE:** To develop a secure, digital document routing and validation system that utilizes public-key cryptography and structural content hashing to make official institutional clearances tamper-proof.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Asymmetric Key Architecture:** Implement RSA or ECDSA digital key pairs for users. A signer uses their private key to sign a secure cryptographic hash of the document, while the system verifies it using their public key.
    * **Cryptographic Structural Chaining:** Compute SHA-256 hashes of the file layers, chaining approvals progressively. If a single pixel, character, or form field is altered post-signing, the hash chain breaks instantly, invalidating the seal.
* **SGD COVERED:** SDG 16: Peace, Justice, and Strong Institutions (Sub-target: Reducing Bureaucratic Corruption and Building Transparent Institutions).
* **EXPECTED OUTPUT:** A secure document routing web platform featuring secure digital signing wallets for faculty, automated multi-stage routing pipelines, and a public drag-and-drop validation portal with dynamic QR code verification.

---

### 6. AgriDetect-GIS (Crop Disease Geospatial Surveillance & Prediction)
* **TITLE:** AgriDetect-GIS: A Spatial-Temporal Epidemiological Simulation and Kernel Density Mapping System for Regional Crop Disease Tracking
* **PROBLEM STATEMENT:** Agricultural extension workers and farmers in agrarian regions struggle to monitor and project the spread of infectious crop diseases. Static, tabular records cannot illustrate spatial propagation vectors over time, preventing communities from identifying outbreaks and protecting neighboring farmlands.
* **OBJECTIVE:** To engineer a geospatial surveillance application that tracks crop disease incidents, generates dynamic regional heatmaps, and runs localized spatial-temporal simulations to predict disease transmission pathways.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Spatial-Temporal Simulation Engine:** Code an epidemiological simulation model (using cellular automata or a modified geographic Susceptible-Infectious-Recovered [SIR] framework) that incorporates environmental metrics like local wind directions, farm density, and humidity variables.
    * **Dynamic Kernel Density Estimation (KDE):** Implement Leaflet.js-compatible algorithms to calculate spatial kernel density maps on the fly based on user-submitted geotagged outbreak reports.
* **SGD COVERED:** SDG 2: Zero Hunger (Sub-target: Sustainable Food Production and Agricultural Risk Resilience) & SDG 15: Life on Land.
* **EXPECTED OUTPUT:** A web-based GIS forecasting application with interactive geographic disease heatmaps, geotagged outbreak logging portals, and an automated 14-day predictive simulation dashboard.

---

### 7. IlokoTranslate (Local Dialect Low-Resource Machine Translation)
* **TITLE:** IlokoTranslate: A Hybrid Machine Translation Engine for Low-Resource Contextual Localization of Institutional Communication
* **PROBLEM STATEMENT:** Official academic circulars, safety disclosures, and public bulletins are primarily written in English or Tagalog. Communicating with rural agricultural groups requires translating these notices into formal Ilokano. Commercial translation services (e.g., Google Translate) frequently fail to capture proper contextual nuances, leading to inaccurate or overly literal translations.
* **OBJECTIVE:** To build an NLP translation system optimized for low-resource regional data that translates academic memos and emergency updates into linguistically accurate, grammatically correct Ilokano.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Hybrid Translation Framework:** Develop a translation architecture combining a custom tokenization model with neural attention layers, supplemented by structural dictionary rules to manage Ilokano's highly agglutinative morphology (prefixes, infixes, and suffixes).
    * **Confidence Scoring Heuristics:** Implement phrase-level confidence scoring algorithms to flag ambiguous segments and present context-aware lexical alternatives to human editors.
* **SGD COVERED:** SDG 4: Quality Education & SDG 10: Reduced Inequalities (Sub-target: Ensuring Inclusive Access to Information and Public Services).
* **EXPECTED OUTPUT:** An administrative translation web console featuring a dual-pane text layout editor, confidence-score highlighting overlays, and a curated parallel text dictionary repository.

---

### 8. EcoRoute (Campus Smart Transit & Dispatching Optimizer)
* **TITLE:** EcoRoute: A Dynamic Campus Transit Optimization and Dispatching Engine Using Metaheuristic Routing Algorithms
* **PROBLEM STATEMENT:** Institutional shuttle fleets, utility vehicles, and security patrols typically follow static schedules and unoptimized route pathways. This rigid structure leads to prolonged passenger wait times during peak hours, inefficient vehicle utilization, and excessive fuel waste during low-demand periods.
* **OBJECTIVE:** To develop an intelligent vehicle dispatching and scheduling engine that dynamically computes optimal vehicle routing paths on demand, reducing passenger wait times and operational costs.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Dynamic Vehicle Routing Problem (DVRP) Solver:** Implement a metaheuristic optimization engine (such as Ant Colony Optimization or a Genetic Algorithm) to recalculate vehicle paths in real-time as ride requests are submitted.
    * **Asynchronous Request Coordinator:** Set up WebSockets to handle real-time geospatial data coordinates and queue passenger requests from various campus nodes instantly.
* **SGD COVERED:** SDG 11: Sustainable Cities and Communities & SDG 13: Climate Action (Sub-target: Reducing Carbon Footprints through Smart Logistics).
* **EXPECTED OUTPUT:** A web dispatching hub for logistics supervisors, a mobile web navigation view for transport drivers, and a ride-request interface for campus commuters.

---

### 9. SecurExam (Privacy-Preserving Local Proctoring & Anomaly Detector)
* **TITLE:** SecurExam: A Lightweight, Client-Side Proctoring Engine Utilizing Behavioral Heuristics and Environment Detection for Academic Laboratories
* **PROBLEM STATEMENT:** Commercial remote proctoring applications are often invasive, collect high volumes of user personal data, and require substantial internet bandwidth to stream video feeds to remote servers. This makes them expensive and impractical for local computer laboratory settings with limited or shared internet bandwidth.
* **OBJECTIVE:** To design a lightweight, privacy-focused local proctoring tool that evaluates student behaviors entirely within the local client browser, alerting proctors without transmitting continuous video data.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **On-Device Behavioral Heuristics:** Integrate client-side eye tracking (using Webgazer.js) and monitor keyboard/mouse interaction frequencies to calculate a real-time "suspicious activity index" without saving user video files.
    * **Virtual Environment Detection:** Write browser-level security checks to identify restricted activities, including virtual machine executions, multi-monitor configurations, focus switching, and unauthorized developer console access.
* **SGD COVERED:** SDG 4: Quality Education (Sub-target: Academic Integrity and Equitable Digital Assessment Infrastructure).
* **EXPECTED OUTPUT:** A secure client-side browser evaluation shell for students, paired with a real-time monitoring dashboard for laboratory instructors that displays student anomaly score flags.

---

### 10. CodeVault (AST-Based Code Plagiarism & Project Archive Scanner)
* **TITLE:** CodeVault: An Abstract Syntax Tree Parsing and Structural Plagiarism Detection Engine for Academic Repositories
* **PROBLEM STATEMENT:** Evaluating student programming submissions for structural plagiarism is highly time-consuming. Traditional text-based plagiarism tools are easily bypassed by superficial code modifications, such as renaming variables, rearranging comment structures, or altering indentation layouts, leaving academic repositories vulnerable to copied work.
* **OBJECTIVE:** To develop a smart codebase archiving and scanning application that evaluates structural similarities between source code files by comparing their syntactic trees rather than their literal text.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **AST Tokenization & Compiling:** Use linguistic parsers to convert uploaded source files into Abstract Syntax Trees (ASTs), isolating the underlying logic from structural cosmetics.
    * **Structural Winnowing & Fingerprinting:** Implement fingerprinting algorithms on the compiled syntax trees. Use Locality-Sensitive Hashing (LSH) to index and cluster code signatures, enabling rapid similarity checks across large project repositories.
* **SGD COVERED:** SDG 4: Quality Education (Sub-target: Promoting Research Excellence, Code Authenticity, and Academic Standards).
* **EXPECTED OUTPUT:** An institutional repository platform with automated zip archive extractions, a tree-based logic similarity scanner, and a visual dashboard that maps identical code structures for instructors.

---

### 11. MMSU Knowledge Hub (Unified Academic Portal & Pathfinder)
* **TITLE:** MMSU Knowledge Hub: An Integrated Multi-Campus Academic Information System with Graph-Theoretic Pathfinding and Semantic Policy Retrieval
* **PROBLEM STATEMENT:** The official MMSU website lacks centralized, easily searchable, and user-friendly academic content. Its user interface is scattered and mobile-unfriendly, making navigation highly difficult for student mobile users. Additionally, students struggle to map out curriculum dependency structures, leading to delayed graduation due to missed prerequisite dependencies. Furthermore, students and advisors find it tedious to navigate long PDF handbooks to locate specific university policy rules, while university updates remain scattered across different social media pages.
* **OBJECTIVE:** To develop a mobile-responsive, unified academic portal that centralizes university resources, models curriculum paths as Directed Acyclic Graphs (DAGs) to run topological pathfinding, hosts an offline-capable RAG chatbot for semantic policy queries, and automates event aggregation from social channels.
* **METHODOLOGY OR HOW TO SOLVE THE PROBLEM:**
    * **Graph-Theoretic Curricular Modeling:** Represent multi-campus curricula as Directed Acyclic Graphs (DAGs). Implement cycle-detection algorithms (e.g., Tarjan's or DFS) to identify invalid prerequisite loops. Develop an A*/Dijkstra-based pathfinding engine that generates alternative semester-by-semester roadmaps for students when courses are failed or unavailable.
    * **Local Retrieval-Augmented Generation (RAG):** Construct a local semantic Q&A chatbot using a sentence-transformer embedding model (e.g., `all-MiniLM-L6-v2`) and HNSW vector indexing. Load the official student handbook and academic documents, enabling instant question-answering with exact source references.
    * **Information Extraction & Deduplication Pipeline:** Set up an automated social media scraper targeting official MMSU Facebook pages. Implement a classification pipeline (using Naive Bayes or SVM models) to categorize posts (e.g., enrollment dates, room changes, suspensions) and apply Locality-Sensitive Hashing (LSH) to filter duplicate announcements.
* **SGD COVERED:** SDG 4: Quality Education (Sub-target: Technology-Enhanced Learning Environments & Equitable Information Access) & SDG 9: Industry, Innovation, and Infrastructure.
* **EXPECTED OUTPUT:** A mobile-first Progressive Web Application (PWA) featuring an interactive graph-based curriculum pathfinder, a client-side vector-based policy consulting chatbot, and a unified, categorized event notification feed.
