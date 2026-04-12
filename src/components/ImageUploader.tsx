import React, { useState } from 'react';
import { processBatchWithGemini, type ValidationMode } from '../services/GeminiOrchestrator';
import type { SNAPScanReport } from '../types';

interface ImageUploaderProps {
  onProcessComplete: (report: SNAPScanReport) => void;
  mode: ValidationMode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onProcessComplete, mode }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(10); // Start progress bar
    
    try {
      // 1. Run mock local checks first (simulated Phase A)
      const interval = setInterval(() => {
        setProgress((prev: number) => prev < 40 ? prev + 10 : prev);
      }, 300);

      // 2. Execute real API call for Phase B
      const result = await processBatchWithGemini(files, mode);
      
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        onProcessComplete(result);
      }, 500);
      
    } catch (e: any) {
      setError(e.message || "An error occurred during processing.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="card panel">
      <div className="card-header">
        <h2>Batch Image Review</h2>
        <p>Upload up to 70 JPEGs simultaneously.</p>
      </div>

      <div 
        className={`upload-area ${isHovering ? 'hovering' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
        style={{ borderColor: isHovering ? 'var(--accent-blue)' : '' }}
      >
        <div className="upload-icon">📸</div>
        <h3>Select or Drop Photos</h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>JPEG, PNG (Max 5MB per file)</p>
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept="image/jpeg, image/png" 
          style={{ display: 'none' }} 
          onChange={handleFileInput}
        />
      </div>

      {files.length > 0 && !isProcessing && (
        <div className="upload-stats animate-fade-in" style={{ padding: '1rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontWeight: 500, color: 'var(--accent-green)' }}>
            ✓ {files.length} images ready for {mode === 'reviewer' ? 'Reviewer' : 'QC'} Analysis
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: 'var(--accent-rose)', color: 'white', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {isProcessing && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>
            {progress < 40 ? 'Phase A: Local Compliance Checks...' : `Phase B: ${mode.toUpperCase()} AI Analysis...`}
          </p>
          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      <button 
        className="btn btn-primary" 
        style={{ width: '100%' }} 
        disabled={files.length === 0 || isProcessing}
        onClick={handleProcess}
      >
        {isProcessing ? 'Analyzing Batch...' : `Run ${mode === 'reviewer' ? 'Reviewer' : 'QC'} Verification`}
      </button>
    </div>
  );
};
