# MMSU Knowledge Hub: BSCS Thesis Feasibility & Technical Upgrade Plan

This document evaluates the feasibility of the proposed **MMSU Knowledge Hub** as a Bachelor of Science in Computer Science (BSCS) thesis topic for the Mariano Marcos State University (MMSU) College of Computing and Information Sciences (CCIS). It outlines how to upgrade the raw concept to meet the department's rigorous academic criteria.

---

## 1. Feasibility & CS Alignment Analysis

> [!WARNING]
> **Raw Concept Verdict: High Risk of Rejection**
> As a simple directory, calendar, and link aggregation site, the proposal lacks a clear **computing component or contribution**. It would likely be categorized as an Information Technology (IT) capstone or a standard CRUD application and rejected during title evaluation.

To get approved by the department chair and secure the necessary "three hands" (faculty approval), the project must be re-engineered from a *static information directory* to an *intelligent, algorithm-driven information processing system*.

---

## 2. Technical Upgrades to Make it "Thesisable"

Here are three distinct architectural directions that introduce core Computer Science challenges, making the project highly defensible.

### Option A: RAG-Powered Academic Advising & Policy Q&A Engine (NLP/AI)
Instead of a basic list of links, the platform serves as an interactive semantic query engine for MMSU's academic policies, student handbooks, and curriculum guidelines.

*   **The Computing Challenge:** Standard LLMs hallucinate and lack private campus data. You will build an offline, local **Retrieval-Augmented Generation (RAG)** pipeline.
*   **Algorithms & Tech:**
    *   **Text Segmentation & Chunking:** Implementing custom recursive character text splitters for documents.
    *   **Vector Embeddings:** Generating vectors using lightweight sentence-transformers (e.g., `all-MiniLM-L6-v2`) hosted locally.
    *   **Vector Search & Indexing:** Building a vector similarity search engine using Hierarchical Navigable Small World (HNSW) graphs or Cosine Similarity.
    *   **Evaluation Metric:** Using RAGAS or BLEU/ROUGE to programmatically evaluate retrieval accuracy and faithfulness.

### Option B: Curricular Dependency & Academic Pathfinding Visualizer (Graph Theory)
Every college's curriculum is a complex network of prerequisites. This module models curricula as mathematical graphs to help students and advisors plan academic tracks.

*   **The Computing Challenge:** Calculating optimal graduation paths, detecting circular prerequisite dependencies (which prevent enrollment), and simulating course scheduling under failures or shifting majors.
*   **Algorithms & Tech:**
    *   **Directed Acyclic Graph (DAG) Modeling:** Representing courses as nodes and prerequisites as directed edges.
    *   **Cycle Detection:** Implementing Depth-First Search (DFS) / Tarjan's algorithm to identify invalid prerequisite loops.
    *   **Topological Sorting:** Sorting courses to output valid chronological semester sequences.
    *   **Pathfinding/Optimization:** Using Dijkstra's or A* algorithm to compute the shortest path to graduation if a student fails a core prerequisite, taking into account which semesters courses are offered (e.g., Batac vs. Laoag campuses).

### Option C: Automated Social Listening & Information Extraction Pipeline (Data Ingestion)
The hub automatically populates its events, announcements, and calendars by scraping scattered official channels (e.g., MMSU main FB, CCIS FB, CTE FB) and classifying the information.

*   **The Computing Challenge:** Converting unorganized, conversational social media posts into structured database schemas without manual human entry.
*   **Algorithms & Tech:**
    *   **Named Entity Recognition (NER):** Extracting dates, event titles, locations (Batac, Laoag, Currimao), and categories from scraped text.
    *   **Text Classification:** Training/fine-tuning a Naive Bayes, SVM, or DistilBERT model to classify posts (e.g., Class Suspension, Academic Deadline, Sports Event, Club Recruitment).
    *   **Locality-Sensitive Hashing (LSH):** Deduplicating highly similar announcements posted across different college pages.

---

## 3. Comparative Evaluation of Proposed Thesis Ideas

Here is how your ideas compare based on the **CCIS BSCS Thesis Criteria**:

| Proposed Title / Idea | Raw CS Value | Complexity | Feasibility | Recommendations to Pass |
| :--- | :--- | :--- | :--- | :--- |
| **MMSU Knowledge Hub** (With Upgrades) | **High** | Medium | High | **Recommended.** Combine the directory UI with **Option A (RAG)** or **Option B (Prerequisite DAGs)**. It is highly useful and showcases modern CS paradigms. |
| **E-Stop** (Passenger-to-Driver Destination) | **Low** | Low | High | **Reject.** As you noted, this is already solved commercially (e.g., Grab). To make it CS, it would need to solve the *Dynamic Vehicle Routing Problem (DVRP)* or *Ride-pooling optimization* using Genetic Algorithms. |
| **Snapy** (Location-Based Attendance) | **Medium** | Medium | Medium | **Borderline.** It is only thesisable if upgraded to use *indoor localization* (Wi-Fi fingerprinting or BLE beacon RSSI triangulation) and *face verification matching* (using Siamese networks/CNNs). |
| **Road Inventory & Condition Monitoring** | **High** | High | Low (Data Gathering) | **Strong CS Topic.** Uses Computer Vision (YOLOv8) to detect road degradation. However, collecting thousands of photos of Ilocos roads to train/validate the model might be highly time-consuming for a small team. |

---

## 4. Suggested Refined Thesis Title Options

If you select the MMSU Knowledge Hub path, present the title focusing on the computing challenge rather than the "website" interface:

1.  **"A Semantic Retrieval-Augmented Generation (RAG) System for Multi-Campus University Policy and Academic Advising"** (Focuses on Option A)
2.  **"Graph-Theoretic Modeling and Pathfinding Analysis of Multi-Campus Curricular Dependency Networks"** (Focuses on Option B)
3.  **"Automated Information Extraction and Categorization of Social Media Bulletins for Unified Campus Event Tracking"** (Focuses on Option C)

---

> [!NOTE]
> Which of the three technical options (AI/RAG, Graph Theory, or Social Listening/Scraping) aligns best with your team's interest and programming strengths? Once you select, we can draft a formal, detailed project outline.
