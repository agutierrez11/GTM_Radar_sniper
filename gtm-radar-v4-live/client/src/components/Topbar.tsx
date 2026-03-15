import { Bell, Search } from 'lucide-react';

/**
 * Topbar Component
 * Design: Clean, minimal SaaS header
 * - White background with subtle border
 * - Logo + status badge on left
 * - Search + notifications + avatar on right
 * - Professional spacing and typography
 */
export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left Section - Logo & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">GTM Radar</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-green-700">Live</span>
          </span>
        </div>
      </div>

      {/* Right Section - Search, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-border rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            className="bg-transparent text-sm placeholder-muted-foreground outline-none w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">A. Gutierrez</p>
            <p className="text-xs text-muted-foreground">Executive</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">AG</span>
          </div>
        </div>
      </div>
    </header>
  );
}
