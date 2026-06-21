'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-slate-200/50 bg-slate-50/50 transition-colors duration-300 dark:border-slate-800/50 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; {currentYear} {t('appName')}. All rights reserved.
            </p>
          </div>
          <div className="text-center md:text-right max-w-md">
            <p className="text-[10px] sm:text-xs text-slate-400 italic dark:text-slate-500">
              {t('footerLegal')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
