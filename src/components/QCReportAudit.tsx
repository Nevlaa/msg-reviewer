import React, { useState } from 'react';
import type { SNAPScanReport, ValidationStatus, ChecklistItem } from '../types';

interface QCReportAuditProps {
  report: SNAPScanReport;
  onUpdateReport: (updatedReport: SNAPScanReport) => void;
}

export const QCReportAudit: React.FC<QCReportAuditProps> = ({ report, onUpdateReport }) => {
  const [activeSection, setActiveSection] = useState<'critical' | 'food' | 'comments' | 'corrections'>('critical');
  const [corrections, setCorrections] = useState<Record<string, number>>({});
  const [formCorrection, setFormCorrection] = useState('');
  const [sketchNotes, setSketchNotes] = useState('');

  const updateChecklistItem = (id: string, status: ValidationStatus) => {
    if (!report.audit_result) return;
    
    const updatedCritical = report.audit_result.critical_requirements.map(item => 
      item.id === id ? { ...item, status } : item
    );

    onUpdateReport({
      ...report,
      audit_result: {
        ...report.audit_result,
        critical_requirements: updatedCritical
      }
    });
  };

  const handleFoodCorrection = (itemId: string, newCount: number) => {
    setCorrections(prev => ({ ...prev, [itemId]: newCount }));
    // In a real app, this would update the report state
  };

  const renderStatusBadge = (status: ValidationStatus) => {
    const colors = {
      Pending: 'var(--text-secondary)',
      Pass: 'var(--accent-green)',
      Fail: 'var(--accent-red)',
      Corrected: 'var(--accent-amber)'
    };
    return (
      <span className="status-badge" style={{ color: colors[status], borderColor: colors[status] }}>
        {status}
      </span>
    );
  };

  return (
    <div className="qc-audit-container">
      <div className="qc-sidebar">
        <nav className="qc-nav">
          <button 
            className={`qc-nav-item ${activeSection === 'critical' ? 'active' : ''}`}
            onClick={() => setActiveSection('critical')}
          >
            1. Critical Requirements
          </button>
          <button 
            className={`qc-nav-item ${activeSection === 'food' ? 'active' : ''}`}
            onClick={() => setActiveSection('food')}
          >
            2. Food Inventory Validation
          </button>
          <button 
            className={`qc-nav-item ${activeSection === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveSection('comments')}
          >
            3. Comment Validation
          </button>
          <button 
            className={`qc-nav-item ${activeSection === 'corrections' ? 'active' : ''}`}
            onClick={() => setActiveSection('corrections')}
          >
            4. Forms & Sketches
          </button>
        </nav>
      </div>

      <div className="qc-main-content">
        {activeSection === 'critical' && (
          <div className="qc-section">
            <header className="qc-section-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Phase A: Critical Requirement Checklist</h2>
                  <p>Verify that all mandatory photographic evidence is present and readable.</p>
                </div>
                <div className="overall-score-badge">
                  Score: 100/100
                </div>
              </div>
            </header>
            
            <div className="qc-checklist">
              {report.audit_result?.critical_requirements.map(item => (
                <div key={item.id} className="qc-checklist-item">
                  <div className="qc-item-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3>{item.label}</h3>
                      {item.guideline && (
                        <div className="guideline-trigger" title={item.guideline}>ⓘ</div>
                      )}
                    </div>
                    <p>{item.description}</p>
                  </div>
                  <div className="qc-item-actions">
                    <button 
                      className={`btn-icon ${item.status === 'Pass' ? 'active-pass' : ''}`}
                      onClick={() => updateChecklistItem(item.id, 'Pass')}
                    >
                      ✓ Pass
                    </button>
                    <button 
                      className={`btn-icon ${item.status === 'Fail' ? 'active-fail' : ''}`}
                      onClick={() => updateChecklistItem(item.id, 'Fail')}
                    >
                      ✗ Fail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'food' && (
          <div className="qc-section">
             <header className="qc-section-header">
              <h2>Phase B: Food Inventory (10/10/10/14 Rule)</h2>
              <p>Compare reported counts against photographic support. Verify that the Reviewer didn't miss varieties to reach the mandatory 10/10/10/14 thresholds.</p>
              <div className="sop-rule-box">
                <strong>SOP Rule:</strong> Bread (10), Meat (10), Dairy (10), Produce (14). Max Count: 20 per variety.
              </div>
            </header>
            
            <div className="food-validation-grid">
              <div className="inventory-reviewer-data">
                 <div className="panel-header">
                    <h3>Inventory Counts</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge-info">Max: 10/10/10/14</span>
                      <button className="btn btn-tiny btn-primary">+ Add Missed Variety</button>
                    </div>
                 </div>
                {Object.entries(report.food_inventory).map(([category, items]) => (
                  <div key={category} className="inventory-category">
                    <h4>{category.replace(/_/g, ' ').toUpperCase()}</h4>
                    <div className="inventory-list">
                      {items.map((item, idx) => (
                        <div key={idx} className="inventory-row-detailed">
                          <div className="item-meta">
                            <span className="variety-name">{item.variety}</span>
                            <span className="unit-label">{item.unit_of_sale} | {item.is_ffr ? 'FFR' : 'Shelf'}</span>
                          </div>
                          <div className="correction-input-group">
                            <span className="original-count">{item.count}</span>
                            <span className="arrow">→</span>
                            <input 
                              type="number" 
                              className="correction-field"
                              value={corrections[item.id] ?? item.count}
                              onChange={(e) => handleFoodCorrection(item.id, parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="inventory-photo-support">
                <div className="panel-header">
                  <h3>Evidence Gallery</h3>
                  <div className="filter-group">
                    <button className="btn btn-tiny active">All</button>
                    <button className="btn btn-tiny">Dairy</button>
                    <button className="btn btn-tiny">Produce</button>
                  </div>
                </div>
                <div className="photo-gallery-large">
                  {report.photos.map(photo => (
                    <div key={photo.id} className="photo-card-large">
                      <img src={photo.url} alt={photo.category} />
                      <div className="photo-overlay">
                        <span>{photo.category}</span>
                        <button className="btn-zoom">🔍</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'comments' && (
          <div className="qc-section">
            <header className="qc-section-header">
              <h2>Phase C: Comment & Survey Consistency</h2>
              <p>Ensure written comments match the evidence provided in survey answers and photos.</p>
            </header>
            
            <div className="comments-validation-box-detailed">
               <div className="panel narrative-panel">
                 <div className="panel-header">
                    <h3>Reviewer Narrative</h3>
                    <button className="btn btn-tiny">Suggest Edit</button>
                 </div>
                 <div className="narrative-content">
                    <p>{report.reviewer_comments}</p>
                 </div>
               </div>
               
               <div className="panel survey-panel">
                 <div className="panel-header">
                    <h3>Cross-Reference: Survey Data</h3>
                 </div>
                 <div className="survey-comparison-list">
                    {Object.entries(report.survey_answers).map(([q, a]) => (
                      <div key={q} className="survey-comparison-item">
                        <div className="question">{q}</div>
                        <div className="answer">{a}</div>
                        <div className="validation-toggle">
                           <button className="btn-tiny">✓ Valid</button>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeSection === 'corrections' && (
          <div className="qc-section">
            <header className="qc-section-header">
              <h2>Phase D: Corrections (Forms & Sketches)</h2>
              <p>Apply necessary edits to store visit consent forms and electronic sketches.</p>
            </header>
            
            <div className="corrections-layout">
               <div className="correction-work-area">
                  <div className="card form-correction-card">
                    <div className="panel-header">
                      <h3>Store Visit Consent Form</h3>
                      <div className="tool-bar">
                        <button className="btn btn-tiny">Pen</button>
                        <button className="btn btn-tiny">Highlighter</button>
                        <button className="btn btn-tiny">Clear</button>
                      </div>
                    </div>
                    <div className="form-canvas-container">
                       <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80" alt="Consent Form" className="form-preview-img" />
                       <div className="canvas-overlay">
                          {/* Sketch logic would go here */}
                       </div>
                    </div>
                    <div className="correction-notes">
                       <label>QC Correction Notes (Consent Form):</label>
                       <textarea 
                        placeholder="Detail the corrections made to the consent form..."
                        value={formCorrection}
                        onChange={(e) => setFormCorrection(e.target.value)}
                       />
                    </div>
                  </div>

                  <div className="card sketch-correction-card">
                    <div className="panel-header">
                      <h3>Electronic Sketch (HPI Mapping)</h3>
                      <div className="tool-bar">
                         <span className="badge-hpi">HPI Star Needed: 6</span>
                         <div className="sop-hint">★ Red Star = HPI | Blue Font = Staple | Black Font = Non-food</div>
                      </div>
                    </div>
                    <div className="sketch-canvas-container">
                       <div className="grid-background">
                          {/* This would be an interactive canvas */}
                          <div className="hpi-marker" style={{ top: '20%', left: '30%' }}>★</div>
                          <div className="hpi-marker" style={{ top: '40%', left: '60%' }}>★</div>
                          <p className="sketch-label">Dairy Cooler</p>
                          <p className="sketch-label" style={{ top: '70%', left: '20%' }}>Produce Island</p>
                       </div>
                    </div>
                    <div className="correction-notes">
                       <label>QC Redline Notes (Sketch):</label>
                       <textarea 
                        placeholder="Detail the corrections made to the store sketch..."
                        value={sketchNotes}
                        onChange={(e) => setSketchNotes(e.target.value)}
                       />
                    </div>
                  </div>
               </div>
               
               <div className="qc-summary-panel">
                  <div className="card">
                    <h3>Audit Summary</h3>
                    <div className="summary-stat">
                       <span>Critical Status:</span>
                       <span className="status-pass">PASS</span>
                    </div>
                    <div className="summary-stat">
                       <span>Food Discrepancies:</span>
                       <span>2 Corrections</span>
                    </div>
                    <div className="summary-stat">
                       <span>Form Corrections:</span>
                       <span>Yes</span>
                    </div>
                    <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>Finalize Audit</button>
                    <button className="btn btn-secondary btn-full" style={{ marginTop: '0.5rem' }}>Reject to Reviewer</button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
