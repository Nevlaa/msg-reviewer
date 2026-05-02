 # SNAP QC Validator: Comprehensive Implementation Plan

## 1. Data Architecture & Mapping
This section defines the "Translation Layer" between the Salesforce API and the Application Logic.

### 1.1 Object & Field Mapping
| Object | API Name | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **Survey** | `Survey__c` | `Name`, `Store_Visit__c`, `Consent_Form_Link__c`, `Sketch_Link__c` | Primary store visit metadata. |
| **Food Inventory** | `Food_Inventory__c` | `Count_BreadCereals_Variety_1__c`, `Count_Dairy_Variety_1__c`, `Count_FV_Variety_1__c`, `Count_MPF_Variety_1__c` | Required variety counts. |
| **Quality Control** | `Quality_Control__c` | `Quality_Count__c`, `Quality_Food_Photos__c`, `Quality_Critical_Photos_Docs__c`, `Feedback__c` | Target for AI-generated scores. |

### 1.2 Configuration (`mapping.json`)
```json
{
  "survey_object": {
    "api_name": "Survey__c",
    "fields": {
      "fns_number": "Store_Visit__c",
      "consent_link": "Consent_Form_Link__c",
      "sketch_link": "Sketch_Link__c"
    }
  },
  "inventory_object": {
    "api_name": "Food_Inventory__c",
    "fields": {
      "bread_count": "Count_BreadCereals_Variety_1__c",
      "dairy_count": "Count_Dairy_Variety_1__c",
      "fv_count": "Count_FV_Variety_1__c",
      "mpf_count": "Count_MPF_Variety_1__c"
    }
  }
}
```

---

## 2. Validation Logic (The "Checklist")
The Agent performs a "Virtual Audit" locally to verify compliance before any data is pushed back to Salesforce.

### 2.1 Check A: Inventory vs. Photo Evidence
*   **Thresholds:** Counts are often stored as `Text(5)` (e.g., "20+").
*   **Logic:** AI must identify volume meeting or exceeding the threshold in interior photos (e.g., `1000009858.jpg`).
*   **SOP Rule:** Bread (10), Meat (10), Dairy (10), Produce (14) varieties required.

### 2.2 Check B: Sketch Link SOP Compliance
*   **Naming Convention:** `[StoreName]_[FNS]_[Date]_Sketch`.
*   **Validation:** Ensure `Sketch_Link__c` contains the correct FNS Number (e.g., `0692723`).

### 2.3 Check C: Consent Form Completeness
*   **Verification:** Ensure "Consent" or "Not Consent" is selected and a signature is present in the `Consent_Form_Link__c` document.

---

## 3. Vision Analysis Pipeline
To ensure high accuracy and low cost, a tiered approach is used.

### 3.1 The Three-Stage Pipeline
1.  **Triage (Efficiency):** Use lightweight models (YOLOv8/Rekognition) to tag photos (Exterior, Cooler, Produce). Discard irrelevant images early.
2.  **Precise Count (Accuracy):** Send relevant crops to an LMM (GPT-4o/Claude 3.5 Sonnet) to verify specific thresholds.
3.  **Logic Check (Validation):** Cross-reference AI findings with Salesforce metadata (FNS Number, Store Type).

### 3.2 High-Accuracy Strategies
*   **Grid-Based Counting:** Divide images into quadrants to prevent "skimming."
*   **Variety Verification:** Explicitly look for at least 3 distinct brands/types per category.
*   **Negative Reasoning:** Look for "filler" items (empty boxes) used to inflate counts.
*   **Stop-at-Success:** Once a threshold is met (e.g., 20 units found), stop processing further photos for that category.

---

## 4. 🤖 Agent Instructions (System Prompt)
> **Role:** You are a Senior Level 3 SNAP QC Auditor.  
> **Task:** Validate if physical stock in images matches the reported inventory from `Food_Inventory__c`.
>
> **Instructions:**
> 1. Identify items matching the target category (e.g., Bread/Loaf Bread).
> 2. Estimate total count. Compare against threshold (e.g., 20+).
> 3. If count >= threshold, respond `MATCH: TRUE`.
> 4. If count < threshold or image is unusable, respond `MATCH: FALSE` with specific observations.
> 5. **Critical Failures:** Flag empty shelves, spoilage, or inaccessible stock.

