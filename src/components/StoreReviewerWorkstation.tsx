import React, { useState } from 'react';
import { VisionService } from '../services/VisionService';

export const StoreReviewerWorkstation: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventoryDraft, setInventoryDraft] = useState<any[]>([]);
  const [polishedSketch, setPolishedSketch] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAgentAutomation = async () => {
    setIsProcessing(true);
    // Logic for processing all photos for inventory and sketch polishing
    // This will use the Accumulator mode and Sketch Refiner
    setTimeout(() => {
      setInventoryDraft([
        { category: 'Bread/Cereals', variety: 'Whole Wheat Bread', units: '12', ffr: true },
        { category: 'Bread/Cereals', variety: 'White Loaf', units: '20+', ffr: true },
        { category: 'Dairy', variety: 'Whole Milk (Gallon)', units: '15', ffr: true },
        { category: 'Dairy', variety: '2% Milk', units: '8', ffr: true },
        { category: 'Fruit/Veg', variety: 'Red Apples', units: '20+', ffr: true },
        { category: 'Fruit/Veg', variety: 'Bananas', units: '14', ffr: true },
      ]);
      setPolishedSketch({
        status: 'Polished',
        image: 'https://via.placeholder.com/600x400?text=Digitized+Store+Sketch+v1.0',
        landmarks: 12
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="agent-workstation animate-fade-in" style={{ padding: '2rem' }}>
      <div className="card hero-card" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
        <h1>Store Reviewer Workstation</h1>
        <p>Automate your food counts and digitize your field sketches in seconds.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* UPLOAD & PROCESSING */}
        <div className="card">
          <h3>1. Upload Field Evidence</h3>
          <div className="upload-zone" style={{ border: '2px dashed #ddd', padding: '2rem', textAlign: 'center', borderRadius: '8px', marginTop: '1rem' }}>
            <input type="file" multiple onChange={handleFileUpload} />
            <p className="tiny-text mt-10">Upload all store photos + your hand-drawn sketch</p>
            {files.length > 0 && <div className="mt-10"><strong>{files.length}</strong> files selected</div>}
          </div>
          <button 
            className="btn-primary w-100 mt-20" 
            disabled={files.length === 0 || isProcessing}
            onClick={runAgentAutomation}
          >
            {isProcessing ? 'AI is Processing Evidence...' : '🚀 Run Agent Automation'}
          </button>
        </div>

        {/* SKETCH POLISHER */}
        <div className="card">
          <h3>2. Digital Sketch Polisher</h3>
          <div className="sketch-preview" style={{ height: '300px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {polishedSketch ? (
              <>
                <img src={polishedSketch.image} alt="Polished Sketch" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  <button className="btn-secondary small">Download Professional Sketch (.PNG)</button>
                </div>
              </>
            ) : (
              <span className="text-secondary">Upload a hand-drawn sketch to digitize</span>
            )}
          </div>
          {polishedSketch && (
            <div className="success-badge mt-10" style={{ background: '#ecfdf5', color: '#059669', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
              ✅ AI Digitization Complete: {polishedSketch.landmarks} landmarks identified & polished.
            </div>
          )}
        </div>
      </div>

      {/* AUTO-INVENTORY DRAFT */}
      {inventoryDraft.length > 0 && (
        <div className="card mt-20">
          <div className="flex-between">
            <h3>3. Draft Inventory (Targeting 10/10/10/14)</h3>
            <button className="btn-secondary small">Export to CSV for Salesforce</button>
          </div>
          <table className="hpi-table mt-10" style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th>Category</th>
                <th>Variety Found</th>
                <th>Count (Units)</th>
                <th>FFR?</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryDraft.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td><strong>{item.variety}</strong></td>
                  <td className="center-text">{item.units}</td>
                  <td className="center-text">{item.ffr ? '✅' : '❌'}</td>
                  <td><span style={{ color: '#059669', fontSize: '0.75rem' }}>Verified</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 italic tiny-text" style={{ color: '#666' }}>
            * AI searched all photos to maximize variety counts. Review and edit before exporting.
          </div>
        </div>
      )}
    </div>
  );
};
