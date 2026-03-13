import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mic, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTTS } from "@/hooks/use-tts";
import { searchSchemes, schemes } from "@/data/schemes";

type SchemeSubset = typeof schemes;

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  schemes?: SchemeSubset;
}

const generateReply = (input: string): { text: string; schemes?: SchemeSubset } => {
  const q = input.toLowerCase().trim();

  if (/^(hi|hello|namaste|hii|hey|नमस्ते|हाय)\b/.test(q)) {
    return {
      text: "Namaste! 🙏 I'm YOJNA AI. Tell me about yourself — farmer, student, worker, business owner, or woman — and I'll find the best schemes for you!",
    };
  }

  const categoryMap: Record<string, string> = {
    farmer: "farmer", किसान: "farmer", kisan: "farmer", agriculture: "farmer",
    student: "student", scholarship: "student", education: "student", छात्र: "student",
    women: "women", woman: "women", महिला: "women", beti: "women",
    health: "health", hospital: "health", आयुष्मान: "health", स्वास्थ्य: "health",
    housing: "housing", house: "housing", awas: "housing", आवास: "housing",
    business: "business", loan: "business", mudra: "business", व्यापार: "business",
    worker: "worker", labour: "worker", job: "worker", employment: "worker", मजदूर: "worker",
    senior: "senior", old: "senior", pension: "senior", वृद्ध: "senior",
  };

  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (q.includes(keyword)) {
      const results = schemes
        .filter((s) => s.category === cat || s.tags.some((t) => t.toLowerCase().includes(keyword)))
        .slice(0, 3);
      return {
        text: `Found ${results.length > 0 ? results.length : "no"} schemes for "${keyword}". Here are the top results — tap Apply to go directly to the official portal:`,
        schemes: results,
      };
    }
  }

  const results = searchSchemes(input);
  if (results.length > 0) {
    return {
      text: `Found ${results.length} scheme${results.length > 1 ? "s" : ""} matching "${input}":`,
      schemes: results.slice(0, 3),
    };
  }

  return {
    text: `No schemes found for "${input}". Try keywords like: farmer, student, health, housing, business, pension, or a scheme name like "PM Kisan", "Ayushman", "MUDRA".`,
  };
};

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Namaste! 🙏 I'm YOJNA AI. Tell me who you are — farmer, student, worker, or anything — and I'll find the right government schemes for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { speak, stop, isSpeaking, isSupported: isTTSSupported } = useTTS();

  useEffect(() => {
    if (isOpen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages, isOpen]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { text: reply, schemes: found } = generateReply(text);
      setMessages((p) => [...p, { id: Date.now() + 1, role: "assistant", content: reply, schemes: found }]);
      setTyping(false);
    }, 700);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[5.5rem] right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center gap-3 bg-[#0b1a2c] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20">
                <span className="text-base font-black text-amber-400">Y</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">YOJNA AI</p>
                <p className="text-[10px] text-white/50">Scheme Assistant · Ask anything</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[88%] space-y-2">
                    <div className={`flex items-end gap-2 rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      <span className="flex-1">{msg.content}</span>
                      {msg.role === "assistant" && isTTSSupported && (
                        <button
                          onClick={() => isSpeaking ? stop() : speak(msg.content)}
                          className="flex-shrink-0 p-1 hover:opacity-60 transition"
                          title={isSpeaking ? "Stop" : "Speak"}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {msg.schemes && msg.schemes.length > 0 && (
                      <div className="space-y-2">
                        {msg.schemes.map((s) => (
                          <div key={s.id} className="flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.colorGradient}`}>
                              <span className="text-lg leading-none">{s.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground line-clamp-1">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground">{s.benefit}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setIsOpen(false); navigate(`/scheme/${s.id}`); }}
                                className="rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold text-foreground"
                              >
                                Info
                              </button>
                              <button
                                onClick={() => window.open(s.applyUrl, "_blank", "noopener,noreferrer")}
                                className={`flex items-center gap-0.5 rounded-lg bg-gradient-to-r ${s.colorGradient} px-2 py-1 text-[10px] font-bold text-white`}
                              >
                                Apply <ExternalLink className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about any scheme..."
                  className="flex-1 rounded-full border border-input bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => { setIsOpen(false); navigate("/voice"); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition hover:bg-violet-200"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md transition disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[4.5rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b1a2c] text-white shadow-xl shadow-black/30 border border-white/10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default AIChatWidget;
