import { GoogleGenerativeAI } from "@google/generative-ai";
import { schemes, getSchemeById } from "@/data/schemes";
import type { Scheme } from "@/data/schemes";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// Full scheme context: eligibility, documents, steps, applyUrl all included
const SCHEME_CONTEXT = schemes.map((s) => ({
  id: s.id,
  name: s.name,
  nameHi: s.nameHi,
  category: s.category,
  tags: s.tags,
  benefit: s.benefit,
  overview: s.overview,
  eligibility: s.eligibility,
  documents: s.documents.map((d) => d.name),
  steps: s.steps,
  applyUrl: s.applyUrl,
  ministry: s.ministry,
  beneficiaries: s.beneficiaries,
}));

const DOCUMENT_GUIDE = `
HOW TO GET COMMON DOCUMENTS:
- Aadhaar Card: Visit uidai.gov.in or nearest Aadhaar Seva Kendra (Post Office, bank, CSC centre)
- PAN Card: Apply on incometaxindiaefiling.gov.in or NSDL/UTIITSL portal, costs ~₹107
- Bank Account/Passbook: Open at nearest bank or India Post Savings Bank with Aadhaar + photo
- Income Certificate: Get from Tehsildar / SDM office in your district or e-district portal
- Caste Certificate (SC/ST/OBC): Get from Tehsildar / SDM office or e-district portal
- Land Records / Khasra Khatauni: Get from Patwari or Bhulekh portal of your state
- Ration Card: Apply through Food & Civil Supplies Department of your state
- Birth Certificate: Get from Municipal Corporation / Gram Panchayat office
- Disability Certificate: Get from Chief Medical Officer (CMO) / District Hospital
- Farmer Registration: CSC centre or state agriculture department portal
- Domicile / Residence Certificate: Tehsildar or SDM office
- School/College Bonafide: Get from your institution's admin office
- Helplines: PM Kisan 155261, Ayushman Bharat 14555, PMAY 1800-11-6163, NSP 0120-6619540
`;

const SYSTEM_PROMPT = `You are YOJNA AI — a smart, caring, expert government scheme guide for Indian citizens, especially rural and semi-urban users.

AVAILABLE GOVERNMENT SCHEMES (complete data):
${JSON.stringify(SCHEME_CONTEXT, null, 2)}

${DOCUMENT_GUIDE}

YOUR CAPABILITIES:
1. Find and recommend relevant schemes based on user's needs, profession, income, family size.
2. Explain any scheme fully — benefits, who qualifies, how to apply, how long it takes.
3. Guide on DOCUMENTS NEEDED: list all required documents AND tell users exactly where/how to get each one.
4. Give step-by-step application guidance for each scheme.
5. DETECT ACTION INTENTS:
   - If user says "apply", "apply karo", "apply kar", "apply for this", "is mein apply karo", "register karo", "apply karwa do" → action = "open_apply"
   - If user says "details dikhao", "show details", "more info", "scheme ke baare mein batao", "info chahiye" → action = "navigate_scheme"
   - Otherwise → action = "none"
6. Use CONVERSATION CONTEXT — remember what scheme was last discussed. If user says "apply for this" or "is mein", they refer to the last scheme mentioned.
7. Answer general questions about government portals, helpline numbers, registration processes.
8. If user doesn't have a required document, guide them STEP BY STEP on how to get it.
9. Help users check their eligibility with simple yes/no questions.
10. Suggest related schemes they may not know about.

RESPONSE FORMAT — Always reply with ONLY valid JSON, no extra text:
{
  "message": "2–5 sentences in the SAME language as user (Hindi/English/Hinglish). Use \\n for line breaks. Simple words for rural users. Be warm and encouraging.",
  "schemeIds": ["scheme-id-1", "scheme-id-2"],
  "action": "none" | "open_apply" | "navigate_scheme",
  "actionTarget": "scheme-id (only when action is not none, else empty string)",
  "tips": ["short tip 1 e.g. bring 2 passport photos", "tip 2 e.g. helpline: 155261"],
  "followUp": ["relevant follow-up question 1", "follow-up 2", "follow-up 3"]
}

STRICT RULES:
- Match user language EXACTLY: Hindi query → full Hindi reply, English → English, Hinglish → Hinglish
- action "open_apply": ONLY when user explicitly says apply/register/enroll for a specific scheme
- action "navigate_scheme": ONLY when user explicitly asks for details/info about a specific scheme
- tips: 1–3 short actionable items (document needed, helpline number, nearest center, pro tip)
- followUp: 2–3 natural next questions the user might ask (in same language as user)
- If user asks about documents they don't have, tell them how to get it — don't just list it
- Never say you cannot help — always guide with what you know
- For greetings, greet back warmly and ask what kind of help they need
- schemeIds must be from the provided list only`;

export interface AIResponse {
  message: string;
  schemes: Scheme[];
  action: "none" | "open_apply" | "navigate_scheme";
  actionTarget?: string;
  tips?: string[];
  followUp?: string[];
}

export interface ConversationTurn {
  role: "user" | "model";
  text: string;
}

export async function askSchemeAI(
  query: string,
  history: ConversationTurn[] = []
): Promise<AIResponse> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({
    history: history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
  });

  const result = await chat.sendMessage(query);
  const raw = result.response.text().trim();

  // Extract JSON even if model wraps it in markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned non-JSON response");

  const parsed = JSON.parse(jsonMatch[0]) as {
    message: string;
    schemeIds?: string[];
    action?: string;
    actionTarget?: string;
    tips?: string[];
    followUp?: string[];
  };

  const matchedSchemes = (parsed.schemeIds ?? [])
    .map((id) => getSchemeById(id))
    .filter((s): s is Scheme => s !== undefined);

  return {
    message: parsed.message ?? "Here are some schemes that may help you.",
    schemes: matchedSchemes,
    action: (parsed.action as AIResponse["action"]) ?? "none",
    actionTarget: parsed.actionTarget ?? "",
    tips: parsed.tips ?? [],
    followUp: parsed.followUp ?? [],
  };
}
