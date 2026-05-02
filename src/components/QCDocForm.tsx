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
              const source = data?.results?.compliance_checks?.ro_fields?.source_photos?.consent;
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
              const source = data?.results?.compliance_checks?.ro_fields?.source_photos?.sketch;
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
               const source = data?.results?.compliance_checks?.ro_fields?.source_photos?.layout?.[field];
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

          <div className="qc-box no-padding">
            <div className="qc-title">STAPLE FOOD INVENTORY (AI SWEEP)</div>
            <div className="inventory-table-container">
              <table className="inventory-table-mini">
                <thead><tr><th>Category</th><th>Item/Variety</th><th>SF Exp</th><th>AI Found</th><th>Source</th></tr></thead>
                <tbody>
                  {data?.results?.food_inventory?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="tiny-text">{item.category}</td>
                      <td className="tiny-text"><strong>{item.item || item.name || 'Unknown'}</strong></td>
                      <td className="center-text">{item.expected}</td>
                      <td className={`center-text ${item.actual_found !== 'Pending AI Scan' ? 'text-blue' : ''}`}>{item.actual_found}</td>
                      <td>
                        {item.source_photo ? (
                          <div className="evidence-preview-tiny" onClick={() => window.open(item.source_photo, '_blank')}>
                             <img src={item.source_photo} alt="Source" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = 'IMG'; }} />
                          </div>
                        ) : '---'}
                      </td>
                    </tr>
                  ))}
                  {(!data?.results?.food_inventory || data.results.food_inventory.length === 0) && (
                    <tr><td colSpan={5} className="center-text p-10">No inventory found / Scan pending</td></tr>
                  )}
                </tbody>
              </table>
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
