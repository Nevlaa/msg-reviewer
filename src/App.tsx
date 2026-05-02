import React, { useState } from 'react';
import { SalesforceConnector } from './components/SalesforceConnector';
import { StoreReviewerWorkstation } from './components/StoreReviewerWorkstation';
import './App.css';

function App() {
  const [activeMode, setActiveMode] = useState<'QC_AUDITOR' | 'STORE_REVIEWER'>('QC_AUDITOR');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">📊</div>
          <div>
            <h1>SNAP QC Validator</h1>
            <p>Senior Level 3 AI Audit Suite</p>
          </div>
        </div>
        
        <nav className="mode-tabs">
          <button 
            className={`tab-btn ${activeMode === 'QC_AUDITOR' ? 'active' : ''}`}
            onClick={() => setActiveMode('QC_AUDITOR')}
          >
            🔍 QC Auditor (Review Mode)
          </button>
          <button 
            className={`tab-btn ${activeMode === 'STORE_REVIEWER' ? 'active' : ''}`}
            onClick={() => setActiveMode('STORE_REVIEWER')}
          >
            🎨 Store Reviewer (Field Tool)
          </button>
        </nav>

        <div className="user-profile">
          <div className="status-indicator"></div>
          <span>Connected to Salesforce Org</span>
        </div>
      </header>

      <main className="main-content">
        {activeMode === 'QC_AUDITOR' ? (
          <SalesforceConnector />
        ) : (
          <StoreReviewerWorkstation />
        )}
      </main>
    </div>
  );
}

export default App;
