export interface DoseRecommendation {
  dose: number;
  unit: string;
  frequency: string;
  note: string;
}

export function calculateEstimatedDose(
  name: string,
  profile: {
    weight: string;
    bodyFat: string;
    age: string;
    gender: string;
  }
): DoseRecommendation | null {
  const weightKg = parseFloat(profile.weight) || 75;
  const age = parseInt(profile.age) || 30;
  const gender = profile.gender.toLowerCase();
  const bodyFat = parseFloat(profile.bodyFat) || (gender === 'female' ? 25 : 18);

  const n = name.toLowerCase();

  // Magnesium
  if (n.includes("magnesium")) {
    const base = gender === 'female' ? 320 : 420;
    const adjusted = weightKg * 5; // 5mg/kg is a common recommendation
    return {
      dose: Math.round(Math.max(base, adjusted)),
      unit: "mg",
      frequency: "Daily",
      note: "Based on 5mg/kg body weight and RDA minimums."
    };
  }

  // Creatine
  if (n.includes("creatine")) {
    const leanMass = weightKg * (1 - bodyFat / 100);
    const dose = Math.round(leanMass * 0.05 * 10) / 10; // 0.05g/kg lean mass
    return {
      dose: Math.max(3, dose),
      unit: "g",
      frequency: "Daily",
      note: "Calculated at 0.05g per kg of lean body mass."
    };
  }

  // Vitamin D
  if (n.includes("vitamin d")) {
    const dose = weightKg * 50; // 50 IU per kg
    return {
      dose: Math.round(dose / 1000) * 1000,
      unit: "IU",
      frequency: "Daily",
      note: "Estimated at 50 IU per kg of body weight."
    };
  }

  // Fish Oil / Omega 3
  if (n.includes("fish oil") || n.includes("omega")) {
    return {
      dose: weightKg > 90 ? 3000 : 2000,
      unit: "mg",
      frequency: "Daily",
      note: "Standard high-performance dose adjusted for body mass."
    };
  }

  // Peptides - BPC-157
  if (n.includes("bpc")) {
    const dose = weightKg * 5; // 5mcg/kg
    return {
      dose: Math.round(dose),
      unit: "mcg",
      frequency: "1-2x Daily",
      note: "Estimated at 5mcg per kg body weight (Standard protocol)."
    };
  }

  // Peptides - TB-500
  if (n.includes("tb-500") || n.includes("thymosin")) {
    return {
      dose: weightKg > 85 ? 5 : 2.5,
      unit: "mg",
      frequency: "2x Weekly",
      note: "Protocol adjusted for total body mass."
    };
  }

  // Zinc
  if (n.includes("zinc")) {
    const base = gender === 'male' ? 11 : 8;
    return {
      dose: weightKg > 90 ? 25 : 15,
      unit: "mg",
      frequency: "Daily",
      note: "Includes safety buffer based on body weight."
    };
  }

  return null;
}
