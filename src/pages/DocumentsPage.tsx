import { motion } from "framer-motion";
import { ArrowLeft, Upload, Camera, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import DocumentCard from "@/components/DocumentCard";

const sampleDocs = [
  { name: "Aadhaar Card", nameHi: "आधार कार्ड", uploadedDate: "12 Jan 2025", status: "verified" as const, icon: "🪪" },
  { name: "Bank Passbook", nameHi: "बैंक पासबुक", uploadedDate: "15 Jan 2025", status: "verified" as const, icon: "🏦" },
  { name: "Land Record", nameHi: "भूमि रिकॉर्ड", uploadedDate: "20 Jan 2025", status: "pending" as const, icon: "📄" },
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border bg-card px-5 pb-4 pt-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button onClick={() => navigate("/")} className="rounded-xl p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("documents")}</h1>
          <div />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-6">
        {/* Upload actions */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 transition-colors hover:border-primary"
          >
            <Upload className="h-8 w-8 text-primary" />
            <span className="text-sm font-bold text-primary">{t("upload")}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 p-5 transition-colors hover:border-secondary"
          >
            <Camera className="h-8 w-8 text-secondary" />
            <span className="text-sm font-bold text-secondary">{t("scan")}</span>
          </motion.button>
        </div>

        {/* Documents list */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-3"
        >
          {sampleDocs.map((doc, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <DocumentCard {...doc} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsPage;
