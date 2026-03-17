"use client";

import React, { createContext, useContext, useEffect, useState, useReducer, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { initializeReminderScheduler, clearReminderScheduler, ensureNotificationChannels } from "@/lib/reminderService";

export type ReminderWindowKey = "Morning" | "Midday" | "Evening" | "Bedtime";

export type StackItem = {
  id: string;
  name: string;
  category: "Supplement" | "Peptide" | "Compound";
  brand?: string;
  form: string;
  defaultDose: string;
  unit: string;
  schedule: {
    days: string[]; // e.g., ["Mon", "Tue"]
    times: string[]; // e.g., ["08:00 AM", "09:00 PM"]
    context?: Array<"with food" | "pre-workout" | "bedtime">;
    frequency?: "daily" | "weekly" | "cycle";
    cycle?: {
      onDays: number;
      offDays: number;
      startDate: string;
    };
    reminderEnabled?: boolean;
  };
  active: boolean;
  ingredients?: string[];
  evidence?: string;
  route?: string;
  cycle?: string;
  history?: string[];
};

export type ReminderTimeWindow = {
  id: ReminderWindowKey;
  start: string; // HH:mm format
  end: string;   // HH:mm format
};

export type ReminderSettings = {
  enabled: boolean;
  maxRemindersPerDay: number;
  snoozeMinutes: number;
  windows: ReminderTimeWindow[];
};

export type StackBlockCompletion = {
  id: string;
  blockId: ReminderWindowKey;
  itemIds: string[];
  itemNames: string[];
  timestamp: number;
  mood: number | null;
  energy: number | null;
  notes?: string;
};

type UserProfile = {
  experienceLevel: string;
  interests: string[];
  currentStack: StackItem[];
  supplements: string[];
  age: string;
  weight: string;
  height: string;
  gender: string;
  bodyFat: string;
  goal: string;
  onboarded: boolean;
  referralCode?: string;
  referredBy?: string;
  premiumUntil?: string;
};

export type LogEntry = {
  id: string;
  name: string;
  dose: string;
  unit: string;
  site: string;
  timestamp: number;
  type: "peptide" | "hormone" | "supplement" | "vitamin";
};

export type SymptomLog = {
  id: string;
  type: "Energy" | "Mood" | "Focus" | "Sleep";
  value: number;
  notes?: string;
  timestamp: number;
};

export type BloodworkEntry = {
  id: string;
  date: string;
  markers: {
    name: string;
    value: number;
    unit: string;
    referenceRange?: string;
    status: "optimal" | "normal" | "low" | "high";
  }[];
};

type State = {
  profile: UserProfile;
  logs: LogEntry[];
  symptomLogs: SymptomLog[];
  reminderSettings: ReminderSettings;
  reminderCompletions: StackBlockCompletion[];
  activeReminderBlock: ReminderWindowKey | null;
  weightHistory: { date: string; weight: number; bodyFat?: number }[];
  bloodworkHistory: BloodworkEntry[];
  activeTab: string;
  theme: "light" | "dark";
};

type Action =
  | { type: "SET_PROFILE"; payload: Partial<UserProfile> }
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "ADD_SYMPTOM_LOG"; payload: SymptomLog }
  | { type: "SET_TAB"; payload: string }
  | { type: "ADD_STACK_ITEM"; payload: StackItem }
  | { type: "UPDATE_STACK_ITEM"; payload: StackItem }
  | { type: "DELETE_STACK_ITEM"; payload: string }
  | { type: "UPDATE_WEIGHT"; payload: number }
  | { type: "ADD_WEIGHT_ENTRY"; payload: { weight: number; bodyFat?: number; date?: string } }
  | { type: "ADD_BLOODWORK"; payload: BloodworkEntry }
  | { type: "DELETE_BLOODWORK"; payload: string }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_REMINDER_SETTINGS"; payload: ReminderSettings }
  | { type: "ADD_REMINDER_COMPLETION"; payload: StackBlockCompletion }
  | { type: "UPDATE_REMINDER_COMPLETION"; payload: { id: string; mood: number; energy: number; notes?: string } }
  | { type: "SET_ACTIVE_REMINDER_BLOCK"; payload: ReminderWindowKey | null }
  | { type: "SET_STATE"; payload: Partial<State> }
  | { type: "RESET" };

