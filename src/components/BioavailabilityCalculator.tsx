"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Info, 
  AlertTriangle, 
  Droplets,
  Zap
} from "lucide-react";

const bioavailabilityData: Record<string, any> = {
  "BPC-157": {
    oral: 0.05,
    sublingual: 0.15,
    subcutaneous: 0.95,
    intramuscular: 0.90,
    notes: "Oral systemic absorption is low. Best used for localized GI orally; systemic repair requires SC/IM."
  },
  "BPC-157 (Arginate)": {
    oral: 0.12,
    notes: "Arginate salt significantly improves gastric stability and increases oral bioavailability."
  },
  "PT-141 (Bremelanotide)": {
    subcutaneous: 0.95,
    intranasal: 0.35,
    notes: "SC injection is the gold standard. Intranasal requires significantly higher dosages."
  },
  "Semaglutide / GLP-1": {
    oral: 0.008,
    subcutaneous: 0.89,
    notes: "Oral semaglutide has extremely low bioavailability (<1%) and requires strict fasting."
  },
  "Tirzepatide": {
    subcutaneous: 0.80,
    notes: "High subcutaneous bioavailability. Potent GIP/GLP-1 agonist."
  },
  "Retatrutide": {
    subcutaneous: 0.85,
    notes: "Triple agonist with high subcutaneous yield (~85%)."
  },
  "GHK-Cu": {
    subcutaneous: 0.90,
    topical: 0.05,
    notes: "High systemic yield via SC. Topical is primarily for localized skin health."
  },
  "TB-500 (Thymosin Beta-4)": {
    subcutaneous: 0.95,
    notes: "Highly bioavailable via injection. Used for tissue repair."
  },
  "Ipamorelin": {
    subcutaneous: 0.90,
    notes: "Growth hormone secretagogue. Best taken SC on an empty stomach."
  },
  "SS-31": {
    subcutaneous: 0.92,
    notes: "Mitochondrial-targeted peptide. High bioavailability via SC."
  },
  "MOTS-c": {
    subcutaneous: 0.88,
    notes: "Mitochondrial-derived peptide. SC injection is the primary clinical route."
  },
  "Selank / Semax": {
    intranasal: 0.40,
    subcutaneous: 0.90,
    notes: "Intranasal bypasses BBB for direct CNS action. SC provides higher systemic levels."
  },
  "Caffeine": {
    oral: 0.99,
    notes: "Nearly 100% bioavailable orally."
  },
  "Vitamin D3": {
    oral: 0.65,
    boosters: ["Fatty Meal"],
    notes: "Fat-soluble. Absorption increases by ~50% when taken with fats."
  },
  "NMN / NR": {
    oral: 0.12,
    sublingual: 0.35,
    notes: "Oral precursors undergo heavy first-pass metabolism. Sublingual increases systemic yield."
  },
  "CoQ10 (Ubiquinone)": {
    oral: 0.03,
    boosters: ["Fatty Meal"],
    notes: "Extremely hydrophobic. Requires fatty meal for absorption."
  },
  "Ubiquinol": {
    oral: 0.15,
    notes: "Reduced form of CoQ10 with ~3-5x higher yield than ubiquinone."
  },
  "Curcumin": {
    oral: 0.01,
    boosters: ["Piperine", "Fat"],
    notes: "Extremely low absorption alone. Piperine can increase yield by up to 2000%."
  },
  "Berberine": {
    oral: 0.05,
    boosters: ["Silymarin"],
    notes: "Low bioavailability due to P-gp efflux. P-gp inhibitors can double absorption."
  },
  "NAC (N-Acetyl Cysteine)": {
    oral: 0.06,
    notes: "Low oral bioavailability due to rapid first-pass liver metabolism."
  },
  "Glutathione (Liposomal)": {
    oral: 0.30,
    notes: "Liposomal form protects glutathione from GI degradation."
  },
  "Testosterone (Cyp/Enan)": {
    intramuscular: 0.95,
    subcutaneous: 0.90,
    topical: 0.10,
    notes: "Injections provide the most stable yield. Topical yield is low (~10%)."
  },
  "Rapamycin (Sirolimus)": {
    oral: 0.14,
    notes: "Low bioavailability (~14%). Absorption is increased by fatty meals."
  },
  "Metformin": {
    oral: 0.50,
    notes: "Oral bioavailability is roughly 50-60%."
  },
  "Tadalafil": {
    oral: 0.85,
    notes: "Highly bioavailable orally with a long half-life."
  }
};

