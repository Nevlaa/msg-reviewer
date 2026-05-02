import React, { useState } from 'react';
import { useSalesforceData } from '../hooks/useSalesforceData';
import { QCDocForm } from './QCDocForm';
import { QCScoringPanel } from './QCScoringPanel';
import { LocationVerificationPanel } from './LocationVerificationPanel';
import './QCDocForm.css';

export const SalesforceConnector: React.FC = () => {
  const [instanceUrl, setInstanceUrl] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [surveyId, setSurveyId] = useState('a1Ccr000005fxSfEAI');
  const [inventoryId, setInventoryId] = useState('a1Bcr000002hN8HEAU');

  const { 
    loading, 
    isAiRunning,
    aiProgress,
    aiStatus,
    error, 
    validationLog, 
    validateData,
    runAiAnalysis,
    activeIds,
    setValidationLog
  } = useSalesforceData({
    instanceUrl: '/services',
    bearerToken: bearerToken
  });

  const handleUpdate = (section: string, field: string, value: any) => {
    setValidationLog((prev: any) => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (section === 'evidence' || section === 'rules') {
        newResults.compliance_checks = {
          ...newResults.compliance_checks,
          [section]: {
            ...newResults.compliance_checks[section],
            [field]: value
          }
        };
      } else {
        newResults[section] = {
          ...newResults[section],
          [field]: value
        };
      }
      return { ...prev, results: newResults };
    });
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    validateData(surveyId, inventoryId);
  };

  return (
    <div className="card panel animate-fade-in">
      <div className="card-header">
        <h2>Salesforce API Connector</h2>
        <p>Connect to Salesforce using your session token to pull live data.</p>
      </div>

      <form onSubmit={handleValidate} className="connector-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div className="form-group">
          <label htmlFor="instanceUrl">Instance URL</label>
          <input
            id="instanceUrl"
            type="text"
            className="input"
            placeholder="https://your-org.my.salesforce.com"
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bearerToken">Bearer Token (sid)</label>
          <input
            id="bearerToken"
            type="password"
            className="input"
            placeholder="Paste token from network tab..."
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="surveyId">Survey ID / Number</label>
            <input
              id="surveyId"
              type="text"
              className={`input ${activeIds?.surveyNumber ? 'success-text' : ''}`}
              value={activeIds?.surveyNumber && activeIds.surveyId === surveyId ? activeIds.surveyNumber : surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              title={activeIds?.surveyId}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="inventoryId">Food Inventory ID / Number</label>
            <input
              id="inventoryId"
              type="text"
              className={`input ${activeIds?.inventoryNumber ? 'success-text' : ''}`}
              value={activeIds?.inventoryNumber && activeIds.inventoryId === inventoryId ? activeIds.inventoryNumber : inventoryId}
              onChange={(e) => setInventoryId(e.target.value)}
              title={activeIds?.inventoryId}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Fetching Salesforce Data...' : 'Fetch Survey Data'}
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* PERSISTENT WORKSTATION FORM */}
      <QCDocForm 
        data={validationLog} 
        isAiRunning={isAiRunning}
        onUpdate={handleUpdate}
      />

      {validationLog && (
        <LocationVerificationPanel data={validationLog} />
      )}

      {validationLog && (
        <QCScoringPanel 
          data={validationLog}
          onUpdate={(field, value) => {
            setValidationLog({
              ...validationLog,
              suggested_qc_scores: {
                ...validationLog.suggested_qc_scores,
                [field]: value
              }
            });
          }}
        />
      )}

      {validationLog && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Action Panel */}
          <div className="card panel animate-fade-in" style={{ border: '2px solid var(--btn-primary)', background: 'rgba(37, 99, 235, 0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🤖 AI QC Gatekeeper 
                  {isAiRunning && <span className="scanning-pulse" style={{ fontSize: '0.75rem', color: 'var(--btn-primary)', fontWeight: 'bold' }}>• LIVE AUDIT</span>}
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {isAiRunning ? aiStatus : 'Ready to scan photos for variety counts and document compliance.'}
                </p>

                {isAiRunning && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${aiProgress}%` }} />
                    </div>
                    <div className="audit-phases">
                      <div className={`phase-item ${aiProgress >= 30 ? 'done' : 'active'}`}>
                        <div className="phase-dot" />
                        <span>Phase 1: Salesforce Image Ingestion</span>
                      </div>
                      <div className={`phase-item ${aiProgress >= 70 ? 'done' : (aiProgress >= 45 ? 'active' : '')}`}>
                        <div className="phase-dot" />
                        <span>Phase 2: Critical Document Evidence Audit</span>
                      </div>
                      <div className={`phase-item ${aiProgress >= 90 ? 'done' : (aiProgress >= 70 ? 'active' : '')}`}>
                        <div className="phase-dot" />
                        <span>Phase 3: Staple Food Variety & Count Verification</span>
                      </div>
                      <div className={`phase-item ${aiProgress === 100 ? 'done' : (aiProgress >= 90 ? 'active' : '')}`}>
                        <div className="phase-dot" />
                        <span>Phase 4: Final Score Consolidation</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ minWidth: '220px', height: '48px', fontSize: '1rem' }}
                  disabled={isAiRunning}
                  onClick={runAiAnalysis}
                >
                  {isAiRunning ? `Scanning... ${aiProgress}%` : '🚀 Run AI Vision Audit'}
                </button>
                {isAiRunning && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Analyzing up to 75 images via Gemini 3.0
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--btn-primary)' }}>
            <h3>Final Audit Narrative</h3>
            <div className="narrative-content" style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              {`AI QC VALIDATION SUMMARY
Status: Pending Manual Review

1. Compliance & Store Information:
- Store Data Match: ${validationLog.results.compliance_checks.store_info_match.status === 'Pass' ? '✅ Pass' : validationLog.results.compliance_checks.store_info_match.status === 'Discrepancy (Explained)' ? '⚠️ Match (Explained)' : '❌ FAIL'}
  *Detail: ${validationLog.results.compliance_checks.store_info_match.details}
- Consent Form Record Type: ${validationLog.results.compliance_checks.consent_verification.is_compliant ? '✅ Verified' : `❌ FAIL (${validationLog.results.compliance_checks.consent_verification.record_type})`}

2. Inventory Verification:
${validationLog.results.food_inventory.map(item => {
  const ffrStatus = item.ffr ? '✅' : (item.should_be_ffr ? '❌ (Missed)' : 'N/A');
  return `- [${item.category}] ${item.item}: Reported ${item.expected}. AI Found: ${item.actual_found}. FFR: ${ffrStatus}.`;
}).join('\n')}

3. Proposed Scores:
- Quality Count: ${validationLog.suggested_qc_scores.Quality_Count__c} / 15
- Quality Food Photos: ${validationLog.suggested_qc_scores.Quality_Food_Photos__c} / 15
- Quality Critical Photos/Docs: ${validationLog.suggested_qc_scores.Quality_Critical_Photos_Docs__c} / 15`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
