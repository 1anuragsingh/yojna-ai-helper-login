import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Mic, ArrowRight, Sparkles, TrendingUp, Users,
  ChevronRight, Star, Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const popularSchemes = [
  { schemeId: "pm-kisan",          name: "PM Kisan Samman Nidhi", category: "Farmer",    benefit: "₹6,000 / year",       gradient: "from-emerald-500 to-green-600",  icon: "🌾", count: "12 Cr+ farmers"   },
  { schemeId: "pm-awas-urban",     name: "PM Awas Yojana",        category: "Housing",   benefit: "₹2.5 Lakh aid",       gradient: "from-blue-500 to-indigo-600",    icon: "🏠", count: "3 Cr+ families"   },
  { schemeId: "ayushman-bharat",   name: "Ayushman Bharat",       category: "Health",    benefit: "₹5 Lakh / year",      gradient: "from-rose-500 to-pink-600",      icon: "🏥", count: "55 Cr+ covered"   },
  { schemeId: "national-scholarship", name: "PM Scholarship",     category: "Education", benefit: "₹25,000 / year",      gradient: "from-violet-500 to-purple-600",  icon: "🎓", count: "82,000+ students"  },
  { schemeId: "ujjwala-yojana",    name: "Ujjwala Yojana",        category: "Women",     benefit: "Free LPG Connection", gradient: "from-orange-500 to-amber-600",   icon: "🍳", count: "9 Cr+ households"  },
  { schemeId: "pm-mudra",          name: "MUDRA Yojana",          category: "Business",  benefit: "Up to ₹10 Lakh",      gradient: "from-teal-500 to-cyan-600",      icon: "💼", count: "40 Cr+ loans"      },
];

const CARD_W = 220;

/* ─────────────────────────────────────────────
   DECORATIVE ─ SVG mandala ring (corner accent)
───────────────────────────────────────────── */
const MandalaAccent = () => (
  <svg
    viewBox="0 0 320 320"
    className="absolute -right-16 -top-16 h-72 w-72 opacity-[0.07] select-none pointer-events-none"
    fill="none"
    aria-hidden
  >
    {[20, 40, 60, 80, 100, 120, 140].map((r) => (
      <circle key={r} cx="160" cy="160" r={r} stroke="white" strokeWidth="1" />
    ))}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return (
        <line
          key={i}
          x1="160" y1="160"
          x2={160 + 140 * Math.cos(angle)}
          y2={160 + 140 * Math.sin(angle)}
          stroke="white" strokeWidth="0.5"
        />
      );
    })}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const cx = 160 + 100 * Math.cos(angle);
      const cy = 160 + 100 * Math.sin(angle);
      return <circle key={i} cx={cx} cy={cy} r="4" fill="white" />;
    })}
  </svg>
);

