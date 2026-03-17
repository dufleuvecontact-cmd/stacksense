"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { CalendarDays, Layers, BarChart3, MessageSquare, User, Crown, FlaskConical } from "lucide-react";
import { Dashboard } from "./tabs/Dashboard";
import { LogTab } from "./tabs/LogTab";
import { ProgressTab } from "./tabs/ProgressTab";
import { AIInsights } from "./tabs/AIInsights";
import { CyclesTab } from "./tabs/CyclesTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { PricingTab } from "./PricingTab";
import { ReferralPage } from "./ReferralPage";
import { SubscriptionProvider, useSubscriptionContext } from "@/hooks/SubscriptionContext";

export function AppShell() {
  return (
    <SubscriptionProvider>
      <AppShellInner />
    </SubscriptionProvider>
  );
}

function AppShellInner() {
    const { state, dispatch } = useApp();
    const [showPricing, setShowPricing] = useState(false);
    const [showReferral, setShowReferral] = useState(false);
    const { isPremium, loading: subLoading } = useSubscriptionContext();

  const tabs = [
    { id: "dashboard", label: "Today", icon: CalendarDays, component: Dashboard },
    { id: "log", label: "Stack", icon: Layers, component: LogTab },
    { id: "cycles", label: "Cycles", icon: FlaskConical, component: CyclesTab },
    { id: "progress", label: "Insights", icon: BarChart3, component: ProgressTab },
    { id: "insights", label: "AI", icon: MessageSquare, component: AIInsights },
    { id: "profile", label: "Profile", icon: User, component: ProfileTab },
  ];

  const ActiveComponent = tabs.find((t) => t.id === state.activeTab)?.component || Dashboard;

  useEffect(() => {
    const trackUsage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Log daily activity
      await supabase.from('activity_logs').upsert({
        user_id: user.id,
        activity_date: today
      }, { onConflict: 'user_id,activity_date' });

      // If user was referred, update referral tracking
      const referredBy = user.user_metadata?.referred_by;
      if (referredBy) {
        // Find the referrer profile by referral code
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referredBy)
          .single();

        if (referrer) {
          // Update or insert referral tracking record
          const { data: existing } = await supabase
            .from('referral_tracking')
            .select('*')
            .eq('referrer_id', referrer.id)
            .eq('referred_id', user.id)
            .single();

          if (!existing) {
            await supabase.from('referral_tracking').insert({
              referrer_id: referrer.id,
              referred_id: user.id,
              usage_days_count: 1,
              last_usage_date: today
            });
          } else if (existing.last_usage_date !== today) {
            const newCount = existing.usage_days_count + 1;
            await supabase.from('referral_tracking').update({
              usage_days_count: newCount,
              last_usage_date: today
            }).eq('id', existing.id);

            // If 7 days reached and reward not granted
            if (newCount >= 7 && !existing.reward_granted) {
              // Grant 1 month premium to referrer
              const { data: profile } = await supabase
                .from('profiles')
                .select('premium_until')
                .eq('id', referrer.id)
                .single();

              const currentPremiumUntil = profile?.premium_until ? new Date(profile.premium_until) : new Date();
              const newPremiumUntil = new Date(currentPremiumUntil);
              newPremiumUntil.setMonth(newPremiumUntil.getMonth() + 1);

              await supabase.from('profiles').update({
                premium_until: newPremiumUntil.toISOString()
              }).eq('id', referrer.id);

              await supabase.from('referral_tracking').update({
                reward_granted: true
              }).eq('id', existing.id);
            }
          }
        }
      }
    };

    trackUsage();
  }, []);

    if (showPricing) {
      return (
        <div className="flex flex-col h-screen bg-off-white dark:bg-zinc-950 overflow-hidden max-w-md mx-auto relative shadow-2xl border-x border-zinc-200 dark:border-zinc-800">
          <PricingTab onClose={() => setShowPricing(false)} />
        </div>
      );
    }

    if (showReferral) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden relative">
          <ReferralPage onBack={() => setShowReferral(false)} />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-background overflow-hidden relative">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <ActiveComponent onShowPricing={() => setShowPricing(true)} onShowReferral={() => setShowReferral(true)} />
          </motion.div>
        </div>
  
          {/* Bottom Tab Bar - Mobile Optimized */}
          <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom,1rem)]">
            <div className="pointer-events-auto mb-4 mx-4 w-auto max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 px-2 py-2 flex justify-between items-center rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                {tabs.map((tab) => {
                  const isActive = state.activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
                      className={`flex flex-col items-center gap-1 transition-all flex-1 py-2.5 rounded-xl relative ${
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <tab.icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? "scale-110" : "scale-100"}`} />
                        <span className="text-[10px] font-medium uppercase tracking-wide relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
                {!subLoading && !isPremium && (
                  <button
                    onClick={() => setShowPricing(true)}
                    className="flex flex-col items-center gap-1 transition-all flex-1 py-2.5 rounded-xl text-amber-500 hover:text-amber-600"
                  >
                      <Crown className="w-5 h-5" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">Pro</span>
                  </button>
                )}
            </div>
          </div>
      </div>
    );
}
