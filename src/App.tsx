import { useState } from 'react'
import { ImageUploader } from './components/ImageUploader';
import { QCChecklist } from './components/QCChecklist';
import { JSONImporter } from './components/JSONImporter';
import { FoodInventoryDashboard } from './components/FoodInventoryDashboard';
import { getSystemPrompt } from './services/PromptGenerator';
import type { ValidationMode } from './services/GeminiOrchestrator';
import type { SNAPScanReport } from './types';

import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('upload');
  const [report, setReport] = useState<SNAPScanReport | null>(null);
  const [validationMode, setValidationMode] = useState<ValidationMode>('reviewer');
  const [copied, setCopied] = useState(false);

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo-group">
            <span className="logo-text">Field Assistant</span>
          </div>
          <nav style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button 
                className="btn" 
                style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem', background: validationMode === 'reviewer' ? 'var(--bg-primary)' : 'transparent', border: 'none', boxShadow: validationMode === 'reviewer' ? 'var(--shadow-sm)' : 'none', color: validationMode === 'reviewer' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setValidationMode('reviewer')}
              >
                Reviewer
              </button>
              <button 
                className="btn" 
                style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem', background: validationMode === 'qc' ? 'var(--bg-primary)' : 'transparent', border: 'none', boxShadow: validationMode === 'qc' ? 'var(--shadow-sm)' : 'none', color: validationMode === 'qc' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setValidationMode('qc')}
              >
                QC Audit
              </button>
            </div>
            <div style={{ width: '1px', height: '1.5rem', background: 'var(--border-color)' }} />
            <button 
              className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
            >
              Scanner
            </button>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Inventory
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        <section className="hero-section">
          <h1 className="hero-title">SNAP-Scan</h1>
          <p>
            Field documentation tool for Reviewers. Gather evidence and validate offline before Salesforce submission.
          </p>
        </section>

        {activeTab === 'upload' && (
          <div className="dashboard-grid">
            <ImageUploader 
              mode={validationMode}
              onProcessComplete={(result) => {
                setReport(result);
                setActiveTab('dashboard'); 
              }} 
            />
            <QCChecklist hasParsedReport={!!report} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card panel">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2>Phase B: Staple Food Validation Assistant</h2>
                  <p>Generate the Structured Prompt Packet for Gemini to process Food Inventory logic.</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--accent-amber)', fontWeight: 600, marginTop: '0.5rem' }}>
                    ⚠️ Tip: Don't forget to attach your 42 photos to the Gemini chat along with this prompt!
                  </p>
                </div>
                <button 
                  className={`btn ${copied ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => {
                    navigator.clipboard.writeText(getSystemPrompt());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Prompt'}
                </button>
              </div>
              <div className="prompt-box">
                {getSystemPrompt()}
              </div>
            </div>

            {!report ? (
              <JSONImporter onImportComplete={setReport} />
            ) : (
              <FoodInventoryDashboard report={report} />
            )}
            
            {report && (
               <button className="btn btn-secondary" onClick={() => setReport(null)}>Import New Data</button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
