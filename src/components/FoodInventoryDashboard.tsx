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
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Variety</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Stock</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Unit</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>FFR?</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: idx !== items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <td style={{ padding: '0.5rem' }}>{item.variety}</td>
              <td style={{ padding: '0.5rem' }}>{item.count}</td>
              <td style={{ padding: '0.5rem' }}>{item.unit_of_sale}</td>
              <td style={{ padding: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: item.is_ffr ? 'rgba(5, 150, 105, 0.1)' : 'var(--bg-secondary)', color: item.is_ffr ? 'var(--accent-green)' : 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
                  {item.is_ffr ? 'Yes' : 'No'}
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
      <div className="card-header">
        <h2>Parsed Phase B Document</h2>
        <p>Staple Food Inventory mapped directly from standard LLM response output.</p>
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
