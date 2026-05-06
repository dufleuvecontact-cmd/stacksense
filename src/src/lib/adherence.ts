import { StackItem, LogEntry } from "./store";

export const calculateDailyAdherence = (
  date: Date,
  stackItems: StackItem[],
  logs: LogEntry[]
) => {
  const dateStr = date.toDateString();
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  const scheduledToday = stackItems.filter(
    (item) => item.active && item.schedule.days.includes(dayName)
  );

  const logsToday = logs.filter(
    (log) => new Date(log.timestamp).toDateString() === dateStr
  );

  // For each scheduled item, check if there is a corresponding log
  // This is a simple version: 1 log = 1 scheduled item taken
  // In a more complex version, we'd check time slots
  let takenCount = 0;
  const scheduledCount = scheduledToday.reduce((acc, item) => acc + item.schedule.times.length, 0);

  // Group logs by name to count multiple doses
  const logCounts: Record<string, number> = {};
  logsToday.forEach(log => {
    logCounts[log.name] = (logCounts[log.name] || 0) + 1;
  });

  scheduledToday.forEach(item => {
    const timesScheduled = item.schedule.times.length;
    const timesLogged = logCounts[item.name] || 0;
    takenCount += Math.min(timesScheduled, timesLogged);
  });

  return {
    scheduled: scheduledCount,
    taken: takenCount,
    percentage: scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 100
  };
};

export const calculateWeeklyAdherence = (
  stackItems: StackItem[],
  logs: LogEntry[]
) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  
  return days.map((day, index) => {
    const dayOffset = (today.getDay() + 6) % 7; // Adjust to Mon-Sun
    const dayDiff = index - dayOffset;
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + dayDiff);
    
    const { percentage } = calculateDailyAdherence(targetDate, stackItems, logs);
    return { day, value: percentage };
  });
};
