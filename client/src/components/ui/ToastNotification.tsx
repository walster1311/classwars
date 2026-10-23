'use client';

import React from 'react';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useClassroomStore } from '@/lib/store';

export function ToastNotification() {
  const toast = useClassroomStore((s) => s.toast);

  if (!toast) return null;

  const bgClasses = {
    info: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
  }[toast.type || 'info'];

  const Icon = {
    info: Info,
    error: AlertCircle,
    success: CheckCircle
  }[toast.type || 'info'];

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-semibold ${bgClasses}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
