"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Zap, Heart, Brain, Moon, Battery, Activity, Target, BedDouble, MessageSquare } from "lucide-react";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Energy" | "Mood" | "Focus" | "Sleep" | null;
}

const symptomConfig = {
  Energy: { 
    icon: Battery, 
    color: "text-amber-500", 
    bg: "bg-amber-50 dark:bg-amber-950/30", 
    description: "How is your physical and mental vitality right now?",
    labels: ["Fatigued", "Normal", "High Energy"],
    accent: "bg-amber-500",
    tags: ["Physical Fatigue", "Mental Burnout", "Restless Energy", "Peak Performance"]
  },
  Mood: { 
    icon: Activity, 
    color: "text-red-500", 
    bg: "bg-red-50 dark:bg-red-950/30", 
    description: "How would you rate your emotional state?",
    labels: ["Low/Irritable", "Stable", "Exceptional"],
    accent: "bg-red-500",
    tags: ["Anxious", "Calm", "Euphoric", "Irritable"]
  },
  Focus: { 
    icon: Target, 
    color: "text-purple-500", 
    bg: "bg-purple-50 dark:bg-purple-950/30", 
    description: "How clear and concentrated is your mind?",
    labels: ["Brain Fog", "Clear", "Hyper-Focus"],
    accent: "bg-purple-500",
    tags: ["Brain Fog", "Flow State", "Distracted", "Sharp"]
  },
  Sleep: { 
    icon: BedDouble, 
    color: "text-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-950/30", 
    description: "How was the quality of your last sleep cycle?",
    labels: ["Restless", "Good", "Deeply Restorative"],
    accent: "bg-blue-500",
    tags: ["Interrupted", "Deep Sleep", "Hard to Wake", "Dreamless"]
  },
};

export function SymptomModal({ isOpen, onClose, type }: SymptomModalProps) {
  const { dispatch } = useApp();
  const [value, setValue] = useState([5]);
  const [notes, setNotes] = useState("");

  if (!type) return null;

  const config = symptomConfig[type];
  const Icon = config.icon;

    const handleSave = () => {
      const currentValue = value?.[0] ?? 5;
      dispatch({
        type: "ADD_SYMPTOM_LOG",
        payload: {
          id: Math.random().toString(36).substr(2, 9),
          type,
          value: currentValue,
          notes: notes.trim() || undefined,
          timestamp: Date.now(),
        }
      });
      toast.success(`${type} logged at ${currentValue}/10`);
      onClose();
      setValue([5]);
      setNotes("");
    };

  const toggleTag = (tag: string) => {
    setNotes(prev => {
      const currentTags = prev.split(", ").filter(t => t);
      if (currentTags.includes(tag)) {
        return currentTags.filter(t => t !== tag).join(", ");
      } else {
        return [...currentTags, tag].join(", ");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center text-center pb-2">
          <div className={`w-20 h-20 ${config.bg} rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-black/5 animate-in zoom-in duration-300`}>
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight dark:text-white">Track {type}</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium px-4 pt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-6 rounded-[2rem]">
            <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {value[0]}
              <span className="text-lg text-zinc-400 font-bold ml-1 italic">/10</span>
            </span>
            <div className="text-right">
              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest text-white ${config.accent}`}>
                {value[0] <= 3 ? config.labels[0] : value[0] <= 7 ? config.labels[1] : config.labels[2]}
              </span>
            </div>
          </div>
          
          <div className="px-2">
            <Slider
              value={value}
              onValueChange={setValue}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between mt-4 px-1">
              {config.labels.map((label, idx) => (
                <span key={idx} className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Context & Tags</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {config.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    notes.includes(tag) 
                      ? `${config.accent} text-white` 
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <Textarea 
              placeholder="Any specific notes or details?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none min-h-[100px] text-sm font-medium focus-visible:ring-teal"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-center flex-col gap-4 mt-2">
          <Button 
            onClick={handleSave}
            className={`w-full h-16 ${config.accent} hover:opacity-90 text-white rounded-[1.5rem] text-lg font-black shadow-xl transition-all active:scale-95`}
          >
            Log {type} Level
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-xl font-bold text-zinc-400 hover:text-zinc-600 hover:bg-transparent"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
