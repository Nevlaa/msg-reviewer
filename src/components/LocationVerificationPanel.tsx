import React from 'react';
import type { ValidationLog } from '../salesforceTypes';

interface LocationVerificationPanelProps {
  data: ValidationLog;
}

export const LocationVerificationPanel: React.FC<LocationVerificationPanelProps> = ({ data }) => {
  const { location_verification } = data.results;

  return (
    <div className="location-verification card animate-fade-in" style={{ marginTop: '1.5rem', borderLeft: '4px solid #4285F4' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>📍 Geospatial Verification</h3>
          <p className="tiny-text">Verify storefront architectural consistency between Google Street View and Agent Photos.</p>
        </div>
        <a 
          href={location_verification.google_maps_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-secondary small"
          style={{ textDecoration: 'none', fontSize: '0.75rem' }}
        >
          Open in Maps ↗
        </a>
      </div>

      <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="verification-box">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '4px', color: '#4285F4' }}>GOOGLE STREET VIEW (REFERENCE)</div>
          <div className="image-container" style={{ height: '250px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            {location_verification.street_view_image ? (
              <img 
                src={location_verification.street_view_image} 
                alt="Google Street View" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                No coordinates found in Maps link to generate Street View.
              </div>
            )}
          </div>
        </div>

        <div className="verification-box">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '4px', color: 'var(--btn-primary)' }}>AGENT EXTERIOR PHOTO (EVIDENCE)</div>
          <div className="image-container" style={{ height: '250px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
            {location_verification.exterior_photo ? (
              <img 
                src={location_verification.exterior_photo} 
                alt="Agent Exterior Evidence" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '0.8rem' }}>
                No photo tagged as 'Exterior' found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="verification-footer" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(66, 133, 244, 0.05)', borderRadius: '4px', fontSize: '0.85rem' }}>
        <strong>Auditor Tip:</strong> Check for matching signage, building entry points, and neighboring shop colors. If the building looks fundamentally different, flag as "Photos/Info Needed" in the scoring panel.
      </div>
    </div>
  );
};
