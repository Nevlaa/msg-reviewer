import React from 'react';

export const QCChecklist: React.FC = () => {
  return (
    <div className="card panel">
      <div className="card-header">
        <h2>15-Point Critical Status</h2>
        <p>Phase A validation overview.</p>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
        <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span>⛽ Exterior (Gas Pumps)</span>
          <span style={{ color: 'var(--text-secondary)' }}>Pending Checks</span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span>📐 Overviews (Corners)</span>
          <span style={{ color: 'var(--text-secondary)' }}>Pending Checks</span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span>💳 POS & EBT Screens</span>
          <span style={{ color: 'var(--text-secondary)' }}>Pending Checks</span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span>🍎 Staple Food Base</span>
          <span style={{ color: 'var(--text-secondary)' }}>Pending Checks</span>
        </li>
      </ul>
    </div>
  );
};
