import React, { useState, useEffect, useRef } from 'react';
import {
  FolderPlus,
  Play,
  Layers,
  Sparkles,
  FileText,
  Volume2,
  Plus,
  ListMusic,
  ArrowLeft,
  ChevronRight,
  Folder as FolderIcon,
} from 'lucide-react';
import {
  Folder,
  UploadedFile,
  QueueItem,
  PlaybackSettings,
  VoiceOption,
} from './types';
import { INITIAL_FOLDERS, INITIAL_FILES } from './data/initialData';
import { audioEngine } from './services/audioEngine';
import { AppHeader } from './components/AppHeader';
import { FolderCard } from './components/FolderCard';
import { FileRow } from './components/FileRow';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { QueueDrawer } from './components/QueueDrawer';
import { VoiceSpeedModal } from './components/VoiceSpeedModal';
import { FileUploadModal } from './components/FileUploadModal';
import { NewFolderModal } from './components/NewFolderModal';
import { FolderAiQuizModal } from './components/FolderAiQuizModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';

const SETTINGS_STORAGE_KEY = 'audiolearner_settings_v1';
const FOLDERS_STORAGE_KEY = 'audiolearner_folders_v1';
const FILES_STORAGE_KEY = 'audiolearner_files_v1';

export default function App() {
  // Persistence initialization
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  const [files, setFiles] = useState<UploadedFile[]>(() => {
    try {
      const saved = localStorage.getItem(FILES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      speed: 1.0,
      voiceId: 'gemini-Kore',
      voiceEngine: 'gemini',
      voiceName: 'Kore (Studio Neural)',
      loopMode: 'off',
      autoPlayNext: true,
      volume: 1.0,
    };
  });

  // Cloud Sync status
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const lastSyncTimestampRef = useRef<number>(0);

  // Mobile navigation tab: 'folders' | 'files' | 'queue'
  const [mobileTab, setMobileTab] = useState<'folders' | 'files' | 'queue'>('folders');

  // Active folder view: null means overview of all folders, or a folderId
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queue & Player State
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(100);
  const [progress, setProgress] = useState<number>(0);
  const [currentSpokenSentence, setCurrentSpokenSentence] = useState<string>('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFolderTargetId, setUploadFolderTargetId] = useState<string | undefined>();
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [aiQuizFolder, setAiQuizFolder] = useState<Folder | null>(null);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

  // Available voices
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>(() =>
    audioEngine.getAvailableVoices()
  );

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const currentIndexRef = useRef(currentQueueIndex);
  currentIndexRef.current = currentQueueIndex;
  const settingsRef = useRef(playbackSettings);
  settingsRef.current = playbackSettings;

  // Persist folders and files locally for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch (e) {
      console.error(e);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.error(e);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(playbackSettings));
    } catch (e) {
      console.error(e);
    }
    audioEngine.setVoice(playbackSettings.voiceId);
    audioEngine.setSpeed(playbackSettings.speed);
  }, [playbackSettings]);

  // ==========================================
  // SERVER SYNC (Ensures PC & Mobile Stay in Sync)
  // ==========================================
  const fetchServerData = async (isBackground: boolean = false) => {
    if (!isBackground) setSyncStatus('syncing');
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.folders && Array.isArray(data.folders)) {
          setFolders(data.folders);
        }
        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
        }
        if (data.playbackSettings && data.playbackSettings.voiceId) {
          setPlaybackSettings(data.playbackSettings);
        }
        if (data.lastUpdated) {
          lastSyncTimestampRef.current = data.lastUpdated;
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch (err) {
      console.warn('Sync failed, using offline cache', err);
      setSyncStatus('offline');
    }
  };

  // Initial fetch and periodic polling for real-time PC <-> Mobile sync
  useEffect(() => {
    fetchServerData(false);

    // Poll every 6 seconds to capture changes uploaded from PC while viewing on mobile
    const pollInterval = setInterval(() => {
      fetchServerData(true);
    }, 6000);

    // Refresh immediately when tab gains focus (e.g. mobile user opens phone)
    const handleFocus = () => {
      fetchServerData(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // AudioEngine callback hooks
  useEffect(() => {
    const unregisterVoices = audioEngine.registerVoicesListener(() => {
      setAvailableVoices(audioEngine.getAvailableVoices());
    });

    audioEngine.setCallbacks({
      onTimeUpdate: (cur, dur, prog) => {
        setCurrentTime(cur);
        setDuration(dur);
        setProgress(prog);
      },
      onStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onSentenceChange: (chunk) => {
        setCurrentSpokenSentence(chunk);
      },
      onEnded: () => {
        handleTrackEnded();
      },
    });

    return () => {
      unregisterVoices();
      audioEngine.stop();
    };
  }, []);

  const handleTrackEnded = () => {
    const currentQ = queueRef.current;
    const curIdx = currentIndexRef.current;
    const settings = settingsRef.current;

    if (settings.loopMode === 'one' && curIdx >= 0 && curIdx < currentQ.length) {
      playTrackAtIndex(curIdx);
      return;
    }

    if (curIdx + 1 < currentQ.length) {
      playTrackAtIndex(curIdx + 1);
    } else if (settings.loopMode === 'all' && currentQ.length > 0) {
      playTrackAtIndex(0);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    }
  };

  const playTrackAtIndex = (index: number) => {
    const item = queueRef.current[index];
    if (!item) return;

    setCurrentQueueIndex(index);
    setCurrentTime(0);
    setProgress(0);
    setCurrentSpokenSentence('');

    if (item.audioUrl && item.type === 'audio') {
      audioEngine.playAudioUrl(item.audioUrl, 0);
    } else {
      audioEngine.playText(item.content, item.duration);
    }
  };

  const fileToQueueItem = (file: UploadedFile): QueueItem => {
    const folder = folders.find((f) => f.id === file.folderId);
    return {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fileId: file.id,
      fileName: file.name,
      folderId: file.folderId,
      folderName: folder?.name || 'Uncategorized',
      type: file.type,
      content: file.content,
      audioUrl: file.audioUrl,
      duration: file.duration,
    };
  };

  // 1. Play All Files
  const handlePlayAllFiles = () => {
    if (files.length === 0) return;
    const newQueue: QueueItem[] = files.map(fileToQueueItem);
    setQueue(newQueue);
    setCurrentQueueIndex(0);
    queueRef.current = newQueue;
    currentIndexRef.current = 0;
    playTrackAtIndex(0);
  };

  // 2. Play All Files in Folder
  const handlePlayFolder = (folderId: string) => {
    const folderFiles = files.filter((f) => f.folderId === folderId);
    if (folderFiles.length === 0) return;

    const newQueue: QueueItem[] = folderFiles.map(fileToQueueItem);
    setQueue(newQueue);
    setCurrentQueueIndex(0);
    queueRef.current = newQueue;
    currentIndexRef.current = 0;
    playTrackAtIndex(0);
  };

  // 3. Play individual file
  const handlePlayFile = (file: UploadedFile) => {
    const item = fileToQueueItem(file);
    const newQueue = [item, ...queue.filter((q) => q.fileId !== file.id)];
    setQueue(newQueue);
    setCurrentQueueIndex(0);
    queueRef.current = newQueue;
    currentIndexRef.current = 0;
    playTrackAtIndex(0);
  };

  const handleAddToQueue = (file: UploadedFile) => {
    const item = fileToQueueItem(file);
    setQueue((prev) => [...prev, item]);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      if (currentQueueIndex >= 0 && currentQueueIndex < queue.length) {
        audioEngine.resume();
      } else if (queue.length > 0) {
        playTrackAtIndex(0);
      } else if (files.length > 0) {
        handlePlayAllFiles();
      }
    }
  };

  const handlePreviousTrack = () => {
    if (currentQueueIndex > 0) {
      playTrackAtIndex(currentQueueIndex - 1);
    } else {
      audioEngine.seek(0);
    }
  };

  const handleNextTrack = () => {
    if (currentQueueIndex + 1 < queue.length) {
      playTrackAtIndex(currentQueueIndex + 1);
    }
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const handleSkipSeconds = (delta: number) => {
    audioEngine.skipSeconds(delta);
  };

  const handleRemoveFromQueue = (queueItemId: string) => {
    const removedIdx = queue.findIndex((q) => q.id === queueItemId);
    const updated = queue.filter((q) => q.id !== queueItemId);
    setQueue(updated);

    if (removedIdx === currentQueueIndex) {
      if (updated.length > 0) {
        const nextIdx = Math.min(removedIdx, updated.length - 1);
        playTrackAtIndex(nextIdx);
      } else {
        audioEngine.stop();
        setCurrentQueueIndex(-1);
      }
    } else if (removedIdx < currentQueueIndex) {
      setCurrentQueueIndex((prev) => prev - 1);
    }
  };

  const handleMoveQueueTrack = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    const reordered = [...queue];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setQueue(reordered);

    if (currentQueueIndex === fromIdx) {
      setCurrentQueueIndex(toIdx);
    } else if (fromIdx < currentQueueIndex && toIdx >= currentQueueIndex) {
      setCurrentQueueIndex((prev) => prev - 1);
    } else if (fromIdx > currentQueueIndex && toIdx <= currentQueueIndex) {
      setCurrentQueueIndex((prev) => prev + 1);
    }
  };

  const handleClearQueue = () => {
    audioEngine.stop();
    setQueue([]);
    setCurrentQueueIndex(-1);
    setIsPlaying(false);
  };

  const handleShuffleQueue = () => {
    if (queue.length <= 1) return;
    const currentTrack = currentQueueIndex >= 0 ? queue[currentQueueIndex] : null;
    const rest = queue.filter((_, idx) => idx !== currentQueueIndex);

    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }

    const shuffled = currentTrack ? [currentTrack, ...rest] : rest;
    setQueue(shuffled);
    setCurrentQueueIndex(currentTrack ? 0 : -1);
  };

  // Create folder: optimistic local update + server persistence
  const handleCreateFolder = async (newF: Omit<Folder, 'id' | 'createdAt'>) => {
    const folder: Folder = {
      ...newF,
      id: `folder-${Date.now()}`,
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, folder]);
    setActiveFolderId(folder.id);

    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
    } catch (e) {
      console.error('Failed to sync folder creation to server:', e);
    }
  };

  // Delete folder: optimistic local update + server persistence
  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Delete this folder and its files?')) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setFiles((prev) => prev.filter((f) => f.folderId !== folderId));
      if (activeFolderId === folderId) {
        setActiveFolderId(null);
      }

      try {
        await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync folder deletion to server:', e);
      }
    }
  };

  // Add files: optimistic local update + server persistence
  const handleAddFiles = async (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);

    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newFiles }),
      });
      if (res.ok) {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.error('Failed to upload files to server:', e);
      setSyncStatus('offline');
    }
  };

  // Delete file: optimistic local update + server persistence
  const handleDeleteFile = async (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setQueue((prev) => prev.filter((q) => q.fileId !== fileId));

    try {
      await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete file from server:', e);
    }
  };

  // Move file: optimistic local update + server persistence
  const handleMoveFileToFolder = async (fileId: string, targetFolderId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, folderId: targetFolderId } : f))
    );

    try {
      await fetch(`/api/files/${fileId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFolderId }),
      });
    } catch (e) {
      console.error('Failed to update file folder on server:', e);
    }
  };

  // Update settings and sync to server
  const handleUpdateSettings = async (newSt: Partial<PlaybackSettings>) => {
    const updated = { ...playbackSettings, ...newSt };
    setPlaybackSettings(updated);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updated }),
      });
    } catch (e) {
      console.error('Failed to sync settings to server:', e);
    }
  };

  // Active folder object if focused
  const currentActiveFolder = folders.find((f) => f.id === activeFolderId);

  // Filtered files based on active folder & search
  const visibleFiles = files.filter((f) => {
    const matchesFolder = activeFolderId ? f.folderId === activeFolderId : true;
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const activeTrack = currentQueueIndex >= 0 ? queue[currentQueueIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 md:pb-24">
      {/* Clean Mobile & Desktop Header with Cloud Sync */}
      <AppHeader
        totalFilesCount={files.length}
        onPlayAll={handlePlayAllFiles}
        onOpenUpload={() => {
          setUploadFolderTargetId(activeFolderId || undefined);
          setIsUploadOpen(true);
        }}
        onOpenNewFolder={() => setIsNewFolderOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        playbackSettings={playbackSettings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        syncStatus={syncStatus}
        onRefreshSync={() => fetchServerData(false)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Mobile Navigation Tabs (Folders, All Files, Queue) */}
        <div className="md:hidden flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMobileTab('folders');
              setActiveFolderId(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'folders' && !activeFolderId
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Folders ({folders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('files');
              setActiveFolderId(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'files'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Files ({files.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQueueOpen(true)}
            className="flex-1 py-2 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Focused Folder View (when user selects a folder on mobile or desktop) */}
        {activeFolderId && currentActiveFolder ? (
          <div className="space-y-4 animate-fade-in">
            {/* Back button & Folder Header */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <button
                type="button"
                onClick={() => setActiveFolderId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Folders</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentActiveFolder.color }}
                    />
                    <h2 className="text-lg sm:text-2xl font-bold text-white">
                      {currentActiveFolder.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentActiveFolder.description}
                  </p>
                </div>

                {/* Big Touch-Friendly Folder Actions */}
                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handlePlayFolder(currentActiveFolder.id)}
                    disabled={visibleFiles.length === 0}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Folder ({visibleFiles.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiQuizFolder(currentActiveFolder)}
                    disabled={visibleFiles.length === 0}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>AI Study Quiz</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Folder Files */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-300">
                  Files ({visibleFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadFolderTargetId(currentActiveFolder.id);
                    setIsUploadOpen(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add File</span>
                </button>
              </div>

              {visibleFiles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">This folder is empty.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadFolderTargetId(currentActiveFolder.id);
                      setIsUploadOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload First File</span>
                  </button>
                </div>
              ) : (
                visibleFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    folder={currentActiveFolder}
                    allFolders={folders}
                    isPlaying={isPlaying && activeTrack?.fileId === file.id}
                    isCurrentInQueue={activeTrack?.fileId === file.id}
                    onPlayFile={() => handlePlayFile(file)}
                    onAddToQueue={() => handleAddToQueue(file)}
                    onViewDoc={() => setViewingFile(file)}
                    onMoveToFolder={(target) => handleMoveFileToFolder(file.id, target)}
                    onDeleteFile={() => handleDeleteFile(file.id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* Normal Overview Mode */
          <>
            {/* Desktop Hero Banner (Hidden on small mobile screens to keep UI lean) */}
            <div className="hidden sm:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 shadow-xl">
              <div className="relative z-10 max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smart Document Audio & AI Quiz</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Listen, learn, and test your comprehension on the go
                </h2>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayAllFiles}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play All Files ({files.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* View: FOLDERS (Default on mobile when tab is folders, and desktop) */}
            {(mobileTab === 'folders' || window.innerWidth >= 768) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Folders ({folders.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Folder</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {folders.map((folder) => {
                    const folderFiles = files.filter((f) => f.folderId === folder.id);

                    return (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        files={folderFiles}
                        isSelected={false}
                        onSelect={() => setActiveFolderId(folder.id)}
                        onPlayFolder={() => handlePlayFolder(folder.id)}
                        onOpenAiQuiz={() => setAiQuizFolder(folder)}
                        onUploadToFolder={() => {
                          setUploadFolderTargetId(folder.id);
                          setIsUploadOpen(true);
                        }}
                        onDeleteFolder={() => handleDeleteFolder(folder.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* View: ALL FILES */}
            {(mobileTab === 'files' || window.innerWidth >= 768) && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      All Files ({visibleFiles.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayAllFiles}
                      disabled={files.length === 0}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {visibleFiles.map((file) => {
                    const folder = folders.find((f) => f.id === file.folderId);
                    const isCurrentInQueue = activeTrack?.fileId === file.id;

                    return (
                      <FileRow
                        key={file.id}
                        file={file}
                        folder={folder}
                        allFolders={folders}
                        isPlaying={isPlaying && isCurrentInQueue}
                        isCurrentInQueue={isCurrentInQueue}
                        onPlayFile={() => handlePlayFile(file)}
                        onAddToQueue={() => handleAddToQueue(file)}
                        onViewDoc={() => setViewingFile(file)}
                        onMoveToFolder={(target) =>
                          handleMoveFileToFolder(file.id, target)
                        }
                        onDeleteFile={() => handleDeleteFile(file.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Audio Player Bar with Mobile Mini-Player */}
      <BottomPlayerBar
        currentTrack={activeTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        progress={progress}
        onPlayPause={handlePlayPause}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onSkipSeconds={handleSkipSeconds}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        queueCount={queue.length}
        isQueueOpen={isQueueOpen}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        playbackSettings={playbackSettings}
        currentSpokenSentence={currentSpokenSentence}
        onOpenDocViewer={() => {
          if (activeTrack) {
            const f = files.find((item) => item.id === activeTrack.fileId);
            if (f) setViewingFile(f);
          }
        }}
      />

      {/* Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentIndex={currentQueueIndex}
        onSelectTrack={(idx) => playTrackAtIndex(idx)}
        onRemoveTrack={handleRemoveFromQueue}
        onMoveTrack={handleMoveQueueTrack}
        onClearQueue={handleClearQueue}
        onShuffleQueue={handleShuffleQueue}
        playbackSettings={playbackSettings}
        onUpdateSettings={handleUpdateSettings}
        isPlaying={isPlaying}
      />

      {/* Voice & Speed Settings Modal */}
      <VoiceSpeedModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={playbackSettings}
        onUpdateSettings={handleUpdateSettings}
        availableVoices={availableVoices}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        initialFolderId={uploadFolderTargetId}
        onAddFiles={handleAddFiles}
      />

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* AI Folder Comprehension Quiz Modal */}
      {aiQuizFolder && (
        <FolderAiQuizModal
          isOpen={Boolean(aiQuizFolder)}
          onClose={() => setAiQuizFolder(null)}
          folder={aiQuizFolder}
          folderFiles={files.filter((f) => f.folderId === aiQuizFolder.id)}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingFile && (
        <DocumentViewerModal
          isOpen={Boolean(viewingFile)}
          onClose={() => setViewingFile(null)}
          file={viewingFile}
          folder={folders.find((f) => f.id === viewingFile.folderId)}
          onPlayFile={() => handlePlayFile(viewingFile)}
          isPlaying={isPlaying && activeTrack?.fileId === viewingFile.id}
        />
      )}
    </div>
  );
}
