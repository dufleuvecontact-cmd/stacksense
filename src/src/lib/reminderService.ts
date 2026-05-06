import { ReminderSettings, ReminderTimeWindow, ReminderWindowKey, StackItem, StackBlockCompletion } from "./store";
import { Dispatch } from "react";

export type ReminderAction = {
  type: "SET_TAB" | "SET_ACTIVE_REMINDER_BLOCK" | "ADD_LOG" | "ADD_REMINDER_COMPLETION";
  payload: any;
};

let schedulerInterval: number | null = null;

export const MOCK_NOTIFICATION_CHANNEL = "stacksense_reminder_channel";

function parseTimeHHmm(value: string) {
  const [hours, minutes] = value.split(":").map((v) => Number(v));
  return { hours, minutes };
}

function withinTimeWindow(now: Date, window: ReminderTimeWindow) {
  const start = parseTimeHHmm(window.start);
  const end = parseTimeHHmm(window.end);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = start.hours * 60 + start.minutes;
  const endMins = end.hours * 60 + end.minutes;

  return nowMins >= startMins && nowMins <= endMins;
}

function calculateTimeCategory(timeStr: string): ReminderWindowKey {
  const normalized = timeStr.trim().toLowerCase();
  if (["morning"].includes(normalized)) return "Morning";
  if (["afternoon", "midday", "pre-workout", "post-workout"].includes(normalized)) return "Midday";
  if (["evening"].includes(normalized)) return "Evening";
  if (["night", "bedtime"].includes(normalized)) return "Bedtime";

  const parts = timeStr.split(" ");
  if (parts.length < 2) return "Morning";
  const [clock, meridian] = parts;
  const [h] = clock.split(":").map((v) => Number(v));
  let hours = Number.isNaN(h) ? 7 : h;
  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  if (hours >= 5 && hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Midday";
  if (hours >= 17 && hours < 21) return "Evening";
  return "Bedtime";
}

export function getBlockItems(stackItems: StackItem[], day: string) {
  const now = new Date();
  const todayKey = day;
  const blocks: Record<ReminderWindowKey, StackItem[]> = {
    Morning: [],
    Midday: [],
    Evening: [],
    Bedtime: [],
  };

  stackItems
    .filter((item) => item.active && item.schedule.reminderEnabled !== false && item.schedule.days?.includes(todayKey))
    .forEach((item) => {
      const targets = item.schedule.times || [];
      if (targets.length === 0) {
        blocks.Morning.push(item);
        return;
      }
      targets.forEach((t) => {
        const category = calculateTimeCategory(t);
        if (!blocks[category]) blocks.Midday.push(item);
        else blocks[category].push(item);
      });
    });

  // Deduplicate
  Object.keys(blocks).forEach((key) => {
    const set = new Set<string>();
    blocks[key as ReminderWindowKey] = blocks[key as ReminderWindowKey].filter((item) => {
      if (set.has(item.id)) return false;
      set.add(item.id);
      return true;
    });
  });

  return blocks;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

function getSentReminderState(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem("stacksense_reminder_sent") || "{}";
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setSentReminderState(state: Record<string, string[]>) {
  try {
    localStorage.setItem("stacksense_reminder_sent", JSON.stringify(state));
  } catch {
    // ignore
  }
}

function markBlockSentToday(blockId: ReminderWindowKey) {
  const day = getTodayKey();
  const state = getSentReminderState();
  state[day] = state[day] || [];
  if (!state[day].includes(blockId)) state[day].push(blockId);
  setSentReminderState(state);
}

function hasBlockBeenSentToday(blockId: ReminderWindowKey) {
  const day = getTodayKey();
  const state = getSentReminderState();
  return state[day]?.includes(blockId);
}

function getTodaysSentCount() {
  const day = getTodayKey();
  const state = getSentReminderState();
  return (state[day] || []).length;
}

async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "default";
  if (!("Notification" in window)) return "denied";

  if (Notification.permission === "granted") return "granted";

  return await Notification.requestPermission();
}

function sendWebNotification(title: string, body: string, onClick?: () => void) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  try {
    const options: NotificationOptions = {
      body,
      tag: "stacksense-stack-reminder",
      renotify: false,
      data: { receivedAt: Date.now() },
      requireInteraction: false,
      silent: false,
      actions: [
        { action: "mark_done", title: "Mark done" },
        { action: "snooze", title: "Snooze" },
      ],
    };

    const notification = new Notification(title, options);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (onClick) onClick();
    };

    notification.onclose = () => {
      // no-op
    };
  } catch (error) {
    console.warn("Unable to show notification", error);
  }
}

