import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import StepProgressBar from "@/components/StepProgressBar";

const ApplicationPage = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const steps = [t("basicInfo"), t("documents"), t("submit")];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border bg-card px-5 pb-4 pt-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("applyNow")}</h1>
          <div />
        </div>
        <div className="mx-auto mt-4 max-w-lg">
          <StepProgressBar steps={steps} currentStep={step} />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-6">
        {step < 2 ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <p className="text-lg font-bold text-foreground">
                {step === 0 ? "Your details are pre-filled from your profile ✅" : "Your documents are ready ✅"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === 0 ? "Review and confirm your information." : "All required documents are uploaded."}
              </p>
            </div>
            <button
              onClick={() => setStep(step + 1)}
              className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md active:scale-[0.98]"
            >
              {t("next")}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <CheckCircle2 className="mx-auto h-20 w-20 text-success" />
            </motion.div>
            <h2 className="mt-4 text-2xl font-extrabold text-foreground">🎉 Application Submitted!</h2>
            <p className="mt-2 text-muted-foreground">You will receive updates on your application status.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-8 w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md"
            >
              {t("home")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;
