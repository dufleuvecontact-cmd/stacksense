"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { copyText } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  Gift,
  Crown,
  Copy,
  Share2,
  Check,
  Clock,
  Zap,
} from "lucide-react";

type ReferralRow = {
  id: string;
  referred_id: string;
  referred_email: string | null;
  usage_days_count: number;
  reward_granted: boolean;
  reward_granted_at: string | null;
  created_at: string;
};

type StatsResponse = {
  referralCode: string;
  referrals: ReferralRow[];
  stats: {
    total: number;
    inProgress: number;
    monthsEarned: number;
  };
};

export function ReferralPage({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink =
    data?.referralCode && typeof window !== "undefined"
      ? `${window.location.origin}?ref=${data.referralCode}`
      : "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/referral/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to load stats");
        const json: StatsResponse = await res.json();
        setData(json);
      } catch {
        toast.error("Could not load referral data");
      }

      setLoading(false);
    };

    load();
  }, []);

  const handleCopy = async () => {
    if (!referralLink) return;
    await copyText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Join me on StackSense — the smart supplement tracker. Use my referral link to get started: ${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "StackSense", text, url: referralLink });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const stats = data?.stats ?? { total: 0, inProgress: 0, monthsEarned: 0 };
  const referrals = data?.referrals ?? [];

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950 pt-[env(safe-area-inset-top,1rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>
        <div>
          <h1 className="text-xl font-black dark:text-white">Referral Program</h1>
          <p className="text-xs text-zinc-400 font-medium">
            Earn free Premium for every friend
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-28">
        {/* Hero reward card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 p-6 shadow-xl shadow-teal/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">1 Month Free</h2>
              <p className="text-white/80 text-sm font-medium">
                for every friend who uses the app for 7 days
              </p>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <Zap className="w-4 h-4" />
              <span>No limit — refer as many people as you want</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Referred",
              value: loading ? "—" : stats.total,
              icon: Users,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-950/30",
            },
            {
              label: "In Progress",
              value: loading ? "—" : stats.inProgress,
              icon: Clock,
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-950/30",
            },
            {
              label: "Months Earned",
              value: loading ? "—" : stats.monthsEarned,
              icon: Crown,
              color: "text-teal-600",
              bg: "bg-teal-50 dark:bg-teal-950/30",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} rounded-2xl p-4 flex flex-col items-center gap-2`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className={`text-2xl font-black ${s.color}`}>
                {s.value}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide text-center">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 px-1">
            Your Referral Link
          </h3>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300 truncate flex-1">
                {loading ? "Generating…" : referralLink}
              </span>
              <button
                onClick={handleCopy}
                disabled={loading}
                className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-teal-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
              <span className="text-xs text-zinc-400 font-medium">Code:</span>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200 tracking-widest">
                {loading ? "—" : data?.referralCode}
              </span>
            </div>
          </div>
          <Button
            onClick={handleShare}
            disabled={loading || !referralLink}
            className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Referral Link
          </Button>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 px-1">
            How it works
          </h3>
          <div className="space-y-2">
            {[
              { step: "1", text: "Share your referral link with a friend" },
              { step: "2", text: "They sign up using your link" },
              { step: "3", text: "They use StackSense for 7 days" },
              {
                step: "4",
                text: "You automatically get 1 month of Premium free",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-teal-500">
                    {s.step}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Referred users list */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 px-1">
            Referred Friends ({loading ? "…" : referrals.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-sm font-bold text-zinc-400">No referrals yet</p>
              <p className="text-xs text-zinc-400">
                Share your link above to start earning!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => {
                const progress = Math.min(
                  ((r.usage_days_count ?? 0) / 7) * 100,
                  100
                );
                const earned = r.reward_granted;
                const daysLeft = 7 - (r.usage_days_count ?? 0);
                return (
                  <div
                    key={r.id}
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                            earned
                              ? "bg-teal-500/10 text-teal-500"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {r.referred_email
                            ? r.referred_email[0].toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                            {r.referred_email ?? "Anonymous user"}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            Joined{" "}
                            {new Date(r.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          earned
                            ? "bg-teal-500/10 text-teal-500"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-500"
                        }`}
                      >
                        {earned
                          ? "Earned"
                          : `${r.usage_days_count ?? 0}/7 days`}
                      </div>
                    </div>

                    {!earned && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          {daysLeft} more day{daysLeft !== 1 ? "s" : ""} until
                          you earn 1 month free
                        </p>
                      </div>
                    )}

                    {earned && (
                      <div className="flex items-center gap-2 text-xs text-teal-500 font-bold">
                        <Crown className="w-3.5 h-3.5" />1 month Premium added
                        to your account
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
