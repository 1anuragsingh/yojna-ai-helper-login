import { CheckCircle2, Clock, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentCardProps {
  name: string;
  nameHi: string;
  uploadedDate: string;
  status: "verified" | "pending";
  icon?: string;
}

const DocumentCard = ({ name, nameHi, uploadedDate, status, icon }: DocumentCardProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl">
        {icon || <FileText className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">{language === "hi" ? nameHi : name}</h4>
        <p className="text-xs text-muted-foreground">{uploadedDate}</p>
      </div>
      <div
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          status === "verified"
            ? "bg-success/10 text-success"
            : "bg-warning/10 text-warning"
        }`}
      >
        {status === "verified" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        {t(status)}
      </div>
    </div>
  );
};

export default DocumentCard;
