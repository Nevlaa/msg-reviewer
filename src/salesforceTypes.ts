export type SalesforceSurvey = {
  Id: string;
  Name: string;
  Store_Visit__c: string;
  Store_Visit__r?: { Name: string };
  Consent_Form_Link__c: string;
  Sketch_Link__c: string;
  Store_Location__c?: string;
  Freezers__c?: number;
  Ice_Chests__c?: number;
};

export type SalesforceFoodInventory = {
  Id: string;
  Name: string;
  Bread_Cereals_Variety_1__c?: string;
  Count_BreadCereals_Variety_1__c?: string;
  Dairy_Variety_1__c?: string;
  Count_Dairy_Variety_1__c?: string;
  FV_Variety_1__c?: string;
  Count_FV_Variety_1__c?: string;
  MPF_Variety_1__c?: string;
  Count_MPF_Variety_1__c?: string;
};

export type SalesforceQCRecord = {
  Id: string;
  Quality_Count__c?: string;
  Quality_Food_Photos__c?: string;
  Quality_Critical_Photos_Docs__c?: string;
  Feedback__c?: string;
};

export type ValidationLog = {
  status: "VALIDATION_COMPLETE" | "ERROR" | "PENDING";
  record_id: string;
  results: {
    location_verification: {
      google_maps_link: string;
      street_view_image: string;
      exterior_photo: string;
    };
    compliance_checks: {
      store_info_match: {
        status: "Pass" | "Fail" | "Discrepancy (Explained)";
        details: string;
      };
      consent_verification: {
        record_type: string;
        is_compliant: boolean;
      };
      ro_fields: {
        registers: string;
        pos_snap: string;
        freezers: string;
        refrigerators: string;
        signage_name: string;
        survey_owner: string;
        fraud_poster: string;
        sales_area_sf: number;
        storage_area_sf: number;
        food_in_storage: boolean;
        address_different: boolean;
        specialty_registers: string;
        total_pos: string;
        exteriors_gas: boolean;
        overviews_found: boolean;
        checkouts_found: boolean;
        wrong_size: boolean;
        hpi_list: { desc: string; units: string }[];
        formula_list: { desc: string; units: string }[];
      };
    };
    food_inventory: {
      category: string;
      item: string;
      expected: string;
      actual_found: number | string;
      ffr: boolean;
      should_be_ffr?: boolean;
      match: boolean;
      evidence_photo?: string;
    }[];
    sketch_validation: {
      link: string;
      sop_compliant: boolean;
      findings?: {
        fns_header: boolean;
        checkouts_x: boolean;
        entrance_labeled: boolean;
        hpi_stars_found: boolean;
        formula_found: boolean;
        storage_found: boolean;
        labels_correct: boolean;
        low_inv_match: boolean;
      };
      error?: string;
    };
    consent_form: {
      status: string;
      selection: string;
      findings?: {
        fns_store_filled: boolean;
        print_name_filled: boolean;
        signature_present: boolean;
        date_title_filled: boolean;
        all_six_filled: boolean;
        entire_form_visible: boolean;
      };
      error?: string;
    };
  };
  suggested_qc_scores: {
    Quality_Count__c: number;
    Quality_Count_Feedback__c?: string;
    Quality_Food_Photos__c: number;
    Quality_Food_Photos_Feedback__c?: string;
    Quality_Critical_Photos_Docs__c: number;
    Quality_Critical_Photos_Docs_Feedback__c?: string;
    Quality_Survey__c: number;
    Quality_Survey_Feedback__c?: string;
    Missing_Information__c: string[];
    QC_Requests_to_Reviewer__c?: string;
    Feedback_Comments__c?: string; // Other Feedback
    Internal_QC_Comments__c?: string;
    QC_Date__c: string;
    QC_d_By_2__c: string; // QC'd By
    EXT_OV_CO_Consent_SK_Fdbk__c?: string; // Internal Doc Fdbk
    Missing_3_X_3__c?: boolean;
  };
};