const units = ["mg", "mcg", "IU", "g", "ml", "ng", "pg", "nmol", "pmol"];

export function BioavailabilityCalculator() {
  const [compound, setCompound] = useState("");
  const [route, setRoute] = useState("oral");
  const [dose, setDose] = useState("");
  const [unit, setUnit] = useState("mg");
  const [hasBooster, setHasBooster] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    if (!compound || !dose) return;
    
    const data = bioavailabilityData[compound] || { [route]: 0.20, notes: "Estimated average for this compound class." };
    let rate = data[route] || data.oral || 0.10;
    
    if (hasBooster) {
      if (compound === "Curcumin") rate = 0.20;
      if (compound === "Berberine") rate = rate * 2.0;
      if (compound === "Vitamin D3") rate = rate * 1.5;
      if (compound === "CoQ10 (Ubiquinone)") rate = rate * 3.0;
      if (compound === "Rapamycin (Sirolimus)") rate = rate * 1.5;
    }

    const effectiveDose = parseFloat(dose) * rate;

    setResult({
      rate: (rate * 100).toFixed(0),
      effectiveDose: effectiveDose < 1 ? effectiveDose.toFixed(3) : effectiveDose.toFixed(2),
      notes: data.notes,
      isBoosted: hasBooster && data.boosters,
      unit: unit
    });
  };

  return (
    <Card className="p-6 rounded-3xl border-none bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
          <Droplets className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg dark:text-white">Bio-Availability Engine</h3>
          <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Clinical Absorption Model</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Compound</label>
          <Select onValueChange={(val) => { setCompound(val); setHasBooster(false); }}>
            <SelectTrigger className="rounded-xl h-12 bg-zinc-50 dark:bg-zinc-950 border-none">
              <SelectValue placeholder="Select compound..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl max-h-[300px]">
              {Object.keys(bioavailabilityData).sort().map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
              <SelectItem value="Other">Other / Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Route</label>
            <Select value={route} onValueChange={setRoute}>
              <SelectTrigger className="rounded-xl h-12 bg-zinc-50 dark:bg-zinc-950 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="sublingual">Sublingual</SelectItem>
                <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                <SelectItem value="intramuscular">Intramuscular</SelectItem>
                <SelectItem value="intranasal">Intranasal</SelectItem>
                <SelectItem value="intravenous">Intravenous (IV)</SelectItem>
                <SelectItem value="topical">Topical / Transdermal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Dose</label>
            <div className="flex gap-1">
              <Input 
                type="number" 
                placeholder="0.00" 
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="rounded-xl h-12 bg-zinc-50 dark:bg-zinc-950 border-none flex-1"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-[70px] rounded-xl h-12 bg-zinc-50 dark:bg-zinc-950 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {units.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {bioavailabilityData[compound]?.boosters && (
          <div className="flex items-center gap-3 p-3 bg-teal/5 rounded-xl border border-teal/10">
            <Zap className="w-4 h-4 text-teal" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-teal uppercase">Absorption Boosters Detected</p>
              <p className="text-[9px] text-zinc-500">Add {bioavailabilityData[compound].boosters.join(" or ")}?</p>
            </div>
            <Button 
              size="sm"
              variant={hasBooster ? "default" : "outline"}
              onClick={() => setHasBooster(!hasBooster)}
              className={`h-7 px-3 rounded-lg text-[10px] font-bold ${hasBooster ? "bg-teal" : "border-teal text-teal hover:bg-teal/5"}`}
            >
              {hasBooster ? "Added" : "Add"}
            </Button>
          </div>
        )}

        <Button 
          onClick={calculate}
          disabled={!compound || !dose}
          className="w-full h-12 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold shadow-lg shadow-teal/20"
        >
          Run Absorption Analysis
        </Button>

        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-teal/5 dark:bg-teal/10 border border-teal/10 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-teal uppercase block mb-1">Estimated Systemic Load</span>
                <span className="text-3xl font-black text-teal tracking-tighter">{result.effectiveDose}<span className="text-sm ml-1">{result.unit}</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-400 uppercase block">Yield Rate</span>
                <span className="text-lg font-black text-zinc-900 dark:text-white">{result.rate}%</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-teal/10">
              <div className="flex gap-2">
                <Info className="w-3 h-3 text-teal shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                  {result.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-tight">
          Estimates based on clinical literature. Individual metabolic rates and gut health may vary absorption significantly.
        </p>
      </div>
    </Card>
  );
}
