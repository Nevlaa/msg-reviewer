import React from 'react';

interface QCChecklistProps {
  hasParsedReport?: boolean;
}

export const QCChecklist: React.FC<QCChecklistProps> = ({ hasParsedReport }) => {
  const checks = [
    { label: "⛽ Exterior (Gas Price)", status: "Pending" },
    { label: "📐 Overviews (Corner 1 & 2)", status: "Pending" },
    { label: "💳 POS/EBT Readability", status: "Pending" },
    { label: "🍎 Staple Food (3x3 Rule)", status: hasParsedReport ? "Verified" : "Pending" },
    { label: "📝 Survey Consistency", status: "Pending" }
  ];

  return (
    <div className="card panel">
      <div className="card-header">
        <h2>Reviewer Pre-Audit</h2>
        <p>Ensure your report passes QC before submission.</p>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, marginTop: '1rem' }}>
        {checks.map((check, idx) => (
          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem' }}>{check.label}</span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: check.status === 'Verified' ? 'var(--accent-green)' : 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}>
              {check.status}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(var(--accent-amber-rgb), 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-amber)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
          💡 Pro Tip: Open a cooler door for dairy/meat photos to automatically trigger "FFR" verification.
        </p>
      </div>
    </div>
  );
};
