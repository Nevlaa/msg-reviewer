import React from 'react';
import type { SNAPScanReport, FoodItem } from '../types';

interface DashboardProps {
  report: SNAPScanReport;
}

const CategoryTable: React.FC<{ title: string, items: FoodItem[], exceeds: boolean }> = ({ title, items, exceeds }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      {exceeds && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 'bold' }}>EXCEEDS LIMIT</span>}
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Count: {items.length} Varieties</span>
    </div>
    
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
        <thead style={{ background: 'var(--bg-secondary)' }}>
          <tr>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Variety Name</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Count (Max 20)</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Unit / LB</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>F/F/R Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: idx !== items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <td style={{ padding: '0.5rem' }}>{item.variety}</td>
              <td style={{ padding: '0.5rem' }}>{item.count}</td>
              <td style={{ padding: '0.5rem' }}>{item.unit_of_sale}</td>
              <td style={{ padding: '0.5rem' }}>
                <span style={{ 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '10px', 
                  background: item.is_ffr ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                  color: item.is_ffr ? 'var(--accent-green)' : 'var(--text-secondary)', 
                  fontSize: '0.65rem', 
                  fontWeight: 800,
                  border: item.is_ffr ? '1px solid var(--accent-green)' : '1px solid transparent'
                }}>
                  {item.is_ffr ? 'PERISHABLE' : 'STABLE'}
                </span>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No items detected.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const FoodInventoryDashboard: React.FC<DashboardProps> = ({ report }) => {
  return (
    <div className="card panel">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Senior Level 3 Audit Report</h2>
          <p>Validated via multi-pass AI scan. Integrity Level: <strong>{report.metadata.audit_integrity}</strong></p>
        </div>
        <div className="accuracy-badge">
          <span className="label">SENIOR L3 ACCURACY</span>
          <span className="value">{(report.metadata.confidence_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="audit-narrative-box">
        <h4>Senior Auditor Narrative:</h4>
        <p>{report.reviewer_comments}</p>
      </div>

      <CategoryTable 
        title="🧀 Dairy & Substitutes" 
        items={report.food_inventory.dairy_and_substitutes} 
        exceeds={report.metadata.exceeds_dairy_limit}
      />
      <CategoryTable 
        title="🥩 Meats, Poultry, Fish" 
        items={report.food_inventory.meats_poultry_fish} 
        exceeds={report.metadata.exceeds_meat_limit}
      />
      <CategoryTable 
        title="🍞 Breads, Grains, Cereals" 
        items={report.food_inventory.breads_grains_cereals} 
        exceeds={report.metadata.exceeds_bread_limit}
      />
      <CategoryTable 
        title="🍎 Fruits & Vegetables" 
        items={report.food_inventory.fruits_and_vegetables} 
        exceeds={report.metadata.exceeds_produce_limit}
      />

    </div>
  );
};
