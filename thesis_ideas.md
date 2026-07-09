### 1. MMSU LinkCast (URL Shortener)            
  • What it is: A secure, school-branded link shortener hosted on a domain like  links.mmsu.ph  (similar to Bitly or TinyURL) that actively scans destination links for scams before redirecting users.                
  • The Problem it addresses:                                                                                                                                                                                                           
      • Faculty and students frequently share long registration links, grade portals, and surveys using generic public shorteners (like  tinyurl.com/xyz ). These public links look unprofessional and can easily mask phishing sites that steal school credentials.              
  • The Computer Science Challenge:                                                                                                                                                                                                                 
      • Dynamic Phishing Detection: The system doesn't just redirect; it runs a real-time heuristic analyzer on target links to detect malicious indicators (like character substitutions in domains or phishing patterns).                         
      • Asynchronous Telemetry Ingestion: The system gathers click analytics (visitor operating systems, browsers, and location estimates) via a rapid queue so the redirect process remains instant and does not lag.        
  • How it works: A department chair creates  links.mmsu.ph/enrollment-2026 . The system scans the destination. If safe, the short link is created. When clicked, visitors redirect instantly, and the creator gets a live dashboard showing real-time click maps.
  ──────       
  ### 2. MMSU Guardian (Campus Emergency & Hazard Map)                                                                                                                                                                                       
  • What it is: A real-time micro-GIS reporting and alert system designed for managing structural, security, or utility hazards across multiple university campuses.                           
  • The Problem it addresses:                               
      • Reporting hazards on campus (like broken electrical lines, chemical spills, or structural issues) currently relies on slow, paper-based report forms or unorganized emails. Administrators have no central map to visualize active safety reports or track responder dispatch times.            
  • As a Replica of PROACT: It uses the same hierarchical workflows and real-time GIS logic found in OVERALL_PROJECT_SUMMARY.md but re-engineered for university facilities.                          
  • The Computer Science Challenge:                            
      • GIS Coordinate Mapping: Mapping indoor levels and campus coordinates on a localized Leaflet/GeoJSON layer.                         
      • Hierarchical State Engine: Managing reporting workflows where reports automatically escalate (e.g., Student → Guard → Campus Director) if they are not resolved within a specific timeframe.             
      • AI Report Consolidation: An NLP pipeline that aggregates hundreds of scattered incident reports into a single cohesive weekly brief for the administration.
  • How it works: A student spots a water pipe leak and pins it on the campus map in the mobile app. The campus maintenance console flashes a real-time warning. A team is dispatched, the issue is marked resolved, and the event is logged.       
  ──────       
  ### 💾 3. GeoSync-SitRep (Offline-First Disaster Reporter)
  • What it is: A disaster situational report (SitRep) aggregator designed for emergency responders operating in areas where cellular networks and internet are completely down.     
  • The Problem it addresses:                                                          
      • During major typhoons or earthquakes, cellular towers fail. First responders in the field cannot access traditional cloud databases to submit damage, casualty, and supply reports, leading to outdated databases at regional headquarters. 
  • The Computer Science Challenge:        
      • Offline Delta-Synchronization: Responders write report structures locally. The database engine calculates changes (deltas) and handles conflict resolution (preventing data overrides) when network access is temporarily restored.  
      • Geospatial Boundary Validation: The system runs a local mathematical Ray-Casting Algorithm against GPS coordinates to ensure coordinates fall within municipal boundaries before caching, eliminating database pollution.       
  • How it works: Responders input local evacuation rates offline. The app validates the boundary location using local GPS. Once a responder gets near a signal booster or satellite terminal, the app pushes only the new offline entries to the central system conflict-free.                  
  ──────                               
  ### 🗓️ 4. UniSched-Opt (Algorithmic Class & Room Scheduler)       
  • What it is: An automated class scheduling and room allocation generator that finds the optimal schedule for university departments.          
  • The Problem it addresses:
      • University scheduling is a classic NP-complete math problem. Designing schedules manually takes weeks and frequently results in room double-bookings, professor schedule clashes, and students having classes scheduled in separate campuses too close together.                                          
  • The Computer Science Challenge:         
      • Genetic Optimization Algorithms: You will program a Genetic Algorithm (GA) with custom mutation, selection, and crossover operators. The system simulates thousands of schedule variations, evolving them until it satisfies all hard rules (no room clashes) and soft rules (faculty preferences).          
  • How it works: The scheduler uploads a CSV of faculty, subjects, and room capacities. They click "Run Optimizer". Within minutes, the engine returns a color-coded interactive calendar grid displaying the mathematically optimal schedule.     
  ──────                       
  ### 🔑 5. CryptoDoc (Forgery-Proof Document Approvals)        
  • What it is: A digital routing platform where official university documents (thesis clearance forms, grade sheets, and graduation checklists) are cryptographically signed to prevent fraud.         
  • The Problem it addresses:                                                                                                                                                   
      • Physical signature clearances are easily forged, lost, or delayed. Simple digital signatures (like drawing on a PDF) can easily be manipulated or copied, making documents vulnerable to alteration.
  • The Computer Science Challenge:                                                                                                              
      • Asymmetric Cryptography: Implementing RSA or ECDSA digital key pairs.                                                    
      • Cryptographic Chaining: Calculating SHA-256 hashes of the file contents and chaining them together. If a single pixel, word, or signature on the PDF is edited after approval, the cryptographic seal instantly breaks.  
  • How it works: A student uploads their clearance form. The system routes it to their Advisor, Department Chair, and Dean. Each logs in and applies their key signature. The final document gets a QR code. Anyone can scan this QR code or drop the PDF into  
  the validator to check its authenticity. 
  ──────
  ### 🌾 6. AgriDetect-GIS (Crop Disease Geospatial Surveillance & Prediction)          
  • What it is: A geospatial crop disease mapping and spatial propagation visualization system.                  
  • The Problem it addresses:                                                                             
      • In agricultural regions like Ilocos Norte, farmers and agricultural extension workers struggle to track and predict the spread of crop diseases (e.g., rice blast or tomato viruses). Static spreadsheets fail to show how a pathogen is moving geographically or how fast it is spreading.                                  
  • The Computer Science Challenge:                                           
      • Spatial-Temporal Simulation (Epidemic Modeling): Coding a mathematical model (like cellular automata or a geographically-adapted SIR model) to simulate disease propagation based on parameters like wind direction, humidity, and farm density.          
      • Dynamic Kernel Density GIS Heatmaps: Using Leaflet/GeoJSON to calculate and display high-density infected zones (heatmaps) in real-time.           
  • How it works: Users upload geotagged reports of crop infections. The system plots them on an interactive map and runs a 14-day predictive simulation showing local farmers the path the disease is likely to travel.
  ──────
  ### 🗣️ 7. IlokoTranslate (Local Dialect Low-Resource Machine Translation)               
  • What it is: A translation engine optimized to translate English/Tagalog academic memos, disaster alerts, and official notices into the Ilokano dialect.        
  • The Problem it addresses:                                                                                                                  
      • Official university announcements and emergency updates are written in English, but outreach to rural farming communities requires translation into formal Ilokano. Commercial translators (like Google Translate) often struggle with local dialects or output incorrect, literal translations.                                                                             
  • The Computer Science Challenge:                                                                                             
      • Low-Resource Machine Translation (NLP): Developing a hybrid neural/phrase-based translation engine using attention mechanisms and custom dictionary rules to handle Ilokano's highly agglutinative grammar structure (where words change meaning depending on prefixes/suffixes).                                                                                  
  • How it works: Administrators paste a memo into the portal. The engine translates it into Ilokano, highlighting words it has low confidence in and suggesting context-aware alternatives.       
  ──────
  ### 🚌 8. EcoRoute (Campus Smart Transit & Dispatching Optimizer)                                                                                   
  • What it is: A dynamic scheduling and route optimization system for campus shuttle services or security patrol vehicles.                       
  • The Problem it addresses:                                                                                                                  
      • Campus shuttles and security patrols operate on rigid, fixed schedules, leading to long waiting times for students during high-demand hours and empty runs during low-demand periods.      
  • The Computer Science Challenge:                                                                                                                                                            
      • Dynamic Vehicle Routing Problem (DVRP): Implementing optimization algorithms (like Ant Colony Optimization or Genetic Algorithms) to compute and update vehicle paths on-the-fly based on real-time passenger ride requests.        
  • How it works: A student at a campus stop taps "Request Ride" on a web interface. The dispatching engine calculates the most efficient route for the closest shuttle and sends the adjusted navigation path to the driver's tablet.    
  ──────
  ### 🛡️ 9. SecurExam (Privacy-Preserving Local Proctoring & Anomaly Detector)                                                                                                             
  • What it is: A lightweight, privacy-focused student proctoring application for computer laboratory examinations that works locally without sending streaming video to servers.          
  • The Problem it addresses:                                                                                                                                                            
      • Existing online proctoring systems (like Respondus) are invasive, require high bandwidth to stream continuous video, and are expensive to deploy.                                 
  • The Computer Science Challenge:                                                                                                                                                     
      • On-Device Behavioral Heuristics: Implementing client-side algorithms (using Webgazer.js for eye tracking or mouse/keyboard input heuristics) to calculate a "suspicious activity index."      
      • Virtual Environment Detection: Methods to detect if a student is running the test inside a Virtual Machine, a dual monitor setup, or an unauthorized browser container.                       
  • How it works: The application runs locally inside the browser. It monitors tab switching and gaze patterns. It only alerts the lab proctor's dashboard if a student's anomaly score crosses a safe threshold.      
  ──────
  ### 📂 10. CodeVault (AST-Based Code Plagiarism & Project Archive Scanner)                                                                                                                         
  • What it is: A smart codebase archiving system that detects structure-level plagiarism and code recycling across student capstone submissions.                                  
  • The Problem it addresses:                                                                                                                                              
      • Checking student programming assignments and capstones for code copying is tedious. Students can easily bypass simple text-similarity checkers (like Turnitin) by renaming variables, changing comments, or rearranging code blocks.    
  • The Computer Science Challenge:                                                                                                                                                                                               
      • Winnowing & AST Parsing: Parsing programming files into Abstract Syntax Trees (ASTs) to compare the structural logic of the code rather than the text itself.                                                           
      • Locality-Sensitive Hashing (LSH): Efficiently clustering and checking newly uploaded ZIP projects against thousands of archived codebase directories.                                                             
  • How it works: A student submits their project ZIP file. The system parses the code structures, matches them against past batches, and flags submissions with near-identical logic paths. 