const initialState: State = {
  profile: {
    experienceLevel: "",
    interests: [],
    currentStack: [],
    supplements: [],
    age: "",
    weight: "",
    height: "",
    gender: "",
    bodyFat: "",
    goal: "",
    onboarded: false,
  },
  logs: [],
  symptomLogs: [],
  reminderSettings: {
    enabled: true,
    maxRemindersPerDay: 3,
    snoozeMinutes: 15,
    windows: [
      { id: "Morning", start: "07:00", end: "09:00" },
      { id: "Midday", start: "12:00", end: "14:00" },
      { id: "Evening", start: "18:00", end: "20:00" },
    ],
  },
  reminderCompletions: [],
  activeReminderBlock: null,
  weightHistory: [
    { date: "Mon", weight: 75, bodyFat: 18 },
    { date: "Tue", weight: 74.8, bodyFat: 17.9 },
    { date: "Wed", weight: 75.1, bodyFat: 18.1 },
    { date: "Thu", weight: 74.9, bodyFat: 18 },
    { date: "Fri", weight: 75.2, bodyFat: 18.2 },
    { date: "Sat", weight: 75.0, bodyFat: 18.1 },
    { date: "Sun", weight: 74.7, bodyFat: 17.8 },
  ],
  bloodworkHistory: [],
  activeTab: "dashboard",
  theme: "light",
};

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "ADD_LOG":
      return { ...state, logs: [action.payload, ...state.logs] };
    case "ADD_SYMPTOM_LOG":
      return { ...state, symptomLogs: [action.payload, ...state.symptomLogs] };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "ADD_STACK_ITEM":
      return {
        ...state,
        profile: {
          ...state.profile,
          currentStack: [...state.profile.currentStack, action.payload],
        },
      };
    case "UPDATE_STACK_ITEM":
      return {
        ...state,
        profile: {
          ...state.profile,
          currentStack: state.profile.currentStack.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
      };
      case "DELETE_STACK_ITEM":
        return {
          ...state,
          profile: {
            ...state.profile,
            currentStack: state.profile.currentStack.filter(
              (item) => item.id !== action.payload
            ),
          },
        };
      case "UPDATE_WEIGHT":
        const newWeight = action.payload;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short" });
        return {
          ...state,
          profile: { ...state.profile, weight: newWeight.toString() },
          weightHistory: [
            ...state.weightHistory,
            { date: todayStr, weight: newWeight },
          ].slice(-14),
        };
      case "ADD_WEIGHT_ENTRY":
        const { weight, bodyFat, date } = action.payload;
        const entryDate = date || new Date().toLocaleDateString("en-US", { weekday: "short" });
        return {
          ...state,
          profile: { 
            ...state.profile, 
            weight: weight.toString(),
            ...(bodyFat ? { bodyFat: bodyFat.toString() } : {})
          },
          weightHistory: [
            ...state.weightHistory,
            { date: entryDate, weight, bodyFat },
          ].slice(-30),
        };
      case "ADD_BLOODWORK":
        return {
          ...state,
          bloodworkHistory: [action.payload, ...state.bloodworkHistory],
        };
      case "DELETE_BLOODWORK":
        return {
          ...state,
          bloodworkHistory: state.bloodworkHistory.filter(
            (item) => item.id !== action.payload
          ),
        };
      case "TOGGLE_THEME":
        return { ...state, theme: state.theme === "light" ? "dark" : "light" };
      case "SET_REMINDER_SETTINGS":
        return { ...state, reminderSettings: action.payload };
      case "ADD_REMINDER_COMPLETION":
        return { ...state, reminderCompletions: [action.payload, ...state.reminderCompletions] };
      case "UPDATE_REMINDER_COMPLETION":
        return {
          ...state,
          reminderCompletions: state.reminderCompletions.map((entry) =>
            entry.id === action.payload.id
              ? { ...entry, mood: action.payload.mood, energy: action.payload.energy, notes: action.payload.notes }
              : entry
          ),
        };
      case "SET_ACTIVE_REMINDER_BLOCK":
        return { ...state, activeReminderBlock: action.payload };
      case "SET_STATE":
        return { ...state, ...action.payload };
      case "RESET":

      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("stacksense_state");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            return {
              ...initial,
              ...parsed,
              profile: {
                ...initial.profile,
                ...(parsed.profile || {}),
              }
            };
          } catch (e) {
            return initial;
          }
        }
      }
      return initial;
    });

    // Handle Auth changes
    useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }, []);

    // Fetch from cloud on login
    useEffect(() => {
      if (!user) return;

      const fetchCloudData = async () => {
        setIsSyncing(true);
        try {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // Fetch stack
          const { data: stackData } = await supabase
            .from("stack_items")
            .select("*")
            .eq("user_id", user.id);

          // Fetch logs
          const { data: logsData } = await supabase
            .from("logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false });

          // Fetch symptoms
          const { data: symptomData } = await supabase
            .from("symptom_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false });

          // Fetch weight
          const { data: weightData } = await supabase
            .from("weight_history")
            .select("*")
            .eq("user_id", user.id);

          // Fetch bloodwork
          const { data: bloodworkData } = await supabase
            .from("bloodwork_history")
            .select("*")
            .eq("user_id", user.id);

          if (profileData || stackData || logsData) {
            const newState: Partial<State> = {};
            
            if (profileData) {
              newState.profile = {
                ...state.profile,
                experienceLevel: profileData.experience_level || state.profile.experienceLevel,
                interests: profileData.interests || state.profile.interests,
                age: profileData.age || state.profile.age,
                weight: profileData.weight || state.profile.weight,
                height: profileData.height || state.profile.height,
                gender: profileData.gender || state.profile.gender,
                bodyFat: profileData.body_fat || state.profile.bodyFat,
                goal: profileData.goal || state.profile.goal,
                onboarded: profileData.onboarded ?? state.profile.onboarded,
                premiumUntil: profileData.premium_until,
              };
            }

            if (stackData) {
              newState.profile = {
                ...(newState.profile || state.profile),
                currentStack: stackData.map(item => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  brand: item.brand,
                  form: item.form,
                  defaultDose: item.default_dose,
                  unit: item.unit,
                  schedule: item.schedule,
                  active: item.active,
                  ingredients: item.ingredients,
                  evidence: item.evidence,
                  route: item.route,
                  cycle: item.cycle,
                  history: item.history,
                }))
              };
            }

            if (logsData) newState.logs = logsData.map(l => ({
              id: l.id,
              name: l.name,
              dose: l.dose,
              unit: l.unit,
              site: l.site,
              timestamp: Number(l.timestamp),
              type: l.type,
            }));

            if (symptomData) newState.symptomLogs = symptomData.map(s => ({
              id: s.id,
              type: s.type,
              value: Number(s.value),
              notes: s.notes,
              timestamp: Number(s.timestamp),
            }));

            if (weightData) newState.weightHistory = weightData.map(w => ({
              date: w.date,
              weight: Number(w.weight),
              bodyFat: w.body_fat ? Number(w.body_fat) : undefined,
            }));

            if (bloodworkData) newState.bloodworkHistory = bloodworkData.map(b => ({
              id: b.id,
              date: b.date,
              markers: b.markers,
            }));

            dispatch({ type: "SET_STATE", payload: newState });
            // toast.success("Data synced from cloud");
          }
        } catch (error) {
          console.error("Error fetching cloud data:", error);
        } finally {
          setTimeout(() => setIsSyncing(false), 500); // Small delay to prevent immediate push-back
        }
      };

      fetchCloudData();
    }, [user]);

    // Push to cloud on changes (debounced)
    useEffect(() => {
      localStorage.setItem("stacksense_state", JSON.stringify(state));

      if (!user || isSyncing) return;

      const syncTimer = setTimeout(async () => {
        try {
          // Sync profile
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            experience_level: state.profile.experienceLevel,
            interests: state.profile.interests,
            age: state.profile.age,
            weight: state.profile.weight,
            height: state.profile.height,
            gender: state.profile.gender,
            body_fat: state.profile.bodyFat,
            goal: state.profile.goal,
            onboarded: state.profile.onboarded,
            premium_until: state.profile.premiumUntil,
            updated_at: new Date().toISOString(),
          });

          // Sync stack (this is tricky with upsert - we might want to delete items not in currentStack)
          // For now, let's just upsert all current items
          if (state.profile.currentStack.length > 0) {
            const stackItems = state.profile.currentStack.map(item => ({
              user_id: user.id,
              id: item.id.includes("-") ? item.id : undefined, // Check if it's a UUID
              name: item.name,
              category: item.category,
              brand: item.brand,
              form: item.form,
              default_dose: item.defaultDose,
              unit: item.unit,
              schedule: item.schedule,
              active: item.active,
              ingredients: item.ingredients,
              evidence: item.evidence,
              route: item.route,
              cycle: item.cycle,
              history: item.history,
              updated_at: new Date().toISOString(),
            }));
            await supabase.from("stack_items").upsert(stackItems);
          }

          // Sync logs (only new ones usually, but here we'll upsert)
          if (state.logs.length > 0) {
            const logs = state.logs.slice(0, 50).map(l => ({
              user_id: user.id,
              id: l.id.includes("-") ? l.id : undefined,
              name: l.name,
              dose: l.dose,
              unit: l.unit,
              site: l.site,
              timestamp: l.timestamp,
              type: l.type,
            }));
            await supabase.from("logs").upsert(logs);
          }

          // Sync symptom logs
          if (state.symptomLogs.length > 0) {
            const symptoms = state.symptomLogs.slice(0, 50).map(s => ({
              user_id: user.id,
              id: s.id.includes("-") ? s.id : undefined,
              type: s.type,
              value: s.value,
              notes: s.notes,
              timestamp: s.timestamp,
            }));
            await supabase.from("symptom_logs").upsert(symptoms);
          }

          // Sync weight
          if (state.weightHistory.length > 0) {
            const weights = state.weightHistory.slice(0, 30).map(w => ({
              user_id: user.id,
              date: w.date,
              weight: w.weight,
              body_fat: w.bodyFat,
            }));
            await supabase.from("weight_history").upsert(weights, { onConflict: 'user_id,date' });
          }

        } catch (error) {
          console.error("Sync error:", error);
        }
      }, 3000); // 3 second debounce

      return () => clearTimeout(syncTimer);
    }, [state, user, isSyncing]);

    // Reminder scheduler for dose coach
    useEffect(() => {
      if (typeof window === "undefined") return;
      ensureNotificationChannels();
      initializeReminderScheduler(state, dispatch);
      return () => {
        clearReminderScheduler();
      };
    }, [state.profile.currentStack, state.reminderSettings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
