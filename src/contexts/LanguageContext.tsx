import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "hi";

interface Translations {
  [key: string]: { en: string; hi: string };
}

const translations: Translations = {
  tagline: { en: "Your Smart Assistant for Government Schemes", hi: "सरकारी योजनाओं के लिए आपका स्मार्ट सहायक" },
  searchPlaceholder: { en: "Search government schemes...", hi: "सरकारी योजनाएं खोजें..." },
  findSchemes: { en: "Find Schemes for Me", hi: "मेरे लिए योजनाएं खोजें" },
  uploadDocs: { en: "Upload Documents", hi: "दस्तावेज़ अपलोड करें" },
  checkEligibility: { en: "Check Eligibility", hi: "पात्रता जांचें" },
  askAI: { en: "Ask AI Assistant", hi: "AI सहायक से पूछें" },
  farmerSchemes: { en: "Farmer Schemes", hi: "किसान योजनाएं" },
  studentSchemes: { en: "Student Schemes", hi: "छात्र योजनाएं" },
  womenSchemes: { en: "Women Schemes", hi: "महिला योजनाएं" },
  seniorSchemes: { en: "Senior Citizen", hi: "वरिष्ठ नागरिक" },
  createProfile: { en: "Create Profile", hi: "प्रोफ़ाइल बनाएं" },
  selectCategory: { en: "Select Your Category", hi: "अपनी श्रेणी चुनें" },
  farmer: { en: "Farmer", hi: "किसान" },
  student: { en: "Student", hi: "छात्र" },
  worker: { en: "Worker", hi: "श्रमिक" },
  business: { en: "Business Owner", hi: "व्यापार मालिक" },
  basicInfo: { en: "Basic Information", hi: "बुनियादी जानकारी" },
  age: { en: "Age", hi: "उम्र" },
  state: { en: "State", hi: "राज्य" },
  district: { en: "District", hi: "जिला" },
  income: { en: "Annual Income", hi: "वार्षिक आय" },
  next: { en: "Next", hi: "आगे" },
  back: { en: "Back", hi: "पीछे" },
  submit: { en: "Submit", hi: "जमा करें" },
  eligibleSchemes: { en: "Eligible Schemes", hi: "पात्र योजनाएं" },
  benefit: { en: "Benefit", hi: "लाभ" },
  eligibility: { en: "Eligibility", hi: "पात्रता" },
  viewDetails: { en: "View Details", hi: "विवरण देखें" },
  applyNow: { en: "Apply Now", hi: "अभी आवेदन करें" },
  documents: { en: "My Documents", hi: "मेरे दस्तावेज़" },
  upload: { en: "Upload", hi: "अपलोड" },
  scan: { en: "Scan with Camera", hi: "कैमरे से स्कैन करें" },
  verified: { en: "Verified", hi: "सत्यापित" },
  pending: { en: "Pending", hi: "लंबित" },
  overview: { en: "Overview", hi: "अवलोकन" },
  requiredDocs: { en: "Required Documents", hi: "आवश्यक दस्तावेज़" },
  howToApply: { en: "How to Apply", hi: "कैसे आवेदन करें" },
  benefits: { en: "Benefits", hi: "लाभ" },
  home: { en: "Home", hi: "होम" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  schemes: { en: "Schemes", hi: "योजनाएं" },
  chat: { en: "Chat", hi: "चैट" },
  optionalDetails: { en: "Optional Details", hi: "वैकल्पिक विवरण" },
  casteCategory: { en: "Caste Category", hi: "जाति श्रेणी" },
  education: { en: "Education", hi: "शिक्षा" },
  disability: { en: "Disability", hi: "विकलांगता" },
  none: { en: "None", hi: "कोई नहीं" },
  yes: { en: "Yes", hi: "हाँ" },
  no: { en: "No", hi: "नहीं" },
  profileComplete: { en: "Profile Complete!", hi: "प्रोफ़ाइल पूर्ण!" },
  schemesFound: { en: "schemes found for you", hi: "योजनाएं आपके लिए मिलीं" },
  perYear: { en: "per year", hi: "प्रति वर्ष" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
