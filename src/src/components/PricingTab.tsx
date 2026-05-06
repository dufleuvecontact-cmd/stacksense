"use client";

import React from 'react';
import {
  Crown,
  Check,
  ArrowLeft,
  Brain,
  Cloud,
  Zap,
  Activity,
  Target,
  FlaskConical,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FREE_FEATURES = [
  { name: "Advanced supplement tracking", included: true },
  { name: "Up to 8 stack items", included: true },
  { name: 'Basic dose logging', included: true },
  { name: 'Weight tracking', included: true },
  { name: 'AI interactions detection', included: false },
  { name: 'Bioavailability calculator', included: false },
  { name: 'Cloud sync & backup', included: false },
  { name: 'Priority AI responses', included: false },
  { name: 'Symptom tracking', included: false },
  { name: 'Protocol templates', included: false }
];

const PREMIUM_FEATURES = [
  { icon: Brain, name: 'AI Interactions & Bioavailability', desc: 'Smart supplement analysis' },
  { icon: Cloud, name: 'Cloud Sync & Backup', desc: 'Access across devices' },
  { icon: Zap, name: 'Enhanced AI Assistant', desc: 'Priority responses' },
  { icon: Activity, name: 'Advanced Logging', desc: 'Mood, energy, sleep' },
  { icon: Target, name: 'Goals & Coaching', desc: 'AI-powered guidance' },
  { icon: FlaskConical, name: 'Protocol Templates', desc: 'Pre-built cycles' }
];

export function PricingTab({ onClose }: { onClose: () => void; }) {
  return (
    <div className="h-full overflow-y-auto pb-24 dark:bg-zinc-950">
      <div className="px-6 pt-8 pb-6 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </Button>
          <h1 className="text-xl font-semibold dark:text-white">Pricing Plans</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">All features are currently available.</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid gap-4">
          <Card className="p-5 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Free</h3>
                <p className="text-zinc-500 text-sm">Basic tracking</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black dark:text-white">$0</p>
                <p className="text-xs text-zinc-400">forever</p>
              </div>
            </div>
            <div className="space-y-2">
              {FREE_FEATURES.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-teal" />
                  <span className="dark:text-zinc-300 !whitespace-pre-line">{f.name}</span>
                </div>
              ))}
            </div>
            <Badge className="mt-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none">
              Current Plan
            </Badge>
          </Card>

          <Card className="p-5 rounded-3xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden opacity-50">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium px-3 py-1 rounded-bl-xl">
              Archived
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-lg dark:text-white">Premium</h3>
                  <p className="text-zinc-500 text-sm">Previously available</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black dark:text-white !whitespace-pre-line">$7.99</p>
                <p className="text-xs text-zinc-400">per month</p>
              </div>
            </div>
            <div className="bg-white/50 dark:bg-zinc-900/20 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold dark:text-zinc-300">Stripe payment processing has been removed</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All features are now available on the free plan</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm uppercase tracking-widest text-zinc-400 px-1">Available Features</h3>
          <div className="grid gap-3">
            {PREMIUM_FEATURES.map((f, i) => (
              <Card key={i} className="p-4 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-white">{f.name}</p>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure local storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
