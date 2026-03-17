"use client";

import React from 'react';
import { Crown, Lock, Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-amber-500/20 dark:border-amber-400/20 tracking-wide ${className}`}>
      <Crown className="w-2.5 h-2.5" />
      Premium
    </span>
  );
}

export function PaywallOverlay({ 
  feature, 
  onUpgrade 
}: { 
  feature: string; 
  onUpgrade: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-end justify-center z-10 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[6px] bg-white/60 dark:bg-zinc-950/70 rounded-2xl" />
      <div className="relative w-full p-4 pb-5 flex flex-col items-center gap-3 text-center">
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
          <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-100">Unlock {feature}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Premium feature</p>
        </div>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all active:scale-95"
        >
          Upgrade <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function FullPagePaywall({ 
  title, 
  description, 
  onUpgrade 
}: { 
  title: string; 
  description: string; 
  onUpgrade: () => void;
}) {
  const features = [
    "AI-powered protocol analysis",
    "Advanced symptom analytics",
    "Hormone & peptide cycle tracker",
    "Bloodwork trend monitoring",
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 py-12 animate-in fade-in duration-300">
      <div className="w-full max-w-xs flex flex-col items-center gap-7">

        {/* Icon */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        {/* Copy */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full space-y-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          {features.map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[12px] text-zinc-600 dark:text-zinc-300 font-medium">{feat}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full space-y-2">
          <Button
            onClick={onUpgrade}
            className="w-full h-12 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl shadow-sm text-sm tracking-wide transition-all active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            $7.99 / month &middot; Cancel anytime
          </p>
        </div>

      </div>
    </div>
  );
}

export function UpgradeBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
        <Crown className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">Unlock Premium</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">All features for $7.99/mo</p>
      </div>
      <Button
        onClick={onUpgrade}
        size="sm"
        className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold text-xs h-8 px-3 shrink-0 shadow-none"
      >
        Upgrade
      </Button>
    </div>
  );
}

export function FreeLimitBanner({ 
  current, 
  max, 
  onUpgrade 
}: { 
  current: number; 
  max: number; 
  onUpgrade: () => void;
}) {
  if (current < max) return null;
  
  return (
    <div className="p-4 bg-red-50/80 dark:bg-red-950/10 border border-red-200/60 dark:border-red-900/30 rounded-2xl flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">Free limit reached</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{current}/{max} items &mdash; upgrade for unlimited</p>
      </div>
      <Button
        onClick={onUpgrade}
        size="sm"
        className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold text-xs h-8 px-3 shrink-0 shadow-none"
      >
        Upgrade
      </Button>
    </div>
  );
}
