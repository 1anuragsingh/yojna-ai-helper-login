import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mic, MicOff, Volume2, VolumeX,
  Loader2, ExternalLink, Send, RefreshCw,
  ChevronRight, Zap, FileText, Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTTS } from "@/hooks/use-tts";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { getSchemeById } from "@/data/schemes";
import type { Scheme } from "@/data/schemes";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

type MicState = "idle" | "listening" | "thinking";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  schemes?: Scheme[];
  tips?: string[];
  followUp?: string[];
  actionLabel?: string;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Namaste! 🙏 I'm YOJNA AI — your personal government scheme guide.\n\nAsk me anything: find schemes, check eligibility, get document help, or say 'apply for PM Kisan' and I'll do it instantly!",
  schemes: [],
  tips: [],
  followUp: [
    "I am a farmer, which schemes apply to me?",
    "What documents do I need for Ayushman Bharat?",
    "Apply for PM Kisan",
    "Schemes for women and girls",
  ],
};

const VoicePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { speak, stop, isSpeaking } = useTTS();
  const { ask, loading: aiLoading, clearHistory } = useAIAssistant();

  const [micState, setMicState] = useState<MicState>("idle");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [langCode, setLangCode] = useState<"hi-IN" | "en-IN">(
    language === "hi" ? "hi-IN" : "en-IN"
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const processQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setMicState("thinking");

      // Add user bubble immediately
      const userId = Date.now().toString();
      setMessages((prev) => [...prev, { id: userId, role: "user", text: query }]);

      const res = await ask(query);

      // Execute detected action automatically
      let actionLabel = "";
      if (res.action === "open_apply" && res.actionTarget) {
        const scheme = getSchemeById(res.actionTarget);
        if (scheme) {
          actionLabel = `Opening ${scheme.name} portal…`;
          setTimeout(() => window.open(scheme.applyUrl, "_blank", "noopener,noreferrer"), 700);
        }
      } else if (res.action === "navigate_scheme" && res.actionTarget) {
        const scheme = getSchemeById(res.actionTarget);
        if (scheme) {
          actionLabel = `Taking you to ${scheme.name}…`;
          setTimeout(() => navigate(`/scheme/${res.actionTarget}`), 700);
        }
      }

      const aiId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: "assistant",
          text: res.message,
          schemes: res.schemes,
          tips: res.tips,
          followUp: res.followUp,
          actionLabel,
        },
      ]);

      setMicState("idle");
      setSpeakingId(aiId);
      speak(res.message);
    },
    [ask, speak, navigate]
  );

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopListening();

    const recognition = new SR();
    recognition.lang = langCode;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalText = "";
    setLiveTranscript("");
    setInterimText("");
    setMicState("listening");

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setLiveTranscript(finalText);
      setInterimText(interim);
    };

    recognition.onend = () => {
      setInterimText("");
      const query = finalText.trim();
      if (query) processQuery(query);
      else setMicState("idle");
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setMicState("idle");
    };

    recognition.start();
  }, [langCode, stopListening, processQuery]);

  const handleTextSubmit = () => {
    const q = textInput.trim();
    if (!q || aiLoading || micState !== "idle") return;
    setTextInput("");
    processQuery(q);
  };

  const handleFollowUp = (query: string) => {
    if (aiLoading || micState !== "idle") return;
    processQuery(query);
  };

  const handleSpeakToggle = (msgId: string, text: string) => {
    if (isSpeaking && speakingId === msgId) {
      stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(msgId);
      speak(text);
    }
  };

  const handleClearChat = () => {
    stop();
    stopListening();
    setLiveTranscript("");
    setInterimText("");
    setTextInput("");
    setMessages([WELCOME]);
    clearHistory();
    setMicState("idle");
    setSpeakingId(null);
  };

  useEffect(() => () => { stopListening(); stop(); }, [stopListening, stop]);

  return (
    <div className="flex flex-col h-screen bg-[#0b1a2c] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5 justify-center">
            <span className="text-base">🤖</span> YOJNA AI
          </h1>
          <p className="text-[10px] text-white/40">Smart guide · Hindi & English</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-white/20">
            {(["en-IN", "hi-IN"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLangCode(code)}
                className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  langCode === code ? "bg-white text-[#0b1a2c]" : "text-white/60 hover:text-white"
                }`}
              >
                {code === "en-IN" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
          <button
            onClick={handleClearChat}
            title="New conversation"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-white/40 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Chat scroll area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-2">

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

            {/* Bot avatar */}
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 mr-2 mt-0.5 text-sm">
                🤖
              </div>
            )}

            <div className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[84%]`}>

              {/* Text bubble */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-sm"
                    : "bg-white/10 text-white rounded-tl-sm backdrop-blur-md"
                }`}
              >
                {msg.text.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </motion.div>

              {/* Action badge */}
              {msg.actionLabel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-300"
                >
                  <Zap className="h-3 w-3" />
                  {msg.actionLabel}
                </motion.div>
              )}

              {/* Scheme cards */}
              {msg.schemes && msg.schemes.length > 0 && (
                <div className="w-full space-y-2">
                  {msg.schemes.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-3 backdrop-blur-md"
                    >
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.colorGradient}`}>
                        <span className="text-xl leading-none">{s.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white line-clamp-1">{s.name}</p>
                        <p className="mt-0.5 text-[11px] text-white/55 line-clamp-1">{s.benefit}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/scheme/${s.id}`)}
                          className="flex items-center gap-0.5 rounded-lg bg-white/12 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-white/22 transition"
                        >
                          <Info className="h-2.5 w-2.5" /> Info
                        </button>
                        <button
                          onClick={() => window.open(s.applyUrl, "_blank", "noopener,noreferrer")}
                          className={`flex items-center gap-0.5 rounded-lg bg-gradient-to-r ${s.colorGradient} px-2 py-1.5 text-[10px] font-bold text-white`}
                        >
                          Apply <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Tips row */}
              {msg.tips && msg.tips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.tips.map((tip, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/12 px-2.5 py-1 text-[10px] font-medium text-amber-300"
                    >
                      <FileText className="h-2.5 w-2.5 flex-shrink-0" />
                      {tip}
                    </span>
                  ))}
                </div>
              )}

              {/* Follow-up chips */}
              {msg.followUp && msg.followUp.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.followUp.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleFollowUp(q)}
                      disabled={aiLoading || micState !== "idle"}
                      className="flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-300 hover:bg-violet-500/25 transition disabled:opacity-40"
                    >
                      {q}
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Read aloud toggle */}
              {msg.role === "assistant" && msg.id !== "welcome" && (
                <button
                  onClick={() => handleSpeakToggle(msg.id, msg.text)}
                  className="self-start flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition mt-0.5"
                >
                  {isSpeaking && speakingId === msg.id
                    ? <><VolumeX className="h-3 w-3" /> Stop</>
                    : <><Volume2 className="h-3 w-3" /> Read aloud</>
                  }
                </button>
              )}
            </div>
          </div>
        ))}

        {/* AI thinking bubble */}
        <AnimatePresence>
          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 mr-2 mt-0.5 text-sm">
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.span
                      key={delay}
                      className="h-2 w-2 rounded-full bg-violet-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live speech preview */}
        <AnimatePresence>
          {micState === "listening" && (liveTranscript || interimText) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <div className="max-w-[84%] rounded-2xl rounded-tr-sm border border-violet-400/20 bg-violet-600/25 px-4 py-2.5 text-sm text-white/70 italic">
                {liveTranscript}
                {interimText && <span className="text-white/40"> {interimText}</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} className="h-1" />
      </div>

      {/* ── Voice speak button ── */}
      {speechSupported && (
        <div className="flex-shrink-0 px-4 pt-3 pb-1 bg-[#0d1f32]">
          <div className="relative flex items-center justify-center">
            {/* Pulse rings when listening */}
            <AnimatePresence>
              {micState === "listening" && (
                <>
                  <motion.div
                    key="ring1"
                    className="absolute h-20 w-20 rounded-full bg-red-500/15"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <motion.div
                    key="ring2"
                    className="absolute h-20 w-20 rounded-full bg-red-500/20"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.1, 0.8] }}
                    transition={{ duration: 1.3, repeat: Infinity }}
                  />
                </>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => {
                if (micState === "listening") {
                  stopListening();
                  const query = liveTranscript.trim();
                  if (query) processQuery(query);
                  else setMicState("idle");
                } else if (micState === "idle" && !aiLoading) {
                  setLiveTranscript("");
                  startListening();
                }
              }}
              disabled={micState === "thinking" || aiLoading}
              animate={
                micState === "listening"
                  ? { scale: [1, 1.06, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.9, repeat: micState === "listening" ? Infinity : 0 }}
              className={`relative z-10 flex items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all disabled:opacity-40 ${
                micState === "listening"
                  ? "bg-red-500 shadow-red-500/50"
                  : micState === "thinking" || aiLoading
                  ? "bg-amber-500/80 shadow-amber-500/30"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-600/40 hover:from-violet-500 hover:to-indigo-500"
              }`}
            >
              {micState === "thinking" || aiLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI is thinking…</span>
                </>
              ) : micState === "listening" ? (
                <>
                  <motion.span
                    className="h-3 w-3 rounded-full bg-white"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  />
                  <span>
                    {langCode === "hi-IN" ? "सुन रहा हूँ… रोकने के लिए दबाएं" : "Listening… tap to stop"}
                  </span>
                  <MicOff className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>
                    {langCode === "hi-IN" ? "🎤 बोलकर पूछें" : "🎤 Tap to Speak"}
                  </span>
                  <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
                    {langCode === "hi-IN" ? "हिंदी" : "English"}
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Language hint */}
          {micState === "idle" && !aiLoading && (
            <p className="mt-1.5 text-center text-[10px] text-white/30">
              {langCode === "hi-IN"
                ? "हिंदी या अंग्रेजी में बोलें — दोनों समझता हूँ"
                : "Speak in Hindi or English — I understand both"}
            </p>
          )}
        </div>
      )}

      {/* ── Text input bar ── */}
      <div className="flex-shrink-0 border-t border-white/8 bg-[#0d1f32] px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          {/* Text input */}
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            disabled={micState !== "idle" || aiLoading}
            placeholder={
              micState === "listening"
                ? langCode === "hi-IN" ? "सुन रहा हूँ…" : "Listening…"
                : aiLoading
                ? langCode === "hi-IN" ? "सोच रहा हूँ…" : "Thinking…"
                : langCode === "hi-IN"
                ? "या यहाँ टाइप करें…"
                : "Or type your question here…"
            }
            className="flex-1 rounded-2xl border border-white/12 bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20 transition disabled:opacity-50"
          />

          {/* Send button */}
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || aiLoading || micState !== "idle"}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition hover:bg-violet-500 disabled:opacity-35"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;
