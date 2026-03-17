"use client";

import React from "react";
import { useApp, ReminderWindowKey, StackBlockCompletion } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock,
  LayoutDashboard,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  TrendingUp,
  AlertCircle,
  Thermometer,
  Zap,
  Brain,
  Eye,
  BedDouble,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SymptomModal } from "@/components/SymptomModal";
import { SupplementSuggestions } from "@/components/SupplementSuggestions";
import { scheduleSnooze } from "@/lib/reminderService";


export function Dashboard({ onShowPricing }: { onShowPricing?: () => void }) {
  const { state, dispatch } = useApp();
  const [activeSymptom, setActiveSymptom] = React.useState<"Energy" | "Mood" | "Focus" | "Sleep" | null>(null);
  const [moodRating, setMoodRating] = React.useState(3);
  const [energyRating, setEnergyRating] = React.useState(3);
  const [showMoodPrompt, setShowMoodPrompt] = React.useState(false);
  const [lastCompletionId, setLastCompletionId] = React.useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todayKey = new Date().toDateString();

  const getTimeCategory = (timeStr: string) => {
    if (!timeStr) return "Morning";
    
    const normalizedTime = timeStr.trim().toLowerCase();

    // Handle named slots from AddItemModal
    if (normalizedTime === "morning") return "Morning";
    if (normalizedTime === "afternoon" || normalizedTime === "pre-workout" || normalizedTime === "post-workout") return "Afternoon";
    if (normalizedTime === "evening") return "Evening";
    if (normalizedTime === "night" || normalizedTime === "bedtime") return "Bedtime";

    const parts = timeStr.split(" ");
    if (parts.length < 2) {
      // If it's not a standard HH:MM AM/PM format, and not a direct match
      // We already checked "Morning", "Afternoon", etc. above.
      // If we got here, it's either a single word or something else.
      return "Morning";
    }
    const [time, modifier] = parts;
    const timeParts = time.split(":");
    let hours = Number(timeParts[0]);
    if (isNaN(hours)) return "Morning";
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    if (hours >= 5 && hours < 12) return "Morning";
    if (hours >= 12 && hours < 17) return "Afternoon";
    if (hours >= 17 && hours < 21) return "Evening";
    return "Bedtime";
  };

  const stackItems = state.profile.currentStack || [];
  const todayItems = stackItems.filter(item => 
    item.active && item.schedule.days.includes(today)
  );

  const logsToday = state.logs.filter(log => 
    new Date(log.timestamp).toDateString() === todayKey
  );

  const sections = [
    { label: "Morning", icon: Sunrise, color: "text-amber-500" },
    { label: "Afternoon", icon: Sun, color: "text-orange-500" },
    { label: "Evening", icon: Sunset, color: "text-indigo-500" },
    { label: "Bedtime", icon: Moon, color: "text-blue-500" },
  ];

  // Smarter taken logic: if item is scheduled twice, it needs two logs to show both as taken
  const itemLogStatus: Record<string, number> = {};
  logsToday.forEach(log => {
    itemLogStatus[log.name] = (itemLogStatus[log.name] || 0) + 1;
  });

  const timeSections = sections.map(section => {
    const itemsInSection = todayItems
      .filter(item => item.schedule.times.some(t => getTimeCategory(t) === section.label))
      .map(item => {
        const isTaken = itemLogStatus[item.name] > 0;
        if (isTaken) itemLogStatus[item.name]--; // "Consume" one log for this section
        return { ...item, taken: isTaken };
      });
    return { ...section, items: itemsInSection };
  });

    const handleLog = (item: any) => {
      dispatch({
        type: "ADD_LOG",
        payload: {
          id: Math.random().toString(36).substr(2, 9),
          name: item.name,
          dose: item.defaultDose,
          unit: item.unit,
          site: "Oral",
          timestamp: Date.now(),
          type: item.category.toLowerCase() as any,
        }
      });
      toast.success(`${item.name} logged`);
    };

    const handleMarkBlockDone = (blockId: string, items: any[]) => {
      if (items.length === 0) {
        toast.info("No items in this block");
        return;
      }

      items.forEach((item) => {
        dispatch({
          type: "ADD_LOG",
          payload: {
            id: Math.random().toString(36).substr(2, 9),
            name: item.name,
            dose: item.defaultDose,
            unit: item.unit,
            site: "Oral",
            timestamp: Date.now(),
            type: item.category.toLowerCase() as any,
          },
        });
      });

      const completionId = Math.random().toString(36).substr(2, 9);
      dispatch({
        type: "ADD_REMINDER_COMPLETION",
        payload: {
          id: completionId,
          blockId: blockId as any,
          itemIds: items.map((i) => i.id),
          itemNames: items.map((i) => i.name),
          timestamp: Date.now(),
          mood: null,
          energy: null,
        } as StackBlockCompletion,
      });
      setLastCompletionId(completionId);
      dispatch({ type: "SET_ACTIVE_REMINDER_BLOCK", payload: null });
      setShowMoodPrompt(true);
      toast.success(`${blockId} stack marked done`);
    };

    const handleSaveMoodRatings = () => {
      if (lastCompletionId) {
        dispatch({
          type: "UPDATE_REMINDER_COMPLETION",
          payload: {
            id: lastCompletionId,
            mood: moodRating,
            energy: energyRating,
          },
        });
      }
      setShowMoodPrompt(false);
      setLastCompletionId(null);
      toast.success("Mood and energy saved");
    };

    const totalScheduled = timeSections.reduce((acc, s) => acc + s.items.length, 0);
    const totalTaken = timeSections.reduce((acc, s) => acc + s.items.filter(i => i.taken).length, 0);
    const adherence = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

    // Calculate Active Cycle Day (days since first log in current stack)
    const getActiveCycleDay = () => {
      if (!state.logs || state.logs.length === 0) return 1;
      const sortedLogs = [...state.logs].sort((a, b) => a.timestamp - b.timestamp);
      const firstLog = sortedLogs[0];
      if (!firstLog) return 1;
      const diffTime = Math.abs(Date.now() - firstLog.timestamp);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    };

    const activeCycleDay = getActiveCycleDay();

          return (
              <div className="h-full overflow-y-auto pb-24 dark:bg-zinc-950 group/dashboard pt-[env(safe-area-inset-top,1rem)]">
              {/* Top Summary Card - Always visible on mobile */}
              <div className="bg-white dark:bg-zinc-900 px-6 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 transition-all duration-500 sticky top-0 z-30">
                <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Today</h1>
              <p className="text-sm text-muted-foreground">{totalTaken} of {totalScheduled} items logged</p>
              </div>
            <div className="bg-teal/10 text-teal dark:bg-teal/20 px-3 py-1 rounded-full text-xs font-medium">
              {adherence}%
            </div>
            </div>
    
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-teal/5 dark:bg-teal/10 border-none rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-teal" />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-teal">Adherence</span>
                </div>
                <p className="text-xl font-semibold dark:text-white">{adherence}%</p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </Card>
              <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-none rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">Active Cycle</span>
                </div>
                <p className="text-xl font-semibold dark:text-white">Day {activeCycleDay}</p>
                <p className="text-[10px] text-muted-foreground">Goal: {state.profile.goal || "Optimization"}</p>
              </Card>
            </div>
          </div>

          {state.activeReminderBlock && (
            <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-950/25 rounded-2xl border border-yellow-100 dark:border-yellow-900 mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600 dark:text-yellow-300">
                    Dose Coach Reminder
                  </p>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {state.activeReminderBlock} Stack is ready
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Opened from notification. Tap below to mark taken for this block.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    scheduleSnooze(state.activeReminderBlock as ReminderWindowKey, state.reminderSettings.snoozeMinutes, state, dispatch);
                    dispatch({ type: "SET_ACTIVE_REMINDER_BLOCK", payload: null });
                    toast.success("Snoozed for " + state.reminderSettings.snoozeMinutes + " minutes");
                  }}
                  className="h-9"
                >
                  Snooze
                </Button>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Items in this block</p>
                <div className="mt-2 space-y-1">
                  {timeSections
                    .find((section) => section.label === state.activeReminderBlock)
                    ?.items.map((item) => (
                      <div key={item.id} className="text-sm text-zinc-800 dark:text-zinc-100">
                        • {item.name} ({item.defaultDose}{item.unit})
                      </div>
                    ))}
                </div>

                <Button
                  size="sm"
                  className="mt-3 h-9"
                  onClick={() => {
                    const itemsInBlock = timeSections.find((section) => section.label === state.activeReminderBlock)?.items || [];
                    handleMarkBlockDone(state.activeReminderBlock as string, itemsInBlock);
                  }}
                >
                  Mark block done
                </Button>
              </div>
            </div>
          )}

          {showMoodPrompt && (
            <Card className="px-4 py-4 mb-5 ring-1 ring-teal/40 bg-white dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-300">Quick Mood Check</p>
              <div className="mt-2 space-y-3">
                <label className="text-sm font-medium">Mood: {moodRating}/5</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={moodRating}
                  onChange={(e) => setMoodRating(Number(e.target.value))}
                  className="w-full"
                />
                <label className="text-sm font-medium">Energy: {energyRating}/5</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={energyRating}
                  onChange={(e) => setEnergyRating(Number(e.target.value))}
                  className="w-full"
                />

                <Button onClick={handleSaveMoodRatings} className="w-full h-10">
                  Save Mood/Energy
                </Button>
              </div>
            </Card>
          )}

        {/* Time of Day Sections */}
        <div className="px-6 py-6 space-y-8">
          {timeSections.map((section) => (
            <div key={section.label} className="space-y-3">
                <div className="flex items-center gap-2">
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                  <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{section.label}</h3>
                </div>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      item.taken 
                        ? "bg-white dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60" 
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
                    }`}
                  >
                    {item.taken ? (
                      <CheckCircle2 className="w-6 h-6 text-teal" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${item.taken ? "line-through text-zinc-400" : "text-zinc-900 dark:text-white"}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase font-medium">{item.defaultDose}{item.unit}</p>
                    </div>
                  {!item.taken && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleLog(item)}
              className="text-teal hover:bg-teal/5 dark:hover:bg-teal/10 font-medium h-8 px-3 rounded-lg"
            >
              Log
            </Button>
                      )}
                    </div>
                  ))}
                  {section.items.length === 0 && (
                    <p className="text-xs text-zinc-400 px-4">Nothing scheduled for this time.</p>
                  )}
                </div>
              </div>
            ))}

              {/* Symptom Tracking Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-zinc-400" />
                      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Symptom Log
                      </h3>
                  </div>
                </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Energy', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'hover:border-amber-200 dark:hover:border-amber-800/50' },
                  { label: 'Mood', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-200 dark:hover:border-violet-800/50' },
                  { label: 'Focus', icon: Eye, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'hover:border-sky-200 dark:hover:border-sky-800/50' },
                  { label: 'Sleep', icon: BedDouble, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'hover:border-indigo-200 dark:hover:border-indigo-800/50' },
                ].map(({ label, icon: Icon, color, bg, border }) => (
                  <button
                    key={label}
                    onClick={() => setActiveSymptom(label as any)}
                    className={`h-[76px] rounded-2xl flex flex-col items-start justify-between p-3.5 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 ${border} hover:shadow-sm transition-all text-left group active:scale-[0.97]`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200 leading-tight">{label}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Log</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <SymptomModal 
              isOpen={!!activeSymptom} 
              onClose={() => setActiveSymptom(null)} 
              type={activeSymptom} 
            />

              {/* Supplement Suggestions */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal" />
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recommendations</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal/10 text-teal">Based on your data</span>
                </div>
              <SupplementSuggestions />
            </div>

          {todayItems.length === 0 && (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-400">Nothing scheduled for today.<br/>Add items to your stack to start tracking.</p>
            <Button 
              variant="outline" 
              onClick={() => dispatch({ type: "SET_TAB", payload: "log" })}
              className="rounded-xl border-zinc-200 font-medium"
            >
              Go to Stack
            </Button>
          </div>
        )}
      </div>


      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button 
          className="w-14 h-14 rounded-full bg-teal hover:bg-teal/90 shadow-lg shadow-teal/30 flex items-center justify-center p-0"
          onClick={() => dispatch({ type: "SET_TAB", payload: "log" })}
        >
          <Plus className="w-8 h-8 text-white" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-1 px-6 py-8">
        <p className="text-[10px] text-center text-zinc-400">
          StackSense is a personal logging tool and does not provide medical advice.
        </p>
        <p className="text-[10px] text-center text-zinc-400">
          Contact:{" "}
          <a href="mailto:dufleuvecontact@gmail.com" className="text-teal-500 hover:text-teal-400 transition-colors">
            dufleuvecontact@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
