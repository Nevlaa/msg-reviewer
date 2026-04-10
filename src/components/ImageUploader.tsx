import React, { useState } from 'react';

export const ImageUploader: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

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

  return (
    <div className="card glass-panel">
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

      {files.length > 0 && (
        <div className="upload-stats animate-fade-in" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontWeight: 500, color: 'var(--accent-green)' }}>
            ✓ {files.length} images queued for validation
          </p>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} disabled={files.length === 0}>
        Process Batch Validation
      </button>
    </div>
  );
};
