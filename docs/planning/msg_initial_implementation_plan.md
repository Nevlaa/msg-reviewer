This implementation plan outlines the development of SNAP-Scan, a React-based mobile dashboard designed for Level 2 Reviewers. The app acts as a local "pre-processor" to ensure your reports pass the Manhattan Strategy Group (MSG) Quality Control (QC) check before you ever hit "Submit" in Salesforce.

Scope of work(responsibiltties) ( MSG QC for SNAP program )
1. Review and validate food inventory checklist counts & varieties by comparing photographic support submitted by Reviewer. 
2. Review and validate written comments inputted by Reviewer by comparing survey answers and photographic support. 
3. Apply corrections to store visit consent forms and electronic sketches. 

## 1. Technical Architecture (The "Universal Access" Strategy)
To accommodate users without expensive Pro AI tiers or specific API access, the app uses a Multi-Model Orchestration Layer.


React Frontend: A PWA (Progressive Web App) that works on mobile/desktop without an App Store.   


Gemini API (Primary): Used for high-speed, 75-image batch processing.   

"Agent-as-a-Service" Wrapper: If a user lacks a Pro plan, the app generates a Structured Prompt Packet. The user copies this into their LLM of choice (ChatGPT, Gemini Basic, etc.) along with the photos. The LLM returns a JSON object which the React app then parses into the survey forms.

## 2. Feature Mapping: The "QC Gatekeeper" Logic
The app’s logic is built directly from the QC Doc  to ensure the reviewer’s data is bulletproof.   

### Phase A: The "Critical Photo" Validator
Before analyzing food, the app checks for the 15-point "Critical" requirements:


Exterior: Detects if gas pumps are present; if so, ensures a gas price photo exists.   


Overviews: Validates 2–3 different angles from corners to match square footage estimates.   


Checkouts: Uses CV (Computer Vision) to count transaction spaces and ensure "Customer Point of View" angles.   


POS/EBT: High-priority check for readable screens on all devices.   

### Phase B: The Staple Food Engine
The agent follows the strict 3x3 Rule found in the QC documentation.   


Variety Check: Scans for at least 3 varieties in each of the 4 groups (Dairy, Meat, Bread, Produce).   


Depth Check: Confirms at least 3 stocking units per variety.   


FFR Logic: If a cooler door is open in a photo, the app automatically checks the "FFR" box for those varieties.   


Variety Limits: Caps reporting at 10/10/10/14 as per MSG Priority of Food Counts.   

### Phase C: HPI & Bundle Intelligence

HPI Filter: Automatically identifies the 6 highest-priced items ($5+) while excluding prohibited items like meat bundles or formula .   


Cross-Check: Verifies that every HPI listed is also represented on the Electronic Sketch with a red star.   

## 3. Implementation Plan: IDE Structure
### Structure (React/Next.js)
Plaintext
/src
  /components
    - ImageUploader.jsx (Batching 75 JPEGs)
    - QCChecklist.jsx (Real-time 15-point scoring)
    - SketchGenerator.jsx (Canvas API for auto-labeling)
  /hooks
    - useUSDAClassification.js (Rules for 1st vs 2nd ingredients)
    - useFFRDetector.js (Visual cue detection for frozen/refrigerated)
  /services
    - GeminiOrchestrator.js (Image analysis)
    - SalesforceBridge.js (Final data push)
### Implementation Steps
Step	Task	Target Metric
1	Ingredient Scraper	
Build a lookup table for common multi-ingredient brands (e.g., Campbell’s, Marie Callender’s) based on SOP guides.   

2	FFR Validator	
Create a "Cooler Door" detection model to ensure "Doors Open" photos are present for Dairy/Meat.   

3	Sketch-to-Scan	
Develop a tool that compares the user's hand-drawn sketch (uploaded as JPEG) against the detected shelf inventory to find discrepancies.   

4	Mock QC Report	
Generate a PDF/Dashboard that mirrors the QC Doc format, flagging "too blurry" or "too close" photos before submission.   

## 4. Ensuring Reviewer/QC Separation
As per your requirement that the Reviewer and QC should not have access to each other, the app will handle this via One-Way Data Sync:

The Reviewer app exports a "Clean Packet" to Salesforce.

The QC team uses their own internal MSG dashboard to view the data.


The Bridge: Any corrections or "Deficiencies" are returned as a "Read-Only" feedback loop in your app, preventing you from seeing the internal QC scoring notes until the report is finalized or rejected .   

Which part of the React build should we focus on first? I can provide the specific JSON schema for the Food Inventory counts to ensure they match the MSG upload portal perfectly.