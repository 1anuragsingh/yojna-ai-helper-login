import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      <Globe className="ml-2 h-4 w-4 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
            language === lang.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