function sendReminderNotification(
  blockId: ReminderWindowKey,
  items: StackItem[],
  dispatch: Dispatch<ReminderAction>,
  snoozeMinutes = 15
) {
  const itemNames = items.map((i) => i.name).slice(0, 5).join(" + ");
  const title = `Time for your ${blockId} Stack`;
  const line = itemNames ? `${itemNames}` : "Open the app to review your stack";

  // NOTE: For Expo / React Native, replace this with expo-notifications module call.
  sendWebNotification(title, line, () => {
    dispatch({ type: "SET_TAB", payload: "dashboard" });
    dispatch({ type: "SET_ACTIVE_REMINDER_BLOCK", payload: blockId });
  });

  markBlockSentToday(blockId);
  if (snoozeMinutes > 0) {
    // Provide a default built-in snooze path to continue workflow with one click; real mobile actions should be sourced from native action callbacks.
    const snoozeKey = `stacksense_snooze_${blockId}_${Date.now()}`;
    const snooze = () => {
      setTimeout(() => {
        if (!hasBlockBeenSentToday(blockId)) {
          sendReminderNotification(blockId, items, dispatch, 0);
        }
      }, snoozeMinutes * 60 * 1000);
    };
    localStorage.setItem(snoozeKey, String(Date.now()));
    // Create a short message in console for debugging.
    console.log(`Reminder for ${blockId} snoozed ${snoozeMinutes} minutes`);
    return snooze;
  }

  return null;
}

export function scheduleSnooze(blockId: ReminderWindowKey, minutes: number, state: any, dispatch: Dispatch<ReminderAction>) {
  const bots = getBlockItems(state.profile.currentStack, new Date().toLocaleDateString("en-US", { weekday: "short" }));
  const items = bots[blockId] || [];
  setTimeout(() => {
    sendReminderNotification(blockId, items, dispatch, 0);
  }, Math.max(1, minutes) * 60 * 1000);
}

export function clearReminderScheduler() {
  if (schedulerInterval !== null) {
    window.clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

export async function initializeReminderScheduler(state: any, dispatch: Dispatch<ReminderAction>) {
  if (typeof window === "undefined") return;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("Notifications not granted", permission);
    return;
  }

  if (schedulerInterval !== null) {
    window.clearInterval(schedulerInterval);
  }

  schedulerInterval = window.setInterval(() => {
    if (!state.reminderSettings?.enabled) return;

    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    const blocks = getBlockItems(state.profile.currentStack, today);
    const maxPerDay = state.reminderSettings.maxRemindersPerDay || 3;
    const sentCount = getTodaysSentCount();

    if (sentCount >= maxPerDay) return;

    Object.values(state.reminderSettings.windows).forEach((windowDefinition: any) => {
      const blockId = windowDefinition.id as ReminderWindowKey;
      const items = blocks[blockId] || [];
      if (!items.length) return;

      if (hasBlockBeenSentToday(blockId)) return;
      if (!withinTimeWindow(new Date(), windowDefinition)) return;

      sendReminderNotification(blockId, items, dispatch, state.reminderSettings.snoozeMinutes);

      if (getTodaysSentCount() >= maxPerDay) return;
    });
  }, 30 * 1000); // evaluate every 30 seconds
}

export function getReminderTimeWindowsFromDefault() {
  return [
    { id: "Morning", start: "07:00", end: "09:00" },
    { id: "Midday", start: "12:00", end: "14:00" },
    { id: "Evening", start: "18:00", end: "20:00" },
  ];
}

export function cancelAllScheduledReminders() {
  clearReminderScheduler();
  // no-native support in browser from this module; rely on service worker implementation in mobile if needed.
}

export function isNotificationAvailable() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function ensureNotificationChannels() {
  // For Android native / React Native Expo: create channel with proper importance.
  // For web we use browser Notification API default channel.
  if (window && "navigator" in window) {
    console.log("Reminder channel ensured: ", MOCK_NOTIFICATION_CHANNEL);
  }
}
