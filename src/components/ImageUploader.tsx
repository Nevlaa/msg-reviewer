import React, { useState } from 'react';

interface ImageUploaderProps {
  onProcessComplete: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onProcessComplete }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleProcess = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate local QC formatting & checks
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        onProcessComplete();
      }
    }, 200);
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
            ✓ {files.length} images queued for validation
          </p>
        </div>
      )}

      {isProcessing && (
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Scanning Phase A Critical Targets...</p>
          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.2s ease' }} />
          </div>
        </div>
      )}

      <button 
        className="btn btn-primary" 
        style={{ width: '100%' }} 
        disabled={files.length === 0 || isProcessing}
        onClick={handleProcess}
      >
        {isProcessing ? 'Processing Batch...' : 'Process Batch Validation'}
      </button>
    </div>
  );
};
