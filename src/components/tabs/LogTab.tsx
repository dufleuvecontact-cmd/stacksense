"use client";

import React, { useState } from "react";
import { useApp, StackItem } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pill, FlaskConical, ChevronRight, Pause, Play, Trash2, Clock, ExternalLink, ShieldAlert, ShieldCheck, ArrowLeft, Layers, Sparkles, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddItemModal } from "@/components/AddItemModal";
import { useSubscriptionContext as useSubscription } from "@/hooks/SubscriptionContext";
import { toast } from "sonner";

const REMINDER_WINDOW_OPTIONS = ["Morning", "Midday", "Evening", "Bedtime"] as const;

export function LogTab({ onShowPricing }: { onShowPricing?: () => void }) {
  const { state, dispatch } = useApp();
  const { isPremium } = useSubscription();
  const [selectedItem, setSelectedItem] = useState<StackItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentStack = state.profile.currentStack || [];

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const filteredStack = currentStack.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supplements = filteredStack.filter(item => item.category === "Supplement");
  const peptides = filteredStack.filter(item => item.category === "Peptide");

  const renderItemCard = (item: StackItem) => (
    <Card 
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="p-4 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-teal/30 dark:hover:border-teal/50 transition-all cursor-pointer rounded-2xl shadow-sm mb-3 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          item.category === "Peptide" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : "bg-teal/5 dark:bg-teal/10 text-teal"
        }`}>
          {item.category === "Peptide" ? <FlaskConical className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
            {!item.active && <Badge variant="secondary" className="text-[8px] h-4 dark:bg-zinc-800 dark:text-zinc-400">Paused</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.defaultDose}{item.unit} - {item.schedule.times.join(", ") || "No time set"}
          </p>
          <p className="text-[10px] text-zinc-400">
            Reminder: {item.schedule.reminderEnabled === false ? "Off" : "On"}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-teal transition-colors" />
      </div>
    </Card>
  );

  const handleDelete = (id: string) => {
    const name = currentStack.find(i => i.id === id)?.name ?? "Item";
    dispatch({ type: "DELETE_STACK_ITEM", payload: id });
    setSelectedItem(null);
    toast.success(`${name} removed from stack`);
  };

  const handleToggleActive = (item: StackItem) => {
    dispatch({ 
      type: "UPDATE_STACK_ITEM", 
      payload: { ...item, active: !item.active } 
    });
    setSelectedItem({ ...item, active: !item.active });
    toast.success(item.active ? "Stack item paused" : "Stack item resumed");
  };

  const handleToggleItemReminder = (item: StackItem) => {
    const reminderEnabled = item.schedule.reminderEnabled === false ? true : false;
    const updatedItem: StackItem = {
      ...item,
      schedule: {
        ...item.schedule,
        reminderEnabled,
        days: reminderEnabled ? item.schedule.days : [],
        times: reminderEnabled ? item.schedule.times : [],
        context: reminderEnabled ? item.schedule.context : [],
      },
    };

    dispatch({ type: "UPDATE_STACK_ITEM", payload: updatedItem });
    if (selectedItem?.id === item.id) setSelectedItem(updatedItem);
    toast.success(`Reminder ${reminderEnabled ? "enabled" : "disabled"} for ${item.name}`);
  };



  const handleToggleReminderWindow = (item: StackItem, windowName: string) => {
    const newTimes = item.schedule.times.includes(windowName)
      ? item.schedule.times.filter((t) => t !== windowName)
      : [...item.schedule.times, windowName];

    const updatedItem: StackItem = {
      ...item,
      schedule: {
        ...item.schedule,
        reminderEnabled: true,
        times: newTimes,
      },
    };

    dispatch({ type: "UPDATE_STACK_ITEM", payload: updatedItem });
    if (selectedItem?.id === item.id) setSelectedItem(updatedItem);
    toast.success(`${updatedItem.name} reminder time updated`);
  };

    return (
      <div className="h-full overflow-y-auto pb-24 dark:bg-zinc-950 group/stack pt-[env(safe-area-inset-top,1rem)]">
        <div className="px-6 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-500 sticky top-0 z-30">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Stack</h1>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline"
              onClick={() => {
                toast.info("Protocol templates coming soon.");
              }}
              className="rounded-xl h-10 px-3 gap-2 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300"
            >
              <ClipboardList className="w-4 h-4" />
            </Button>

            <Button 
              onClick={handleAddClick}
              className="bg-teal hover:bg-teal/90 text-white rounded-xl h-10 px-4 font-medium gap-2 shadow-lg shadow-teal/10"
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search your stack..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none focus-visible:ring-teal dark:text-white"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {supplements.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Supplements</h3>
            {supplements.map(renderItemCard)}
          </section>
        )}

        {peptides.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Peptides & Therapies</h3>
              <Badge variant="outline" className="text-[8px] text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">Logging Only</Badge>
            </div>
            {peptides.map(renderItemCard)}
          </section>
        )}

        {currentStack.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Your stack is empty</p>
                <p className="text-xs text-zinc-400">Add a supplement or peptide to begin tracking.</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold dark:text-zinc-300"
            >
              Add Item
            </Button>
          </div>
        )}
      </div>

      <AddItemModal isOpen={isAdding} onClose={() => setIsAdding(false)} />

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border-t dark:border-zinc-800"
            >
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className={`border-none px-0 font-bold uppercase tracking-widest text-[10px] ${
                      selectedItem.category === "Peptide" ? "text-amber-600 dark:text-amber-400" : "text-teal"
                    }`}>
                      {selectedItem.category}
                    </Badge>
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">{selectedItem.name}</h2>
                    {selectedItem.brand && <p className="text-xs text-zinc-400 dark:text-zinc-500">{selectedItem.brand}</p>}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <ArrowLeft className="w-6 h-6 text-zinc-400" />
                  </Button>
                </div>

                {selectedItem.category === "Peptide" && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                      <strong>Peptide tracking is for logging only.</strong> StackSense does not recommend peptide use, dosing, or cycles. Consult a licensed professional for all decisions.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedItem.active ? "bg-teal" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                      <p className="font-medium text-zinc-900 dark:text-white">{selectedItem.active ? "Active" : "Paused"}</p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Form</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedItem.form}</p>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-zinc-900 dark:text-white">Details</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl space-y-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Schedule</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.schedule.days.map(day => (
                          <Badge key={day} variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none">
                            {day}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {selectedItem.schedule.times.join(", ") || "No specific time"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Reminder: {selectedItem.schedule.reminderEnabled === false ? "Off" : "On"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {REMINDER_WINDOW_OPTIONS.map((windowName) => {
                          const active = selectedItem.schedule.times.includes(windowName);
                          return (
                            <button
                              key={windowName}
                              onClick={() => handleToggleReminderWindow(selectedItem, windowName)}
                              className={`h-7 px-2 text-[10px] font-bold rounded-full transition ${
                                active
                                  ? "bg-teal text-white"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {windowName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedItem.evidence && (
                      <div className="p-4 bg-teal/5 dark:bg-teal/10 border border-teal/10 dark:border-teal/20 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-teal uppercase">Evidence Summary</p>
                          <Badge className="bg-teal/20 text-teal border-none text-[8px] h-4">Educational</Badge>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{selectedItem.evidence}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-xl font-bold gap-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300"
                  onClick={() => handleToggleActive(selectedItem)}
                >
                  {selectedItem.active ? <Pause className="w-4 h-4 text-zinc-400" /> : <Play className="w-4 h-4 text-teal" />}
                  {selectedItem.active ? "Pause" : "Resume"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleToggleItemReminder(selectedItem)}
                  className={`rounded-xl font-bold gap-2 ${selectedItem.schedule.reminderEnabled === false ? "border-zinc-200 dark:border-zinc-800 text-zinc-600" : "bg-teal/5 border-teal/10 text-teal"}`}
                >
                  {selectedItem.schedule.reminderEnabled === false ? (
                    <ShieldAlert className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-teal" />
                  )}
                  {selectedItem.schedule.reminderEnabled === false ? "Enable Reminder" : "Disable Reminder"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDelete(selectedItem.id)}
                  className="rounded-xl font-bold gap-2 text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <p className="text-[10px] text-center text-zinc-400 px-6 py-8">
          For personal logging only. StackSense does not recommend peptide or supplement protocols.
        </p>
    </div>
  );
}
