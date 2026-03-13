import { GoogleGenerativeAI } from "@google/generative-ai";
import { schemes, getSchemeById } from "@/data/schemes";
import type { Scheme } from "@/data/schemes";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// Compact scheme list injected into every prompt
const SCHEME_CONTEXT = schemes.map((s) => ({
  id: s.id,
  name: s.name,
  nameHi: s.nameHi,
  category: s.category,
  tags: s.tags,
  benefit: s.benefit,
  eligibility: s.eligibility.slice(0, 2),
}));

const SYSTEM_PROMPT = `You are YOJNA AI, a warm and friendly assistant that helps Indian citizens find government welfare schemes.

You have access to the following government schemes:
${JSON.stringify(SCHEME_CONTEXT, null, 2)}

Rules:
1. Detect the language of the user query (Hindi/English/Hinglish) and reply in that SAME language.
2. Match the user's query to the most relevant schemes based on their need/category/keywords.
3. Respond ONLY with valid JSON — no extra text before or after.
4. JSON format: {"message": "...", "schemeIds": ["id1", "id2", "id3"]}
   - message: A friendly 2–3 sentence explanation naming the matched schemes and why they qualify. Keep it simple for rural users.
   - schemeIds: Array of up to 3 most relevant scheme IDs from the list above. Empty array [] if nothing matches.
5. For Hindi queries, write the message entirely in Hindi.
6. If the user greets you, greet back and ask what kind of scheme they need.
7. If nothing matches, suggest they try keywords like: farmer, student, health, housing, business, women, pension.`;

export interface AIResponse {
  message: string;
  schemes: Scheme[];
}

export async function askSchemeAI(query: string): Promise<AIResponse> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    `User query: "${query}"`,
  ]);

  const raw = result.response.text().trim();

  // Extract JSON even if model wraps it in markdown
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned non-JSON response");

  const parsed = JSON.parse(jsonMatch[0]) as { message: string; schemeIds?: string[] };

  const matchedSchemes = (parsed.schemeIds ?? [])
    .map((id) => getSchemeById(id))
    .filter((s): s is Scheme => s !== undefined);

  return {
    message: parsed.message ?? "Here are some schemes that may help you.",
    schemes: matchedSchemes,
  };
}
