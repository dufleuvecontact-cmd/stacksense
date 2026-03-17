import type { SymptomLog } from "./store";

export type Suggestion = {
  name: string;
  category: "Supplement" | "Peptide" | "Compound";
  dose: string;
  reason: string;
  priority: "high" | "medium" | "low";
  tags: string[];
};

// ── Symptom thresholds ────────────────────────────────────────────────────────
// A "signal" fires when average score over recent logs is below/above threshold
// All rule scores are 1–10 (10 = best). Low scores = problems.

type Rule = {
  name: string;
  category: "Supplement" | "Peptide" | "Compound";
  dose: string;
  reason: string;
  priority: "high" | "medium" | "low";
  tags: string[];
  // conditions: each entry is an OR branch; all keys within one entry are AND
  conditions: Partial<{
    energyBelow: number;
    moodBelow: number;
    focusBelow: number;
    sleepBelow: number;
    energyAbove: number; // for overactivation patterns (future use)
  }>[];
};

const RULES: Rule[] = [
  // ── LOW ENERGY ──────────────────────────────────────────────────────────────
  {
    name: "Magnesium Glycinate",
    category: "Supplement",
    dose: "400 mg",
    reason: "Magnesium deficiency is one of the most common causes of fatigue. Glycinate form is gentle and well-absorbed.",
    priority: "high",
    tags: ["energy", "sleep", "recovery"],
    conditions: [{ energyBelow: 5 }, { sleepBelow: 5 }],
  },
  {
    name: "Vitamin B12 (Methylcobalamin)",
    category: "Supplement",
    dose: "1000 mcg",
    reason: "B12 is critical for mitochondrial energy production and red blood cell function. Low B12 presents as fatigue and brain fog.",
    priority: "high",
    tags: ["energy", "focus", "mood"],
    conditions: [{ energyBelow: 5 }, { focusBelow: 5 }],
  },
  {
    name: "CoQ10 (Ubiquinone)",
    category: "Supplement",
    dose: "200 mg",
    reason: "CoQ10 is essential for ATP synthesis in mitochondria. Supplementation is linked to reduced fatigue, especially in those over 30.",
    priority: "high",
    tags: ["energy", "cardiovascular"],
    conditions: [{ energyBelow: 5 }],
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    category: "Supplement",
    dose: "500 mg",
    reason: "NMN boosts NAD+ levels, which decline with age and fatigue, supporting cellular energy and DNA repair.",
    priority: "medium",
    tags: ["energy", "longevity"],
    conditions: [{ energyBelow: 5 }],
  },
  {
    name: "Vitamin D3",
    category: "Supplement",
    dose: "5000 IU",
    reason: "Vitamin D deficiency strongly correlates with fatigue, low mood, and immune dysfunction.",
    priority: "high",
    tags: ["energy", "mood", "immune"],
    conditions: [{ energyBelow: 5 }, { moodBelow: 5 }],
  },
  {
    name: "Iron Bisglycinate",
    category: "Supplement",
    dose: "25 mg",
    reason: "Iron deficiency is the #1 nutritional cause of fatigue worldwide. Bisglycinate is non-constipating and highly bioavailable.",
    priority: "high",
    tags: ["energy", "recovery"],
    conditions: [{ energyBelow: 4 }],
  },
  {
    name: "Cordyceps Militaris",
    category: "Supplement",
    dose: "500 mg",
    reason: "Cordyceps improves oxygen utilisation and ATP production, significantly reducing perceived exertion and fatigue.",
    priority: "medium",
    tags: ["energy", "performance"],
    conditions: [{ energyBelow: 6 }],
  },
  {
    name: "Acetyl-L-Carnitine (ALCAR)",
    category: "Supplement",
    dose: "500 mg",
    reason: "ALCAR shuttles fatty acids into mitochondria for energy and supports mental clarity alongside physical energy.",
    priority: "medium",
    tags: ["energy", "focus", "neuroprotection"],
    conditions: [{ energyBelow: 5 }, { focusBelow: 6 }],
  },
  {
    name: "Rhodiola Rosea",
    category: "Supplement",
    dose: "300 mg",
    reason: "Rhodiola is an adaptogen clinically shown to reduce fatigue, burnout, and stress-induced exhaustion.",
    priority: "medium",
    tags: ["energy", "stress", "mood"],
    conditions: [{ energyBelow: 6 }, { moodBelow: 6 }],
  },
  {
    name: "MOTS-c",
    category: "Peptide",
    dose: "5 mg",
    reason: "MOTS-c is a mitochondria-derived peptide that activates AMPK and significantly improves metabolic energy output.",
    priority: "medium",
    tags: ["energy", "metabolic", "longevity"],
    conditions: [{ energyBelow: 5 }],
  },
  {
    name: "Ipamorelin",
    category: "Peptide",
    dose: "200 mcg",
    reason: "Ipamorelin stimulates GH release, which improves energy, body composition, and recovery without cortisol spikes.",
    priority: "medium",
    tags: ["energy", "recovery", "GH"],
    conditions: [{ energyBelow: 5 }],
  },

  // ── LOW MOOD ─────────────────────────────────────────────────────────────────
  {
    name: "5-HTP (5-Hydroxytryptophan)",
    category: "Supplement",
    dose: "100 mg",
    reason: "5-HTP is a direct serotonin precursor. Clinically shown to improve mood, anxiety, and mild depression.",
    priority: "high",
    tags: ["mood", "sleep", "anxiety"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Ashwagandha KSM-66",
    category: "Supplement",
    dose: "600 mg",
    reason: "KSM-66 has the strongest clinical evidence for reducing cortisol, anxiety, and stress while improving mood and well-being.",
    priority: "high",
    tags: ["mood", "stress", "hormonal"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Omega-3 Fish Oil",
    category: "Supplement",
    dose: "2000 mg",
    reason: "EPA/DHA are fundamental to neurological function and mood regulation. Low omega-3 is consistently linked to depression.",
    priority: "high",
    tags: ["mood", "brain", "inflammation"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Magnesium Glycinate",
    category: "Supplement",
    dose: "400 mg",
    reason: "Magnesium modulates NMDA receptors and HPA axis stress response. Low magnesium exacerbates anxiety and mood instability.",
    priority: "high",
    tags: ["mood", "anxiety", "sleep"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Saffron Extract (Affron)",
    category: "Supplement",
    dose: "28 mg",
    reason: "Saffron extract shows antidepressant effects comparable to mild SSRIs in multiple RCTs, improving mood and reducing anxiety.",
    priority: "medium",
    tags: ["mood", "anxiety"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "L-Tyrosine",
    category: "Supplement",
    dose: "500 mg",
    reason: "Tyrosine is the precursor to dopamine and norepinephrine. Improves mood and motivation, especially under stress.",
    priority: "medium",
    tags: ["mood", "focus", "stress"],
    conditions: [{ moodBelow: 6 }, { focusBelow: 6 }],
  },
  {
    name: "Lithium Orotate",
    category: "Supplement",
    dose: "5 mg",
    reason: "Low-dose lithium orotate has neuroprotective effects and supports mood stability by modulating neurotransmitter systems.",
    priority: "medium",
    tags: ["mood", "neuroprotection"],
    conditions: [{ moodBelow: 4 }],
  },
  {
    name: "Selank",
    category: "Peptide",
    dose: "200 mcg",
    reason: "Selank is a synthetic anxiolytic peptide that modulates BDNF and serotonin, reducing anxiety without sedation.",
    priority: "medium",
    tags: ["mood", "anxiety", "cognitive"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Mucuna Pruriens (L-Dopa)",
    category: "Supplement",
    dose: "300 mg",
    reason: "Mucuna provides natural L-DOPA, a direct dopamine precursor, supporting motivation, mood, and drive.",
    priority: "medium",
    tags: ["mood", "motivation", "dopamine"],
    conditions: [{ moodBelow: 5 }],
  },
  {
    name: "Vitamin B3 (Niacinamide)",
    category: "Supplement",
    dose: "500 mg",
    reason: "Niacinamide supports NAD+ metabolism and has anxiolytic properties, reducing anxiety and improving mood.",
    priority: "low",
    tags: ["mood", "anxiety"],
    conditions: [{ moodBelow: 6 }],
  },

  // ── LOW FOCUS ────────────────────────────────────────────────────────────────
  {
    name: "Alpha GPC",
    category: "Supplement",
    dose: "300 mg",
    reason: "Alpha GPC provides highly bioavailable choline for acetylcholine synthesis, directly supporting focus, memory, and learning.",
    priority: "high",
    tags: ["focus", "memory", "cognitive"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Lion's Mane Extract",
    category: "Supplement",
    dose: "1000 mg",
    reason: "Lion's Mane contains hericenones and erinacines that stimulate NGF synthesis, improving focus and neuroplasticity over time.",
    priority: "high",
    tags: ["focus", "memory", "neuroplasticity"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "CDP Choline (Citicoline)",
    category: "Supplement",
    dose: "250 mg",
    reason: "Citicoline increases dopamine and acetylcholine levels, improving attention, processing speed, and working memory.",
    priority: "high",
    tags: ["focus", "dopamine", "memory"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Bacopa Monnieri",
    category: "Supplement",
    dose: "300 mg",
    reason: "Bacopa is one of the most studied herbs for cognitive enhancement, improving memory consolidation and reducing brain fog.",
    priority: "medium",
    tags: ["focus", "memory", "anxiety"],
    conditions: [{ focusBelow: 6 }],
  },
  {
    name: "L-Theanine",
    category: "Supplement",
    dose: "200 mg",
    reason: "L-Theanine promotes alpha brain waves and calm focus. Stacking with caffeine further enhances concentration without jitteriness.",
    priority: "medium",
    tags: ["focus", "calm", "cognitive"],
    conditions: [{ focusBelow: 6 }],
  },
  {
    name: "Phosphatidylserine",
    category: "Supplement",
    dose: "200 mg",
    reason: "PS is a key phospholipid in neuronal membranes, clinically shown to improve attention, working memory, and cognitive function.",
    priority: "medium",
    tags: ["focus", "memory", "stress"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Semax",
    category: "Peptide",
    dose: "200 mcg",
    reason: "Semax is a synthetic ACTH analogue that increases BDNF, improves attention, and is used clinically for cognitive enhancement.",
    priority: "medium",
    tags: ["focus", "BDNF", "motivation"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Noopept",
    category: "Compound",
    dose: "10 mg",
    reason: "Noopept is a potent nootropic peptide analogue that enhances NGF/BDNF expression and improves memory and focus rapidly.",
    priority: "medium",
    tags: ["focus", "memory", "neuroprotection"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Huperzine A",
    category: "Supplement",
    dose: "100 mcg",
    reason: "Huperzine A inhibits acetylcholinesterase, keeping acetylcholine available longer and sharpening focus and memory recall.",
    priority: "medium",
    tags: ["focus", "memory"],
    conditions: [{ focusBelow: 5 }],
  },
  {
    name: "Phenylpiracetam",
    category: "Compound",
    dose: "100 mg",
    reason: "Phenylpiracetam improves cognitive speed, memory retrieval, and motivation. Cycle to maintain effectiveness.",
    priority: "low",
    tags: ["focus", "energy", "motivation"],
    conditions: [{ focusBelow: 5 }, { energyBelow: 5 }],
  },
  {
    name: "Uridine Monophosphate",
    category: "Supplement",
    dose: "250 mg",
    reason: "UMP increases dopamine D1 receptor density and CDP-choline levels, supporting long-term cognitive health and focus.",
    priority: "low",
    tags: ["focus", "dopamine", "neuroprotection"],
    conditions: [{ focusBelow: 6 }],
  },
  {
    name: "Ginkgo Biloba",
    category: "Supplement",
    dose: "120 mg",
    reason: "Ginkgo improves cerebral blood flow and has antioxidant properties, improving concentration and reducing brain fog.",
    priority: "low",
    tags: ["focus", "circulation", "memory"],
    conditions: [{ focusBelow: 6 }],
  },

  // ── POOR SLEEP ───────────────────────────────────────────────────────────────
  {
    name: "Magnesium Glycinate",
    category: "Supplement",
    dose: "400 mg",
    reason: "Magnesium activates GABA receptors and regulates melatonin production, improving sleep quality and reducing night-time cortisol.",
    priority: "high",
    tags: ["sleep", "relaxation", "recovery"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Melatonin (Low Dose)",
    category: "Supplement",
    dose: "0.5 mg",
    reason: "Low-dose melatonin (0.3–0.5 mg) signals sleep onset without suppressing natural melatonin production. Effective for sleep latency.",
    priority: "high",
    tags: ["sleep", "circadian"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Glycine (Sleep)",
    category: "Supplement",
    dose: "3 g",
    reason: "Glycine lowers core body temperature and activates glycine receptors in the SCN, reducing time to sleep and improving deep sleep.",
    priority: "high",
    tags: ["sleep", "recovery", "temperature"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Apigenin",
    category: "Supplement",
    dose: "50 mg",
    reason: "Apigenin is a partial GABA-A agonist that promotes relaxation and sleep onset without habit formation.",
    priority: "high",
    tags: ["sleep", "relaxation"],
    conditions: [{ sleepBelow: 6 }],
  },
  {
    name: "L-Theanine",
    category: "Supplement",
    dose: "200 mg",
    reason: "L-Theanine reduces anxiety-driven arousal and increases alpha-wave activity, promoting restful sleep.",
    priority: "medium",
    tags: ["sleep", "anxiety", "calm"],
    conditions: [{ sleepBelow: 6 }],
  },
  {
    name: "Ashwagandha KSM-66",
    category: "Supplement",
    dose: "600 mg",
    reason: "KSM-66 significantly reduces cortisol (validated via DHEA-S/cortisol ratio), which is a primary disruptor of sleep architecture.",
    priority: "medium",
    tags: ["sleep", "stress", "cortisol"],
    conditions: [{ sleepBelow: 5 }, { moodBelow: 6 }],
  },
  {
    name: "DSIP (Deep Sleep Inducing Peptide)",
    category: "Peptide",
    dose: "100 mcg",
    reason: "DSIP promotes delta-wave (deep) sleep, reduces cortisol, and modulates sleep architecture at the hypothalamic level.",
    priority: "medium",
    tags: ["sleep", "deep sleep", "recovery"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Epitalon",
    category: "Peptide",
    dose: "5 mg",
    reason: "Epitalon regulates the pineal gland and melatonin synthesis, restoring healthy circadian rhythms and improving sleep quality.",
    priority: "medium",
    tags: ["sleep", "circadian", "longevity"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Inositol (Sleep)",
    category: "Supplement",
    dose: "2 g",
    reason: "Inositol modulates serotonin and reduces anxiety, with RCTs showing improvements in sleep and panic disorder.",
    priority: "medium",
    tags: ["sleep", "anxiety"],
    conditions: [{ sleepBelow: 6 }, { moodBelow: 6 }],
  },
  {
    name: "Valerian Root",
    category: "Supplement",
    dose: "300 mg",
    reason: "Valerian potentiates GABA activity and reduces sleep latency. Best effect seen with consistent nightly use.",
    priority: "low",
    tags: ["sleep", "GABA"],
    conditions: [{ sleepBelow: 5 }],
  },
  {
    name: "Phosphatidylserine (Sleep)",
    category: "Supplement",
    dose: "200 mg",
    reason: "PS blunts cortisol at night, particularly stress-induced evening cortisol that delays sleep onset.",
    priority: "low",
    tags: ["sleep", "stress", "cortisol"],
    conditions: [{ sleepBelow: 5 }, { moodBelow: 6 }],
  },

  // ── COMBINED LOW SCORES (multi-domain dysfunction) ───────────────────────────
  {
    name: "Vitamin D3",
    category: "Supplement",
    dose: "5000 IU",
    reason: "Vitamin D affects energy metabolism, immune function, mood (serotonin synthesis), and sleep quality — deficiency impacts all four domains.",
    priority: "high",
    tags: ["energy", "mood", "sleep", "immune"],
    conditions: [{ energyBelow: 6, moodBelow: 6 }, { sleepBelow: 6, energyBelow: 6 }],
  },
  {
    name: "Omega-3 Fish Oil",
    category: "Supplement",
    dose: "2000 mg EPA/DHA",
    reason: "EPA/DHA support neuronal membrane integrity affecting mood, focus, and energy. Anti-inflammatory effects benefit all symptom domains.",
    priority: "high",
    tags: ["mood", "focus", "energy", "inflammation"],
    conditions: [{ moodBelow: 6, focusBelow: 6 }, { moodBelow: 6, energyBelow: 6 }],
  },
  {
    name: "NAC (N-Acetyl Cysteine)",
    category: "Supplement",
    dose: "600 mg",
    reason: "NAC replenishes glutathione and modulates glutamate/dopamine pathways, benefiting mood, energy, and cognitive clarity.",
    priority: "medium",
    tags: ["mood", "energy", "detox", "antioxidant"],
    conditions: [{ moodBelow: 5, energyBelow: 5 }],
  },
  {
    name: "Panax Ginseng",
    category: "Supplement",
    dose: "200 mg",
    reason: "Standardised Panax ginseng (ginsenosides) improves energy, mood, and cognitive function across multiple RCTs.",
    priority: "medium",
    tags: ["energy", "mood", "focus"],
    conditions: [{ energyBelow: 5, moodBelow: 5 }, { energyBelow: 5, focusBelow: 5 }],
  },
  {
    name: "BPC-157",
    category: "Peptide",
    dose: "250 mcg",
    reason: "BPC-157 modulates dopamine and serotonin systems, reduces systemic inflammation, and accelerates recovery — impacting mood, energy, and sleep.",
    priority: "medium",
    tags: ["mood", "energy", "recovery", "anti-inflammatory"],
    conditions: [{ moodBelow: 5, energyBelow: 6 }, { sleepBelow: 5, energyBelow: 5 }],
  },
  {
    name: "Methylfolate (5-MTHF)",
    category: "Supplement",
    dose: "1000 mcg",
    reason: "MTHFR mutations impair methylation, lowering neurotransmitter production and NAD+ recycling. Methylfolate addresses root-cause mood, energy, and cognition issues.",
    priority: "high",
    tags: ["mood", "energy", "focus", "methylation"],
    conditions: [{ moodBelow: 5, energyBelow: 5 }, { moodBelow: 5, focusBelow: 5 }],
  },
  {
    name: "P5P (Active B6)",
    category: "Supplement",
    dose: "50 mg",
    reason: "P5P (active B6) is required for serotonin, GABA, and dopamine synthesis. Deficiency causes low mood, poor sleep, and cognitive fog.",
    priority: "medium",
    tags: ["mood", "sleep", "focus"],
    conditions: [{ moodBelow: 5, sleepBelow: 5 }],
  },
  {
    name: "TMG (Trimethylglycine)",
    category: "Supplement",
    dose: "1000 mg",
    reason: "TMG is a methyl donor that supports methylation pathways for neurotransmitter synthesis, energy metabolism, and homocysteine regulation.",
    priority: "medium",
    tags: ["energy", "mood", "methylation"],
    conditions: [{ energyBelow: 5, moodBelow: 5 }],
  },
];

// ── Engine ────────────────────────────────────────────────────────────────────

export function getSymptomAverages(logs: SymptomLog[]): Record<string, number> {
  const recent = logs.slice(0, 20); // last 20 logs max
  const grouped: Record<string, number[]> = {};
  for (const log of recent) {
    if (!grouped[log.type]) grouped[log.type] = [];
    grouped[log.type].push(log.value);
  }
  const averages: Record<string, number> = {};
  for (const [type, values] of Object.entries(grouped)) {
    averages[type] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return averages;
}

export function getSuggestions(
  symptomLogs: SymptomLog[],
  currentStackNames: string[]
): Suggestion[] {
  if (symptomLogs.length < 2) return []; // need at least 2 logs to make suggestions

  const avgs = getSymptomAverages(symptomLogs);
  const energy = avgs["Energy"] ?? 10;
  const mood = avgs["Mood"] ?? 10;
  const focus = avgs["Focus"] ?? 10;
  const sleep = avgs["Sleep"] ?? 10;

  const matched: (Rule & { score: number })[] = [];
  const alreadyInStack = new Set(currentStackNames.map(n => n.toLowerCase()));

  for (const rule of RULES) {
    // Skip if already in stack
    if (alreadyInStack.has(rule.name.toLowerCase())) continue;

    let conditionMet = false;
    for (const cond of rule.conditions) {
      const checks = [
        cond.energyBelow !== undefined ? energy < cond.energyBelow : true,
        cond.moodBelow !== undefined ? mood < cond.moodBelow : true,
        cond.focusBelow !== undefined ? focus < cond.focusBelow : true,
        cond.sleepBelow !== undefined ? sleep < cond.sleepBelow : true,
      ];
      if (checks.every(Boolean)) {
        conditionMet = true;
        break;
      }
    }

    if (conditionMet) {
      // Score = how many domains are affected × how far below threshold
      let score = 0;
      if (energy < 6) score += (6 - energy);
      if (mood < 6) score += (6 - mood);
      if (focus < 6) score += (6 - focus);
      if (sleep < 6) score += (6 - sleep);
      matched.push({ ...rule, score });
    }
  }

  // Sort by priority then score; deduplicate by name
  const seen = new Set<string>();
  return matched
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return b.score - a.score;
    })
    .filter(r => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    })
    .slice(0, 8)
    .map(({ name, category, dose, reason, priority, tags }) => ({
      name, category, dose, reason, priority, tags,
    }));
}