---

## 5. Output Format: "The Virtual Review"
The agent generates a structured JSON report and a draft audit note.

### 5.1 Validation JSON
```json
{
  "status": "VALIDATION_COMPLETE",
  "record_id": "S-0190912",
  "results": {
    "food_inventory": {
      "item": "Bread/Loaf Bread",
      "expected": "20+",
      "actual_found": 24,
      "match": true,
      "evidence_photo": "1000009858.jpg",
      "confidence": "98%"
    },
    "sketch_validation": {
      "link": "https://...",
      "sop_compliant": false,
      "error": "Missing FNS number in file naming convention."
    }
  },
  "suggested_qc_scores": {
    "Quality_Count__c": 5,
    "Quality_Food_Photos__c": 5,
    "Quality_Critical_Photos_Docs__c": 3
  }
}
```

### 5.2 Draft Audit Note
> **AI QC VALIDATION SUMMARY**  
> **Status:** Pending Manual Review  
> 
> **1. Inventory Verification:**  
> - Bread/Cereals: Reported 20+. AI Found: 24 units in 1000009858.jpg. (MATCH)  
> - Dairy: Reported 20+. AI Found: Visible stock meets threshold. (MATCH)  
>
> **2. Document Compliance:**  
> - Consent Form: Verified. Selection: "Consent Given".  
> - Sketch Link: FAIL. FNS Number missing from file prefix.  
>
> **3. Proposed Scores:**  
> - Quality Count: 15 | Quality Food Photos: 15 | Quality Critical: 15

---

## 🚀 Next Steps
1.  **Capture Token:** Use F12 Dev Tools -> Network -> `sid` cookie.
2.  **Run Prototype:** Use the Read-Only boilerplate to pull live data from `S-0190912` and `FI-0183205`.
3.  **Vision Test:** Download `1000009858.jpg` and run it through the Vision prompt to calibrate accuracy.
4.  **Human in the Loop:** Review discrepancies in the local dashboard before enabling the `PATCH` method.

> [!TIP]
> Include a **Confidence Score** in the audit notes. This allows human reviewers to quickly skim high-confidence passes and focus on low-confidence or failed items.

## 6. Survey Field API Mapping
To complete your data mapping for the SNAP QC Validator, I have extracted the API names for the sections mentioned on the Survey page. These names are critical for GET calls so the agent knows exactly which data points to pull for validation.

### 6.1 Store Information (Verified against USDA Data)
| UI Label | API Name |
| :--- | :--- |
| **FNS Number** | `Store_Visit__c` |
| **Store Name** | `Store_Name__c` |
| **Street Address 1** | `Street_Address_1__c` |
| **City / State / Zip** | `City__c`, `State__c`, `Zip_Code__c` |
| **Owner/Manager Name** | `Owner_Manager_Name__c` |

### 6.2 General Store Information
| UI Label | API Name |
| :--- | :--- |
| **Store Name (Contact Provided)** | `Store_Name_Provided_by_store_contact__c` |
| **Store Name (Outside Signage)** | `Store_Name_as_Posted_on_Outside_Signage__c` |
| **Store Owner Name(s)** | `Store_Owner_Names__c` |
| **No Fraud Poster Displayed?** | `SNAP_No_Fraud_Poster_Displayed__c` |
| **Hours of Operation** | `[Day]_Open_From__c` and `[Day]_Closes_At__c` |

### 6.3 Store Characteristics (Key for Inventory Verification)
These fields help the AI Agent understand the store's capacity to hold the stock reported in the Food Inventory.

