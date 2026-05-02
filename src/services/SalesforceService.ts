import type { SalesforceSurvey, SalesforceFoodInventory } from '../salesforceTypes';

export class SalesforceService {
  private instanceUrl: string;
  private bearerToken: string;

  constructor(instanceUrl: string, bearerToken: string) {
    // If instanceUrl is a full URL that matches the Salesforce org, we can strip it 
    // to use the local proxy, or just keep it as is if the user wants to use a CORS-enabled endpoint.
    this.instanceUrl = instanceUrl?.endsWith('/') ? instanceUrl.slice(0, -1) : (instanceUrl || '');
    this.bearerToken = bearerToken;
  }

  private async fetchFromSalesforce<T>(endpoint: string): Promise<T> {
    const url = this.instanceUrl.startsWith('http') ? `${this.instanceUrl}${endpoint}` : endpoint;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Salesforce API Error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async getSurvey(surveyId: string): Promise<SalesforceSurvey> {
    const fields = [
      'Id', 'Name', 'Store_Visit__c', 'Store_Visit__r.Name', 'Store_Name__c', 'Street_Address_1__c', 
      'City__c', 'State__c', 'Zip_Code__c', 'Owner_Manager_Name__c',
      'Store_Name_Provided_by_store_contact__c', 'Store_Name_as_Posted_on_Outside_Signage__c',
      'Store_Owner_Names__c', 'Freezers__c', 'Refrigerators__c', 'of_storage_freezers__c',
      'of_cash_registers_for_grocery_purchase__c', 'of_POS_devices_accepting_SNAP__c',
      'Consent_Form_Link__c', 'Sketch_Link__c', 'RecordTypeId', 'Store_Visit_Comments__c',
      'SNAP_No_Fraud_Poster_Displayed__c', 'Est_square_footage_of_store_public_area__c',
      'Estimated_square_footage_of_storage_room__c', 'of_checkout_countersareas__c',
      'of_specialty_cash_registers__c', 'Total_POS_devices__c',
      'HPI_1_Description__c', 'HPI_1_of_Units__c',
      'HPI_2_Description__c', 'HPI_2_of_Units__c',
      'HPI_3_Description__c', 'HPI_3_of_Units__c',
      'HPI_4_Description__c', 'HPI_4_of_Units__c',
      'HPI_5_Description__c', 'HPI_5_of_Units__c',
      'HPI_6_Description__c', 'HPI_6_of_Units__c',
      'Infant_Formula_1_Description__c', 'Infant_Formula_1_of_Units__c',
      'Infant_Formula_2_Description__c', 'Infant_Formula_2_of_Units__c',
      'Infant_Formula_3_Description__c', 'Infant_Formula_3_of_Units__c',
      'Infant_Formula_4_Description__c', 'Infant_Formula_4_of_Units__c',
      'Infant_Formula_NA__c', 'Store_accepts_WICWomenInfantChildren__c',
      'Store_Contact_Collaborated_on_survey_Qs__c',
      'No_on_site_visit_made__c', 'Outcome_of_store_visit__c',
      'Re_Visit2nd_attempt_arrival_DateTime__c', 'Site_Visit1st_attempt_arrivalDateTime__c',
      'Unsuccessful_Visit_Reason__c', 'Food_stored_in_storage_areas__c',
      'Store_Location__c', 'Store_Address_is_Different__c'
    ].join(',');
    
    const query = `SELECT ${fields} FROM Survey__c WHERE Id = '${surveyId}' LIMIT 1`;
    const response = await this.fetchFromSalesforce<any>(`/services/data/v60.0/query?q=${encodeURIComponent(query)}`);
    
    if (!response.records || response.records.length === 0) {
      throw new Error(`Survey record not found: ${surveyId}`);
    }
    
    return response.records[0] as SalesforceSurvey;
  }

  async getFoodInventory(id: string): Promise<SalesforceFoodInventory> {
    return this.fetchFromSalesforce(`/services/data/v60.0/sobjects/Food_Inventory__c/${id}`);
  }

  /**
   * Fetches all photos (ContentVersion) linked to a Survey or Food Inventory record.
   * This uses ContentDocumentLink which is more robust than FirstPublishLocationId.
   */
  async getSurveyPhotos(surveyId: string, inventoryId?: string): Promise<any[]> {
    console.log(`SALESFORCE: Searching for photos linked to Survey (${surveyId}) and Inventory (${inventoryId})...`);
    
    const ids = [surveyId];
    if (inventoryId) ids.push(inventoryId);
    
    const idList = ids.map(id => `'${id}'`).join(',');
    
    // 1. Get the ContentDocument IDs linked to these records
    const linkQuery = `SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId IN (${idList})`;
    const linkResponse = await this.fetchFromSalesforce<any>(`/services/data/v60.0/query?q=${encodeURIComponent(linkQuery)}`);
    
    if (!linkResponse.records || linkResponse.records.length === 0) {
      console.log('SALESFORCE: No ContentDocumentLinks found.');
      return [];
    }
    
    const docIds = linkResponse.records.map((r: any) => `'${r.ContentDocumentId}'`).join(',');
    
    // 2. Get the actual Latest Versions of those documents
    const versionQuery = `SELECT Id, Title, FileExtension, VersionData FROM ContentVersion WHERE ContentDocumentId IN (${docIds}) AND IsLatest = true`;
    const versionResponse = await this.fetchFromSalesforce<any>(`/services/data/v60.0/query?q=${encodeURIComponent(versionQuery)}`);
    
    console.log(`SALESFORCE: Found ${versionResponse.records?.length || 0} total photos via links.`);
    return versionResponse.records || [];
  }

  /**
   * Fetches the actual binary data of an image and converts it to base64.
   */
  async getPhotoBase64(versionDataUrl: string): Promise<string> {
    // Since we use a proxy for /services, we can call this directly if it starts with /services
    const response = await fetch(versionDataUrl, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`
      }
    });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Related files fetching (ContentDocumentLink)
  async getRelatedFiles(recordId: string): Promise<any[]> {
    const query = `SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileExtension FROM ContentDocumentLink WHERE LinkedEntityId = '${recordId}'`;
    return this.fetchFromSalesforce<any>(`/services/data/v60.0/query/?q=${encodeURIComponent(query)}`).then(res => res.records);
  }
}
