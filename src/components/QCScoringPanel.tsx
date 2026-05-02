import React from 'react';
import type { ValidationLog } from '../salesforceTypes';

interface QCScoringPanelProps {
  data: ValidationLog;
  onUpdate: (field: string, value: any) => void;
}

export const QCScoringPanel: React.FC<QCScoringPanelProps> = ({ data, onUpdate }) => {
  const scores = data.suggested_qc_scores;
  
  const missingOptions = [
    "2nd Visit", 
    "Delivery Route", 
    "Doc Edit Needed", 
    "NY/CS", 
    "Photos/Info Needed", 
    "RTR", 
    "Unsuccessful"
  ];

  const handleToggleMissing = (option: string) => {
    const current = scores.Missing_Information__c || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    onUpdate('Missing_Information__c', updated);
  };

  return (
    <div className="qc-scoring-panel card animate-fade-in" style={{ marginTop: '2rem', borderTop: '4px solid var(--btn-primary)' }}>
      <div className="card-header">
        <h2>QC Scoring & Finalization</h2>
        <p>Finalize the audit scores and document any missing information or required edits.</p>
      </div>

      <div className="scoring-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        {/* LEFT COLUMN: BASIC INFO & SCORES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Date QC'd</label>
            <input 
              type="date" 
              className="input" 
              value={scores.QC_Date__c} 
              onChange={(e) => onUpdate('QC_Date__c', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>QC'd By</label>
            <input 
              type="text" 
              className="input" 
              value={scores.QC_d_By_2__c} 
              onChange={(e) => onUpdate('QC_d_By_2__c', e.target.value)} 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: scores.Missing_3_X_3__c ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)', border: `1px solid ${scores.Missing_3_X_3__c ? 'var(--error)' : 'var(--success)'}` }}>
            <input 
              type="checkbox" 
              id="missing-3x3" 
              checked={!!scores.Missing_3_X_3__c} 
              onChange={(e) => onUpdate('Missing_3_X_3__c', e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem' }}
            />
            <label htmlFor="missing-3x3" style={{ fontWeight: 600, color: scores.Missing_3_X_3__c ? 'var(--error)' : 'var(--success)' }}>
              {scores.Missing_3_X_3__c ? '⚠️ Missing 3x3 Staple Variety' : '✅ 3x3 Variety Requirement Met'}
            </label>
          </div>

          <div className="score-feedback-group" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="form-group">
              <label>Quality Count (15 max)</label>
              <input 
                type="number" 
                className="input" 
                max={15} 
                value={scores.Quality_Count__c} 
                onChange={(e) => onUpdate('Quality_Count__c', parseInt(e.target.value))} 
              />
              <textarea 
                className="input" 
                placeholder="Food Count Feedback"
                style={{ marginTop: '0.5rem', minHeight: '80px' }}
                value={scores.Quality_Count_Feedback__c}
                onChange={(e) => onUpdate('Quality_Count_Feedback__c', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Quality Food Photos (15 max)</label>
              <input 
                type="number" 
                className="input" 
                max={15} 
                value={scores.Quality_Food_Photos__c} 
                onChange={(e) => onUpdate('Quality_Food_Photos__c', parseInt(e.target.value))} 
              />
              <textarea 
                className="input" 
                placeholder="Food Photos Feedback"
                style={{ marginTop: '0.5rem', minHeight: '80px' }}
                value={scores.Quality_Food_Photos_Feedback__c}
                onChange={(e) => onUpdate('Quality_Food_Photos_Feedback__c', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Quality Critical Photos Docs (15 max)</label>
              <input 
                type="number" 
                className="input" 
                max={15} 
                value={scores.Quality_Critical_Photos_Docs__c} 
                onChange={(e) => onUpdate('Quality_Critical_Photos_Docs__c', parseInt(e.target.value))} 
              />
              <label style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>EXT,OV,CO,Consent,SK Fdbk (Internal)</label>
              <textarea 
                className="input" 
                placeholder="Internal Document Feedback (FNS#/Store Name only)"
                style={{ marginTop: '0.25rem', minHeight: '80px' }}
                value={scores.EXT_OV_CO_Consent_SK_Fdbk__c}
                onChange={(e) => onUpdate('EXT_OV_CO_Consent_SK_Fdbk__c', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Quality Survey (15 max)</label>
              <input 
                type="number" 
                className="input" 
                max={15} 
                value={scores.Quality_Survey__c} 
                onChange={(e) => onUpdate('Quality_Survey__c', parseInt(e.target.value))} 
              />
              <textarea 
                className="input" 
                placeholder="Survey Feedback"
                style={{ marginTop: '0.5rem', minHeight: '80px' }}
                value={scores.Quality_Survey_Feedback__c}
                onChange={(e) => onUpdate('Quality_Survey_Feedback__c', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATUS & INTERNAL FEEDBACK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Missing Information</label>
            <div className="multi-select-container" style={{ display: 'flex', gap: '1rem', height: '200px' }}>
              <div className="select-list" style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
                <div style={{ padding: '0.5rem', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Available</div>
                {missingOptions.filter(o => !(scores.Missing_Information__c || []).includes(o)).map(option => (
                  <div 
                    key={option} 
                    className="select-item" 
                    style={{ padding: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                    onClick={() => handleToggleMissing(option)}
                  >
                    {option} →
                  </div>
                ))}
              </div>
              <div className="select-list" style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto', background: 'rgba(37, 99, 235, 0.05)' }}>
                <div style={{ padding: '0.5rem', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', background: 'var(--btn-primary)', color: 'white', fontWeight: 600 }}>Chosen</div>
                {(scores.Missing_Information__c || []).map(option => (
                  <div 
                    key={option} 
                    className="select-item chosen" 
                    style={{ padding: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--btn-primary)' }}
                    onClick={() => handleToggleMissing(option)}
                  >
                    ← {option}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>QC Requests to Reviewer</label>
            <textarea 
              className="input" 
              placeholder="What specifically needs to be fixed?"
              style={{ minHeight: '100px' }}
              value={scores.QC_Requests_to_Reviewer__c}
              onChange={(e) => onUpdate('QC_Requests_to_Reviewer__c', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Other Feedback (Internal)</label>
            <textarea 
              className="input" 
              placeholder="Extra feedback about the QC review internally..."
              style={{ minHeight: '80px' }}
              value={scores.Feedback_Comments__c}
              onChange={(e) => onUpdate('Feedback_Comments__c', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Internal QC Comments</label>
            <textarea 
              className="input" 
              placeholder="Board member / Board review notes..."
              style={{ minHeight: '100px' }}
              value={scores.Internal_QC_Comments__c}
              onChange={(e) => onUpdate('Internal_QC_Comments__c', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <input type="checkbox" id="send-missing" style={{ width: '1.25rem', height: '1.25rem' }} />
            <label htmlFor="send-missing" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Send Missing Information Email to Reviewer</label>
          </div>
        </div>
      </div>
    </div>
  );
};
