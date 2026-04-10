import { useState } from 'react'
import { ImageUploader } from './components/ImageUploader';
import { QCChecklist } from './components/QCChecklist';
import { JSONImporter } from './components/JSONImporter';
import { FoodInventoryDashboard } from './components/FoodInventoryDashboard';
import { getSystemPrompt } from './services/PromptGenerator';
import { SNAPScanReport } from './types';

import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('upload');
  const [report, setReport] = useState<SNAPScanReport | null>(null);
  const [phaseAComplete, setPhaseAComplete] = useState(false);

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo-group">
            <span className="logo-text">Field Assistant</span>
          </div>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Phase A
            </button>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Food Validator (Prompt)
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        <section className="hero-section">
          <h1 className="hero-title">SNAP-Scan</h1>
          <p>
            Field documentation tool for Level 2 Reviewers. Gather evidence and validate offline before Salesforce submission.
          </p>
        </section>

        {activeTab === 'upload' && (
          <div className="dashboard-grid">
            <ImageUploader onProcessComplete={() => {
              setPhaseAComplete(true);
              setActiveTab('dashboard'); // Auto-switch to prompt builder once Phase A completes
            }} />
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
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigator.clipboard.writeText(getSystemPrompt())}
                >
                  Copy Prompt
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
