"use client";

import React, { useState } from "react";
import { useApp, StackItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Settings,
  Database,
  Moon,
  Sun,
  FileText,
  ChevronRight,
  LogOut,
  FlaskConical,
  Crown,
  CreditCard,
  Loader2,
  Lock,
  Gift,
  Activity,
  Target,
  Scale,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { BloodworkAnalysisCard } from "@/components/BloodworkAnalysisCard";
import { ProtocolLibrary } from "@/components/ProtocolLibrary";

export function ProfileTab({
  onShowPricing,
  onShowReferral,
}: {
  onShowPricing?: () => void;
  onShowReferral?: () => void;
}) {
  const { state, dispatch } = useApp();
  const isDark = state.theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(state.profile);
  const [showProtocols, setShowProtocols] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const currentStack = state.profile.currentStack || [];

  const handleSaveProfile = () => {
    if (editForm.weight !== state.profile.weight) {
      dispatch({ type: "UPDATE_WEIGHT", payload: parseFloat(editForm.weight) || 0 });
    }
    dispatch({ type: "SET_PROFILE", payload: editForm });
    setIsEditing(false);
    toast.success("Profile updated");
  };

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_THEME" });
    toast.success(state.theme === "light" ? "Dark mode enabled" : "Light mode enabled");
  };



  const parseArrayValue = (value?: string) =>
    (value || "").split(/[,;|]/).map((v) => v.trim()).filter(Boolean);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) {
        toast.error("CSV must contain headers and at least one row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const doseKey = headers.includes("dose") ? "dose" : headers.includes("dosage") ? "dosage" : null;
      const timeKey = headers.includes("times") ? "times" : headers.includes("time") ? "time" : headers.includes("time of day") ? "time of day" : null;
      const required = ["name", "unit"];

      for (const h of required) {
        if (!headers.includes(h)) {
          toast.error(`Missing required column: ${h}`);
          return;
        }
      }
      if (!doseKey) {
        toast.error("Missing required column: dose or dosage");
        return;
      }

      const newItems: StackItem[] = lines.slice(1).map((line) => {
        const values = line.split(",");
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = (values[idx] || "").trim(); });

        const rowDose = row[doseKey || "dose"] || "";
        const rowTimes = row[timeKey || "times"] || row.time || row["time of day"] || "Morning";

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: row.name || "Untitled",
          category: "Supplement",
          brand: row.brand || "",
          form: row.form || "Capsule",
          defaultDose: rowDose,
          unit: row.unit || "mg",
          schedule: {
            days: parseArrayValue(row.days || "Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
            times: parseArrayValue(rowTimes),
            context: parseArrayValue(row.context).map((c) => c as any),
            frequency: (row.frequency as any) || "daily",
            reminderEnabled: true,
          },
          active: true,
          ingredients: row.ingredients ? parseArrayValue(row.ingredients) : [`${row.name} ${rowDose}${row.unit}`],
          evidence: row.evidence || "",
        } as StackItem;
      });

      newItems.forEach((item) => dispatch({ type: "ADD_STACK_ITEM", payload: item }));
      toast.success(`Imported ${newItems.length} stack items from spreadsheet.`);
    } catch (error) {
      toast.error("Failed to import stack CSV.");
      console.error(error);
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const exportStackToPDF = () => {
    if (!currentStack.length) {
      toast.error("No stack items to export.");
      return;
    }

    const rows = currentStack.map((item) => {
      const schedule = `${item.schedule.days.join(", ")} | ${item.schedule.times.join(", ")}`;
      const reminder = item.schedule.reminderEnabled === false ? "Off" : "On";
      return `<tr><td>${item.name}</td><td>${item.defaultDose}</td><td>${item.unit}</td><td>${schedule}</td><td>${reminder}</td></tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Stack Export</title><style>body{font-family:system-ui,sans-serif;padding:16px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#f0f0f0;}</style></head><body><h1>Stack Export</h1><table><thead><tr><th>Name</th><th>Dose</th><th>Unit</th><th>Schedule</th><th>Reminder</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Unable to open print window.");
      return;
    }

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.onafterprint = () => win.close();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error(error.message); return; }
    dispatch({ type: "RESET" });
    localStorage.clear();
    window.location.reload();
  };

  const settingsSections = [
    {
      title: "Membership",
      items: [
        {
          icon: Gift,
          label: "Referral Program",
          sublabel: "Earn 1 free month per friend",
          value: "Invite",
          onClick: () => onShowReferral?.(),
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        {
          icon: Database,
          label: "Cloud Sync & Backup",
          sublabel: "Syncing automatically",
          value: "Active",
          onClick: () => {
            toast.success("All data is securely backed up.");
          },
        },
        {
          icon: FileText,
          label: "Stack PDF Export",
          sublabel: "Export your complete stack",
          value: "Export",
          onClick: () => {
            exportStackToPDF();
          },
          disabled: false,
        },
        {
          icon: Database,
          label: "Stack CSV Import",
          sublabel: "Import stack from spreadsheet",
          value: "Import",
          onClick: () => {
            handleImportClick();
          },
          disabled: false,
        },
        {
          icon: FileText,
          label: "Blood Work PDF",
          sublabel: "Upload your latest results",
          value: "Upload",
          onClick: () => toast.info("Scroll down to the Bloodwork section"),
        },
        {
          icon: FlaskConical,
          label: "Protocol Library",
          sublabel: "Saved stacks and templates",
          value: "12 Saved",
          onClick: () => setShowProtocols(true),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: isDark ? Sun : Moon,
          label: "Dark Mode",
          sublabel: isDark ? "Currently enabled" : "Currently disabled",
          value: isDark ? "On" : "Off",
          onClick: toggleDarkMode,
        },
      ],
    },
  ];

  // ── Protocol Library full-screen ────────────────────────────────────────────
  if (showProtocols) {
    return <ProtocolLibrary onClose={() => setShowProtocols(false)} />;
  }

  // ── Edit form ────────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="h-full overflow-y-auto p-5 space-y-6 pt-[env(safe-area-inset-top,1rem)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Edit Profile</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-muted-foreground">
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Age</label>
              <Input type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                className="rounded-xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Weight (kg)</label>
              <Input type="number" value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                className="rounded-xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Height (cm)</label>
              <Input type="number" value={editForm.height} onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                className="rounded-xl border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Gender</label>
              <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm dark:text-white focus:ring-2 focus:ring-teal/40 outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Main Goal</label>
            <select value={editForm.goal} onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
              className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm dark:text-white focus:ring-2 focus:ring-teal/40 outline-none">
              <option value="Muscle">Muscle Growth</option>
              <option value="Longevity">Longevity</option>
              <option value="Cognitive">Cognitive Focus</option>
              <option value="Recovery">Injury Recovery</option>
              <option value="Fat Loss">Fat Loss</option>
            </select>
          </div>
        </div>

        <Button onClick={handleSaveProfile} className="w-full h-12 bg-teal hover:bg-teal/90 text-white rounded-xl font-semibold">
          Save Changes
        </Button>
      </div>
    );
  }

  // ── Main profile view ────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto pt-[env(safe-area-inset-top,1rem)] pb-24">

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-teal/10 dark:bg-teal/20 border-2 border-teal/30 flex items-center justify-center">
              <User className="w-7 h-7 text-teal" />
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold dark:text-white truncate">
                Bio-ID&nbsp;<span className="text-teal font-bold">{state.profile.age || "—"}</span>
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
            <p className="text-[12px] text-teal font-medium mt-0.5">Level 4 · Optimized</p>
          </div>
        </div>
      </div>

      {/* ── Metric cards ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: Scale,
              label: "WEIGHT",
              value: state.profile.weight ? `${state.profile.weight} kg` : "—",
              color: "text-teal",
            },
            {
              icon: Calendar,
              label: "AGE",
              value: state.profile.age ? `${state.profile.age} y` : "—",
              color: "text-blue-500",
            },
            {
              icon: Target,
              label: "GOAL",
              value: state.profile.goal || "—",
              color: "text-violet-500",
            },
          ].map((m, i) => (
            <button
              key={i}
              onClick={() => setIsEditing(true)}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm hover:border-teal/30 dark:hover:border-teal/30 transition-colors text-center"
            >
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                {m.label}
              </span>
              <span className={`text-sm font-bold ${m.color} truncate w-full leading-tight`}>
                {m.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Settings sections ────────────────────────────────────────────────── */}
      <div className="px-4 space-y-5">
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 px-1">
              {section.title}
            </p>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={item.onClick}
                  disabled={"disabled" in item && item.disabled}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    "disabled" in item && item.disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100 dark:active:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      "accent" in item && item.accent
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}>
                      <item.icon className={`w-4 h-4 ${"accent" in item && item.accent ? "text-amber-600 dark:text-amber-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight ${"accent" in item && item.accent ? "dark:text-white" : "dark:text-zinc-200"}`}>
                        {item.label}
                      </p>
                      {"sublabel" in item && item.sublabel && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-tight">
                          {item.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {"disabled" in item && item.disabled ? (
                      <Lock className="w-3.5 h-3.5 text-zinc-300" />
                    ) : (
                      <span className={`text-[11px] font-semibold ${"accent" in item && item.accent ? "text-amber-600 dark:text-amber-400" : "text-teal"}`}>
                        {item.value}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* ── Bloodwork section ────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 px-1">
            Health Analysis
          </p>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <BloodworkAnalysisCard onShowPricing={onShowPricing} />
          </div>
        </div>

        {/* ── Sign out ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 px-1">
            Account
          </p>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
            </button>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="pt-2 pb-4 text-center space-y-1">
          <div className="flex justify-center items-center gap-1.5 text-teal/60">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold text-teal/60">StackSense</span>
          </div>
          <p className="text-[10px] text-zinc-400">Version 1.0.0 · Build 2025.01</p>
          <p className="text-[10px] text-zinc-400">Not medical advice · Consult your physician</p>
        </div>
      </div>
    </div>
  );
}
