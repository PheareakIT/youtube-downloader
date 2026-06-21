'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Copy, 
  Check, 
  Video, 
  Music, 
  Download, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import Link from 'next/link';

function VideoDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, t } = useTranslation();
  const url = searchParams.get('url');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch video details
  useEffect(() => {
    if (!url) {
      setError(t('invalidUrl'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    axios.post('/api/video/info', { url })
      .then((res) => {
        setVideoInfo(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching video info:', err);
        setError(t('errorFetching'));
        setLoading(false);
      });
  }, [url, t]);

  const handleCopyInfo = () => {
    if (!videoInfo) return;
    const text = `${t('videoDetails')}:\n${t('colVideo')}: ${videoInfo.title}\n${t('channel')}: ${videoInfo.channel}\n${t('duration')}: ${formatDuration(videoInfo.duration)}\n${t('views')}: ${videoInfo.viewCount.toLocaleString()}\nURL: https://www.youtube.com/watch?v=${videoInfo.videoId}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartDownload = async (formatId: string, ext: string, resolution: string, fileSize: number) => {
    if (!videoInfo || !url) return;
    
    setDownloadingId(formatId);
    try {
      const response = await axios.post('/api/video/download', {
        url,
        formatId,
        ext,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        channel: videoInfo.channel,
        duration: videoInfo.duration,
        fileSize,
        resolution
      });

      if (response.data.success) {
        // Redirect to download history manager
        router.push('/history');
      }
    } catch (err) {
      console.error('Failed to trigger download:', err);
      alert('Failed to start download process. Make sure FFmpeg is installed.');
      setDownloadingId(null);
    }
  };

  // Format Helper: Seconds to HH:MM:SS
  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Localized Views Formatter
  const formatViews = (views: number) => {
    if (language === 'km') {
      if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)} លានដង`;
      }
      if (views >= 10000) {
        return `${(views / 10000).toFixed(1)} ម៉ឺនដង`;
      }
      return `${views.toLocaleString()} ដង`;
    }
    
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  // Format File Size
  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <div className="mesh-bg" />
        <div className="glass-card p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
            <Youtube className="h-5 w-5 text-red-500 absolute" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold animate-pulse">
            {t('analyzing')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !videoInfo) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <div className="mesh-bg" />
        <div className="glass-card p-8 rounded-3xl max-w-md w-full text-center flex flex-col items-center gap-4 border border-red-200/20">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold">{error || 'An error occurred'}</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-4 flex flex-col">
      <div className="mesh-bg" />
      
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 border border-slate-200/50 hover:bg-slate-50 text-slate-700 dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('home')}</span>
        </Link>
      </div>

      {/* Grid Layout: Left Details, Right Formats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Video Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={videoInfo.thumbnail} 
                alt={videoInfo.title} 
                className="object-cover h-full w-full"
              />
            </div>
            
            {/* Title */}
            <h1 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {videoInfo.title}
            </h1>

            {/* Details List */}
            <div className="mt-4 space-y-2 border-t border-slate-200/30 pt-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('channel')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  {videoInfo.channel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('duration')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {formatDuration(videoInfo.duration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('views')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  {formatViews(videoInfo.viewCount)}
                </span>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyInfo}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 hover:bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:bg-slate-900 transition-all text-sm font-semibold shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">{t('infoCopied').split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('copyInfo')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Download Selectors */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MP4 Videos Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-red-500" />
              <span>{t('videoFormats')}</span>
            </h2>

            <div className="space-y-3">
              {videoInfo.videoOptions && videoInfo.videoOptions.length > 0 ? (
                videoInfo.videoOptions.map((opt: any) => (
                  <div 
                    key={opt.formatId} 
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-950/30 transition-all hover:bg-white dark:hover:bg-slate-950/70"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {opt.note}
                      </span>
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        {formatSize(opt.size)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartDownload(opt.formatId, opt.ext, opt.resolution, opt.size)}
                      disabled={downloadingId !== null}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      {downloadingId === opt.formatId ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t('downloadingBtn').split('...')[0]}</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>{t('downloadBtn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No video formats detected.</p>
              )}
            </div>
          </div>

          {/* MP3 Audios Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4">
              <Music className="h-5 w-5 text-violet-500" />
              <span>{t('audioFormats')}</span>
            </h2>

            <div className="space-y-3">
              {videoInfo.audioOptions && videoInfo.audioOptions.map((opt: any) => (
                <div 
                  key={opt.resolution} 
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-950/30 transition-all hover:bg-white dark:hover:bg-slate-950/70"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {opt.note}
                    </span>
                    <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                      {formatSize(opt.size)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartDownload(opt.formatId, opt.ext, opt.resolution, opt.size)}
                    disabled={downloadingId !== null}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {downloadingId === opt.resolution ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{t('downloadingBtn').split('...')[0]}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>{t('downloadBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Full page wrapper utilizing Next.js SearchParams with Suspense
export default function VideoPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <div className="mesh-bg" />
          <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
        </div>
      }
    >
      <VideoDetailsContent />
    </Suspense>
  );
}
