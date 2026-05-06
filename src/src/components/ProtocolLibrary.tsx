"use client";

import React, { useState, useMemo } from "react";
import { LIBRARY, LibraryItem } from "@/lib/library";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  ChevronRight,
  FlaskConical,
  Pill,
  Zap,
  BookOpen,
  Clock,
  Shield,
  ArrowLeft,
  Layers,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Enriched protocol data ──────────────────────────────────────────────────
type ProtocolDetail = LibraryItem & {
  mechanism?: string;
  clinicalUse?: string;
  halfLife?: string;
  synergies?: string[];
  warnings?: string[];
  timing?: string;
  evidence?: "Strong" | "Moderate" | "Preliminary" | "Anecdotal";
};

const PROTOCOL_DETAILS: Record<string, Partial<ProtocolDetail>> = {
  "BPC-157": {
    mechanism: "Upregulates growth hormone receptor expression and activates VEGF/angiogenesis pathways. Modulates GABAergic and dopaminergic neurotransmission. Stimulates tendon/ligament fibroblast migration.",
    clinicalUse: "Accelerated healing of tendons, ligaments, muscle, and gut. Used for leaky gut, IBD, and injury recovery. Neuroprotective potential.",
    halfLife: "~4 hours (subcutaneous)",
    synergies: ["TB-500", "GHK-Cu", "NAC (N-Acetyl Cysteine)"],
    warnings: ["Theoretical pro-angiogenic concern with existing tumors (precautionary)", "Research primarily in animal models"],
    timing: "Inject 30 min before or after food near injury site or subcutaneously",
    evidence: "Moderate",
  },
  "TB-500": {
    mechanism: "Synthetic version of Thymosin Beta-4. Promotes actin polymerization, angiogenesis, and cell migration. Reduces inflammation via NF-kB pathway inhibition.",
    clinicalUse: "Systemic tissue repair, chronic injury healing, cardiac muscle recovery, and anti-fibrotic effects.",
    halfLife: "~2–3 days (subcutaneous)",
    synergies: ["BPC-157", "GHK-Cu"],
    warnings: ["Potential mitogenic activity — avoid with active cancers", "Human data sparse"],
    timing: "Loading dose 2× weekly for 4–6 weeks; maintenance 1× weekly",
    evidence: "Moderate",
  },
  "Semaglutide": {
    mechanism: "GLP-1 receptor agonist. Enhances glucose-dependent insulin secretion, delays gastric emptying, reduces appetite via CNS hypothalamic pathways.",
    clinicalUse: "Weight management (15–20% body weight reduction in trials), T2D glycaemic control, cardiovascular risk reduction (SUSTAIN-6).",
    halfLife: "~7 days (once-weekly dosing)",
    synergies: ["Tirzepatide (alternative, not combined)", "Berberine HCL (complementary glucose control)"],
    warnings: ["Thyroid C-cell tumors in rodents (class warning)", "Pancreatitis risk", "Contraindicated in personal/family history of MEN2"],
    timing: "Subcutaneous injection once weekly, same day each week. Titrate slowly.",
    evidence: "Strong",
  },
  "Tirzepatide": {
    mechanism: "Dual GIP/GLP-1 receptor agonist. Superior weight loss vs semaglutide in SURMOUNT trials (~22% body weight). Improves insulin sensitivity, hepatic fat.",
    clinicalUse: "Obesity, T2D, MAFLD/NAFLD. Emerging data for heart failure with preserved ejection fraction.",
    halfLife: "~5 days",
    synergies: ["Ca-AKG", "Berberine HCL"],
    warnings: ["Same class warnings as semaglutide (GI side effects, thyroid)", "Muscle mass loss — ensure adequate protein + resistance training"],
    timing: "Once weekly SubQ. Start at 2.5 mg, titrate every 4 weeks.",
    evidence: "Strong",
  },
  "NMN (Nicotinamide Mononucleotide)": {
    mechanism: "Precursor to NAD+. Restores declining NAD+ levels via NMN → NMN → NAD+ pathway. Activates sirtuins (SIRT1/3) and PARP DNA repair enzymes. Supports mitochondrial biogenesis.",
    clinicalUse: "Longevity, energy metabolism, DNA repair, insulin sensitivity. Human trials show improved muscle insulin sensitivity and aerobic capacity.",
    halfLife: "~2–3 hours post-ingestion",
    synergies: ["Resveratrol (Trans)", "TMG (Trimethylglycine)", "Apigenin"],
    warnings: ["TMG co-supplementation advised to prevent methyl group depletion", "NMN may feed senescent cells — use Fisetin periodically"],
    timing: "Morning on empty stomach or with breakfast. 250–500 mg.",
    evidence: "Moderate",
  },
  "Rapamycin (Sirolimus)": {
    mechanism: "Inhibits mTORC1 (mechanistic target of rapamycin complex 1). Induces autophagy, reduces senescent cell accumulation, extends lifespan in multiple model organisms.",
    clinicalUse: "Longevity protocol (intermittent use), immunosuppression post-transplant. The PEARL trial and ongoing longevity research suggest safety at low intermittent doses.",
    halfLife: "~62 hours",
    synergies: ["Metformin (complementary AMPK/mTOR axis)", "Acarbose"],
    warnings: ["Immunosuppressive at therapeutic doses", "Impairs wound healing", "Do not use continuously — requires medical supervision", "Drug interactions with CYP3A4 inhibitors"],
    timing: "Intermittent dosing: 5–10 mg once weekly (longevity protocol). Must be physician-supervised.",
    evidence: "Moderate",
  },
  "Metformin": {
    mechanism: "Activates AMPK (AMP-activated protein kinase). Inhibits hepatic gluconeogenesis, reduces IGF-1 signaling, mild mTOR inhibition. Reduces mitochondrial Complex I activity.",
    clinicalUse: "T2D first-line therapy. Anti-aging potential (TAME trial). Reduces cancer risk and cardiovascular events.",
    halfLife: "~6.2 hours",
    synergies: ["Rapamycin (Sirolimus)", "Berberine HCL (alternative, may overlap)"],
    warnings: ["Reduces exercise adaptation (AMPK paradox) — separate from workouts", "B12 depletion with long-term use — supplement B12", "Lactic acidosis risk if eGFR < 45"],
    timing: "500–1000 mg with meals. Separate from high-intensity exercise by 4+ hours.",
    evidence: "Strong",
  },
  "Ipamorelin": {
    mechanism: "Selective ghrelin receptor agonist (GHRP). Stimulates pituitary GH release without significant cortisol, prolactin, or ACTH elevation. Synergistic with GHRH analogs.",
    clinicalUse: "GH pulse augmentation for body recomposition, recovery, sleep quality, and anti-aging. Clean GH secretagogue profile.",
    halfLife: "~2 hours",
    synergies: ["CJC-1295 (No DAC)", "Mod GRF 1-29", "MK-677 (Ibutamoren)"],
    warnings: ["May increase IGF-1 — monitor levels", "Water retention at high doses", "Tachyphylaxis with continuous use — cycle"],
    timing: "100–300 mcg SubQ 30 min before sleep or fasted. Stack with CJC-1295 No DAC for synergy.",
    evidence: "Moderate",
  },
  "Epitalon": {
    mechanism: "Tetrapeptide (Ala-Glu-Asp-Gly). Stimulates pineal gland telomerase production. Increases melatonin synthesis, regulates circadian rhythm, and has antioxidant effects.",
    clinicalUse: "Longevity, telomere lengthening, sleep quality, and anti-aging. Soviet research base; limited Western RCT data.",
    halfLife: "~1–2 hours",
    synergies: ["Thymalin", "DSIP (Deep Sleep Inducing Peptide)"],
    warnings: ["Mostly animal and Russian observational data", "Long-term human safety profile not established"],
    timing: "5–10 mg/day SubQ or intranasal for 10–20 day cycles. 2–3 cycles/year.",
    evidence: "Preliminary",
  },
  "Selank": {
    mechanism: "Synthetic heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro). Modulates GABA-A receptor. Increases BDNF and NGF, regulates IL-6 expression. Anti-anxiety without sedation.",
    clinicalUse: "Anxiety reduction, cognitive enhancement, immune modulation, nootropic. Widely used in Russia; OTC in many countries.",
    halfLife: "~1–2 hours",
    synergies: ["Semax", "L-Theanine", "N-Acetyl Selank (longer-acting form)"],
    warnings: ["Limited large-scale Western RCTs", "Mild tolerance may develop — cycle use"],
    timing: "200–300 mcg intranasal 1–2× daily. Use on-cycle 4 weeks, off 2 weeks.",
    evidence: "Preliminary",
  },
  "Creatine Monohydrate": {
    mechanism: "Replenishes phosphocreatine (PCr) stores in muscle, enabling faster ATP regeneration during high-intensity effort. Also supports neuronal energy via PCr shuttle.",
    clinicalUse: "Strength, power, muscle mass (meta-analyses: +8% strength, +14% power vs placebo). Emerging evidence for cognitive performance and neuroprotection.",
    halfLife: "N/A — chronic saturation protocol",
    synergies: ["Vitamin D3", "Glycine", "Carbohydrates (insulin-mediated uptake)"],
    warnings: ["Mild water retention (intracellular) — not fat", "May slightly raise creatinine (false elevation in kidney labs)", "Ensure adequate hydration"],
    timing: "3–5 g daily with or without food. No loading phase necessary. Morning or post-workout.",
    evidence: "Strong",
  },
  "Berberine HCL": {
    mechanism: "Activates AMPK (similar to Metformin). Inhibits PTP1B, upregulates GLUT4, reduces hepatic lipid synthesis, modulates gut microbiome. Also inhibits PCSK9.",
    clinicalUse: "Blood glucose control, insulin resistance, lipid lowering. 'Nature's Metformin' — similar glucose-lowering effect in head-to-head trials.",
    halfLife: "~4.5 hours",
    synergies: ["Dihydroberberine (bioavailable form)", "Milk Thistle (hepatoprotective)"],
    warnings: ["CYP3A4 inhibitor — check drug interactions", "GI side effects common — take with meals", "Don't stack with Metformin without supervision"],
    timing: "500 mg 2–3× daily with meals.",
    evidence: "Strong",
  },
  "Magnesium Glycinate": {
    mechanism: "Highly bioavailable magnesium chelate. Acts as NMDA receptor antagonist, activates GABA receptors, cofactor for 300+ enzymes. Supports HPA axis regulation.",
    clinicalUse: "Sleep quality, anxiety reduction, muscle relaxation, blood pressure support, migraine prevention, insulin sensitivity.",
    halfLife: "N/A — mineral",
    synergies: ["Vitamin D3", "Zinc Picolinate", "L-Theanine"],
    warnings: ["High doses cause loose stools (though less than oxide/citrate)", "Caution in renal impairment"],
    timing: "200–400 mg 30–60 min before sleep.",
    evidence: "Strong",
  },
  "Vitamin D3": {
    mechanism: "Secosteroid hormone precursor. Binds VDR (vitamin D receptor) in nearly every cell. Regulates 1000+ genes. Essential for calcium/phosphorus metabolism, immune function, testosterone biosynthesis.",
    clinicalUse: "Immune function, bone density, mood, testosterone support, cardiovascular health. Deficiency linked to depression, autoimmune disease, increased cancer risk.",
    halfLife: "~15–25 days",
    synergies: ["Vitamin K2 (MK-7)", "Magnesium Glycinate", "Omega-3 Fish Oil"],
    warnings: ["Monitor 25-OH-D levels — toxicity at chronic high doses (>10,000 IU without co-factors)", "Always stack with K2 to direct calcium away from arteries"],
    timing: "2000–5000 IU with fatty meal. Test levels every 6 months.",
    evidence: "Strong",
  },
  "GHK-Cu": {
    mechanism: "Tripeptide (Gly-His-Lys) copper complex. Stimulates collagen and elastin synthesis, activates antioxidant enzymes, promotes wound healing, regulates gene expression for tissue remodeling (~500+ genes).",
    clinicalUse: "Skin rejuvenation, wound healing, hair growth stimulation, anti-fibrotic effects, lung health (COPD research).",
    halfLife: "~1–4 hours",
    synergies: ["BPC-157", "NAC (N-Acetyl Cysteine)", "Vitamin C"],
    warnings: ["Topical well-tolerated; injectable data limited in humans", "May stimulate cell growth — theoretical caution with active malignancies"],
    timing: "Topical: apply to target area 1–2× daily. Injectable: 2 mg SubQ 3–5× weekly.",
    evidence: "Moderate",
  },
  "Thymosin Alpha-1": {
    mechanism: "Endogenous thymic peptide. Modulates T-cell differentiation, enhances dendritic cell function, increases IL-2 production. Activates TLR-2 and TLR-9 signaling.",
    clinicalUse: "Immune enhancement (approved in 37 countries for hepatitis B/C), cancer adjunct therapy, chronic infection management, post-COVID immune dysregulation.",
    halfLife: "~2 hours",
    synergies: ["VIP (Vasoactive Intestinal Peptide)", "Thymalin"],
    warnings: ["Theoretical autoimmune flare risk in autoimmune conditions — use with caution", "Pharmaceutical grade quality critical"],
    timing: "1.5 mg SubQ 2× weekly. Cycles of 6–12 weeks.",
    evidence: "Moderate",
  },
  "Modafinil": {
    mechanism: "Inhibits dopamine reuptake (DAT), increases orexin/hypocretin signaling, mildly increases NE and histamine. Promotes wakefulness without amphetamine-like peripheral stimulation.",
    clinicalUse: "Narcolepsy, shift work disorder, off-label cognitive enhancement and wakefulness. Widely used in military and high-performance contexts.",
    halfLife: "~15 hours",
    synergies: ["Alpha GPC", "CDP Choline (Citicoline)", "L-Theanine (to reduce edge)"],
    warnings: ["Can cause severe skin reactions (SJS — rare)", "Reduces efficacy of hormonal contraceptives (CYP3A4 inducer)", "Scheduled IV in US — prescription only", "Avoid with heart conditions"],
    timing: "100–200 mg in the morning. Avoid after 12pm to protect sleep.",
    evidence: "Strong",
  },
};

