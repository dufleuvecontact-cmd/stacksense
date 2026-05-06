"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp, StackItem } from "@/lib/store";
import { LIBRARY, LibraryItem } from "@/lib/library";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Pill, 
  FlaskConical, 
  ShieldAlert, 
  Plus,
  Check,
  Search,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ["Supplement", "Peptide"] as const;
const FORMS = ["Capsule", "Tablet", "Powder", "Liquid", "Softgel", "Injection", "Nasal Spray", "Topical"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Morning", "Afternoon", "Evening", "Bedtime", "Pre-workout", "Post-workout"];

import { calculateEstimatedDose, DoseRecommendation } from "@/lib/dosing";

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
    const { state, dispatch } = useApp();
    const [category, setCategory] = useState<"Supplement" | "Peptide" | "Compound">("Supplement");
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [form, setForm] = useState("Capsule");
    const [dose, setDose] = useState("");
    const [unit, setUnit] = useState("mg");
    const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
    const [selectedTimes, setSelectedTimes] = useState<string[]>(["Morning"]);
    const [selectedContext, setSelectedContext] = useState<Array<"with food" | "pre-workout" | "bedtime">>([]);
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "cycle">("daily");
    const [itemReminderEnabled, setItemReminderEnabled] = useState(true);
    const [cycleConfig, setCycleConfig] = useState({ onDays: 5, offDays: 2 });
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [existingItem, setExistingItem] = useState<StackItem | null>(null);
    const [recommendation, setRecommendation] = useState<DoseRecommendation | null>(null);
    
    // Library Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [showLibrary, setShowLibrary] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Update recommendation whenever name changes
    useEffect(() => {
      if (name) {
        const rec = calculateEstimatedDose(name, state.profile);
        setRecommendation(rec);
      } else {
        setRecommendation(null);
      }
    }, [name, state.profile]);

    const filteredLibrary = LIBRARY.filter(item => 
      item.category === category && 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSaveDisabled = !name || !dose;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setShowLibrary(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectLibraryItem = (item: LibraryItem) => {
      setName(item.name);
      setCategory(item.category);
      setForm(item.defaultForm);
      setUnit(item.defaultUnit);
      if (item.defaultDose) setDose(item.defaultDose);
      setSearchQuery(item.name);
      setShowLibrary(false);

      // Check for duplicates immediately
      const duplicate = state.profile.currentStack.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      if (duplicate) {
        setExistingItem(duplicate);
        setShowDuplicateWarning(true);
      }
    };

    const handleCustomEntry = () => {
      setName(searchQuery);
      setShowLibrary(false);
      
      const duplicate = state.profile.currentStack.find(i => i.name.toLowerCase() === searchQuery.toLowerCase());
      if (duplicate) {
        setExistingItem(duplicate);
        setShowDuplicateWarning(true);
      }
    };

    const handleSave = () => {
      if (isSaveDisabled) return;

      const newItem: StackItem = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        category,
        brand,
        form,
        defaultDose: dose,
        unit,
        schedule: {
          days: itemReminderEnabled ? selectedDays : [],
          times: itemReminderEnabled ? selectedTimes : [],
          context: itemReminderEnabled ? selectedContext : [],
          frequency,
          cycle: frequency === "cycle" ? { onDays: cycleConfig.onDays, offDays: cycleConfig.offDays, startDate: new Date().toISOString().split("T")[0] } : undefined,
          reminderEnabled: itemReminderEnabled,
        },
        active: true,
        ingredients: [`${name} ${dose}${unit}`],
        evidence: category === "Peptide" 
          ? "Peptide tracking is for logging only. Consult a professional." 
          : "Standard dietary supplement.",
        ...(category === "Peptide" && {
          route: form === "Injection" ? "Subcutaneous" : "Oral",
          cycle: "Continuous",
          history: []
        })
      };

      dispatch({ type: "ADD_STACK_ITEM", payload: newItem });
      toast.success(`${name} added to stack`);
      resetForm();
      onClose();
    };


    const resetForm = () => {
      setName("");
      setSearchQuery("");
      setBrand("");
      setDose("");
      setSelectedTimes(["Morning"]);
      setSelectedContext([]);
      setFrequency("daily");
      setCycleConfig({ onDays: 5, offDays: 2 });
      setCategory("Supplement");
      setForm("Capsule");
      setUnit("mg");
      setItemReminderEnabled(true);
    }; 

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border-t dark:border-zinc-800"
            >
              <AnimatePresence>
                {showDuplicateWarning && existingItem && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-[90] bg-white dark:bg-zinc-950 p-8 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-[2rem] flex items-center justify-center">
                      <ShieldAlert className="w-10 h-10 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black dark:text-white">Duplicate Found</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        You already have <span className="font-bold text-zinc-900 dark:text-zinc-200">"{existingItem.name}"</span> in your stack.
                      </p>
                    </div>

                    <div className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 space-y-4 border border-zinc-100 dark:border-zinc-800">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <span>Comparison</span>
                        <span>Existing Item</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm font-bold dark:text-zinc-300">Dose</span>
                        <span className="text-sm font-black text-teal">{existingItem.defaultDose}{existingItem.unit}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm font-bold dark:text-zinc-300">Schedule</span>
                        <span className="text-sm font-black text-teal">{existingItem.schedule.days.length} Days/week</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-bold dark:text-zinc-300">Times</span>
                        <span className="text-sm font-black text-teal">{existingItem.schedule.times.join(", ")}</span>
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                      <Button 
                        onClick={() => {
                          setShowDuplicateWarning(false);
                          resetForm();
                          onClose();
                        }}
                        className="w-full h-14 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-2xl font-bold"
                      >
                        GOT IT, CANCEL THIS
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => setShowDuplicateWarning(false)}
                        className="text-zinc-400 font-bold"
                      >
                        Add anyway (I know what I'm doing)
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="px-6 pt-8 pb-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Add to Stack</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </Button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Category Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setUnit(cat === "Peptide" ? "mcg" : "mg");
                      if (cat === "Peptide") setForm("Injection");
                      else setForm("Capsule");
                      setSearchQuery("");
                      setName("");
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      category === cat
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-500"
                    }`}
                  >
                    {cat === "Supplement" ? (
                      <Pill className="w-4 h-4" />
                    ) : (
                      <FlaskConical className="w-4 h-4" />
                    )}
                    {cat}
                  </button>
                ))}
              </div>

              {category === "Peptide" && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
                    Peptide tracking is strictly for personal logging. StackSense does not provide dosing protocols or medical advice.
                  </p>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2 relative" ref={searchRef}>
                  <Label htmlFor="name" className="text-xs font-bold text-zinc-400 uppercase">Search {category} Library *</Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="name"
                      placeholder={`Search ${category.toLowerCase()}s...`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowLibrary(true);
                      }}
                      onFocus={() => setShowLibrary(true)}
                      className="h-12 pl-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-teal font-medium dark:text-white"
                    />
                  </div>

                  <AnimatePresence>
                    {showLibrary && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 z-[80] overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {searchQuery && (
                          <button
                            onClick={handleCustomEntry}
                            className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 border-b border-zinc-50 dark:border-zinc-800 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                              <Plus className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">Add custom: "{searchQuery}"</p>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold">New manual entry</p>
                            </div>
                          </button>
                        )}
                        
                        {filteredLibrary.length > 0 ? (
                          filteredLibrary.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => handleSelectLibraryItem(item)}
                              className="w-full px-4 py-3 text-left hover:bg-teal/5 dark:hover:bg-teal/10 flex items-center gap-3 border-b border-zinc-50 dark:border-zinc-800 last:border-0 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                                {category === "Supplement" ? <Pill className="w-4 h-4 text-teal" /> : <Sparkles className="w-4 h-4 text-teal" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</p>
                                <p className="text-[10px] text-zinc-400 uppercase font-bold">{item.defaultForm} • Typical: {item.defaultDose}{item.defaultUnit}</p>
                              </div>
                            </button>
                          ))
                        ) : searchQuery && filteredLibrary.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-zinc-400">No matches found in library.</p>
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-900/50">
                            Common {category}s
                          </div>
                        )}

                        {!searchQuery && LIBRARY.filter(i => i.category === category).slice(0, 5).map(item => (
                          <button
                            key={item.name}
                            onClick={() => handleSelectLibraryItem(item)}
                            className="w-full px-4 py-3 text-left hover:bg-teal/5 dark:hover:bg-teal/10 flex items-center gap-3 border-b border-zinc-50 dark:border-zinc-800 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              {category === "Supplement" ? <Pill className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> : <Sparkles className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                            </div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase">Brand (Optional)</Label>
                    <Input
                      placeholder="e.g., Thorne"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-teal font-medium dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase">Form</Label>
                    <Select value={form} onValueChange={setForm}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-teal font-medium dark:text-white">
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                        {FORMS.map((f) => (
                          <SelectItem key={f} value={f} className="dark:text-white focus:bg-teal/5 dark:focus:bg-teal/10">{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase">Default Dose *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-teal pr-12 font-bold dark:text-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                        {unit}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-teal font-medium dark:text-white">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                        {["mg", "mcg", "g", "IU", "ml", "drops", "units", "spray"].map(u => (
                          <SelectItem key={u} value={u} className="dark:text-white focus:bg-teal/5 dark:focus:bg-teal/10">{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                </div>

                {recommendation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-teal/5 dark:bg-teal/900/10 border border-teal/10 dark:border-teal/900/30 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal" />
                        <span className="text-xs font-bold text-teal uppercase tracking-tight">Smart Recommendation</span>
                      </div>
                      <Badge variant="outline" className="bg-teal text-white border-none text-[8px] h-4">STX AI</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black dark:text-white">
                          {recommendation.dose}{recommendation.unit} <span className="text-xs font-bold text-zinc-400">/ {recommendation.frequency}</span>
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium leading-tight">
                          {recommendation.note}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setDose(recommendation.dose.toString());
                          setUnit(recommendation.unit);
                          toast.success("Applied recommended dose");
                        }}
                        className="bg-teal hover:bg-teal/90 text-white rounded-xl h-8 text-[10px] font-bold"
                      >
                        APPLY
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Schedule */}

              <div className="space-y-4">
                <Label className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Schedule
                </Label>

                <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Enable item reminder</p>
                    <p className="text-[10px] text-zinc-400">When off, this item is not included in reminder block notifications.</p>
                  </div>
                  <Switch checked={itemReminderEnabled} onCheckedChange={setItemReminderEnabled} />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                      onClick={() => itemReminderEnabled && toggleDay(day)}
                      disabled={!itemReminderEnabled}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          selectedDays.includes(day)
                            ? "bg-teal text-white shadow-md shadow-teal/20"
                            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                        } ${!itemReminderEnabled ? "opacity-40 cursor-not-allowed" : "hover:border-teal/50"}`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Times</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map((time) => (
                      <button
                        key={time}
                        onClick={() => itemReminderEnabled && toggleTime(time)}
                        disabled={!itemReminderEnabled}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${
                          selectedTimes.includes(time)
                            ? "bg-teal/10 text-teal border border-teal/20 dark:bg-teal/20 dark:border-teal/50"
                            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                        } ${!itemReminderEnabled ? "opacity-40 cursor-not-allowed" : "hover:bg-teal/5 dark:hover:bg-teal/20"}`}
                      >
                        {selectedTimes.includes(time) && <Check className="w-3 h-3" />}
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Context flags</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "with food", label: "With Food" },
                      { id: "pre-workout", label: "Pre-workout" },
                      { id: "bedtime", label: "Bedtime" },
                    ].map((ctx) => (
                      <button
                        key={ctx.id}
                        onClick={() => {
                          if (!itemReminderEnabled) return;
                          setSelectedContext((prev) =>
                            prev.includes(ctx.id as any)
                              ? prev.filter((c) => c !== ctx.id)
                              : [...prev, ctx.id as any]
                          );
                        }}
                        disabled={!itemReminderEnabled}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${
                          selectedContext.includes(ctx.id as any)
                            ? "bg-amber-200 text-amber-800 border border-amber-300"
                            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                        } ${!itemReminderEnabled ? "opacity-40 cursor-not-allowed" : "hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
                      >
                        {selectedContext.includes(ctx.id as any) && <Check className="w-3 h-3" />}
                        {ctx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Frequency</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Selected days" },
                      { value: "cycle", label: "Cycling" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFrequency(option.value as any)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${
                          frequency === option.value
                            ? "bg-teal/10 text-teal border border-teal/20"
                            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                        }`}
                      >
                        {frequency === option.value ? <Check className="w-3 h-3" /> : null} {option.label}
                      </button>
                    ))}
                  </div>

                  {frequency === "cycle" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label className="text-[10px] text-zinc-500">On days</label>
                      <label className="text-[10px] text-zinc-500">Off days</label>
                      <input
                        type="number"
                        value={cycleConfig.onDays}
                        onChange={(e) => setCycleConfig((prev) => ({ ...prev, onDays: Number(e.target.value) }))}
                        className="h-9 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
                        min={1}
                      />
                      <input
                        type="number"
                        value={cycleConfig.offDays}
                        onChange={(e) => setCycleConfig((prev) => ({ ...prev, offDays: Number(e.target.value) }))}
                        className="h-9 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
                        min={1}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              {limitReached && (
                <p className="text-[11px] text-amber-600 font-bold text-center mb-4 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">
                  Free plan limit reached (8 items). Upgrade for unlimited slots.
                </p>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`w-full h-14 rounded-2xl font-bold text-base transition-all ${
                  isSaveDisabled 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed" 
                    : "bg-teal hover:bg-teal/90 text-white shadow-lg shadow-teal/20"
                }`}
              >
                {limitReached ? "Limit Reached" : "Save to Stack"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
