import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tabs-wrap">
      <div className="nav-tabs-custom">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
