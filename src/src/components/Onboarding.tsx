"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, ShieldCheck, Lock, ShieldAlert, Check, Scale, User } from "lucide-react";

const onboardingSteps = [
  "Welcome",
  "Goals",
  "Basics",
  "Privacy",
  "Disclaimers",
];

export function Onboarding() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [cloudSync, setCloudSync] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, onboardingSteps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    dispatch({ 
      type: "SET_PROFILE", 
      payload: { 
        goal: selectedGoals.join(", "),
        age,
        weight,
        onboarded: true 
      } 
    });
  };

  const goals = [
    "Energy & focus",
    "Gym performance",
    "Sleep & recovery",
    "General health",
    "Stress management",
  ];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-teal/20 to-teal rounded-3xl flex flex-col items-center justify-center shadow-xl shadow-teal/10 border border-teal/20">
              <div className="flex flex-col items-center">
                <div className="w-8 h-3 bg-teal rounded-full mb-1" />
                <div className="w-8 h-3 bg-teal/60 rounded-full mb-1" />
                <div className="w-8 h-3 bg-teal/30 rounded-full" />
              </div>
            </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">StackSense</h1>
                <h2 className="text-lg font-medium text-teal">Track your stack clearly.</h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  Log your supplements and peptides in one place. Understand overlaps and basic evidence — without medical advice.
                </p>
              </div>
          <Button onClick={next} size="lg" className="w-full max-w-xs bg-teal hover:bg-teal/90 rounded-2xl h-12 text-base font-medium">
            Get started
          </Button>
          </motion.div>
        );

        case 1:
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">What are your goals?</h2>
                <p className="text-muted-foreground text-sm">Select what you're focusing on.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => {
                        setSelectedGoals(prev => 
                          isSelected ? prev.filter(g => g !== goal) : [...prev, goal]
                        );
                      }}
                      className={`px-4 py-3 rounded-2xl border-2 transition-all font-medium ${
                        isSelected ? "border-teal bg-teal/5 text-teal" : "border-border bg-white text-muted-foreground"
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>
          );

        case 2:
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">A bit about you</h2>
                <p className="text-muted-foreground text-sm">This helps personalize your experience.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-teal" /> Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-12 rounded-xl border-zinc-200 focus:ring-teal focus:border-teal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4 text-teal" /> Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g. 75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-12 rounded-xl border-zinc-200 focus:ring-teal focus:border-teal"
                  />
                </div>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal" /> Data & Privacy
                </h2>
                <p className="text-muted-foreground text-sm">StackSense is local-first. Your data stays on your device unless you choose otherwise.</p>
              </div>
              
              <Card className="p-4 space-y-4 rounded-2xl border-teal/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Enable cloud backup & sync</p>
                    <p className="text-xs text-muted-foreground italic">Off by default</p>
                  </div>
                  <Checkbox 
                    checked={cloudSync} 
                    onCheckedChange={(v) => setCloudSync(!!v)}
                    className="rounded-full w-6 h-6 data-[state=checked]:bg-teal data-[state=checked]:border-teal"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Allow anonymous analytics</p>
                    <p className="text-xs text-muted-foreground italic">Off by default</p>
                  </div>
                  <Checkbox 
                    checked={analytics} 
                    onCheckedChange={(v) => setAnalytics(!!v)}
                    className="rounded-full w-6 h-6 data-[state=checked]:bg-teal data-[state=checked]:border-teal"
                  />
                </div>
              </Card>
  
              <div className="bg-zinc-50 p-4 rounded-2xl flex gap-3 border border-zinc-100">
                <ShieldCheck className="w-5 h-5 text-teal shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All data is encrypted locally. We never sell your personal health data to third parties.
                </p>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Important Disclaimers
                </h2>
                <p className="text-muted-foreground text-sm">Please read and agree to continue.</p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-4 text-sm text-zinc-600">
                  <p>
                    <strong>StackSense is a logging and educational tool only.</strong> It does not provide medical advice, diagnosis, or treatment. For any decisions about supplements, peptides, or health, consult a licensed professional.
                  </p>
                  <p>
                    <strong>Peptide tracking is for logging only.</strong> StackSense does not recommend peptide use, dosing, or cycles. Use of peptides involves significant health risks.
                  </p>
                  <p>
                    Information provided by the StackSense Assistant is summarized from public sources and should be verified with a healthcare provider.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl border border-border">
                <Checkbox 
                  id="agree" 
                  checked={agreed} 
                  onCheckedChange={(v) => setAgreed(!!v)}
                  className="mt-1 rounded-sm border-2"
                />
                <label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                  I understand and agree to the disclaimers above.
                </label>
              </div>

              <Button 
                onClick={finish} 
                disabled={!agreed}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 rounded-2xl text-base font-medium"
              >
                Enter app
              </Button>
            </div>
          );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-off-white flex flex-col p-6 max-w-md mx-auto overflow-y-auto">
      {step > 0 && (
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={prev} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-1">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-teal" : i < step ? "w-2 bg-teal/40" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 && step < onboardingSteps.length - 1 && (
        <div className="mt-8">
          <Button onClick={next} className="w-full h-12 bg-teal hover:bg-teal/90 rounded-2xl text-base flex items-center justify-center gap-2 font-medium">
            Continue <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
