'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { 
  Settings, 
  Globe, 
  Sun, 
  Moon, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Loader2,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loadingDiag, setLoadingDiag] = useState(true);

  // Fetch diagnostics info on load
  useEffect(() => {
    setLoadingDiag(true);
    axios.get('/api/diagnostics')
      .then((res) => {
        setDiagnostics(res.data);
        setLoadingDiag(false);
      })
      .catch((err) => {
        console.error('Error fetching environment diagnostics:', err);
        setLoadingDiag(false);
      });
  }, []);

  return (
    <div className="flex-1 py-4 flex flex-col max-w-4xl mx-auto w-full">
      <div className="mesh-bg" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
          <Settings className="h-7 w-7 text-red-500" />
          <span>{t('appSettings')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize UI language, toggle themes, and check system engine requirements.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* UI Configuration Section */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/30 pb-3 mb-4">
            Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-blue-500" />
                {t('uiLanguage')}
              </label>
              
              <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 mt-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    language === 'en'
                      ? 'bg-white shadow-sm text-red-500 dark:bg-slate-950 dark:text-red-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('km')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    language === 'km'
                      ? 'bg-white shadow-sm text-red-500 dark:bg-slate-950 dark:text-red-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  ភាសាខ្មែរ (Khmer)
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="h-4.5 w-4.5 text-violet-500" /> : <Sun className="h-4.5 w-4.5 text-amber-500" />}
                {t('uiTheme')}
              </label>

              <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 mt-1">
                <button
                  onClick={() => { if (theme === 'dark') toggleTheme(); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    theme === 'light'
                      ? 'bg-white shadow-sm text-red-500 dark:bg-slate-950 dark:text-red-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {t('themeLight').split(' (')[0]}
                </button>
                <button
                  onClick={() => { if (theme === 'light') toggleTheme(); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-white shadow-sm text-red-500 dark:bg-slate-950 dark:text-red-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {t('themeDark').split(' (')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics Info */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/30 pb-3 mb-2 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-violet-500" />
            <span>{t('envDiagnostics')}</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            {t('diagnosticsDesc')}
          </p>

          <div className="space-y-4">
            {loadingDiag ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
              </div>
            ) : diagnostics ? (
              <>
                {/* Python Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-950/30 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t('pythonStatus')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {diagnostics.python.version || 'Version details not reported'}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    diagnostics.python.installed
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {diagnostics.python.installed ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('statusInstalled')}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{t('statusMissing')}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* FFmpeg Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-950/30 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t('ffmpegStatus')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                      {diagnostics.ffmpeg.version || 'Version details not reported'}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    diagnostics.ffmpeg.installed
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {diagnostics.ffmpeg.installed ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('statusInstalled')}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{t('statusMissing')}</span>
                      </>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-red-500 text-center">Failed to query diagnostics.</p>
            )}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/30 pb-3 mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-red-500" />
            <span>{t('disclaimerTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed dark:text-slate-400">
            {t('disclaimerText')}
          </p>

          <div className="mt-5 flex items-center gap-2 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/20">
            <Lock className="h-4.5 w-4.5 text-red-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {t('acceptDisclaimer')} (YouTube TOS Compliance)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
