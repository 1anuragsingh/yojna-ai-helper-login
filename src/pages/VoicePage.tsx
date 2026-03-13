import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTTS } from "@/hooks/use-tts";
import { searchSchemes } from "@/data/schemes";

type VoiceState = "idle" | "listening" | "processing" | "result" | "unsupported";

// Extend Window for webkit
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const SUGGESTIONS = [
  "Farmer schemes",
  "Health insurance for family",
  "Scholarship for students",
  "Business loan",
  "किसान योजना",
  "महिला योजना",
  "बेरोजगारी",
];

const VoicePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { speak, stop, isSpeaking } = useTTS();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [langCode, setLangCode] = useState<"hi-IN" | "en-IN">(
    language === "hi" ? "hi-IN" : "en-IN"
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setVoiceState("unsupported");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

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
      setVoiceState((prev) => (prev === "listening" ? "processing" : prev));
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setVoiceState("idle");
    };

    recognition.start();
  }, [langCode, stopListening]);

  // When processing → navigate
  useEffect(() => {
    if (voiceState !== "processing") return;
    const query = transcript.trim();
    if (!query) { setVoiceState("idle"); return; }

    const timer = setTimeout(() => {
      const results = searchSchemes(query);
      const message = results.length === 1 
        ? `Found 1 scheme matching ${query}. Opening details.`
        : results.length > 1
        ? `Found ${results.length} schemes matching ${query}. Opening list.`
        : `No schemes found for ${query}. Try another search.`;
      
      // Speak the result
      speak(message);
      
      setTimeout(() => {
        if (results.length === 1) {
          navigate(`/scheme/${results[0].id}`);
        } else {
          navigate(`/schemes?q=${encodeURIComponent(query)}`);
        }
      }, 1000);
    }, 800);

    return () => clearTimeout(timer);
  }, [voiceState, transcript, navigate, speak]);

  // Cleanup on unmount
  useEffect(() => () => stopListening(), [stopListening]);

  const handleSuggestion = (text: string) => {
    setTranscript(text);
    const results = searchSchemes(text);
    if (results.length === 1) navigate(`/scheme/${results[0].id}`);
    else navigate(`/schemes?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1a2c] pb-24">

      {/* header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-white">Voice Search</h1>

        {/* language toggle */}
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

      {/* main area */}
      <div className="flex flex-1 flex-col items-center justify-center px-5">

        {voiceState === "unsupported" ? (
          <div className="text-center">
            <span className="text-5xl">😔</span>
            <p className="mt-4 text-base font-bold text-white">Voice not supported</p>
            <p className="mt-1 text-sm text-white/50">
              Please use Chrome on Android or desktop for voice search.
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
            {/* Waveform / pulsing mic */}
            <div className="relative mb-8 flex items-center justify-center">
              {voiceState === "listening" && (
                <>
                  <motion.div
                    className="absolute h-48 w-48 rounded-full bg-violet-500/15"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute h-36 w-36 rounded-full bg-violet-500/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                </>
              )}

              <motion.button
                onClick={voiceState === "listening" ? stopListening : startListening}
                disabled={voiceState === "processing"}
                animate={voiceState === "listening" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all ${
                  voiceState === "listening"
                    ? "bg-red-500 shadow-red-500/40"
                    : voiceState === "processing"
                    ? "bg-amber-500 shadow-amber-500/40"
                    : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40"
                }`}
              >
                {voiceState === "processing" ? (
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                ) : voiceState === "listening" ? (
                  <MicOff className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </motion.button>
            </div>

            {/* status label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={voiceState}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-2 text-center"
              >
                {voiceState === "idle" && (
                  <>
                    <p className="text-lg font-bold text-white">Tap to speak</p>
                    <p className="text-sm text-white/50">
                      Say a scheme name or category in {langCode === "hi-IN" ? "Hindi" : "English"}
                    </p>
                    <p className="text-xs text-white/40 mt-2">📢 Results will be read aloud</p>
                  </>
                )}
                {voiceState === "listening" && (
                  <>
                    <p className="text-lg font-bold text-violet-300">Listening…</p>
                    <p className="text-sm text-white/50">Tap the mic to stop</p>
                  </>
                )}
                {voiceState === "processing" && (
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-bold text-amber-300">Finding schemes…</p>
                    {isSpeaking && (
                      <button
                        onClick={stop}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-300/20 text-amber-300 hover:bg-amber-300/30 transition"
                        title="Stop voice"
                      >
                        <VolumeX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* transcript box */}
            <AnimatePresence>
              {(transcript || interimText) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 w-full max-w-sm rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-center backdrop-blur-md"
                >
                  <p className="text-base font-semibold text-white">
                    {transcript}
                    {interimText && (
                      <span className="text-white/40"> {interimText}</span>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Volume icon hint */}
            {voiceState === "listening" && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-5 flex items-center gap-2 text-violet-300"
              >
                <Volume2 className="h-4 w-4" />
                <span className="text-xs font-medium">Speak clearly near your microphone</span>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* suggestions */}
      {voiceState === "idle" && (
        <div className="px-5 pb-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
            Try saying
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePage;
