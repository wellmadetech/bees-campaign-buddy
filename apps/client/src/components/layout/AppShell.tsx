import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Menu, X } from 'lucide-react';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile, shown on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with mobile menu button */}
        <header className="h-14 bg-white border-b border-surface-200/80 flex items-center px-4 lg:px-6 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <TopBar />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
