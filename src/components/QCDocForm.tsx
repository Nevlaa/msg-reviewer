import React from 'react';
import './QCDocForm.css';

interface QCDocFormProps {
  data: any;
  onUpdate: (section: string, field: string, value: any) => void;
  isAiRunning: boolean;
}

export const QCDocForm: React.FC<QCDocFormProps> = ({ data, onUpdate, isAiRunning }) => {
  const renderCheckWithEvidence = (section: string, field: string, label: string) => {
    // Correctly path to compliance_checks for evidence and rules
    const targetSection = (section === 'evidence' || section === 'rules') 
      ? data?.results?.compliance_checks?.[section]
      : data?.results?.[section];
      
    const isChecked = targetSection?.[field];
    
    // Attempt to find a source photo in several possible locations
    let sourcePhoto = null;
    if (section === 'evidence' && targetSection?.sources) {
      sourcePhoto = targetSection.sources[field]?.source_photo;
    }
    
    return (
      <div className="qc-check-row" onClick={() => data && onUpdate(section, field, !isChecked)}>
        <span>{label}</span>
        <div className="flex-gap-small">
          {sourcePhoto && (
            <div className="evidence-preview-tiny" onClick={(e) => { e.stopPropagation(); window.open(sourcePhoto, '_blank'); }}>
              <img src={sourcePhoto} alt="Evidence" title="Click to view full AI evidence" />
            </div>
          )}
          <span className={`qc-status ${isChecked ? 'pass' : 'fail'}`}>
            {data ? (isChecked ? '✅' : '❌') : '○'}
          </span>
        </div>
      </div>
    );
  };

  const safeVal = (val: any) => val || '---';

  return (
    <div className="qc-doc-container animate-fade-in">
      {/* GEOSPATIAL VERIFICATION OVERLAY (TOP) */}
      <div className="qc-box geospatial-preview" style={{ marginBottom: '1.5rem', border: '1px solid #ddd' }}>
        <div className="qc-title" style={{ background: '#f8fafc', color: '#64748b' }}>📍 Geospatial Verification</div>
        <div className="geospatial-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
          <div className="geo-side">
            <div className="tiny-text mb-5">GOOGLE STREET VIEW (REFERENCE)</div>
            <div className="geo-img-placeholder">
              {data?.results.location_verification?.street_view_image ? (
                <img src={data.results.location_verification.street_view_image} alt="Street View" />
              ) : (
                <span>No coordinates found in Maps link</span>
              )}
            </div>
          </div>
          <div className="geo-side">
            <div className="tiny-text mb-5">AGENT EXTERIOR PHOTO (EVIDENCE)</div>
            <div className="geo-img-placeholder">
              {data?.results.location_verification?.source_photo ? (
                <img src={data.results.location_verification.source_photo} alt="AI Exterior Match" />
              ) : (
                data?.results.location_verification?.exterior_photo ? (
                   <img src={data.results.location_verification.exterior_photo} alt="Record Exterior" />
                ) : (
                  <span>No exterior photo found</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="qc-header-grid">
        <div className="qc-full-row border-b">
          <div className="flex-between">
            <div className="flex-gap"><strong>FNS#</strong> <span className="value-text">{safeVal(data?.record_id)}</span></div>
            <div className="small-tag">Updated {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div className="qc-full-row border-b flex-between">
          <span>Store Name: <strong className="value-text">{safeVal(data?.results.compliance_checks.ro_fields?.signage_name)}</strong></span>
          <span>matches Store Name Provided? 
            <span className={`qc-status ${data?.results.compliance_checks.store_info_match.status === 'Pass' ? 'pass' : 'fail'}`}>
              {data ? (data.results.compliance_checks.store_info_match.status === 'Pass' ? '✅' : '❌') : '○'}
            </span>
          </span>
        </div>
        <div className="qc-full-row flex-between">
          <span>Google map - correct location?</span>
          <span className={`qc-status ${(data?.results.location_verification?.geospatial_confidence ?? 0) >= 0.8 || (data?.results.location_verification?.google_maps_link && (data?.results.location_verification?.geospatial_confidence ?? 0) === 0) ? 'pass' : 'fail'}`}>
            {data ? (
              (data.results.location_verification?.geospatial_confidence ?? 0) >= 0.8 ? '✅' : 
              (data.results.location_verification?.google_maps_link && (data.results.location_verification?.geospatial_confidence ?? 0) === 0) ? '✅' : '❌'
            ) : '○'}
          </span>
        </div>
        {/* ... (rest of header remains) ... */}
        <div className="qc-full-row flex-between">
          <span>Address diff? (need comments)</span>
          <input type="checkbox" checked={!!data?.results.compliance_checks.ro_fields?.address_different} readOnly style={{ width: '14px', height: '14px' }} />
        </div>
      </div>

      <div className="qc-main-grid">
        {/* LEFT COLUMN */}
        <div className="qc-col">
          <div className="qc-box flex-row"><div className="q-num-header">1</div><div className="q-text">SALES AREA SF <strong className="value-text underlined">{safeVal(data?.results.compliance_checks.ro_fields?.sales_area_sf)}</strong></div></div>
          <div className="qc-box flex-row"><div className="q-num-header">9-12</div><div className="q-text"><strong>#CO / SPEC / GRO / POS / EBT</strong><br/><span className="value-text underlined">{safeVal(data?.results.compliance_checks.ro_fields?.registers)}</span> / <span className="value-text underlined">{safeVal(data?.results.compliance_checks.ro_fields?.specialty_registers)}</span> / <span className="value-text underlined">{safeVal(data?.results.compliance_checks.ro_fields?.total_pos)}</span></div></div>
          <div className="qc-box flex-row"><div className="q-num-header">14</div><div className="q-text">Strg SF <strong className="value-text underlined">{safeVal(data?.results.compliance_checks.ro_fields?.storage_area_sf)}</strong> 📷</div></div>
          <div className="qc-box flex-row"><div className="q-num-header">15</div><div className="q-text">If walk-ins present, 14 is yes 📷</div></div>
          <div className="qc-box flex-row"><div className="q-num-header">28</div><div className="q-text">Formula 📷 (WIC: {data?.results.compliance_checks.ro_fields?.formula_wic || 'No'})</div></div>
          
          <div className="qc-box no-padding">
            <div className="qc-sub-header">29 HPIs Are these in food counts?</div>
            <table className="hpi-table">
              <thead><tr><th>Item Desc</th><th>Qty</th></tr></thead>
              <tbody>
                {data?.results.compliance_checks.ro_fields?.hpi_list?.map((hpi: any, idx: number) => (
                  <tr key={idx}><td>{hpi.desc}</td><td>{hpi.units}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="qc-box dark h-100"><div className="qc-title">COMMENTS / EDITS / FEEDBACK</div><div className="comment-area"></div></div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="qc-col">
          <div className="qc-box dark">
            <div className="qc-title">VISIT DATE/TIME / OUTCOME</div>
            <div className="visit-meta">
              <div className="meta-row"><span>1st Attempt:</span> <strong>{safeVal(data?.results.compliance_checks.ro_fields?.visit_1_arrival)}</strong></div>
              <div className="meta-row border-t mt-5"><span>Outcome:</span> <strong className={data?.results.compliance_checks.ro_fields?.visit_outcome === 'Successful' ? 'text-green' : 'text-red'}>{safeVal(data?.results.compliance_checks.ro_fields?.visit_outcome)}</strong></div>
            </div>
            <div className="comment-preview mt-10">{safeVal(data?.results.compliance_checks.ro_fields?.store_visit_comments)}</div>
          </div>

          <div className="qc-box no-padding">
            <div className="qc-title">CONSENT</div>
            {(() => {
              const f = data?.results?.consent_form?.findings;
              const source = data?.results?.consent_form?.source_photo;
              return (
                <div className="qc-check-row">
                  <span>FNS / DATE / STORE NAME / 6 FIELDS</span>
                  <div className="flex-gap-small">
                    {source && <div className="evidence-preview-tiny"><img src={source} alt="Consent" /></div>}
                    <span className={`qc-status ${f?.all_six_filled ? 'pass' : 'fail'}`}>{data ? (f?.all_six_filled ? '✅' : '❌') : '○'}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="qc-box no-padding">
            <div className="qc-title">SKETCH</div>
            {(() => {
              const f = data?.results?.sketch_validation?.findings;
              const source = data?.results?.sketch_validation?.source_photo;
              return (
                <div className="qc-check-row">
                  <span>HPI STARS / LAYOUT / FNS HEADER</span>
                  <div className="flex-gap-small">
                    {source && <div className="evidence-preview-tiny"><img src={source} alt="Sketch" /></div>}
                    <span className={`qc-status ${f?.hpi_stars_found ? 'pass' : 'fail'}`}>{data ? (f?.hpi_stars_found ? '✅' : '❌') : '○'}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="qc-box no-padding">
            <div className="qc-title">LAYOUT VERIFICATION</div>
            {['exteriors_gas', 'overviews_found', 'checkouts_found'].map(field => {
               const source = data?.results?.compliance_checks?.layout_verification?.sources?.[field]?.source_photo;
               return (
                 <div className="qc-check-row" key={field}>
                   <span>{field.replace('_found', '').replace('_', ' ').toUpperCase()}</span>
                   <div className="flex-gap-small">
                     {source && <div className="evidence-preview-tiny"><img src={source} alt={field} /></div>}
                     <span className={`qc-status ${data?.results.compliance_checks.ro_fields?.[field] ? 'pass' : 'fail'}`}>
                       {data ? (data.results.compliance_checks.ro_fields?.[field] ? '✅' : '❌') : '○'}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="qc-col">
          <div className="qc-box no-padding">
            <div className="qc-title">3x3 STAPLES (AI VERIFIED)</div>
            {renderCheckWithEvidence('rules', '3x3_grains', 'Have 3x3 on Grains?')}
            {renderCheckWithEvidence('rules', '3x3_dairy', 'Have 3x3 on Dairy?')}
            {renderCheckWithEvidence('rules', '3x3_meats', 'Have 3x3 on Meats?')}
            {renderCheckWithEvidence('rules', '3x3_produce', 'Have 3x3 on Fruit/Veg?')}
            {data?.results?.compliance_checks?.rules?.['3x3_notes'] && (
              <div className="tiny-text italic p-5 border-t bg-light-blue">
                <strong>AI REASONING:</strong> {data.results.compliance_checks.rules['3x3_notes']}
              </div>
            )}
          </div>

          {data?.results?.ffr_edits_comment && (
            <div className="qc-box no-padding" style={{ marginBottom: '15px', borderLeft: '4px solid ' + (data.results.ffr_edits_comment.includes('Points removed') ? '#ef4444' : '#22c55e') }}>
              <div className="qc-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎯 REVIEWER ACCURACY FEEDBACK</span>
                <span style={{ fontSize: '0.65rem' }}>{data.results.ffr_edits_comment.includes('Points removed') ? '⚠️ DISCREPANCY' : '✅ PASS'}</span>
              </div>
              <div style={{ padding: '10px', background: data.results.ffr_edits_comment.includes('Points removed') ? '#fef2f2' : '#f0fdf4' }}>
                <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: '500' }}>
                  "{data.results.ffr_edits_comment}"
                </div>
              </div>
            </div>
          )}

          <div className="qc-box no-padding">
            <div className="qc-title">📋 STORE REVIEWER INVENTORY vs AI VERIFICATION</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', padding: '4px 8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              Comparing store reviewer's food list against AI image analysis. ✅ = 3+ units found (3x3 compliant). FFR = Fresh/Frozen/Refrigerated.
            </div>
            <div className="inventory-table-container">
              <table className="inventory-table-mini" style={{ fontSize: '0.7rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '6px', width: '80px' }}>Category</th>
                    <th style={{ padding: '6px' }}>Reviewer Item</th>
                    <th style={{ padding: '6px' }}>AI Matched As</th>
                    <th style={{ padding: '6px', width: '50px', textAlign: 'center' }}>Count</th>
                    <th style={{ padding: '6px', width: '40px', textAlign: 'center' }}>FFR</th>
                    <th style={{ padding: '6px', width: '40px', textAlign: 'center' }}>3x3</th>
                    <th style={{ padding: '6px', width: '100px' }}>Source Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.food_inventory?.map((item: any, idx: number) => {
                    const aiCountNum = parseInt(item.actual_found) || 0;
                    const sfCountNum = parseInt(item.expected) || 0;
                    
                    // "Close enough" logic: 
                    // 1. Exact match
                    // 2. Both are high volume (10+ or 20+)
                    // 3. Within +/- 2 units
                    const isCountClose = 
                      item.actual_found === item.expected ||
                      (String(item.actual_found || '').includes('+') && String(item.expected || '').includes('+')) ||
                      Math.abs(aiCountNum - sfCountNum) <= 2;

                    const hasMatch = item.match && item.ai_match_name;
                    
                    // 3x3/Threshold compliance: At least 3 units (or high volume)
                    const meetsMinThreshold = aiCountNum >= 3 || String(item.actual_found || '').includes('+');
                    
                    const needsFFR = item.should_be_ffr;
                    const ffrOk = !needsFFR || item.ai_ffr_found;
                    
                    // A row is "Verified" if there's a match, the count is close to the reviewer, AND FFR matches
                    const rowPass = hasMatch && isCountClose && ffrOk;
                    
                    return (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        background: hasMatch ? (rowPass ? '#f0fdf4' : '#fefce8') : '#fef2f2'
                      }}>
                        <td style={{ padding: '5px 6px', fontSize: '0.6rem', color: '#64748b' }}>{item.category}</td>
                        <td style={{ padding: '5px 6px' }}>
                          <strong>{item.item || 'Unknown'}</strong>
                          {item.expected && <span style={{ color: '#94a3b8', fontSize: '0.6rem', marginLeft: '4px' }}>(exp: {item.expected})</span>}
                        </td>
                        <td style={{ padding: '5px 6px', color: hasMatch ? '#059669' : '#dc2626', fontStyle: hasMatch ? 'normal' : 'italic' }}>
                          {hasMatch ? item.ai_match_name : 'Not found in images'}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'center', fontWeight: 'bold' }}>
                          <span style={{ 
                            color: isCountClose ? '#059669' : '#dc2626',
                            background: isCountClose ? '#d1fae5' : '#fee2e2',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem'
                          }}>
                            {item.actual_found || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                          {needsFFR ? (
                            <span style={{ fontSize: '0.8rem' }}>{item.ai_ffr_found ? '✅' : '❌'}</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.6rem' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '5px 6px', textAlign: 'center', fontSize: '0.85rem' }}>
                          {hasMatch && meetsMinThreshold ? '✅' : '❌'}
                        </td>
                        <td style={{ padding: '5px 6px' }}>
                          {item.source_photo ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div className="evidence-preview-tiny" onClick={() => window.open(item.source_photo, '_blank')}>
                                <img src={item.source_photo} alt="Source" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              </div>
                              <span style={{ fontSize: '0.55rem', color: '#64748b', fontFamily: 'monospace' }}>{item.source_photo_title || '—'}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.6rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!data?.results?.food_inventory || data.results.food_inventory.length === 0) && (
                    <tr><td colSpan={7} className="center-text p-10">No inventory loaded / Run AI scan</td></tr>
                  )}
                </tbody>
              </table>
              {/* Summary row */}
              {data?.results?.food_inventory?.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f1f5f9', fontSize: '0.65rem', color: '#475569', borderTop: '2px solid #cbd5e1' }}>
                  <span>
                    <strong>Matched:</strong> {data.results.food_inventory.filter((i: any) => i.match).length} / {data.results.food_inventory.length} items
                  </span>
                  <span>
                    <strong>3x3 Pass:</strong> {data.results.food_inventory.filter((i: any) => i.match && (parseInt(i.actual_found) >= 3 || i.actual_found === '10+')).length} items
                  </span>
                  <span>
                    <strong>FFR Issues:</strong> {data.results.food_inventory.filter((i: any) => i.should_be_ffr && !i.ai_ffr_found).length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="qc-box no-padding">
            <div className="qc-title">AREA EVIDENCE</div>
            {renderCheckWithEvidence('evidence', 'canned', 'Canned food shelves')}
            {renderCheckWithEvidence('evidence', 'coolers', 'Cooler doors')}
            {renderCheckWithEvidence('evidence', 'milk', 'Dairy / Eggs')}
            {renderCheckWithEvidence('evidence', 'chips', 'Chips / Snacks')}
            {renderCheckWithEvidence('evidence', 'jerky', 'Jerky')}
            {renderCheckWithEvidence('evidence', 'pastry', 'Pastry / Bread')}
          </div>
        </div>
      </div>

      {/* EVIDENCE GALLERY SECTION */}
      {data?.results?.scanned_photos?.length > 0 && (
        <div className="qc-box dark mt-15">
          <div className="qc-title">📸 AI SWEEP: INVENTORY VERIFICATION GALLERY ({data.results.scanned_photos.length} photos scanned)</div>
          <div className="evidence-gallery">
            {data.results.scanned_photos.map((src: string, i: number) => (
              <div key={i} className="gallery-item" onClick={() => window.open(src, '_blank')}>
                <img src={src} alt={`Sweep ${i}`} />
                <div className="gallery-label"># {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SALESFORCE PHOTO MANIFEST */}
      {data?.results?.photo_manifest && (
        <details open className="qc-box mt-15" style={{ background: '#0f172a', border: '1px solid #334155' }}>
          <summary style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold', padding: '0.75rem', fontSize: '0.85rem' }}>
            📂 SALESFORCE PHOTO MANIFEST ({data.results.photo_manifest.length} files fetched)
          </summary>
          <div style={{ padding: '0 0.75rem 0.75rem', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #475569' }}>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>#</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Title</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>PathOnClient</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Description</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Tags</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Ext</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Size</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>PublishLocation</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#94a3b8' }}>Batch</th>
                </tr>
              </thead>
              <tbody>
                {data.results.photo_manifest.map((p: any) => (
                  <tr key={p.index} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '4px 6px' }}>{p.index}</td>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{p.title || '—'}</td>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.path || '—'}</td>
                    <td style={{ padding: '4px 6px' }}>{p.description || '—'}</td>
                    <td style={{ padding: '4px 6px' }}>{p.tags || '—'}</td>
                    <td style={{ padding: '4px 6px' }}>{p.extension}</td>
                    <td style={{ padding: '4px 6px' }}>{p.size ? `${Math.round(p.size / 1024)}KB` : '—'}</td>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace', fontSize: '0.6rem' }}>{p.publishLocation || '—'}</td>
                    <td style={{ padding: '4px 6px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        background: p.batch === 'INVENTORY' ? '#065f46' : p.batch === 'CRITICAL' ? '#92400e' : '#7f1d1d',
                        color: 'white'
                      }}>
                        {p.batch}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* STORE REVIEWER INVENTORY JSON PANEL (EXPECTED DATA) */}
      {data?.results?.food_inventory && (
        <details className="qc-box mt-15" style={{ background: '#0f172a', border: '1px solid #334155' }}>
          <summary style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: 'bold', padding: '0.75rem', fontSize: '0.85rem' }}>
            📦 STORE REVIEWER INVENTORY (EXPECTED JSON)
          </summary>
          <div style={{ padding: '0 0.75rem 0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Raw variety list as reported by the store reviewer in the field:
            </div>
            <pre style={{ 
              background: '#1e293b', 
              color: '#38bdf8', 
              padding: '1rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              overflow: 'auto', 
              maxHeight: '400px',
              border: '1px solid #0ea5e9'
            }}>
              {JSON.stringify({
                fns_number: data.record_id,
                inventory_summary: data.results.food_inventory.map((item: any) => ({
                  category: item.category,
                  item: item.item,
                  expected_count: item.expected,
                  unit_type: item.item?.toLowerCase().includes('lb') ? 'Weight (lb)' : 'Units/Packs',
                  ffr_required: item.should_be_ffr
                }))
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {/* RAW AI RESPONSE JSON PANEL */}
      {data?.results?.ai_raw_response && (
        <details open className="qc-box mt-15" style={{ background: '#0f172a', border: '1px solid #334155' }}>
          <summary style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold', padding: '0.75rem', fontSize: '0.85rem' }}>
            🔍 RAW AI RESPONSE JSON ({data.results.ai_raw_response.photos_analyzed} photos analyzed, {data.results.ai_raw_response.inventory?.length || 0} items found)
          </summary>
          <div style={{ padding: '0 0.75rem 0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>Evidence Detection:</div>
            <pre style={{ 
              background: '#1e293b', 
              color: '#e2e8f0', 
              padding: '1rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              overflow: 'auto', 
              maxHeight: '200px',
              border: '1px solid #334155',
              marginBottom: '0.75rem'
            }}>
              {JSON.stringify(data.results.ai_raw_response.evidence_found, null, 2)}
            </pre>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>Full AI Inventory ({data.results.ai_raw_response.inventory?.length || 0} items):</div>
            <pre style={{ 
              background: '#1e293b', 
              color: '#e2e8f0', 
              padding: '1rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              overflow: 'auto', 
              maxHeight: '400px',
              border: '1px solid #334155'
            }}>
              {JSON.stringify(data.results.ai_raw_response.inventory, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};
