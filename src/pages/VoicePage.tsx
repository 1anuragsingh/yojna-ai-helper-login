import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mic, MicOff, Volume2, VolumeX,
  Loader2, RotateCcw, ExternalLink, Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTTS } from "@/hooks/use-tts";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import type { Scheme } from "@/data/schemes";

// Extend Window for webkit
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

type VoiceState = "idle" | "listening" | "thinking" | "result" | "unsupported";

interface AssistantResult {
  message: string;
  schemes: Scheme[];
}

const SUGGESTIONS = [
  { label: "Farmer schemes", query: "farmer schemes" },
  { label: "Student scholarship", query: "scholarship for students" },
  { label: "Health insurance", query: "health insurance family" },
  { label: "Business loan", query: "business loan MUDRA" },
  { label: "किसान योजना", query: "किसान के लिए योजना" },
  { label: "महिला योजना", query: "महिला के लिए सरकारी योजना" },
  { label: "Explain PM Kisan", query: "Explain PM Kisan" },
];

const VoicePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { speak, stop, isSpeaking } = useTTS();
  const { ask, loading: aiLoading } = useAIAssistant();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [langCode, setLangCode] = useState<"hi-IN" | "en-IN">(
    language === "hi" ? "hi-IN" : "en-IN"
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check speech recognition support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setVoiceState("unsupported");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  // Process query through AI and speak the result
  const processQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setVoiceState("thinking");
      const res = await ask(query);
      setResult(res);
      setVoiceState("result");

      // Build a readable TTS string
      const schemeNames = res.schemes.map((s, i) => `${i + 1}. ${s.name}`).join(". ");
      const ttsText = res.schemes.length > 0
        ? `${res.message} ${schemeNames}`
        : res.message;
      speak(ttsText);
    },
    [ask, speak]
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

    setTranscript("");
    setInterimText("");
    setResult(null);
    setVoiceState("listening");

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimText(interim);
    };

    recognition.onend = () => {
      setInterimText("");
      // If we're still "listening" when it ends, finalize
      setVoiceState((prev) => {
        if (prev === "listening") return "thinking";
        return prev;
      });
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setVoiceState("idle");
    };

    recognition.start();
  }, [langCode, stopListening]);

  // When state moves to "thinking", trigger AI processing
  useEffect(() => {
    if (voiceState !== "thinking") return;
    const query = transcript.trim();
    if (!query) { setVoiceState("idle"); return; }
    processQuery(query);
  }, [voiceState, transcript, processQuery]);

  const reset = useCallback(() => {
    stop();
    stopListening();
    setTranscript("");
    setInterimText("");
    setTextInput("");
    setResult(null);
    setVoiceState("idle");
  }, [stop, stopListening]);

  const handleTextSubmit = () => {
    const q = textInput.trim();
    if (!q) return;
    setTranscript(q);
    setTextInput("");
    processQuery(q);
  };

  const handleSuggestion = (query: string) => {
    setTranscript(query);
    processQuery(query);
  };

  // Cleanup on unmount
  useEffect(() => () => { stopListening(); stop(); }, [stopListening, stop]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1a2c] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Voice Assistant</h1>
          <p className="text-[10px] text-white/40">AI-powered · Ask in Hindi or English</p>
        </div>
        {/* Language toggle */}
        <div className="flex overflow-hidden rounded-full border border-white/20">
          {(["en-IN", "hi-IN"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLangCode(code)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                langCode === code ? "bg-white text-[#0b1a2c]" : "text-white/60 hover:text-white"
              }`}
            >
              {code === "en-IN" ? "EN" : "हिं"}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col items-center px-5">
        {voiceState === "unsupported" ? (
          <div className="mt-20 text-center">
            <span className="text-5xl">😔</span>
            <p className="mt-4 text-base font-bold text-white">Voice not supported</p>
            <p className="mt-1 text-sm text-white/50">
              Please use Chrome on Android or desktop.
            </p>
            <button
              onClick={() => navigate("/schemes")}
              className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              Browse Schemes instead
            </button>
          </div>
        ) : (
          <>
            {/* Mic / State area */}
            <div className="mt-6 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                {voiceState === "listening" && (
                  <>
                    <motion.div
                      className="absolute h-52 w-52 rounded-full bg-violet-500/15"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute h-40 w-40 rounded-full bg-violet-500/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  </>
                )}
                {voiceState === "result" && isSpeaking && (
                  <motion.div
                    className="absolute h-44 w-44 rounded-full bg-emerald-500/20"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}

                <motion.button
                  onClick={() => {
                    if (voiceState === "listening") { stopListening(); setVoiceState("idle"); }
                    else if (voiceState === "result" || voiceState === "thinking") reset();
                    else startListening();
                  }}
                  disabled={voiceState === "thinking" || aiLoading}
                  animate={voiceState === "listening" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all ${
                    voiceState === "listening"
                      ? "bg-red-500 shadow-red-500/40"
                      : voiceState === "thinking" || aiLoading
                      ? "bg-amber-500 shadow-amber-500/40"
                      : voiceState === "result"
                      ? "bg-emerald-500 shadow-emerald-500/40"
                      : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40"
                  }`}
                >
                  {voiceState === "thinking" || aiLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                  ) : voiceState === "listening" ? (
                    <MicOff className="h-10 w-10 text-white" />
                  ) : voiceState === "result" ? (
                    <RotateCcw className="h-9 w-9 text-white" />
                  ) : (
                    <Mic className="h-10 w-10 text-white" />
                  )}
                </motion.button>
              </div>

              {/* Status label */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={voiceState + String(aiLoading)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 text-center"
                >
                  {voiceState === "idle" && (
                    <>
                      <p className="text-lg font-bold text-white">Tap to speak</p>
                      <p className="text-sm text-white/50">
                        Ask about any scheme in {langCode === "hi-IN" ? "Hindi" : "English"}
                      </p>
                      <p className="mt-1 text-xs text-white/30">
                        e.g. "Mere liye student scholarship hai?"
                      </p>
                    </>
                  )}
                  {voiceState === "listening" && (
                    <>
                      <p className="text-lg font-bold text-violet-300">Listening…</p>
                      <p className="text-sm text-white/50">Tap mic to stop</p>
                    </>
                  )}
                  {(voiceState === "thinking" || aiLoading) && (
                    <p className="text-lg font-bold text-amber-300">AI is thinking…</p>
                  )}
                  {voiceState === "result" && (
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-base font-bold text-emerald-300">
                        {isSpeaking ? "Reading aloud…" : "Here are your results"}
                      </p>
                      {isSpeaking ? (
                        <button
                          onClick={stop}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"
                          title="Stop speaking"
                        >
                          <VolumeX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (result) {
                              const schemeNames = result.schemes.map((s, i) => `${i + 1}. ${s.name}`).join(". ");
                              speak(result.schemes.length > 0 ? `${result.message} ${schemeNames}` : result.message);
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60"
                          title="Play again"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Transcript bubble */}
            <AnimatePresence>
              {(transcript || interimText) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 w-full max-w-sm rounded-2xl border border-white/10 bg-white/8 px-5 py-3 text-center backdrop-blur-md"
                >
                  <p className="text-sm font-medium text-white/70 mb-0.5">You said:</p>
                  <p className="text-base font-semibold text-white">
                    {transcript}
                    {interimText && <span className="text-white/40"> {interimText}</span>}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Volume hint while listening */}
            {voiceState === "listening" && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-4 flex items-center gap-2 text-violet-300"
              >
                <Volume2 className="h-4 w-4" />
                <span className="text-xs font-medium">Speak clearly near your microphone</span>
              </motion.div>
            )}

            {/* AI result cards */}
            <AnimatePresence>
              {voiceState === "result" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 w-full max-w-sm space-y-3"
                >
                  {/* AI message */}
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-sm leading-relaxed text-white">{result.message}</p>
                  </div>

                  {/* Scheme cards */}
                  {result.schemes.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur-md"
                    >
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.colorGradient}`}
                      >
                        <span className="text-2xl leading-none">{s.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">
                          {i + 1}. {s.name}
                        </p>
                        <p className="text-[11px] text-white/60 mt-0.5 line-clamp-1">{s.benefit}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/scheme/${s.id}`)}
                          className="rounded-xl bg-white/15 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/25"
                        >
                          Info
                        </button>
                        <button
                          onClick={() => window.open(s.applyUrl, "_blank", "noopener,noreferrer")}
                          className={`flex items-center gap-0.5 rounded-xl bg-gradient-to-r ${s.colorGradient} px-2.5 py-1.5 text-[10px] font-bold text-white`}
                        >
                          Apply <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Ask again button */}
                  <button
                    onClick={reset}
                    className="w-full rounded-2xl border border-violet-400/30 bg-violet-500/15 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-500/25"
                  >
                    🎤 Ask another question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Suggestions (idle only) */}
      {voiceState === "idle" && (
        <div className="px-5 pb-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
            Try saying
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestion(s.query)}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Text input fallback */}
          <div className="flex gap-2">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              placeholder="Or type your question here…"
              className="flex-1 rounded-full border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/30"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition disabled:opacity-40 hover:bg-violet-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePage;
