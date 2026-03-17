"use client";

import { useApp } from "@/lib/store";
import { Onboarding } from "@/components/Onboarding";
import { AppShell } from "@/components/AppShell";
import { Auth } from "@/components/Auth";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function Home() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        // Record daily activity for referral tracking (fire-and-forget, JWT-authenticated)
        fetch('/api/referral/apply', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});
      }
    });

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.access_token) {
        fetch('/api/referral/apply', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});
      }
    });

    return () => {
      if (authListener.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [state.theme, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-0 sm:p-4 md:p-8 transition-colors duration-500 relative overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/30 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      {/* Container to mimic mobile device on desktop */}
      <div className="w-full h-full sm:h-auto sm:max-w-[430px] bg-white dark:bg-slate-950 shadow-none sm:shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden sm:rounded-[3.5rem] sm:aspect-[9/19.5] sm:max-h-[880px] border-0 sm:border-[8px] border-zinc-900/10 dark:border-white/5 ring-0 sm:ring-1 ring-zinc-900/5 dark:ring-white/10 z-10 group">
        
        {/* Notch / Dynamic Island - Only on Desktop preview */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-950 rounded-2xl z-[100] border border-white/5">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-800" />
        </div>

          <div className="h-full overflow-hidden relative pb-safe">
            {!session ? (
              <Auth />
            ) : state.profile.onboarded ? (
              <AppShell />
            ) : (
              <Onboarding />
            )}
          </div>

      </div>
      <Toaster position="top-center" />
    </main>
  );
}