// Enriched data fallback for items not in detail map
function getDetail(item: LibraryItem): ProtocolDetail {
  return {
    ...item,
    ...(PROTOCOL_DETAILS[item.name] || {
      mechanism: "See research databases (PubMed, Examine.com) for detailed mechanism of action.",
      clinicalUse: `Used as a ${item.category.toLowerCase()} for health optimization and performance.`,
      halfLife: "Variable — consult product literature",
      synergies: [],
      warnings: ["Always consult a physician before starting any new compound"],
      timing: `${item.defaultDose} ${item.defaultUnit} via ${item.defaultForm}`,
      evidence: "Preliminary" as const,
    }),
  };
}

const CATEGORY_TABS = ["All", "Supplement", "Peptide", "Compound"] as const;
type CategoryTab = typeof CATEGORY_TABS[number];

const CATEGORY_ICON = {
  Supplement: Pill,
  Peptide: Zap,
  Compound: FlaskConical,
};

const EVIDENCE_COLOR: Record<string, string> = {
  Strong: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  Moderate: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  Preliminary: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  Anecdotal: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const CATEGORY_COLOR: Record<string, string> = {
  Supplement: "bg-teal/10 text-teal border-teal/20",
  Peptide: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
  Compound: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800",
};

export function ProtocolLibrary({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("All");
  const [selected, setSelected] = useState<ProtocolDetail | null>(null);

  const filtered = useMemo(() => {
    return LIBRARY.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const g: Record<string, LibraryItem[]> = {};
    for (const item of filtered) {
      if (!g[item.category]) g[item.category] = [];
      g[item.category].push(item);
    }
    return g;
  }, [filtered]);

  if (selected) {
    return <DetailView item={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <div className="shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <div>
              <h1 className="text-sm font-bold dark:text-white flex items-center gap-2">
                Protocol Library
                <Badge className="text-[8px] h-4 px-1.5 bg-teal/10 text-teal border-teal/20 font-black uppercase tracking-widest">
                  {LIBRARY.length}
                </Badge>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">Compounds · Peptides · Supplements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compounds, peptides…"
            className="pl-8 h-9 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-teal/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-teal text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <BookOpen className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">No results for "{search}"</p>
          </div>
        )}

        {Object.entries(grouped).map(([category, items]) => {
          const Icon = CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] || Pill;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {category}s
                </span>
                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">
                  {items.length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                {items.map((item) => {
                  const detail = PROTOCOL_DETAILS[item.name];
                  const hasDetail = !!detail;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelected(getDetail(item))}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLOR[item.category]}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold dark:text-slate-100 truncate leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {item.defaultDose} {item.defaultUnit} · {item.defaultForm}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {hasDetail && (
                          <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────
function DetailView({ item, onBack }: { item: ProtocolDetail; onBack: () => void }) {
  const Icon = CATEGORY_ICON[item.category as keyof typeof CATEGORY_ICON] || Pill;
  const evidence = item.evidence || "Preliminary";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <div className="shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Protocol Library</span>
        </button>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${CATEGORY_COLOR[item.category]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold dark:text-white leading-tight">{item.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`text-[9px] h-4 px-1.5 border font-bold uppercase tracking-wider ${CATEGORY_COLOR[item.category]}`}>
                {item.category}
              </Badge>
              <Badge className={`text-[9px] h-4 px-1.5 border font-bold uppercase tracking-wider ${EVIDENCE_COLOR[evidence]}`}>
                {evidence} Evidence
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Dosing quick card */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "DOSE", value: `${item.defaultDose} ${item.defaultUnit}`, icon: Activity },
            { label: "FORM", value: item.defaultForm, icon: Layers },
            { label: "HALF-LIFE", value: item.halfLife || "Variable", icon: Clock },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 shadow-sm"
            >
              <stat.icon className="w-3.5 h-3.5 text-teal" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <span className="text-xs font-bold dark:text-slate-100 leading-tight">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        {[
          {
            icon: BookOpen,
            title: "Mechanism of Action",
            content: item.mechanism,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20",
          },
          {
            icon: Shield,
            title: "Clinical Use",
            content: item.clinicalUse,
            color: "text-teal",
            bg: "bg-teal/5 dark:bg-teal/10",
          },
          {
            icon: Clock,
            title: "Timing & Protocol",
            content: item.timing,
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-950/20",
          },
        ].map((s) => s.content ? (
          <div key={s.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{s.title}</p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.content}</p>
          </div>
        ) : null)}

        {/* Synergies */}
        {item.synergies && item.synergies.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bio-Synergies</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.synergies.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {item.warnings && item.warnings.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-red-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Warnings & Safety</p>
            </div>
            <div className="space-y-2">
              {item.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-red-700 dark:text-red-400 leading-snug">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-slate-400 italic px-2 pb-2">
          Not medical advice. Research purposes only. Consult a qualified physician before starting any protocol.
        </p>
      </div>
    </div>
  );
}
