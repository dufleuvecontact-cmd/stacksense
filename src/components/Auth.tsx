"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Gift } from "lucide-react";
import { toast } from "sonner";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      setReferralCodeInput(ref);
      localStorage.setItem("stacksense_referral", ref);
    } else {
      const saved = localStorage.getItem("stacksense_referral");
      if (saved) {
        setReferralCode(saved);
        setReferralCodeInput(saved);
      }
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
              toast.success("Welcome back.");

        } else {
            const { error, data } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

              // If email confirmation is disabled, signUp returns a session directly.
              // If not, fall back to signing in immediately so the user lands in the app.
              if (!data.session) {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                  toast.success("Account created. Check your email to confirm, then sign in.");
                  return;
                }
              }

              // Apply referral code if one was captured.
              // After signUp+signIn, get the fresh session token to authenticate the request.
              const pendingCode = referralCodeInput.trim() || referralCode || localStorage.getItem("stacksense_referral");
              if (pendingCode) {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                if (token) {
                  try {
                    await fetch('/api/referral/apply', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      // newUserId is NOT sent — the server derives it from the JWT
                      body: JSON.stringify({ referralCode: pendingCode }),
                    });
                  } catch {
                    // Non-fatal
                  }
                  localStorage.removeItem("stacksense_referral");
                }
              }

              toast.success("Account created. Welcome to StackSense.");

          }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full bg-white dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            StackSense
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {mode === "login"
              ? "Sign in to your account"
              : "Create an account to get started"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition-all dark:text-white text-base"
                />
              </div>
            </div>
  
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition-all dark:text-white text-base"
                />
              </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Referral code (optional)"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition-all dark:text-white text-base tracking-widest font-mono"
                />
              </div>
              {referralCodeInput && (
                  <p className="text-[11px] text-teal font-medium px-1 flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Referral code applied.
                  </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal text-white font-medium rounded-2xl hover:bg-teal/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

          <div className="text-center space-y-4">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm font-medium text-zinc-500 hover:text-teal transition-colors"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>

          </div>

      </motion.div>
    </div>
  );
}
