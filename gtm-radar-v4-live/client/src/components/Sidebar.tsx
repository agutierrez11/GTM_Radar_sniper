import { BarChart3, Target, TrendingUp, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

/**
 * Sidebar Navigation Component
 * Design: Clean, minimal SaaS navigation with simple SVG icons
 * - Light background (#ffffff)
 * - Subtle borders (#e5e7eb)
 * - Blue accent (#378ADD) for active states
 * - Icons from lucide-react (simple, professional)
 */
export default function Sidebar() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'targets', label: 'Targets', icon: Target },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">GTM</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">GTM Radar</h1>
            <p className="text-xs text-muted-foreground">Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600'
                  : 'text-foreground hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
