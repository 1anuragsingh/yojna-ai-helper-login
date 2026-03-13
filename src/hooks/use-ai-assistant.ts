import { useState, useCallback } from "react";
import { askSchemeAI, type AIResponse } from "@/lib/gemini";
import { searchSchemes, schemes } from "@/data/schemes";

// Rule-based fallback (used when API key is missing or Gemini fails)
function localFallback(query: string): AIResponse {
  const q = query.toLowerCase().trim();

  if (/^(hi|hello|namaste|hii|hey|नमस्ते|हाय)\b/.test(q)) {
    return {
      message:
        "Namaste! 🙏 I'm YOJNA AI. Tell me who you are — farmer, student, worker, or business owner — and I'll find the right government schemes for you!",
      schemes: [],
    };
  }

  const categoryMap: Record<string, string> = {
    farmer: "farmer", किसान: "farmer", kisan: "farmer", agriculture: "farmer",
    student: "student", scholarship: "student", education: "student", छात्र: "student",
    women: "women", woman: "women", महिला: "women", beti: "women",
    health: "health", hospital: "health", आयुष्मान: "health", "स्वास्थ्य": "health",
    housing: "housing", house: "housing", awas: "housing", आवास: "housing",
    business: "business", loan: "business", mudra: "business", "व्यापार": "business",
    worker: "worker", labour: "worker", job: "worker", employment: "worker", "मजदूर": "worker",
    senior: "senior", old: "senior", pension: "senior", "वृद्ध": "senior",
  };

  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (q.includes(keyword)) {
      const matched = schemes
        .filter((s) => s.category === cat || s.tags.some((t) => t.toLowerCase().includes(keyword)))
        .slice(0, 3);
      return {
        message:
          matched.length > 0
            ? `You may qualify for ${matched.length} scheme${matched.length > 1 ? "s" : ""}. Here are the top results:`
            : `No schemes found for that category yet. Try: farmer, student, health, housing, or business.`,
        schemes: matched,
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
  };
}

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (query: string): Promise<AIResponse> => {
    setLoading(true);
    try {
      return await askSchemeAI(query);
    } catch {
      // Graceful degradation — show local results with no error shown to user
      return localFallback(query);
    } finally {
      setLoading(false);
    }
  }, []);

  return { ask, loading };
}