/* ─────────────────────────────────────────────
   DECORATIVE ─ Parliament silhouette at horizon
───────────────────────────────────────────── */
const HorizonSilhouette = () => (
  <svg
    viewBox="0 0 800 120"
    preserveAspectRatio="xMidYMax meet"
    className="absolute bottom-0 left-0 right-0 w-full opacity-[0.08] select-none pointer-events-none"
    fill="white"
    aria-hidden
  >
    {/* simplified skyline: domes, minarets, buildings */}
    <rect x="0"   y="60"  width="60"  height="60" />
    <rect x="70"  y="40"  width="40"  height="80" />
    <rect x="120" y="50"  width="20"  height="70" />
    <ellipse cx="140" cy="50" rx="16" ry="10" />
    <rect x="160" y="30"  width="8"   height="90" />
    <polygon points="164,30 160,55 168,55" />
    <rect x="180" y="55"  width="80"  height="65" />
    <ellipse cx="220" cy="55" rx="28" ry="18" />
    <rect x="216" y="20"  width="8"   height="35" />
    <polygon points="220,20 215,38 225,38" />
    <rect x="270" y="45"  width="30"  height="75" />
    <rect x="310" y="35"  width="50"  height="85" />
    <ellipse cx="335" cy="35" rx="20" ry="14" />
    <rect x="370" y="55"  width="100" height="65" />
    <rect x="390" y="20"  width="6"   height="35" />
    <polygon points="393,20 388,38 398,38" />
    <rect x="460" y="38"  width="6"   height="37" />
    <polygon points="463,38 458,55 468,55" />
    <rect x="480" y="50"  width="60"  height="70" />
    <ellipse cx="510" cy="50" rx="22" ry="14" />
    <rect x="550" y="40"  width="40"  height="80" />
    <rect x="600" y="60"  width="200" height="60" />
    <rect x="640" y="35"  width="30"  height="85" />
    <ellipse cx="655" cy="35" rx="18" ry="12" />
    <rect x="700" y="50"  width="20"  height="70" />
    <rect x="740" y="45"  width="60"  height="75" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % popularSchemes.length;
        carouselRef.current?.scrollTo({ left: next * CARD_W, behavior: "smooth" });
        return next;
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setHeaderSolid(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToCard = (i: number) => {
    setActiveIndex(i);
    carouselRef.current?.scrollTo({ left: i * CARD_W, behavior: "smooth" });
  };

  const categories = [
    { label: t("farmerSchemes"),  icon: "🌾", color: "from-green-50  to-emerald-50 border-emerald-200" },
    { label: t("studentSchemes"), icon: "🎓", color: "from-blue-50   to-indigo-50  border-blue-200"    },
    { label: t("womenSchemes"),   icon: "👩", color: "from-pink-50   to-rose-50    border-rose-200"     },
    { label: t("seniorSchemes"),  icon: "🧓", color: "from-amber-50  to-orange-50  border-amber-200"    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ══════════════════════════════════════════
          HERO  (rich photo-quality background)
      ══════════════════════════════════════════ */}
      <section className="hero-photo relative overflow-hidden">

        {/* ─── decorative layers ─── */}
        {/* blob 1 – saffron glow upper-left */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-amber-400/25 blur-[100px]" />
        {/* blob 2 – emerald glow mid */}
        <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-[90px]" />
        {/* blob 3 – indigo glow bottom-right */}
        <div className="absolute -bottom-16 right-4 h-56 w-56 rounded-full bg-indigo-400/20 blur-[80px]" />
        {/* mandala ring top-right */}
        <MandalaAccent />
        {/* grain / noise overlay */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />
        {/* horizon buildings */}
        <HorizonSilhouette />

        {/* ─── fixed nav bar (sits inside hero at top) ─── */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300 ${
            headerSolid
              ? "bg-[#0d1f35]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
              : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
            {/* ── Logo (corner) ── */}
            <div className="flex items-center gap-2.5">
              {/* badge */}
              <div className="relative flex h-10 w-10 items-center justify-center">
                {/* outer saffron ring */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-80" />
                {/* inner dark square */}
                <div className="absolute inset-[3px] rounded-xl bg-[#0d1f35] flex items-center justify-center">
                  <span className="text-sm font-black text-amber-400 leading-none">Y</span>
                </div>
              </div>
              {/* wordmark */}
              <div className="leading-tight">
                <span className="block text-[15px] font-extrabold tracking-wider text-white">
                  YOJNA <span className="text-amber-400">AI</span>
                </span>
                <span className="block text-[9px] font-medium tracking-widest text-white/50 uppercase">
                  Scheme Assistant
                </span>
              </div>
            </div>

            {/* right actions */}
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* ─── hero content ─── */}
        <div className="relative mx-auto max-w-2xl px-5 pb-20 pt-8">

          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-sm">
              🇮🇳 India's Smart Scheme Assistant
            </span>

            {/* headline */}
            <h2 className="mb-3 text-4xl font-extrabold leading-[1.15] tracking-tight text-white">
              Find Schemes<br />
              Made for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-400">You</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-amber-400/60" />
              </span>
            </h2>

            <p className="mb-7 text-sm leading-relaxed text-white/60">
              {t("tagline")} — free, fast, in your language.
            </p>
          </motion.div>

          {/* ─── Search bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="relative mb-6"
          >
            <div className="relative flex items-center rounded-2xl bg-white shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <Search className="ml-4 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <input
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent py-4 pl-3 pr-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              {/* mic */}
              <button
                onClick={() => navigate("/voice")}
                className="mr-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <Mic className="h-4 w-4" />
              </button>
              {/* search submit */}
              <button
                onClick={() => navigate("/schemes")}
                className="mr-2 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/30 transition-transform active:scale-95"
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* ─── Stats row ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="flex flex-wrap gap-2"
          >
            {[
              { emoji: "✨", val: "500+",    label: "Active Schemes" },
              { emoji: "👥", val: "55 Cr+",  label: "Beneficiaries"  },
              { emoji: "📍", val: "28",       label: "States"          },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3.5 py-1.5 backdrop-blur-md"
              >
                <span className="text-sm leading-none">{s.emoji}</span>
                <span className="text-xs font-bold text-white">{s.val}</span>
                <span className="text-[10px] text-white/50">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTENT  (white / background)
      ══════════════════════════════════════════ */}
      <div className="mx-auto max-w-2xl px-5">

        {/* ─── Popular Schemes ─── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Popular Schemes
            </h2>
            <button
              onClick={() => navigate("/schemes")}
              className="flex items-center gap-0.5 text-sm font-semibold text-primary transition-opacity hover:opacity-70"
            >
              See All <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
          >
            {popularSchemes.map((s) => (
              <motion.div
                key={s.schemeId}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/scheme/${s.schemeId}`)}
                className={`snap-start flex-shrink-0 w-52 rounded-3xl bg-gradient-to-br ${s.gradient} p-5 shadow-lg cursor-pointer select-none`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-3xl leading-none">{s.icon}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                    {s.category}
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-bold leading-snug text-white">{s.name}</h3>
                <p className="text-xs font-semibold text-white/80">{s.benefit}</p>
                <div className="mt-3 flex items-center gap-1 border-t border-white/20 pt-2">
                  <Users className="h-3 w-3 text-white/60" />
                  <span className="text-[10px] text-white/70">{s.count}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            {popularSchemes.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToCard(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </motion.section>

        {/* ─── Browse by Category ─── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mt-8"
        >
          <h2 className="mb-4 text-lg font-bold text-foreground">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/schemes")}
                className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-br ${cat.color} p-4 text-left shadow-sm transition-shadow hover:shadow-card`}
              >
                <span className="text-3xl leading-none">{cat.icon}</span>
                <span className="text-sm font-semibold text-foreground leading-tight">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ─── Voice Banner ─── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              <span className="absolute -inset-2 rounded-full bg-white/10 animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Mic className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
                Voice Mode
              </p>
              <h3 className="text-base font-bold text-white">Ask in Your Language</h3>
              <p className="text-xs text-white/60">Hindi, English &amp; regional languages</p>
            </div>
            <button
              onClick={() => navigate("/voice")}
              className="flex-shrink-0 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md transition-transform active:scale-95"
            >
              Try Now
            </button>
          </div>
        </motion.section>

        {/* ─── Trust row ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.56 }}
          className="mt-6 flex items-center justify-center gap-6"
        >
          {[
            { icon: Star,     label: "4.8 Rating"  },
            { icon: Users,    label: "1M+ Users"    },
            { icon: Sparkles, label: "AI Powered"   },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
              <item.icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ─── Primary CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            {t("createProfile")}
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Takes less than 2 minutes &nbsp;·&nbsp; Completely free
          </p>
        </motion.div>

      </div>

      {/* ══════════════════════════════════════════
          FLOATING VOICE FAB
      ══════════════════════════════════════════ */}
      <div className="fixed bottom-24 right-5 z-50">
        <span className="absolute inset-0 rounded-full bg-violet-500/50 animate-ping" />
        <span className="absolute -inset-2 rounded-full bg-violet-400/20 animate-pulse" />
        <motion.button
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => navigate("/voice")}
          title="Voice Search"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/40"
        >
          <Mic className="h-6 w-6 text-white drop-shadow-sm" />
        </motion.button>
      </div>

    </div>
  );
};

export default HomePage;
