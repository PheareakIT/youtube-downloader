'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Search, 
  Sparkles, 
  History, 
  ArrowRight, 
  Music, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  ClipboardPaste,
  X
} from 'lucide-react';
import Link from 'next/link';

const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [validationError, setValidationError] = useState('');

  // Fetch recent downloads on mount
  useEffect(() => {
    fetch('/api/download/history')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Keep only the last 3 completed downloads for the home view
          setRecentDownloads(data.filter((d: any) => d.status === 'completed').slice(0, 3));
        }
      })
      .catch((err) => console.error('Error fetching recent history:', err));
  }, []);

  const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setValidationError('');

    if (!url.trim()) return;

    if (!YT_REGEX.test(url.trim())) {
      setValidationError(t('invalidUrl'));
      return;
    }

    // Navigate to Video Details page
    router.push(`/video?url=${encodeURIComponent(url.trim())}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setValidationError('');
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check for dragged text/links
    const text = e.dataTransfer.getData('text');
    if (text) {
      setUrl(text);
      setValidationError('');
    }
  };

  // Helper to format duration
  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to format file size
  const formatSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-4">
      {/* Background Mesh */}
      <div className="mesh-bg" />

      {/* Main Header Hero */}
      <div className="text-center max-w-2xl mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold mb-4 dark:bg-red-500/20 dark:text-red-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>V1.0 - Clean & Fast</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-white leading-tight"
        >
          {t('tagline')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400"
        >
          {t('description')}
        </motion.p>
      </div>

      {/* URL Input Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-3xl"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-card p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
            isDragging 
              ? 'ring-2 ring-red-500/50 scale-[1.01] bg-red-50/5 dark:bg-red-950/5' 
              : 'border-slate-200/50 dark:border-slate-800/50'
          }`}
        >
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="h-5 w-5" />
              </div>
              
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setValidationError('');
                }}
                placeholder={isDragging ? t('dragDropText') : t('pastePlaceholder')}
                className="w-full pl-11 pr-24 py-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all text-sm sm:text-base shadow-inner"
              />

              {/* Clear and Paste buttons inside input on desktop */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-300 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-500 hover:to-violet-500 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all duration-300 hover:scale-[1.02]"
            >
              <span>{t('analyzeBtn')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Validation Error Message */}
          <AnimatePresence>
            {validationError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs sm:text-sm text-red-500 font-medium pl-2"
              >
                {validationError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Drag and Drop Prompt */}
          <div className="mt-4 text-center hidden sm:block">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t('dragDropText')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recent Downloads & Features Grid */}
      <div className="w-full max-w-6xl mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Downloads Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-red-500" />
              <span>{t('recentDownloads')}</span>
            </h2>
            <Link href="/history" className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 glass-card p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-center min-h-[220px]">
            {recentDownloads.length > 0 ? (
              <div className="space-y-3 flex-1">
                {recentDownloads.map((download: any) => (
                  <div 
                    key={download.id} 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-200/30 dark:hover:border-slate-700/30"
                  >
                    <div className="relative h-12 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={download.thumbnail} 
                        alt={download.title} 
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-4">
                        {download.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{download.channel}</span>
                        <span>•</span>
                        <span>{formatDuration(download.duration)}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {download.format_note} ({formatSize(download.file_size)})
                        </span>
                      </div>
                    </div>
                    
                    <a
                      href={`/api/download/file/${download.id}`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex-shrink-0"
                      title={t('actionDownloadFile')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                <History className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p className="text-xs">{t('noHistory')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Grid (Features Cards) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <span>Why Choose Us?</span>
          </h2>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 flex-shrink-0">
              <Youtube className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">High Quality Downloads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get videos up to 1080p Full HD. High bitrates with automatic audio merging.</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400 flex-shrink-0">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Crystal Clear MP3s</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Extract high quality audio from any video. Convert directly to 128kbps or 320kbps MP3s.</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex-shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Instant Queue Processing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Our background queue manager keeps track of progress while you search other links.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
