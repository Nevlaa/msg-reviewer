import React, { useState } from 'react';
import { SNAPScanReport } from '../types';

interface JSONImporterProps {
  onImportComplete: (report: SNAPScanReport) => void;
}

export const JSONImporter: React.FC<JSONImporterProps> = ({ onImportComplete }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.food_inventory || !parsed.metadata) {
        throw new Error("Invalid format. Missing 'food_inventory' or 'metadata'.");
      }
      setError(null);
      onImportComplete(parsed as SNAPScanReport);
    } catch (e: any) {
      setError(e.message || "Failed to parse JSON");
    }
  };

  return (
    <div className="card panel">
      <div className="card-header">
        <h2>JSON Importer</h2>
        <p>Paste the response from Gemini below to ingest Food Inventory and Metadata metrics.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--accent-rose)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <textarea 
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}
        placeholder='{ "food_inventory": { ... }, "metadata": { ... } }'
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleImport} style={{ marginTop: '1rem', width: '100%' }}>
        Parse Phase B Report
      </button>
    </div>
  );
};
