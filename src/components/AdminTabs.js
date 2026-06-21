export default function AdminTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="admin-tabs" role="tablist" aria-label="Admin sections">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`admin-tab-btn${activeTab === t.key ? ' admin-tab-btn-active' : ''}`}
          onClick={() => onChange(t.key)}
          role="tab"
          aria-selected={activeTab === t.key}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

