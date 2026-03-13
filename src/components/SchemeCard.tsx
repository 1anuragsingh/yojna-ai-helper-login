import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Scheme } from "@/data/schemes";

interface SchemeCardProps {
  scheme: Scheme;
}

const SchemeCard = ({ scheme }: SchemeCardProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isHi = language === "hi";

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(scheme.applyUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/scheme/${scheme.id}`)}
      className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${scheme.colorGradient}`} />

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${scheme.colorGradient} shadow-md`}>
              <span className="text-2xl leading-none">{scheme.icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2">
                {isHi ? scheme.nameHi : scheme.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{scheme.ministry}</p>
            </div>
          </div>
          {scheme.eligibilityScore && (
            <div className="flex-shrink-0 flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span className="text-[11px] font-bold text-success">{scheme.eligibilityScore}%</span>
            </div>
          )}
        </div>

        {/* benefit */}
        <div className="mb-3 rounded-xl bg-muted px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("benefit")}
          </span>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            {isHi ? scheme.benefitHi : scheme.benefit}
          </p>
        </div>

        <p className="mb-4 text-[11px] text-muted-foreground">
          👥 {scheme.beneficiaries} &nbsp;·&nbsp; Since {scheme.launchedYear}
        </p>

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/scheme/${scheme.id}`); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            {t("viewDetails")}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleApply}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${scheme.colorGradient} py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-95`}
          >
            {t("applyNow")}
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SchemeCard;
