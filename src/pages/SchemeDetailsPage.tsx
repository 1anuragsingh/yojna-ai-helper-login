import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ExternalLink, Users, Calendar, Building2, Zap, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSchemeById } from "@/data/schemes";
import { useToast } from "@/hooks/use-toast";

// Schemes that support browser automation (via local automation server)
const AUTO_FILL_CONFIG: Record<string, { endpoint: string; label: string }> = {
  "pm-kisan": {
    endpoint: "/apply/pm-kisan",
    label: "Auto-Fill Aadhaar & State",
  },
};

const AUTOMATION_SERVER = "http://localhost:3001";

const SchemeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [autoFilling, setAutoFilling] = useState(false);

  const scheme = getSchemeById(id ?? "");
  const isHi = language === "hi";
  const autoFill = id ? AUTO_FILL_CONFIG[id] : undefined;

  if (!scheme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <span className="text-6xl">😕</span>
        <p className="text-lg font-bold text-foreground">Scheme not found</p>
        <button onClick={() => navigate("/schemes")} className="text-sm font-semibold text-primary">
          ← Back to Schemes
        </button>
      </div>
    );
  }

  const handleApply = () => window.open(scheme.applyUrl, "_blank", "noopener,noreferrer");

  const handleAutoFill = async () => {
    if (!autoFill) return;
    setAutoFilling(true);
    try {
      // Check if automation server is running
      await fetch(`${AUTOMATION_SERVER}/health`, { signal: AbortSignal.timeout(2500) });
      // Trigger automation
      await fetch(`${AUTOMATION_SERVER}${autoFill.endpoint}`, { method: "POST" });
      toast({
        title: "⚡ Browser opening!",
        description: "Aadhaar + State auto-filled. Solve the CAPTCHA to get your OTP.",
      });
    } catch {
      toast({
        title: "Start the automation server first",
        description: "Run in a new terminal:  node scripts/automate-server.cjs",
        variant: "destructive",
      });
    } finally {
      setAutoFilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── Gradient Hero ── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${scheme.colorGradient} px-5 pb-8 pt-6`}>
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 left-4 h-28 w-28 rounded-full bg-black/10 blur-xl" />

        <div className="relative mx-auto max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-lg">
              <span className="text-4xl leading-none">{scheme.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="mb-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {scheme.category}
              </span>
              <h1 className="text-xl font-extrabold leading-tight text-white">
                {isHi ? scheme.nameHi : scheme.name}
              </h1>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: Users,     text: scheme.beneficiaries },
              { icon: Calendar,  text: `Since ${scheme.launchedYear}` },
              { icon: Building2, text: scheme.ministry.split(" ").slice(0, 3).join(" ") },
            ].map((m) => (
              <div key={m.text} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <m.icon className="h-3.5 w-3.5 text-white/80" />
                <span className="text-xs font-medium text-white/90">{m.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-2xl space-y-6 px-5 pt-6">

        {/* Benefit card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.colorGradient} p-5 text-center shadow-lg`}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">{t("benefit")}</p>
          <p className="text-2xl font-extrabold text-white">{isHi ? scheme.benefitHi : scheme.benefit}</p>
        </motion.div>

        {/* Overview */}
        <section>
          <h2 className="mb-2 text-base font-bold text-foreground">{t("overview")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isHi ? scheme.overviewHi : scheme.overview}
          </p>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="mb-3 text-base font-bold text-foreground">{t("eligibility")}</h2>
          <div className="space-y-2">
            {(isHi ? scheme.eligibilityHi : scheme.eligibility).map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-card">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section>
          <h2 className="mb-3 text-base font-bold text-foreground">{t("requiredDocs")}</h2>
          <div className="space-y-2">
            {scheme.documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
                <span className="text-2xl leading-none">{doc.icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {isHi ? doc.nameHi : doc.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How to Apply */}
        <section>
          <h2 className="mb-3 text-base font-bold text-foreground">{t("howToApply")}</h2>
          <div className="space-y-3">
            {(isHi ? scheme.stepsHi : scheme.steps).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${scheme.colorGradient} text-xs font-bold text-white shadow-sm`}>
                  {i + 1}
                </div>
                <p className="pt-0.5 text-sm leading-relaxed text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Apply CTA */}
        <div className="space-y-3">

          {/* AI Auto-Fill — shown only for supported schemes (pm-kisan) */}
          {autoFill && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  AI-Assisted Application
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-amber-700/80 dark:text-amber-300/70">
                Opens the official PM Kisan portal and <strong>auto-fills Aadhaar (98765432100)</strong>{" "}
                and state <strong>(Madhya Pradesh)</strong>. You only solve the CAPTCHA.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAutoFill}
                disabled={autoFilling}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-600 disabled:opacity-60"
              >
                {autoFilling ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Opening browser…</>
                ) : (
                  <><Zap className="h-4 w-4" /> {autoFill.label}</>
                )}
              </motion.button>
              <p className="mt-2 text-center text-[10px] text-amber-600/50">
                Needs automation server running · <code className="font-mono">node scripts/automate-server.cjs</code>
              </p>
            </motion.div>
          )}

          {/* Standard button — always shown */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleApply}
            className={`flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r ${scheme.colorGradient} py-4 text-base font-bold text-white shadow-xl transition-transform active:scale-[0.98]`}
          >
            {t("applyNow")} — Official Portal
            <ExternalLink className="h-5 w-5" />
          </motion.button>
          <p className="pb-4 text-center text-xs text-muted-foreground">
            You'll be redirected to the official government portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailsPage;
