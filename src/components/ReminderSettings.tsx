"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Bell, Clock, ShieldCheck } from "lucide-react";

export function ReminderSettings() {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState(state.reminderSettings);

  useEffect(() => {
    setDraft(state.reminderSettings);
  }, [state.reminderSettings]);

  const handleWindowChange = (id: "Morning" | "Midday" | "Evening", field: "start" | "end", value: string) => {
    setDraft((prev) => ({
      ...prev,
      windows: prev.windows.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    }));
  };

  const applySettings = () => {
    dispatch({ type: "SET_REMINDER_SETTINGS", payload: draft });
    toast.success("Reminder settings updated");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        <Bell className="w-4 h-4" />
        Dose Coach / Reminder Settings
      </div>

      <Card className="p-4 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Reminders</p>
            <p className="text-sm font-medium">Daily stack block coaching</p>
          </div>
          <Switch
            checked={draft.enabled}
            onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked })}
          />
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Time windows per block</div>
        <div className="space-y-2">
          {draft.windows.map((window) => (
            <div key={window.id} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-semibold uppercase text-zinc-500">{window.id}</span>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="time"
                  value={window.start}
                  onChange={(e) => handleWindowChange(window.id, "start", e.target.value)}
                  className="h-8 p-1"
                />
              </div>
              <Input
                type="time"
                value={window.end}
                onChange={(e) => handleWindowChange(window.id, "end", e.target.value)}
                className="h-8 p-1"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-zinc-500 flex flex-col gap-1">
            Max reminders / day
            <Input
              type="number"
              min={1}
              max={10}
              value={draft.maxRemindersPerDay}
              onChange={(e) => setDraft({ ...draft, maxRemindersPerDay: Number(e.target.value) || 3 })}
              className="h-9"
            />
          </label>
          <label className="text-xs text-zinc-500 flex flex-col gap-1">
            Snooze minutes
            <Input
              type="number"
              min={5}
              max={60}
              value={draft.snoozeMinutes}
              onChange={(e) => setDraft({ ...draft, snoozeMinutes: Number(e.target.value) || 15 })}
              className="h-9"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={applySettings} className="h-10 gap-2">
            <ShieldCheck className="w-4 h-4" /> Save
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-500">Workflow notes</p>
        <ul className="text-[12px] space-y-1 pt-2 text-zinc-600 dark:text-zinc-300">
          <li>1 notification per block (Morning/Midday/Evening).</li>
          <li>Tap notification to open Today and highlight block.</li>
          <li>Mark done logs all compounds in block and prompts quick mood/energy slider.</li>
        </ul>
      </Card>
    </div>
  );
}
