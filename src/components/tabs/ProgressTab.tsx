import React, { useState } from "react";
import { useApp, BloodworkEntry, StackItem } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  FileText,
  TrendingUp,
  Activity,
  Droplet,
  Plus,
  AlertTriangle,
  Layers,
  Lightbulb,
  BookOpen,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Lock,
  Calculator,
  Zap,
  Brain,
  Eye,
  BedDouble,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { calculateWeeklyAdherence } from "@/lib/adherence";
import { BioavailabilityCalculator } from "@/components/BioavailabilityCalculator";
import { BloodworkAnalysisCard } from "@/components/BloodworkAnalysisCard";

export function ProgressTab({ onShowPricing }: { onShowPricing?: () => void }) {
  const { state, dispatch } = useApp();
  const [showAddBloodwork, setShowAddBloodwork] = useState(false);
  const [newBloodwork, setNewBloodwork] = useState<{
    date: string;
    markers: { name: string; value: string; unit: string }[];
  }>({
    date: new Date().toISOString().split("T")[0],
    markers: [{ name: "", value: "", unit: "" }],
  });

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeightEntry, setNewWeightEntry] = useState({
    weight: "",
    bodyFat: "",
  });

  const adherenceData = calculateWeeklyAdherence(
    state.profile?.currentStack || [],
    state.logs || [],
  );
  const currentAdherence =
    adherenceData.find(
      (d) =>
        d.day === new Date().toLocaleDateString("en-US", { weekday: "short" }),
    )?.value || 0;

  // Legit Stack Insights Logic

  const generateInsights = () => {
    const insights: {
      type: "warning" | "info" | "success";
      title: string;
      description: string;
      icon: React.ReactNode;
    }[] = [];
    const stack = (state.profile?.currentStack || []).filter((i) => i.active);

    if (stack.length === 0) return [];

    // 1. Duplicate Ingredients
    const ingredientsCount: Record<string, string[]> = {};
    stack.forEach((item) => {
      item.ingredients?.forEach((ing) => {
        const normalized = ing.toLowerCase().trim();
        if (!ingredientsCount[normalized]) ingredientsCount[normalized] = [];
        ingredientsCount[normalized].push(item.name);
      });
    });

    Object.entries(ingredientsCount).forEach(([ing, items]) => {
      if (items.length > 1) {
        insights.push({
          type: "warning",
          title: `Redundant ${ing.charAt(0).toUpperCase() + ing.slice(1)}`,
          description: `Detected in ${items.join(" and ")}. Consider consolidating doses to avoid excessive intake.`,
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        });
      }
    });

    // 2. Synergy Checks
    const hasVitD = stack.some((i) =>
      i.name.toLowerCase().includes("vitamin d"),
    );
    const hasVitK = stack.some((i) =>
      i.name.toLowerCase().includes("vitamin k"),
    );
    if (hasVitD && !hasVitK) {
      insights.push({
        type: "info",
        title: "Synergy Opportunity: Vitamin K2",
        description:
          "Taking Vitamin D3 without K2 can lead to calcium being deposited in arteries rather than bones. Consider adding K2.",
        icon: <Lightbulb className="w-4 h-4 text-blue-500" />,
      });
    }

    // 3. Timing Checks
    const stimulants = [
      "caffeine",
      "coffee",
      "pre-workout",
      "modafinil",
      "adderall",
    ];
    const hasLateStimulants = stack.some(
      (i) =>
        stimulants.some((s) => i.name.toLowerCase().includes(s)) &&
        i.schedule.times.some(
          (t) => t.includes("PM") && !t.includes("12:00 PM"),
        ),
    );
    if (hasLateStimulants) {
      insights.push({
        type: "warning",
        title: "Sleep Architecture Risk",
        description:
          "Stimulants detected in PM schedule. This may significantly degrade sleep quality even if you can fall asleep.",
        icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      });
    }

    // 4. Success marker
    if (stack.length > 3 && insights.length === 0) {
      insights.push({
        type: "success",
        title: "Optimized Stack",
        description:
          "Your current stack shows no obvious redundancies or common interaction risks. Well organized!",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      });
    }

    return insights;
  };

  const stackInsights = generateInsights();

  const handleAddMarker = () => {
    setNewBloodwork((prev) => ({
      ...prev,
      markers: [...prev.markers, { name: "", value: "", unit: "" }],
    }));
  };

  const handleSaveBloodwork = () => {
    const entry: BloodworkEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: newBloodwork.date,
      markers: newBloodwork.markers
        .map((m) => ({
          name: m.name,
          value: parseFloat(m.value),
          unit: m.unit,
          status: "normal" as const, // Simplified for now
        }))
        .filter((m) => m.name && !isNaN(m.value)),
    };

    if (entry.markers.length === 0) {
      toast.error("Please add at least one valid marker");
      return;
    }

    dispatch({ type: "ADD_BLOODWORK", payload: entry });
    setShowAddBloodwork(false);
    setNewBloodwork({
      date: new Date().toISOString().split("T")[0],
      markers: [{ name: "", value: "", unit: "" }],
    });
    toast.success("Bloodwork added successfully");
  };

  const handleSaveWeight = () => {
    const w = parseFloat(newWeightEntry.weight);
    const bf = parseFloat(newWeightEntry.bodyFat);

    if (isNaN(w)) {
      toast.error("Please enter a valid weight");
      return;
    }

    dispatch({
      type: "ADD_WEIGHT_ENTRY",
      payload: {
        weight: w,
        bodyFat: isNaN(bf) ? undefined : bf,
      },
    });

    setShowAddWeight(false);
    setNewWeightEntry({ weight: "", bodyFat: "" });
    toast.success("Weight entry saved");
  };

  const weightData = (state.weightHistory || []).map((w) => ({
    name: w.date,
    weight: w.weight,
    bf: w.bodyFat || 0,
  }));

  return (
    <div className="h-full overflow-y-auto p-6 pb-24 space-y-6 dark:bg-zinc-950 pt-[env(safe-area-inset-top,1rem)]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-white">Progress</h1>
      </div>

      {/* Weight Chart */}
      <Card className="p-5 rounded-3xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal" />
            <h3 className="font-medium dark:text-white">
              Weight & Body Composition
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showAddWeight} onOpenChange={setShowAddWeight}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4 text-teal" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px] rounded-[2rem] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Log today's stats
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500">
                      Current Weight (kg)
                    </label>
                    <Input
                      type="number"
                      placeholder="75.0"
                      value={newWeightEntry.weight}
                      onChange={(e) =>
                        setNewWeightEntry((prev) => ({
                          ...prev,
                          weight: e.target.value,
                        }))
                      }
                      className="h-12 rounded-xl dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500">
                      Body Fat % (Optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="18.5"
                      value={newWeightEntry.bodyFat}
                      onChange={(e) =>
                        setNewWeightEntry((prev) => ({
                          ...prev,
                          bodyFat: e.target.value,
                        }))
                      }
                      className="h-12 rounded-xl dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold"
                    />
                  </div>
                  <Button
                    onClick={handleSaveWeight}
                    className="w-full h-12 bg-teal hover:bg-teal/90 text-white rounded-xl font-medium mt-2"
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <select className="text-[10px] bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 border-none rounded-lg p-1.5 font-bold outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
        <div className="relative h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006D77" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#006D77" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={state.theme === "dark" ? "#27272a" : "#f0f0f0"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
              />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  backgroundColor:
                    state.theme === "dark" ? "#18181b" : "#ffffff",
                  color: state.theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#006D77"
                fillOpacity={1}
                fill="url(#colorWeight)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around pt-2">
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">
              Starting
            </p>
            <p className="font-bold dark:text-white text-sm">
              {weightData[0]?.weight || 0} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">
              Current
            </p>
            <p className="font-bold text-teal text-sm">
              {weightData[weightData.length - 1]?.weight || 0} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">
              Change
            </p>
            <p
              className={`font-bold text-sm ${(weightData[weightData.length - 1]?.weight || 0) - (weightData[0]?.weight || 0) >= 0 ? "text-orange-500" : "text-emerald-500"}`}
            >
              {(
                (weightData[weightData.length - 1]?.weight || 0) -
                (weightData[0]?.weight || 0)
              ).toFixed(1)}{" "}
              kg
            </p>
          </div>
        </div>
      </Card>

      {/* Adherence Grid */}
      <Card className="p-5 rounded-3xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal" />
            <h3 className="font-medium dark:text-white">Dose Adherence</h3>
          </div>
        </div>
        <div className="relative">
          <div className="h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData}>
                <Bar
                  dataKey="value"
                  fill="#006D77"
                  radius={[6, 6, 6, 6]}
                  background={{
                    fill: state.theme === "dark" ? "#27272a" : "#f4f4f5",
                    radius: 6,
                  }}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#a1a1aa" }}
                />
                <YAxis hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="text-[11px] text-center text-zinc-500 font-medium">
          {Math.round(currentAdherence)}% adherence today.{" "}
          <span className="text-teal font-medium">
            {currentAdherence > 80 ? "On track." : "Keep logging."}
          </span>
        </p>
      </Card>

      {/* Bioavailability Calculator Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal" />
            <h3 className="font-medium dark:text-white">
              Bioavailability Calculator
            </h3>
          </div>
        </div>

        <div className="relative">
          <BioavailabilityCalculator />
        </div>
      </div>

      {/* Bloodwork Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-medium dark:text-white">Bloodwork History</h3>
          <Dialog open={showAddBloodwork} onOpenChange={setShowAddBloodwork}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-teal font-medium p-0 h-auto gap-1 hover:bg-transparent"
              >
                <Plus className="w-4 h-4" /> Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Add bloodwork results
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">
                    Test Date
                  </label>
                  <Input
                    type="date"
                    value={newBloodwork.date}
                    onChange={(e) =>
                      setNewBloodwork((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="rounded-xl dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-zinc-500">
                    Markers
                  </label>
                  {newBloodwork.markers.map((marker, i) => {
                    const updateMarker = (
                      field: keyof typeof marker,
                      val: string,
                    ) => {
                      const updated = [...newBloodwork.markers];
                      updated[i] = { ...updated[i], [field]: val };
                      setNewBloodwork((prev) => ({
                        ...prev,
                        markers: updated,
                      }));
                    };

                    return (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Name (e.g. Testo)"
                            value={marker.name}
                            onChange={(e) =>
                              updateMarker("name", e.target.value)
                            }
                            className="rounded-xl h-9 text-xs dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <Input
                            placeholder="Value"
                            type="number"
                            value={marker.value}
                            onChange={(e) =>
                              updateMarker("value", e.target.value)
                            }
                            className="rounded-xl h-9 text-xs dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                          />
                        </div>
                        <div className="w-16 space-y-1">
                          <Input
                            placeholder="Unit"
                            value={marker.unit}
                            onChange={(e) =>
                              updateMarker("unit", e.target.value)
                            }
                            className="rounded-xl h-9 text-xs dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMarker}
                    className="w-full rounded-xl border-dashed"
                  >
                    + Add Marker
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSaveBloodwork}
                className="w-full bg-teal hover:bg-teal/90 text-white rounded-xl font-medium"
              >
                Save entry
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <div className="space-y-3">
            {(state.bloodworkHistory || []).length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">
                  No bloodwork recorded yet.
                </p>{" "}
              </div>
            ) : (
              (state.bloodworkHistory || []).map((entry) => (
                <Card
                  key={entry.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm dark:text-zinc-200">
                        Panel Results
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      onClick={() =>
                        dispatch({
                          type: "DELETE_BLOODWORK",
                          payload: entry.id,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {entry.markers.map((marker, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl flex justify-between items-center"
                      >
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                          {marker.name}
                        </span>
                        <span className="text-xs font-bold dark:text-white">
                          {marker.value}{" "}
                          <span className="text-[9px] font-normal text-zinc-400">
                            {marker.unit}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Bloodwork Analysis */}
      <BloodworkAnalysisCard onShowPricing={onShowPricing} />

      {/* Legit Stack Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal" />
            <h3 className="font-medium dark:text-white">Stack Insights</h3>
          </div>
        </div>
        <div className="relative">
          <div className="space-y-3">
            {stackInsights.length === 0 ? (
              <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-3xl text-center">
                <Lightbulb className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">
                  Add active items to your stack to see automated health
                  insights and interactions.
                </p>
              </Card>
            ) : (
              stackInsights.map((insight, i) => (
                <Card
                  key={i}
                  className={`p-4 border-none rounded-2xl space-y-2 ${
                    insight.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-900/10"
                      : insight.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/10"
                        : "bg-blue-50 dark:bg-blue-900/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {insight.icon}
                      <span
                        className={`font-bold text-xs ${
                          insight.type === "warning"
                            ? "text-amber-700 dark:text-amber-400"
                            : insight.type === "success"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {insight.title}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[8px] uppercase border-current opacity-50"
                    >
                      Auto-Detected
                    </Badge>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      insight.type === "warning"
                        ? "text-amber-800/80 dark:text-amber-200/60"
                        : insight.type === "success"
                          ? "text-emerald-800/80 dark:text-emerald-200/60"
                          : "text-blue-800/80 dark:text-blue-200/60"
                    }`}
                  >
                    {insight.description}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Symptom Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal" />
            <h3 className="font-medium dark:text-white">Symptom Analytics</h3>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Energy",
                    color: "text-amber-500",
                    border: "border-amber-100 dark:border-amber-900/30",
                    icon: Zap,
                    val: "7.4",
                  },
                  {
                    label: "Mood",
                    color: "text-violet-500",
                    border: "border-violet-100 dark:border-violet-900/30",
                    icon: Brain,
                    val: "6.8",
                  },
                  {
                    label: "Focus",
                    color: "text-sky-500",
                    border: "border-sky-100 dark:border-sky-900/30",
                    icon: Eye,
                    val: "8.1",
                  },
                  {
                    label: "Sleep",
                    color: "text-indigo-500",
                    border: "border-indigo-100 dark:border-indigo-900/30",
                    icon: BedDouble,
                    val: "7.2",
                  },
                ].map(({ label, color, border, icon: Icon, val }) => (
                  <div
                    key={label}
                    className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border ${border}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide ${color}`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-xl font-black text-zinc-800 dark:text-zinc-100">
                      {val}
                      <span className="text-xs font-normal text-zinc-400 ml-0.5">
                        /10
                      </span>
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">7-day avg</p>
                  </div>
                ))}
              </div>
              <div className="h-16 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800" />
            </div>
          </div>

          {(() => {
            const logs = state.symptomLogs || [];
            const types = ["Energy", "Mood", "Focus", "Sleep"] as const;
            const typeConfig = {
              Energy: {
                color: "#f59e0b",
                bg: "bg-amber-50 dark:bg-amber-900/20",
                textColor: "text-amber-500",
                icon: Zap,
              },
              Mood: {
                color: "#8b5cf6",
                bg: "bg-violet-50 dark:bg-violet-900/20",
                textColor: "text-violet-500",
                icon: Brain,
              },
              Focus: {
                color: "#0ea5e9",
                bg: "bg-sky-50 dark:bg-sky-900/20",
                textColor: "text-sky-500",
                icon: Eye,
              },
              Sleep: {
                color: "#6366f1",
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
                textColor: "text-indigo-500",
                icon: BedDouble,
              },
            };

            const avgByType = types.map((type) => {
              const typeLogs = logs.filter((l: any) => l.type === type);
              const avg =
                typeLogs.length > 0
                  ? (
                      typeLogs.reduce((s: number, l: any) => s + l.value, 0) /
                      typeLogs.length
                    ).toFixed(1)
                  : null;
              return { type, avg, count: typeLogs.length };
            });

            // Build last 7 days chart data
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dayKey = d.toDateString();
              const label = d.toLocaleDateString("en-US", { weekday: "short" });
              const entry: Record<string, any> = { day: label };
              types.forEach((type) => {
                const dayLogs = logs.filter(
                  (l: any) =>
                    l.type === type &&
                    new Date(l.timestamp).toDateString() === dayKey,
                );
                entry[type] =
                  dayLogs.length > 0
                    ? Math.round(
                        dayLogs.reduce((s: number, l: any) => s + l.value, 0) /
                          dayLogs.length,
                      )
                    : null;
              });
              return entry;
            });

            return (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-3xl text-center">
                    <Activity className="w-6 h-6 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500 font-medium">
                      No symptom data yet.
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Log Energy, Mood, Focus, and Sleep from the Today tab.
                    </p>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {avgByType.map(({ type, avg, count }) => {
                        const cfg = typeConfig[type];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={type}
                            className={`p-4 ${cfg.bg} rounded-2xl`}
                          >
                            <div className="flex items-center gap-1.5 mb-2">
                              <Icon
                                className={`w-3.5 h-3.5 ${cfg.textColor}`}
                              />
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider ${cfg.textColor}`}
                              >
                                {type}
                              </span>
                            </div>
                            <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
                              {avg ?? "—"}
                              {avg && (
                                <span className="text-xs font-normal text-zinc-400 ml-0.5">
                                  /10
                                </span>
                              )}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-medium mt-0.5">
                              {count} logs total
                            </p>{" "}
                          </div>
                        );
                      })}
                    </div>

                    <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                        7-Day Trend
                      </p>
                      <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={last7}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={
                                state.theme === "dark" ? "#27272a" : "#f0f0f0"
                              }
                            />
                            <XAxis
                              dataKey="day"
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fontSize: 9,
                                fill: "#a1a1aa",
                                fontWeight: "bold",
                              }}
                            />
                            <YAxis hide domain={[0, 10]} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                backgroundColor:
                                  state.theme === "dark"
                                    ? "#18181b"
                                    : "#ffffff",
                                fontSize: 11,
                              }}
                            />
                            {types.map((type) => (
                              <Line
                                key={type}
                                type="monotone"
                                dataKey={type}
                                stroke={typeConfig[type].color}
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {types.map((type) => (
                          <div key={type} className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: typeConfig[type].color,
                              }}
                            />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">
                              {type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Educational Snippets Section */}
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-teal" />
          <h3 className="font-medium dark:text-white">Learn More</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              title: "Bioavailability",
              text: "Absorption rates vary significantly. For example, curcumin needs piperine for meaningfully better uptake.",
            },
            {
              title: "Half-Life Basics",
              text: "Compounds clear your system at different rates. Split dosing can help maintain more stable blood levels.",
            },
          ].map((snippet, i) => (
            <Card
              key={i}
              className="p-4 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-teal/30 dark:hover:border-teal/50 transition-all group cursor-pointer"
              onClick={() => dispatch({ type: "SET_TAB", payload: "insights" })}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-zinc-200">
                    {snippet.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {snippet.text}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-teal group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-center text-zinc-400 py-4">
        For informational purposes only. Not medical advice.
      </p>
    </div>
  );
}
