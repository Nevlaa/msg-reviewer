# Future Feature Roadmap: MSG Reviewer Field App

This document tracks upcoming features and enhancements for the MSG Reviewer ecosystem, specifically focusing on the field application used by store reviewers.

## 1. Real-Time AI Inventory Scanning (High Priority)
*   **Feature Description:** Integrate AI vision scanning directly into the photo-capture workflow of the field app. 
*   **Objective:** As a reviewer takes photos of store shelves, the AI scans the image in real-time to perform food count inventory.
*   **Key Benefits:**
    *   **Efficiency:** Combines two manual steps (taking photos and counting inventory) into a single, automated action.
    *   **Accuracy:** Reduces human error in counting varieties and units during high-pressure store visits.
    *   **Immediate Feedback:** Can alert the reviewer if a specific shelf or category looks low on stock before they leave the aisle, ensuring all required evidence is captured.
*   **Implementation Considerations:**
    *   Requires on-device or fast cloud-based inference (e.g., Gemini 3 Flash).
    *   Integration with the mobile camera interface to provide an "Inventory Overlay" or instant validation results.