| UI Label | API Name |
| :--- | :--- |
| **# Freezers** | `Freezers__c` |
| **# Refrigerators** | `Refrigerators__c` |
| **# of Storage Freezers** | `of_storage_freezers__c` |
| **# of Cash Registers** | `of_cash_registers_for_grocery_purchase__c` |
| **# of POS devices (SNAP)** | `of_POS_devices_accepting_SNAP__c` |
| **# checkout counters/areas** | `of_checkout_countersareas__c` |
| **# specialty cash registers** | `of_specialty_cash_registers__c` |
| **Total POS devices** | `Total_POS_devices__c` |
| **Est square footage (Public)** | `Est_square_footage_of_store_public_area__c` |
| **Est square footage (Storage)** | `Estimated_square_footage_of_storage_room__c` |
| **HPI 1-6 Description** | `HPI_[1-6]_Description__c` |
| **HPI 1-6 Units** | `HPI_[1-6]_of_Units__c` |
| **HPI 1-6 Price** | `HPI_[1-6]_Price__c` |
| **HPI 1-6 Package/Weight** | `HPI_[1-6]_Package_Weight__c` |
| **HPI 1-6 Pricing Source** | `HPI_[1-6]_Pricing_Source__c` |
| **Infant Formula 1-4 Description** | `Infant_Formula_[1-4]_Description__c` |
| **Infant Formula 1-4 Units** | `Infant_Formula_[1-4]_of_Units__c` |
| **Infant Formula N/A** | `Infant_Formula_NA__c` |
| **Store Accepts WIC** | `Store_accepts_WICWomenInfantChildren__c` |
| **Contact Collaborated?** | `Store_Contact_Collaborated_on_survey_Qs__c` |
| **Store Visit Comments** | `Store_Visit_Comments__c` |
| **No on-site visit made** | `No_on_site_visit_made__c` |
| **Outcome of store visit** | `Outcome_of_store_visit__c` |
| **Re-Visit/2nd Arrival** | `Re_Visit2nd_attempt_arrival_DateTime__c` |
| **Site Visit/1st Arrival** | `Site_Visit1st_attempt_arrivalDateTime__c` |
| **Unsuccessful Reason** | `Unsuccessful_Visit_Reason__c` |

---

## 7. Integration Strategy for React
Since you are a React developer, you can now build a clean Config object to handle these mappings. This keeps your validation logic decoupled from the specific Salesforce field names.

```javascript
const SURVEY_FIELDS = {
    IDENTIFIERS: ['Name', 'Store_Visit__c', 'Store_Name__c'],
    SIGNAGE: ['Store_Name_as_Posted_on_Outside_Signage__c'],
    CAPACITY: ['Freezers__c', 'Refrigerators__c', 'of_storage_freezers__c'],
    LINKS: ['Consent_Form_Link__c', 'Sketch_Link__c']
};

// Example usage in your GET request
const fieldsParam = SURVEY_FIELDS.IDENTIFIERS.concat(SURVEY_FIELDS.LINKS).join(',');
const endpoint = `${BASE_URL}/sobjects/Survey__c/${RECORD_ID}?fields=${fieldsParam}`;
```

---

## 8. Next Steps for Validation Logic
*   **Signage Cross-Check:** The AI agent compares the `Store_Name__c` (official) with the `Store_Name_as_Posted_on_Outside_Signage__c` (observed) to flag any rebranding or store name discrepancies.
*   **Capacity Logic:** If the survey says there are 0 Freezers (`Freezers__c`), but the Food Inventory lists 20+ units of Frozen Meat, the agent should auto-generate a note flagging this as a logical inconsistency.

---

## 9. Inventory Calibration & Accuracy (Methodology)
To ensure the AI maintains a "Senior Level 3" auditor persona, it must follow the established counting methodology illustrated in the reference examples.

*   **Reference Examples:** [inventory_calibration_data.md](file:///c:/Users/shors/projects/msg-reviewer/docs/planning/inventory_calibration_data.md)
*   **Methodology Rules:**
    *   **Unit of Measure (UOM):** The AI must distinguish between "Weight (lb)", "Packs/Containers", and "Individual Units" as shown in the examples.
    *   **Meats (Section 2):** Prioritize "Available by lb" for fresh butcher-cut meats.
    *   **Variety Aggregation:** Flavors (Chocolate, Strawberry) and fat content (Whole, 2%, Skim) for the same product type (e.g., Milk) must be aggregated into a single variety count. They are **NOT** separate varieties.
    *   **Accuracy Buffer:** Maintain a +/- 2 unit variance logic for system validation.
