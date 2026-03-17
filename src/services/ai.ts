import Anthropic from "@anthropic-ai/sdk";

export type BloodworkMarker = {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
  status?: "optimal" | "normal" | "low" | "high";
};

export type BloodworkInput = {
  date: string;
  rawText?: string;
  markers?: BloodworkMarker[];
  userContext?: {
    age?: string;
    gender?: string;
    goal?: string;
  };
};

export type BloodworkSummary = {
  summary: string;
  keyFindings: string[];
  questionsForDoctor: string[];
  disclaimer: string;
};

const MOCK_SUMMARY: BloodworkSummary = {
  summary:
    "AI analysis is not configured yet. Please add your ANTHROPIC_API_KEY to .env.local to enable this feature.",
  keyFindings: ["Add ANTHROPIC_API_KEY to enable bloodwork analysis"],
  questionsForDoctor: [],
  disclaimer:
    "This is not medical advice. Always consult a qualified physician before making health decisions.",
};

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateBloodworkSummary(
  input: BloodworkInput
): Promise<BloodworkSummary> {
  const client = getClient();
  if (!client) return MOCK_SUMMARY;

  const safeContext = {
    age: input.userContext?.age?.slice(0, 10),
    gender: input.userContext?.gender?.slice(0, 20),
    goal: input.userContext?.goal?.slice(0, 200),
  };

  const markersText = input.markers?.length
    ? input.markers
        .map(
          (m) =>
            `  - ${m.name}: ${m.value} ${m.unit}${m.referenceRange ? ` (ref: ${m.referenceRange})` : ""}${m.status ? ` [${m.status}]` : ""}`
        )
        .join("\n")
    : "No structured markers provided.";

  const rawSection = input.rawText
    ? `\n\nExtracted PDF text:\n"""\n${input.rawText.slice(0, 3000)}\n"""`
    : "";

  const systemPrompt = `You are a biomarker interpretation assistant. Your role is to:
1. Explain key bloodwork findings in plain language a non-doctor can understand.
2. Flag values that are out of normal range (high or low).
3. Note trends if multiple test dates are present.
4. Suggest 3-5 specific questions the user should ask their doctor.
5. Always include a clear disclaimer that this is not medical advice.

Focus on: CBC, lipid panel, metabolic panel, liver enzymes, hormones if present.

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "2-3 sentence plain-language overview",
  "keyFindings": ["finding 1", "finding 2"],
  "questionsForDoctor": ["question 1", "question 2"],
  "disclaimer": "This analysis is for informational purposes only and is not medical advice. Please consult your physician."
}`;

  const userMessage = `Blood test date: ${input.date}
${safeContext ? `Patient context: Age ${safeContext.age || "unknown"}, Gender ${safeContext.gender || "unknown"}, Goal: ${safeContext.goal || "general health"}` : ""}

Structured markers:
${markersText}
${rawSection}`;

  try {
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(content) as BloodworkSummary;
    parsed.disclaimer =
      parsed.disclaimer ||
      "This analysis is for informational purposes only and is not medical advice. Please consult your physician.";
    return parsed;
  } catch (err) {
    console.error("generateBloodworkSummary error:", err);
    return {
      ...MOCK_SUMMARY,
      summary: "Failed to analyze bloodwork. Please try again.",
    };
  }
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  modelOverride?: string
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const message = await client.messages.create({
      model: modelOverride || "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    return message.content[0].type === "text" ? message.content[0].text : null;
  } catch {
    return null;
  }
}
