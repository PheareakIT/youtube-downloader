'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import axios from 'axios';
import { 
  History, 
  Trash2, 
  XCircle, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp,
  HardDrive,
  FileVideo,
  FileAudio,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch download logs
  const fetchDownloads = () => {
    axios.get('/api/download/history')
      .then((res) => {
        setDownloads(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching download logs:', err);
        setLoading(false);
      });
  };

  // Poll database updates every 1.5 seconds
  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteOrCancel = async (id: string, isCancel: boolean) => {
    try {
      await axios.delete(`/api/download/${id}`);
      fetchDownloads();
    } catch (err) {
      console.error(`Failed to delete/cancel download ID ${id}:`, err);
      alert('Failed to complete action.');
    }
  };

  // Helper: Seconds to HH:MM:SS
  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: Bytes to human-readable size
  const formatSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Status Badge UI helper
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: t('statusPending'),
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          icon: Clock
        };
      case 'downloading':
        return {
          label: t('statusDownloading'),
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: Loader2,
          pulse: true
        };
      case 'completed':
        return {
          label: t('statusCompleted'),
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          icon: CheckCircle2
        };
      case 'failed':
        return {
          label: t('statusFailed'),
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: AlertCircle
        };
      case 'cancelled':
        return {
          label: t('statusCancelled'),
          color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          icon: XCircle
        };
      default:
        return {
          label: status,
          color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          icon: Clock
        };
    }
  };

  return (
    <div className="flex-1 py-4 flex flex-col">
      <div className="mesh-bg" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <History className="h-7 w-7 text-red-500" />
            <span>{t('downloadManager')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor active progress and download history logs.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-all"
        >
          <span>{t('home')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* History Grid/List Container */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
          </div>
        ) : downloads.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {downloads.map((item) => {
                const statusDetails = getStatusDetails(item.status);
                const StatusIcon = statusDetails.icon;
                const isDownloading = item.status === 'downloading' || item.status === 'pending';
                const isAudio = item.ext === 'mp3';

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between transition-all"
                  >
                    {/* Thumbnail and Title */}
                    <div className="flex items-center gap-4 w-full md:w-auto min-w-0">
                      <div className="relative h-16 w-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 shadow-sm border border-slate-200/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="object-cover h-full w-full"
                        />
                        {/* Duration label */}
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white">
                          {formatDuration(item.duration)}
                        </span>
                      </div>
                      
                      <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                          {item.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.channel}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {isAudio ? <FileAudio className="h-3.5 w-3.5 text-violet-400" /> : <FileVideo className="h-3.5 w-3.5 text-red-400" />}
                            {item.format_note}
                          </span>
                          <span>•</span>
                          <span>{formatSize(item.file_size)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Speed Indicator (for active downloads) */}
                    {isDownloading && (
                      <div className="w-full md:w-64 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500 flex items-center gap-1 dark:text-slate-400">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                            {item.speed || '0 B/s'}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">{item.progress}%</span>
                        </div>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/10 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status and Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-200/20 pt-3 md:pt-0">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${statusDetails.color}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${statusDetails.pulse ? 'animate-spin' : ''}`} />
                        <span>{statusDetails.label}</span>
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isDownloading ? (
                          <button
                            onClick={() => handleDeleteOrCancel(item.id, true)}
                            className="p-2.5 rounded-xl border border-red-200/30 hover:border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title={t('actionCancel')}
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        ) : (
                          <>
                            {item.status === 'completed' && (
                              <a
                                href={`/api/download/file/${item.id}`}
                                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all gap-1"
                                title={t('actionDownloadFile')}
                              >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('actionDownloadFile')}</span>
                              </a>
                            )}
                            
                            <button
                              onClick={() => handleDeleteOrCancel(item.id, false)}
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:text-red-500 dark:hover:border-red-500/30 dark:hover:text-red-400 hover:bg-red-500/5 transition-all text-slate-500 dark:text-slate-400"
                              title={t('actionDelete')}
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 glass-card p-12 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
            <div className="p-4 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-700">
              <HardDrive className="h-10 w-10" />
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-300 font-bold">{t('noHistory')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Videos you queue will appear here with live progress tracking.</p>
            </div>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-md"
            >
              <span>Download a Video</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
