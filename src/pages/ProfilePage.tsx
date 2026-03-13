import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sprout, GraduationCap, Hammer, Briefcase, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import StepProgressBar from "@/components/StepProgressBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ProfilePage = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    category: "",
    age: "",
    state: "",
    district: "",
    income: "",
    caste: "",
    education: "",
    disability: "no",
  });
  const navigate = useNavigate();
  const { t } = useLanguage();

  const steps = [t("selectCategory"), t("basicInfo"), t("optionalDetails")];

  const categories = [
    { id: "farmer", label: t("farmer"), icon: "🌾" },
    { id: "student", label: t("student"), icon: "🎓" },
    { id: "worker", label: t("worker"), icon: "🔨" },
    { id: "business", label: t("business"), icon: "💼" },
  ];

  const states = ["Uttar Pradesh", "Maharashtra", "Bihar", "Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Karnataka", "Gujarat", "West Bengal", "Andhra Pradesh"];
  const incomeRanges = ["< ₹1 Lakh", "₹1-3 Lakh", "₹3-5 Lakh", "₹5-10 Lakh", "> ₹10 Lakh"];
  const casteOptions = ["General", "OBC", "SC", "ST"];
  const educationOptions = ["No formal education", "Primary", "Secondary", "Graduate", "Post Graduate"];

  const handleComplete = () => {
    navigate("/schemes");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border bg-card px-5 pb-4 pt-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))} className="rounded-xl p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("createProfile")}</h1>
          <LanguageSwitcher />
        </div>
        <div className="mx-auto mt-4 max-w-lg">
          <StepProgressBar steps={steps} currentStep={step} />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-6 text-center text-xl font-bold">{t("selectCategory")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setProfile({ ...profile, category: cat.id }); setStep(1); }}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                      profile.category === cat.id ? "border-primary bg-primary/5 shadow-card-hover" : "border-border bg-card shadow-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-5xl">{cat.icon}</span>
                    <span className="text-base font-bold text-foreground">{cat.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="mb-2 text-center text-xl font-bold">{t("basicInfo")}</h2>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("age")}</label>
                <select
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">—</option>
                  {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("state")}</label>
                <select
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">—</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("income")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {incomeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setProfile({ ...profile, income: range })}
                      className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all ${
                        profile.income === range ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
              >
                {t("next")} <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="mb-2 text-center text-xl font-bold">{t("optionalDetails")}</h2>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("casteCategory")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {casteOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setProfile({ ...profile, caste: c })}
                      className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all ${
                        profile.caste === c ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("education")}</label>
                <select
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">—</option>
                  {educationOptions.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("disability")}</label>
                <div className="flex gap-3">
                  {[{ val: "no", label: t("no") }, { val: "yes", label: t("yes") }].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setProfile({ ...profile, disability: opt.val })}
                      className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        profile.disability === opt.val ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
              >
                <CheckCircle2 className="h-5 w-5" />
                {t("submit")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
