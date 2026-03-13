import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SchemeCard from "@/components/SchemeCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { schemes, searchSchemes, getSchemesByCategory, SchemeCategory } from "@/data/schemes";

const CATEGORIES: { id: SchemeCategory | "all"; label: string; labelHi: string; emoji: string }[] = [
  { id: "all",      label: "All",      labelHi: "सभी",       emoji: "🇮🇳" },
  { id: "farmer",   label: "Farmer",   labelHi: "किसान",     emoji: "🌾" },
  { id: "student",  label: "Student",  labelHi: "छात्र",      emoji: "🎓" },
  { id: "women",    label: "Women",    labelHi: "महिला",     emoji: "👩" },
  { id: "health",   label: "Health",   labelHi: "स्वास्थ्य",   emoji: "🏥" },
  { id: "housing",  label: "Housing",  labelHi: "आवास",      emoji: "🏠" },
  { id: "business", label: "Business", labelHi: "व्यापार",   emoji: "💼" },
  { id: "worker",   label: "Worker",   labelHi: "श्रमिक",    emoji: "⛏️" },
  { id: "senior",   label: "Senior",   labelHi: "वरिष्ठ",    emoji: "🧓" },
];

const SchemesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<SchemeCategory | "all">("all");

  const filtered = useMemo(() => {
    let base = query.trim() ? searchSchemes(query) : getSchemesByCategory(activeCategory);
    if (query.trim() && activeCategory !== "all") {
      base = base.filter((s) => s.category === activeCategory);
    }
    return base;
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-5 pb-3 pt-5">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">{t("eligibleSchemes")}</h1>
            <LanguageSwitcher />
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-2xl border border-input bg-muted py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{cat.emoji}</span>
                {language === "hi" ? cat.labelHi : cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mx-auto max-w-2xl px-5 pt-5">
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          🎉 <strong>{filtered.length}</strong> {t("schemesFound")}
        </motion.p>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-16 flex flex-col items-center text-center"
            >
              <span className="text-5xl">🔍</span>
              <p className="mt-3 text-base font-semibold text-foreground">No schemes found</p>
              <p className="text-sm text-muted-foreground">Try different keywords or category</p>
              <button
                onClick={() => { setQuery(""); setActiveCategory("all"); }}
                className="mt-4 text-sm font-semibold text-primary"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {filtered.map((scheme) => (
                <motion.div
                  key={scheme.id}
                  layout
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <SchemeCard scheme={scheme} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SchemesPage;
