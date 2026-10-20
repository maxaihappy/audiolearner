import React, { useState } from 'react';
import {
  Play,
  Plus,
  FolderPlus,
  Sliders,
  Mic,
  Volume2,
  Search,
  X,
  FileUp,
  Cloud,
  CloudCheck,
  RefreshCw,
} from 'lucide-react';
import { PlaybackSettings } from '../types';

interface AppHeaderProps {
  totalFilesCount: number;
  onPlayAll: () => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onOpenVoiceSettings: () => void;
  playbackSettings: PlaybackSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  onRefreshSync?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  totalFilesCount,
  onPlayAll,
  onOpenUpload,
  onOpenNewFolder,
  onOpenVoiceSettings,
  playbackSettings,
  searchQuery,
  onSearchChange,
  syncStatus = 'synced',
  onRefreshSync,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold shrink-0">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
                  AudioLearner
                </h1>
                {/* Cloud Sync Status Indicator */}
                <button
                  type="button"
                  onClick={onRefreshSync}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer"
                  title="PC & Mobile Cloud Sync Status (Click to refresh)"
                >
                  <RefreshCw
                    className={`w-2.5 h-2.5 text-emerald-400 ${
                      syncStatus === 'syncing' ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="hidden xs:inline">
                    {syncStatus === 'syncing' ? 'Syncing...' : 'PC & Mobile Synced'}
                  </span>
                </button>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 truncate">
                Listen to your files & test your recall
              </p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative flex-1 max-w-xs mx-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files or topics..."
              aria-label="Search files or topics"
              className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Responsive for Mobile & Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              className="md:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 active:scale-95"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Voice & Speed Badge */}
            <button
              onClick={onOpenVoiceSettings}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer active:scale-95"
              title="Change voice and playback speed"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden xs:inline text-[11px] font-medium text-slate-200 truncate max-w-[65px] sm:max-w-[90px]">
                {playbackSettings.voiceName.split(' ')[0]}
              </span>
              <span className="font-bold text-amber-400 text-[11px] bg-amber-400/10 px-1 py-0.2 rounded">
                {playbackSettings.speed}x
              </span>
            </button>

            {/* Play All Files (Desktop & Tablet) */}
            <button
              onClick={onPlayAll}
              disabled={totalFilesCount === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>

            {/* Add / Create Button with Dropdown Sheet for Mobile & Desktop */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>

              {/* Add Dropdown Menu */}
              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 animate-fade-in text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenUpload();
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors text-left font-medium cursor-pointer"
                    >
                      <FileUp className="w-4 h-4 text-emerald-400" />
                      <span>Upload File / Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenNewFolder();
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors text-left font-medium cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-indigo-400" />
                      <span>Create New Folder</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Mobile Search Bar */}
        {showMobileSearch && (
          <div className="mt-2 pt-2 border-t border-slate-800 md:hidden flex items-center gap-2 animate-fade-in">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search files or topics..."
                aria-label="Search files or topics"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setShowMobileSearch(false);
              }}
              className="text-xs text-slate-400 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
