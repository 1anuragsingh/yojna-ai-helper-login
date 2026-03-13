import { useState, useCallback } from "react";
import { askSchemeAI, type AIResponse, type ConversationTurn } from "@/lib/gemini";
import { searchSchemes, schemes } from "@/data/schemes";

function localFallback(query: string): AIResponse {
  const q = query.toLowerCase().trim();

  if (/^(hi|hello|namaste|hii|hey|नमस्ते|हाय)\b/.test(q)) {
    return {
      message:
        "Namaste! 🙏 I'm YOJNA AI. Tell me who you are — farmer, student, worker, or business owner — and I'll find the right government schemes for you!",
      schemes: [],
      action: "none",
      tips: [],
      followUp: [
        "I am a farmer, show me schemes",
        "Schemes for students",
        "Health insurance schemes",
      ],
    };
  }

  // Detect apply intent
  const applyIntent = /\b(apply|apply karo|apply kar|register karo|enroll)\b/i.test(q);

  const categoryMap: Record<string, string> = {
    farmer: "farmer", किसान: "farmer", kisan: "farmer", agriculture: "farmer",
    student: "student", scholarship: "student", education: "student", छात्र: "student",
    women: "women", woman: "women", महिला: "women", beti: "women",
    health: "health", hospital: "health", आयुष्मान: "health", स्वास्थ्य: "health",
    housing: "housing", house: "housing", awas: "housing", आवास: "housing",
    business: "business", loan: "business", mudra: "business", व्यापार: "business",
    worker: "worker", labour: "worker", job: "worker", employment: "worker", मजदूर: "worker",
    senior: "senior", old: "senior", pension: "senior", वृद्ध: "senior",
  };

  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (q.includes(keyword)) {
      const matched = schemes
        .filter((s) => s.category === cat || s.tags.some((t) => t.toLowerCase().includes(keyword)))
        .slice(0, 3);
      return {
        message:
          matched.length > 0
            ? `Found ${matched.length} scheme${matched.length > 1 ? "s" : ""} for you:`
            : `No schemes found for that category. Try: farmer, student, health, housing, or business.`,
        schemes: matched,
        action: applyIntent && matched.length > 0 ? "open_apply" : "none",
        actionTarget: applyIntent && matched.length > 0 ? matched[0].id : "",
        tips: ["You can ask about documents needed", "Say 'How to apply?' for step-by-step guide"],
        followUp: ["What documents do I need?", "Am I eligible?", "How to apply step by step?"],
      };
    }
  }

  const results = searchSchemes(query).slice(0, 3);
  return {
    message:
      results.length > 0
        ? `Found ${results.length} scheme${results.length > 1 ? "s" : ""} matching your query:`
        : `No schemes found for "${query}". Try: farmer, student, health, housing, business, pension.`,
    schemes: results,
    action: "none",
    tips: ["Try keywords like farmer, student, health, housing", "Ask in Hindi or English"],
    followUp: ["Show farmer schemes", "Show health schemes", "Show student scholarships"],
  };
}

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ConversationTurn[]>([]);

  const ask = useCallback(
    async (query: string): Promise<AIResponse> => {
      setLoading(true);
      try {
        const response = await askSchemeAI(query, history);
        // Append this turn to history for multi-turn context
        setHistory((prev) => [
          ...prev,
          { role: "user", text: query },
          {
            role: "model",
            text: JSON.stringify({
              message: response.message,
              schemeIds: response.schemes.map((s) => s.id),
              action: response.action,
              actionTarget: response.actionTarget,
            }),
          },
        ]);
        return response;
      } catch {
        return localFallback(query);
      } finally {
        setLoading(false);
      }
    },
    [history]
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  return { ask, loading, clearHistory };
}
