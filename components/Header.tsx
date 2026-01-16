
import React from 'react';
import { GeneratorIcon, ExportIcon, SparklesIcon } from './Icons';
import { ViewMode } from '../types';

interface HeaderProps
{
  viewMode: ViewMode;
  onNavigateHome: () => void;
  onExport?: () => void;
  onRefine?: () => void;
  canExport: boolean;
  canRefine: boolean;
}

export const Header: React.FC<HeaderProps> = ( { viewMode, onNavigateHome, onExport, onRefine, canExport, canRefine } ) =>
{
  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50 relative">
      <div className="flex items-center space-x-4 cursor-pointer group" onClick={ onNavigateHome }>
        <div className="accent-gradient p-2 rounded-xl text-white transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <GeneratorIcon />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-400 transition-colors">
            Agentic Studio <span className="text-sky-500">Pro</span>
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold opacity-70">
              Studio Edition
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] text-emerald-500 font-bold">LIVE SYNC</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        { viewMode === 'ide' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={ onRefine }
              disabled={ !canRefine }
              className="flex items-center space-x-2 px-4 py-1.5 bg-brand-primary hover:bg-sky-400 text-white rounded-full text-xs font-semibold transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <SparklesIcon />
              <span>Refine</span>
            </button>

            <button
              onClick={ onExport }
              disabled={ !canExport }
              className="flex items-center space-x-2 px-4 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-full text-xs font-semibold transition-all border border-brand-primary/20 hover:border-brand-primary/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent"
            >
              <ExportIcon />
              <span>Export</span>
            </button>
          </div>
        ) }
        <div className="h-6 w-px bg-slate-700 mx-2"></div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-600 border border-white/20 shadow-inner ring-2 ring-slate-800"></div>
      </div>
    </header>
  );
};
