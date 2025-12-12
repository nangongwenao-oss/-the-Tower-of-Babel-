import React from 'react';
import { Home, Activity, ShieldAlert, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export type View = 'dashboard' | 'analysis' | 'safety' | 'progress';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'analysis', icon: Activity, label: 'PCI Analysis' },
    { id: 'safety', icon: ShieldAlert, label: 'Guardian' },
    { id: 'progress', icon: BarChart2, label: 'Growth' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-6 md:pb-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className={clsx(
                "flex flex-col items-center gap-1 transition-colors duration-200",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={clsx(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-blue-50" : "bg-transparent"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};