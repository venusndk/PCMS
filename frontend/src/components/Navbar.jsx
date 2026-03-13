// components/Navbar.jsx
import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';

export default function Navbar({ onMenuClick, title }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display text-base font-bold text-slate-800">{title}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell className="w-4.5 h-4.5" style={{width:'18px',height:'18px'}} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
        </button>
        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-primary-700">AD</span>
        </div>
      </div>
    </header>
  );
}
