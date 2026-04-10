import { useState } from 'react'
import { ImageUploader } from './components/ImageUploader';
import { QCChecklist } from './components/QCChecklist';

import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('upload');

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo-group">
            <span className="logo-text">SNAP-Scan</span>
          </div>
          <nav>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ background: activeTab === 'dashboard' ? '' : 'transparent', color: activeTab === 'dashboard' ? '' : 'var(--text-secondary)' }}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container animate-fade-in">
        <section className="hero-section">
          <h1 className="hero-title">QC Gatekeeper Validation</h1>
          <p>
            Upload your Level 2 Review photos for instant, offline-first Phase A & B compliance checks before submitting to Salesforce.
          </p>
        </section>

        <div className="dashboard-grid">
          <ImageUploader />
          <QCChecklist />
        </div>
      </main>
    </div>
  )
}

export default App
