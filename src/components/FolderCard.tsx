import React from 'react';
import {
  Play,
  Sparkles,
  Folder as FolderIcon,
  Clock,
  FileText,
  Plus,
  Trash2,
  Leaf,
  Compass,
  Cpu,
  Bookmark,
  Layers,
} from 'lucide-react';
import { Folder, UploadedFile } from '../types';

interface FolderCardProps {
  folder: Folder;
  files: UploadedFile[];
  isSelected: boolean;
  onSelect: () => void;
  onPlayFolder: () => void;
  onOpenAiQuiz: () => void;
  onUploadToFolder: () => void;
  onDeleteFolder: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  files,
  isSelected,
  onSelect,
  onPlayFolder,
  onOpenAiQuiz,
  onUploadToFolder,
  onDeleteFolder,
}) => {
  const totalDurationSecs = files.reduce((acc, f) => acc + (f.duration || 60), 0);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'Bookmark':
        return <Bookmark className="w-4 h-4 text-pink-400" />;
      default:
        return <FolderIcon className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between group relative ${
        isSelected
          ? 'bg-slate-900 border-indigo-500/80 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Row: Icon, Title, and Delete */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: `${folder.color}20`,
                borderColor: `${folder.color}40`,
                borderWidth: '1px',
              }}
            >
              {getFolderIcon(folder.icon)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                {folder.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatTime(totalDurationSecs)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder();
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Folder"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {folder.description || 'Collection of documents and study materials.'}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Play Folder */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayFolder();
            }}
            disabled={files.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Play all files in this folder in queue"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play Folder ({files.length})</span>
          </button>

          {/* Add file directly to this folder */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUploadToFolder();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Add file to this folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Study Quiz Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAiQuiz();
          }}
          disabled={files.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-40"
          title="Interactive AI Comprehension Quiz for this folder"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>AI Quiz</span>
        </button>
      </div>
    </div>
  );
};
