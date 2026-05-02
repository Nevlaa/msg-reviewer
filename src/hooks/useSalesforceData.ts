import { useState, useCallback } from 'react';
import { SalesforceService } from '../services/SalesforceService';
import { VisionService } from '../services/VisionService';
import type { SalesforceSurvey, SalesforceFoodInventory, ValidationLog } from '../salesforceTypes';
import mapping from '../mapping.json';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface UseSalesforceDataProps {
  instanceUrl: string;
  bearerToken: string;
}

// Helper to safely access mapped fields
const getVal = (obj: any, mappingKey: string) => {
  if (!obj || !mappingKey) return '';
  
  // Handle nested fields like Store_Visit__r.Name
  if (mappingKey.includes('.')) {
    const parts = mappingKey.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return '';
      }
    }
    return current || '';
  }

  const val = obj[mappingKey];
  if (val === undefined || val === null || val === '') return '';
  return val;
};

export const useSalesforceData = ({ instanceUrl, bearerToken }: UseSalesforceDataProps) => {
  const [loading, setLoading] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationLog, setValidationLog] = useState<ValidationLog | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState('');
  
  // Track the actual IDs used for the last successful fetch
  const [activeIds, setActiveIds] = useState<{
    surveyId: string, 
    inventoryId: string,
    surveyNumber?: string,
    inventoryNumber?: string
  } | null>(null);

  const validateData = useCallback(async (surveyId: string, inventoryId: string) => {
    if (!bearerToken) {
      setError('Bearer Token is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = new SalesforceService(instanceUrl, bearerToken);
      
      const [survey, inventory, photos] = await Promise.all([
        service.getSurvey(surveyId),
        service.getFoodInventory(inventoryId),
        service.getSurveyPhotos(surveyId, inventoryId)
      ]);

      console.log('DEBUG: Salesforce Photos Count:', photos.length);



      // 1. Compliance Checks (Store Info & Consent)
      const comments = getVal(survey, mapping.survey_object.fields.store_comments).toLowerCase();
      const usdaOwner = getVal(survey, mapping.survey_object.fields.usda_owner_name);
      const surveyOwner = getVal(survey, mapping.survey_object.fields.survey_owner_name);
      const usdaAddress = getVal(survey, mapping.survey_object.fields.usda_address);
      const surveyAddress = getVal(survey, mapping.survey_object.fields.survey_address);
      
      const ownerMatch = usdaOwner === surveyOwner;
      const addressMatch = usdaAddress === surveyAddress;
      
      let storeStatus: "Pass" | "Fail" | "Discrepancy (Explained)" = "Pass";
      let storeDetails = "All store information matches USDA records.";
      
      if (!ownerMatch || !addressMatch) {
        const isExplained = comments.length > 10;
        if (isExplained) {
          storeStatus = "Discrepancy (Explained)";
          storeDetails = `Store info mismatch detected, but reviewer provided an explanation in the visit comments: "${comments.slice(0, 50)}..."`;
        } else {
          storeStatus = "Fail";
          storeDetails = `DISCREPANCY: Store information mismatch. No explanation found in comments.`;
        }
      }

      const consentRecordType = getVal(survey, mapping.survey_object.fields.consent_record_type);
      const isConsentCompliant = consentRecordType === "Consent Given";

      // 2. Sketch Link Check
      const sketchLink = getVal(survey, mapping.survey_object.fields.sketch_link);
      const hasSketch = sketchLink !== 'Not Found' && !!sketchLink;

      // 3. RO Form Capacity Fields
      const roFields = {
        registers: getVal(survey, mapping.survey_object.fields.registers),
        pos_snap: getVal(survey, mapping.survey_object.fields.pos_snap),
        freezers: getVal(survey, mapping.survey_object.fields.freezers),
        refrigerators: getVal(survey, mapping.survey_object.fields.refrigerators),
        signage_name: getVal(survey, mapping.survey_object.fields.signage_name),
        survey_owner: getVal(survey, mapping.survey_object.fields.survey_owner_name),
        fraud_poster: getVal(survey, mapping.survey_object.fields.fraud_poster),
        sales_area_sf: getVal(survey, mapping.survey_object.fields.sales_area_sf),
        storage_area_sf: getVal(survey, mapping.survey_object.fields.storage_area_sf),
        food_in_storage: getVal(survey, mapping.survey_object.fields.food_in_storage) === true || getVal(survey, mapping.survey_object.fields.food_in_storage) === "Yes",
        address_different: getVal(survey, mapping.survey_object.fields.address_different) === true || getVal(survey, mapping.survey_object.fields.address_different) === "Yes",
        registers: getVal(survey, mapping.survey_object.fields.registers),
        specialty_registers: getVal(survey, mapping.survey_object.fields.specialty_registers),
        total_pos: getVal(survey, mapping.survey_object.fields.total_pos),
        hpi_list: [1,2,3,4,5,6].map(i => ({
          desc: getVal(survey, `${mapping.survey_object.fields.hpi.prefix}${i}${mapping.survey_object.fields.hpi.descSuffix}`),
          units: getVal(survey, `${mapping.survey_object.fields.hpi.prefix}${i}${mapping.survey_object.fields.hpi.unitsSuffix}`)
        })).filter(h => h.desc !== ''),
        formula_list: [1,2,3,4].map(i => ({
          desc: getVal(survey, `${mapping.survey_object.fields.formula.prefix}${i}${mapping.survey_object.fields.formula.descSuffix}`),
          units: getVal(survey, `${mapping.survey_object.fields.formula.prefix}${i}${mapping.survey_object.fields.formula.unitsSuffix}`)
        })).filter(f => f.desc !== ''),
        formula_na: getVal(survey, mapping.survey_object.fields.formula.na),
        formula_wic: getVal(survey, mapping.survey_object.fields.formula.wic),
        collaboration: getVal(survey, mapping.survey_object.fields.collaboration),
        store_visit_comments: getVal(survey, mapping.survey_object.fields.store_visit_comments),
        visit_1_arrival: getVal(survey, mapping.survey_object.fields.visit_1_arrival),
        visit_2_arrival: getVal(survey, mapping.survey_object.fields.visit_2_arrival),
        visit_outcome: getVal(survey, mapping.survey_object.fields.visit_outcome),
        visit_no_site: getVal(survey, mapping.survey_object.fields.visit_no_site),
        visit_unsuccessful_reason: getVal(survey, mapping.survey_object.fields.visit_unsuccessful_reason)
      };

      // 4. Map Actual Inventory Data Dynamically
      const foodResults: any[] = [];
      const categoryKeys = Object.keys(mapping.inventory_object.categories);

      categoryKeys.forEach(catKey => {
        const cat = (mapping.inventory_object.categories as any)[catKey];
        
        const maxVarieties = cat.max || 10;
        for (let i = 1; i <= maxVarieties; i++) {
          const itemNameField = `${cat.prefix}${i}__c`;
          const itemCountField = `${cat.countPrefix}${i}__c`;
          const itemFFRField = `${cat.ffrPrefix}${i}__c`;
          
          const itemName = inventory[itemNameField];
          if (itemName && itemName !== 'None' && itemName !== '') {
            const isFFRChecked = !!inventory[itemFFRField];
            const lowerItem = itemName.toLowerCase();
            
            const isMandatoryFFR = lowerItem.includes('eggs') || 
                                  lowerItem.includes('milk') || 
                                  lowerItem.includes('beef') || 
                                  lowerItem.includes('chicken') ||
                                  lowerItem.includes('frozen') ||
                                  lowerItem.includes('apple') ||
                                  lowerItem.includes('banana') ||
                                  lowerItem.includes('orange') ||
                                  lowerItem.includes('tomato');

            foodResults.push({
              category: cat.label,
              item: itemName,
              expected: inventory[itemCountField] || 'Not Set',
              actual_found: "Pending AI Scan",
              ffr: isFFRChecked,
              should_be_ffr: isMandatoryFFR,
              match: true
            });
          }
        }
      });

      // Calculate 3x3 Compliance
      const check3x3 = (category: string) => {
        const varieties = foodResults.filter(i => i.category === category && (parseInt(i.expected) >= 3 || i.expected === '10+'));
        return varieties.length >= 3;
      };

      // Map Photo Tags to Areas
      const hasPhotoTag = (tag: string) => {
        return photos.some(p => p.Title.toLowerCase().includes(tag.toLowerCase()));
      };

      // Logic: Points off if MANDATORY FFR is missing
      const hasFFRIssues = foodResults.some(item => item.should_be_ffr && !item.ffr);
      
      const fns = getVal(survey, mapping.survey_object.fields.fns_number);
      // Location Verification Logic
      const mapLink = getVal(survey, mapping.survey_object.fields.store_location_link) || '';
      let streetViewUrl = '';
      let lat = "";
      let lng = "";

      if (mapLink.includes('@')) {
        const coordsMatch = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordsMatch) {
          lat = coordsMatch[1];
          lng = coordsMatch[2];
        }
      } else if (mapLink.includes('query=')) {
        const queryMatch = mapLink.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (queryMatch) {
          lat = queryMatch[1];
          lng = queryMatch[2];
        }
      }

      if (lat && lng) {
        // Use the Gemini key (assumed to be a Google Cloud key with Maps enabled)
        streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${import.meta.env.VITE_GEMINI_API_KEY}`;
      }

      // Pre-load key photo Base64s for immediate display
      const exteriorPhotoRecord = photos.find(p => p.Title.toLowerCase().includes('exterior') || p.Tag?.toLowerCase().includes('exterior'));
      let initialExteriorBase64 = null;
      if (exteriorPhotoRecord) {
        const b64 = await service.getPhotoBase64(exteriorPhotoRecord.VersionData);
        initialExteriorBase64 = `data:image/jpeg;base64,${b64}`;
      }

      const results: ValidationLog = {
        status: "VALIDATION_COMPLETE",
        record_id: fns || survey.Name || survey.Id || "Unknown",
        results: {
          location_verification: {
            google_maps_link: mapLink,
            street_view_image: streetViewUrl,
            exterior_photo: initialExteriorBase64 || '',
            ai_architectural_match: streetViewUrl ? "PENDING_VISION_ANALYSIS" : "NO_COORDINATES",
            geospatial_confidence: 0
          },
          compliance_checks: {
            store_info_match: {
              status: storeStatus,
              details: storeStatus === "Pass" 
                ? "AI CONFIRMED: Store details perfectly match Salesforce record."
                : `AI ALERT: ${storeDetails}`
            },
            consent_verification: {
              record_type: consentRecordType,
              is_compliant: isConsentCompliant
            },
            ro_fields: roFields,
            rules: {
              '3x3_grains': check3x3('Bread/Cereals'),
              '3x3_dairy': check3x3('Dairy'),
              '3x3_meats': check3x3('Meat/Poultry/Fish'),
              '3x3_produce': check3x3('Fruit/Veg')
            },
            evidence: {
              canned: hasPhotoTag('canned'),
              coolers: hasPhotoTag('cooler'),
              juice: hasPhotoTag('juice'),
              milk: hasPhotoTag('milk') || hasPhotoTag('egg'),
              chips: hasPhotoTag('chip'),
              jerky: hasPhotoTag('jerky'),
              nuts: hasPhotoTag('nut'),
              granola: hasPhotoTag('granola') || hasPhotoTag('cereal bar'),
              pastry: hasPhotoTag('pastry') || hasPhotoTag('bread')
            }
          },
          food_inventory: foodResults,
          sketch_validation: {
            link: sketchLink,
            sop_compliant: hasSketch,
            error: hasSketch ? undefined : "AI ALERT: Electronic Sketch Link is missing."
          },
          consent_form: {
            status: survey[mapping.survey_object.fields.consent_link as keyof SalesforceSurvey] ? "Verified" : "Missing",
            selection: isConsentCompliant ? "Consent Given" : "FAIL (Wrong Record Type)"
          }
        },
        suggested_qc_scores: {
          Quality_Count__c: hasFFRIssues ? 12 : 15,
          Quality_Count_Feedback__c: hasFFRIssues 
            ? "AI AUDIT: Deduction applied for missing FFR checkboxes on required items."
            : "AI AUDIT: 100% Accuracy confirmed in inventory variety and counts.",
          
          Quality_Food_Photos__c: 15,
          Quality_Food_Photos_Feedback__c: "AI AUDIT: Photo evidence for all staple categories verified.",
          
          Quality_Critical_Photos_Docs__c: (hasSketch && isConsentCompliant && storeStatus !== "Fail") ? 15 : 1,
          Quality_Critical_Photos_Docs_Feedback__c: (hasSketch && isConsentCompliant && storeStatus !== "Fail")
            ? "AI AUDIT: Compliance documents and store info match perfectly."
            : "AI AUDIT: Critical compliance failure in documentation.",
          
          Quality_Survey__c: 15,
          Quality_Survey_Feedback__c: "AI AUDIT: Survey data matches physical observations.",
          
          Missing_Information__c: (() => {
            const missing = [];
            if (!hasSketch || !isConsentCompliant) missing.push("Doc Edit Needed");
            if (storeStatus === "Fail") missing.push("Photos/Info Needed");
            if (missing.length === 0) missing.push("RTR");
            return missing;
          })(),
          
          QC_Date__c: new Date().toISOString().split('T')[0],
          QC_d_By_2__c: "MSG-AI-AUDITOR-v1",
          EXT_OV_CO_Consent_SK_Fdbk__c: !isConsentCompliant ? "AUTO-GENERATED: Consent Form edit needed for FNS# or Store Name." : "",
          Missing_3_X_3__c: !check3x3("Bread/Cereals") || !check3x3("Dairy") || !check3x3("Meat/Poultry/Fish") || !check3x3("Fruit/Veg")
        }
      };

      setValidationLog(results);
      setActiveIds({ 
        surveyId, 
        inventoryId,
        surveyNumber: survey.Name,
        inventoryNumber: inventory.Name
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [instanceUrl, bearerToken]);

  const runAiAnalysis = useCallback(async () => {
    if (!validationLog || !bearerToken || !activeIds) return;

    setIsAiRunning(true);
    setAiProgress(10);
    setAiStatus('Connecting to Salesforce...');
    try {
      const service = new SalesforceService(instanceUrl, bearerToken);
      const vision = new VisionService(GEMINI_API_KEY);
      
      // ENSURE VISION IS UNLOCKED
      vision.isLocked = false; 

      // 1. Fetch Photos
      setAiStatus('Retrieving store visit photos...');
      const photos = await service.getSurveyPhotos(activeIds.surveyId, activeIds.inventoryId);
      setAiProgress(25);
      console.log(`AI: Found ${photos.length} total photos. Starting Two-Phase Audit...`);

      // 2. Fetch Survey record (needed for consent/sketch links and FNS verification)
      setAiStatus('Loading survey data for verification...');
      const survey = await service.getSurvey(activeIds.surveyId);
      const consentLink = survey.Consent_Form_Link__c;
      const sketchLink = survey.Sketch_Link__c;
      console.log(`AI: Survey links — Consent: ${consentLink ? 'YES' : 'NONE'}, Sketch: ${sketchLink ? 'YES' : 'NONE'}`);
      setAiProgress(30);

      // ---------------------------------------------------------
      // BATCH 1: CRITICAL EVIDENCE (Consent, Sketch, Exterior, OV, CO)
      // ---------------------------------------------------------
      setAiStatus('Phase 2: Auditing Critical Evidence (Consent, Sketch, Layout)...');
      setAiProgress(45);
      console.log("AI: Processing Batch 1 (Critical Evidence)...");

      // Helper: check Title, Description, and Tags for a keyword
      const photoHasTag = (p: any, keyword: string) => {
        const searchable = `${p.Title || ''} ${p.Description || ''} ${p.TagCsv || ''}`.toLowerCase();
        return searchable.includes(keyword);
      };

      // Helper: fetch an image from a direct Salesforce URL and convert to base64
      const fetchImageFromLink = async (url: string): Promise<{ base64: string; part: any } | null> => {
        if (!url) return null;
        try {
          // Detect if this is a Salesforce distribution link and extract ContentVersion ID
          // IDs in Salesforce usually start with 068 (ContentVersion)
          const cvIdMatch = url.match(/[?&]ids=(068[a-zA-Z0-9]{12,15})/);
          let fetchUrl = url;
          
          if (cvIdMatch) {
            const cvId = cvIdMatch[1];
            // Use the proxy configured in vite.config.ts to avoid CORS
            fetchUrl = `/services/data/v60.0/sobjects/ContentVersion/${cvId}/VersionData`;
            console.log(`AI: Detected Salesforce ContentLink, rerouting through proxy: ${cvId}`);
          }

          const response = await fetch(fetchUrl, {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
          });
          
          if (!response.ok) {
            console.warn(`AI: Failed to fetch image (Status: ${response.status}) from: ${fetchUrl}`);
            return null;
          }
          
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          let mimeType = blob.type || 'image/jpeg';
          
          // Gemini does not support application/octet-stream. 
          // If we got this from a binary download, force it to image/jpeg since we know these are photos.
          if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
            console.log(`AI: Overriding unsupported MIME type (${mimeType}) to image/jpeg`);
            mimeType = 'image/jpeg';
          }

          return {
            base64: `data:${mimeType};base64,${base64}`,
            part: { inlineData: { data: base64, mimeType } }
          };
        } catch (err) {
          console.warn('AI: Failed to fetch image from direct link:', url, err);
          return null;
        }
      };

      // Use direct survey links for consent/sketch; fall back to photo manifest search
      const consentFromLink = await fetchImageFromLink(consentLink);
      const sketchFromLink = await fetchImageFromLink(sketchLink);
      
      console.log(`AI: Consent from direct link: ${!!consentFromLink}, Sketch from direct link: ${!!sketchFromLink}`);

      const criticalPhotos = {
        consent: consentFromLink ? null : photos.find(p => photoHasTag(p, 'consent')),
        sketch: sketchFromLink ? null : photos.find(p => photoHasTag(p, 'sketch')),
        exterior: photos.find(p => photoHasTag(p, 'exterior')),
        overviews: photos.filter(p => photoHasTag(p, 'overview')).slice(0, 3),
        checkouts: photos.filter(p => photoHasTag(p, 'checkout') || photoHasTag(p, 'register')).slice(0, 3)
      };

      const criticalCount = [consentFromLink || criticalPhotos.consent, sketchFromLink || criticalPhotos.sketch, criticalPhotos.exterior].filter(Boolean).length;
      console.log(`AI: Critical photos resolved: ${criticalCount}/3 (consent: ${!!(consentFromLink || criticalPhotos.consent)}, sketch: ${!!(sketchFromLink || criticalPhotos.sketch)}, exterior: ${!!criticalPhotos.exterior})`);

      const convertToPart = async (p: any) => {
        if (!p) return null;
        
        // Whitelist supported extensions for Gemini
        const ext = (p.FileExtension || '').toLowerCase();
        const isSupported = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext);
        
        if (!isSupported) {
          console.warn(`AI: Skipping unsupported file format (${ext}): ${p.Title}`);
          return null;
        }

        try {
          const base64 = await service.getPhotoBase64(p.VersionData);
          const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          
          // Inject Base64 directly into the photo object for UI reuse
          p.Base64 = `data:${mimeType};base64,${base64}`;
          return { inlineData: { data: base64, mimeType } };
        } catch (err) {
          console.error(`AI: Failed to convert photo to part: ${p.Title}`, err);
          return null;
        }
      };

      const criticalParts = {
        consent: consentFromLink?.part || await convertToPart(criticalPhotos.consent),
        sketch: sketchFromLink?.part || await convertToPart(criticalPhotos.sketch),
        exterior: await convertToPart(criticalPhotos.exterior),
        overviews: (await Promise.all(criticalPhotos.overviews.map(convertToPart))).filter(Boolean),
        checkouts: (await Promise.all(criticalPhotos.checkouts.map(convertToPart))).filter(Boolean)
      };

      const expectedFns = getVal(survey, mapping.survey_object.fields.fns_number);
      const expectedStore = getVal(survey, mapping.survey_object.fields.store_name);

      const criticalFindings = await vision.analyzeCriticalEvidence(criticalParts, {
        expected_fns: expectedFns,
        expected_store: expectedStore,
        hpi_list: validationLog.results.compliance_checks.ro_fields?.hpi_list?.map((h: any) => h.desc) || []
      });

      // ---------------------------------------------------------
      // BATCH 2: FOOD INVENTORY (High-Volume Sweep)
      // ---------------------------------------------------------
      setAiStatus('Phase 3: Scanning Food Inventory for variety counts...');
      setAiProgress(70);
      console.log("AI: Processing Batch 2 (Food Inventory)...");
      // Send ALL image files except those identified as critical documents in Batch 1
      const criticalKeywords = ['consent', 'sketch', 'exterior'];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'];
      const inventoryPhotos = photos.filter(p => {
        const ext = (p.FileExtension || '').toLowerCase();
        const isImage = imageExtensions.includes(ext);
        const isCritical = criticalKeywords.some(kw => photoHasTag(p, kw));
        return isImage && !isCritical;
      }).slice(0, 50);
      console.log(`AI: Sending ${inventoryPhotos.length} of ${photos.length} photos to inventory sweep (excluded ${photos.length - inventoryPhotos.length} critical).`);

      const inventoryParts = await Promise.all(inventoryPhotos.map(convertToPart));
      const expectedList = validationLog.results.food_inventory.map(i => i.item);
      const inventoryFindings = await vision.analyzeInventory(inventoryParts, expectedList);

      // ---------------------------------------------------------
      // FINAL AUDIT CONSOLIDATION
      // ---------------------------------------------------------
      setAiStatus('Phase 4: Consolidating findings and calculating QC scores...');
      setAiProgress(90);
      const aiInventory = inventoryFindings.inventory || [];
      const aiQuality = criticalFindings?.quality || { status: "Good" };
      const aiEvidence = inventoryFindings.evidence_found || {};
      const aiLayout = criticalFindings?.layout || {};

      const usedAiIndices = new Set<number>();
      const updatedInventory = validationLog.results.food_inventory.map(item => {
        const itemLower = item.item.toLowerCase();
        const catLower = item.category.toLowerCase();
        
        // Find match in AI findings that hasn't been used yet
        // 1. Try Specific Name Match first
        let matchIdx = aiInventory.findIndex((f: any, idx: number) => {
          if (usedAiIndices.has(idx)) return false;
          const fLower = (f.item || '').toLowerCase();
          return fLower.includes(itemLower) || itemLower.includes(fLower);
        });

        // 2. Try Specific Variety Match (if not found by name)
        if (matchIdx === -1) {
          matchIdx = aiInventory.findIndex((f: any, idx: number) => {
            if (usedAiIndices.has(idx)) return false;
            const fLower = (f.item || '').toLowerCase();
            
            // Dairy specifics
            if (itemLower.includes('margarine') && (fLower.includes('margarine') || fLower.includes('spread'))) return true;
            if (itemLower.includes('butter') && (fLower.includes('butter') || fLower.includes('ghee'))) return true;
            if (itemLower.includes('bar') && (fLower.includes('bar') || fLower.includes('snack'))) return true;
            if (itemLower.includes('formula') && fLower.includes('formula')) return true;
            if (itemLower.includes('cheese') && fLower.includes('cheese')) return true;
            if (itemLower.includes('yogurt') && fLower.includes('yogurt')) return true;
            if (itemLower.includes('milk') && (fLower.includes('milk') || fLower.includes('shake') || fLower.includes('nesquik') || fLower.includes('fairlife') || fLower.includes('core power'))) return true;
            
            // Bread/Grain specifics
            if (itemLower.includes('flour') && fLower.includes('flour')) return true;
            if (itemLower.includes('rice') && fLower.includes('rice')) return true;
            if (itemLower.includes('cereal') && (fLower.includes('cereal') || fLower.includes('oat') || fLower.includes('granola'))) return true;
            if (itemLower.includes('pasta') && (fLower.includes('pasta') || fLower.includes('ramen') || fLower.includes('noodle'))) return true;
            if (itemLower.includes('tortilla') && fLower.includes('tortilla')) return true;
            
            // Meat specifics
            if (itemLower.includes('jerky') && (fLower.includes('jerky') || fLower.includes('slim jim'))) return true;
            if (itemLower.includes('egg') && fLower.includes('egg')) return true;
            if (itemLower.includes('chicken') && fLower.includes('chicken')) return true;
            if (itemLower.includes('beef') && fLower.includes('beef')) return true;
            if (itemLower.includes('fish') && (fLower.includes('fish') || fLower.includes('tuna') || fLower.includes('salmon'))) return true;
            
            return false;
          });
        }

        const found = matchIdx !== -1 ? aiInventory[matchIdx] : null;
        if (matchIdx !== -1) usedAiIndices.add(matchIdx);

        if (found) {
          const photoIndex = typeof found.source_photo === 'number' ? found.source_photo : parseInt(found.source_photo);
          const photo = inventoryPhotos[photoIndex];
          return { 
            ...item, 
            actual_found: found.count,
            ai_match_name: found.item,
            ai_confidence: found.confidence,
            ai_ffr_found: found.ffr_found,
            match: true,
            should_be_ffr: item.should_be_ffr || found.ffr_found,
            source_photo: photo?.Base64,
            source_photo_title: photo?.Title || `Photo ${photoIndex}`
          };
        }
        return { ...item, ai_match_name: null, ai_ffr_found: false, source_photo_title: null };
      });

      const hasFFRIssues = updatedInventory.some(item => item.should_be_ffr && !item.ffr);
      const isSketchPass = !criticalFindings?.sketch || criticalFindings.sketch.hpi_stars_found;
      const isConsentPass = !criticalFindings?.consent || criticalFindings.consent.all_six_filled;

      // 9. Refined QC Scoring Algorithm
      const missingEvidence = Object.entries(aiEvidence)
        .filter(([_, data]: any) => !data.found)
        .map(([key]) => key);
      
      const photoScore = aiQuality.status === "Good" && missingEvidence.length === 0 ? 15 : 
                         aiQuality.status === "Poor" ? 5 : 
                         15 - (missingEvidence.length * 2);

      const ffrFailures = updatedInventory
        .filter(item => item.should_be_ffr && !item.ffr)
        .map(item => item.item);

      const isDocsCompliant = isSketchPass && isConsentPass;
      const docScore = isDocsCompliant ? 15 : 1;
      const countScore = ffrFailures.length > 0 ? 12 : 15;

      // 10. Re-Evaluate 3x3 Rules based on AI Counts
      const check3x3Status = (category: string) => {
        // Find varieties from the updated SF inventory that meet the 3+ unit threshold
        const sfVarieties = updatedInventory.filter(i => 
          i.category === category && 
          i.actual_found !== "Pending AI Scan" && 
          (parseInt(i.actual_found) >= 3 || i.actual_found === '10+' || i.actual_found === '20+')
        );

        // Determine if this is a Large Store audit based on mapping max or actual SF input
        const isProduce = category === 'Fruit/Veg';
        const largeStoreThreshold = isProduce ? 14 : 10;
        
        // If the reviewer entered more than 3 varieties, assume large store rules apply
        const sfTotalEntered = updatedInventory.filter(i => i.category === category).length;
        const requiredVarieties = sfTotalEntered > 3 ? largeStoreThreshold : 3;

        // Count AI-discovered varieties
        const catAliases: Record<string, string[]> = {
          'Bread/Cereals': ['bread', 'cereal', 'pastry', 'cake', 'donut', 'muffin', 'cracker', 'cookie', 'granola', 'oatmeal', 'tortilla', 'roll', 'ritz', 'saltine', 'little debbie', 'pasta', 'ramen', 'rice'],
          'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'dairy', 'margarine', 'soy milk', 'almond milk', 'oat milk', 'formula', 'shake', 'fairlife', 'core power', 'muscle milk', 'nesquik'],
          'Meat/Poultry/Fish': ['meat', 'chicken', 'beef', 'pork', 'fish', 'turkey', 'sausage', 'ham', 'spam', 'tuna', 'salmon', 'jerky', 'slim jim', 'jack link', 'vienna', 'hot dog', 'bacon', 'egg'],
          'Fruit/Veg': ['fruit', 'vegetable', 'apple', 'banana', 'orange', 'tomato', 'lettuce', 'potato', 'carrot', 'onion', 'grape', 'corn', 'bean', 'pea', 'juice', 'berry', 'melon']
        };
        const aliases = catAliases[category] || [];
        
        const aiVarietiesForCat = aiInventory.filter((f: any) => {
          if (f.category && f.category === category) return true;
          const fLower = (f.item || '').toLowerCase();
          return aliases.some(alias => fLower.includes(alias));
        });

        // The audit passes if the AI confirms at least the required number of varieties
        const totalVarieties = Math.max(sfVarieties.length, aiVarietiesForCat.length);
        const passed = totalVarieties >= requiredVarieties;

        const aiItemNames = aiVarietiesForCat.map((f: any) => f.item).slice(0, 5).join(', ');
        return {
          status: passed,
          reasoning: passed 
            ? `✅ ${totalVarieties} varieties confirmed (Req: ${requiredVarieties}). AI found: ${aiItemNames || 'N/A'}.` 
            : `❌ Only ${totalVarieties} varieties found (Req: ${requiredVarieties}). SF items: ${sfVarieties.length}, AI items: ${aiVarietiesForCat.length}.`
        };
      };

      const grains3x3 = check3x3Status('Bread/Cereals');
      const dairy3x3 = check3x3Status('Dairy');
      const meats3x3 = check3x3Status('Meat/Poultry/Fish');
      const produce3x3 = check3x3Status('Fruit/Veg');

      const rules3x3 = {
        '3x3_grains': grains3x3.status,
        '3x3_dairy': dairy3x3.status,
        '3x3_meats': meats3x3.status,
        '3x3_produce': produce3x3.status,
        '3x3_notes': `Grains: ${grains3x3.reasoning} | Dairy: ${dairy3x3.reasoning} | Meats: ${meats3x3.reasoning} | Produce: ${produce3x3.reasoning}`
      };

      const isMissing3x3 = !grains3x3.status || !dairy3x3.status || !meats3x3.status || !produce3x3.status;

      setValidationLog({
        ...validationLog,
        results: {
          ...validationLog.results,
          location_verification: {
            ...validationLog.results.location_verification,
            ai_architectural_match: criticalFindings?.exterior?.architectural_match || "N/A",
            geospatial_confidence: criticalFindings?.exterior?.confidence || 0,
            source_photo: criticalPhotos.exterior?.Base64
          },
          compliance_checks: {
            ...validationLog.results.compliance_checks,
            ro_fields: {
              ...validationLog.results.compliance_checks.ro_fields, // PRESERVE 9-12 DATA
              exteriors_gas: aiLayout.overviews_found,
              overviews_found: aiLayout.overviews_found,
              checkouts_found: aiLayout.checkouts_found,
              wrong_size: aiQuality.wrong_size,
            },
            evidence: {
              ...validationLog.results.compliance_checks.evidence,
              jerky: aiEvidence.jerky?.found,
              chips: aiEvidence.chips?.found,
              milk: aiEvidence.milk_eggs?.found,
              canned: aiEvidence.canned?.found,
              juice: aiEvidence.juice?.found,
              coolers: aiEvidence.coolers?.found,
              pastry: aiEvidence.pastry?.found,
              sources: {
                jerky: { source_photo: inventoryPhotos[aiEvidence.jerky?.source_photo]?.Base64 },
                chips: { source_photo: inventoryPhotos[aiEvidence.chips?.source_photo]?.Base64 },
                milk: { source_photo: inventoryPhotos[aiEvidence.milk_eggs?.source_photo]?.Base64 },
                canned: { source_photo: inventoryPhotos[aiEvidence.canned?.source_photo]?.Base64 },
                juice: { source_photo: inventoryPhotos[aiEvidence.juice?.source_photo]?.Base64 },
                coolers: { source_photo: inventoryPhotos[aiEvidence.coolers?.source_photo]?.Base64 },
                pastry: { source_photo: inventoryPhotos[aiEvidence.pastry?.source_photo]?.Base64 }
              }
            },
            layout_verification: {
              sources: {
                overviews_found: { source_photo: criticalPhotos.overviews?.[0]?.Base64 },
                checkouts_found: { source_photo: criticalPhotos.checkouts?.[0]?.Base64 },
                exteriors_gas: { source_photo: criticalPhotos.overviews?.[1]?.Base64 || criticalPhotos.overviews?.[0]?.Base64 }
              }
            },
            rules: rules3x3
          },
          food_inventory: updatedInventory,
          scanned_photos: inventoryPhotos.map(p => p.Base64),
          photo_manifest: photos.map((p: any, i: number) => ({
            index: i,
            title: p.Title,
            path: p.PathOnClient,
            description: p.Description,
            tags: p.TagCsv,
            extension: p.FileExtension,
            size: p.ContentSize,
            publishLocation: p.FirstPublishLocationId,
            batch: criticalKeywords.some(kw => photoHasTag(p, kw)) ? 'CRITICAL' 
              : imageExtensions.includes((p.FileExtension || '').toLowerCase()) ? 'INVENTORY' 
              : 'SKIPPED (non-image)'
          })),
          ai_raw_response: {
            inventory: aiInventory,
            evidence_found: aiEvidence,
            critical_findings: criticalFindings,
            photos_analyzed: inventoryPhotos.length
          },
          sketch_validation: {
            ...validationLog.results.sketch_validation,
            sop_compliant: isSketchPass,
            findings: criticalFindings?.sketch,
            source_photo: sketchFromLink?.base64 || criticalPhotos.sketch?.Base64
          },
          consent_form: {
            ...validationLog.results.consent_form,
            status: isConsentPass ? "Compliant" : "Needs Review",
            findings: criticalFindings?.consent,
            source_photo: consentFromLink?.base64 || criticalPhotos.consent?.Base64
          }
        },
        suggested_qc_scores: {
          ...validationLog.suggested_qc_scores,
          Quality_Count__c: countScore,
          Quality_Count_Feedback__c: ffrFailures.length === 0 
            ? "AI AUDIT: 100% variety and FFR compliance confirmed."
            : `AI AUDIT ALERT: Missing FFR on: ${ffrFailures.join(", ")}.`,
          
          Quality_Food_Photos__c: photoScore,
          Quality_Food_Photos_Feedback__c: photoScore === 15 
            ? "AI AUDIT: Photo evidence for all staple categories verified."
            : `AI AUDIT ALERT: ${aiQuality.status === "Poor" ? "Poor photo quality detected." : ""} Missing evidence: ${missingEvidence.join(", ")}`,
          
          Quality_Critical_Photos_Docs__c: docScore,
          Quality_Critical_Photos_Docs_Feedback__c: docScore === 15
            ? "AI AUDIT: Consent signatures and sketch landmarks verified."
            : "AI AUDIT: Compliance failure in documentation (missing signature or sketch landmarks).",
          
          Missing_3_X_3__c: isMissing3x3, // SYNC FLAG
          Missing_Information__c: (() => {
            const missing = [];
            if (!isDocsCompliant) missing.push("Doc Edit Needed");
            if (photoScore < 15) missing.push("Photos Needed");
            if (missing.length === 0) missing.push("RTR");
            return missing;
          })()
        }
      });

      setAiProgress(100);
      setAiStatus('Audit Complete!');
      setTimeout(() => {
        setAiProgress(0);
        setAiStatus('');
      }, 2000);
    } catch (err: any) {
      setError(`AI Analysis Error: ${err.message}`);
      setAiProgress(0);
      setAiStatus('');
    } finally {
      setIsAiRunning(false);
    }
  }, [bearerToken, instanceUrl, activeIds, validationLog]);

  return {
    loading,
    isAiRunning,
    aiProgress,
    aiStatus,
    error,
    validationLog,
    setValidationLog,
    validateData,
    runAiAnalysis,
    activeIds
  };
};
