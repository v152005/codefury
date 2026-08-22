import React, { useState, useEffect, useRef } from "react";

/**
 * VoiceInput component integrates browser Web Speech API (Speech-to-Text).
 * @param {function} onTranscript - Callback triggered when final transcript is available.
 * @param {string} lang - Preferred language code ('en', 'hi', 'kn').
 * @param {string} promptText - Optional instruction label.
 */
export default function VoiceInput({ onTranscript, lang = "en", promptText = "" }) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);

  // Check browser compatibility
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const [errorMsg, setErrorMsg] = useState(
    !SpeechRecognition ? "Your browser does not support Speech Recognition. Please type your answer." : ""
  );

  // Map app language code to speech locale
  const langLocales = {
    en: "en-IN", // English (India)
    hi: "hi-IN", // Hindi (India)
    kn: "kn-IN", // Kannada (India)
  };

  const currentLocale = langLocales[lang] || "en-US";

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // Stop listening when user stops talking
    rec.interimResults = true; // Show results in real-time
    rec.lang = currentLocale;

    rec.onstart = () => {
      setIsListening(true);
      setErrorMsg("");
      setInterimTranscript("");
    };

    rec.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access is blocked. Please enable it in browser settings.");
      } else if (event.error === "no-speech") {
        setErrorMsg("We couldn't hear anything. Please try again.");
      } else {
        setErrorMsg(`Speech error occurred: ${event.error}. Please type your answer.`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      if (interimStr) {
        setInterimTranscript(interimStr);
      }

      if (finalStr) {
        setInterimTranscript("");
        onTranscript(finalStr);
      }
    };

    recognitionRef.current = rec;

    // Cleanup synthesis and recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLocale, onTranscript, SpeechRecognition]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={toggleListening}
          style={{
            background: isListening ? "rgba(255, 75, 75, 0.15)" : "rgba(219, 245, 96, 0.1)",
            border: isListening ? "2px solid #ff4b4b" : "2px solid #d9f560",
            borderRadius: "50%",
            width: "64px",
            height: "64px",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isListening ? "0 0 20px rgba(255, 75, 75, 0.4)" : "none"
          }}
          aria-label={isListening ? "Stop listening" : "Start speaking"}
        >
          {/* Animated record pulse wave */}
          {isListening && (
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid #ff4b4b",
              animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
            }} />
          )}

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isListening ? "#ff4b4b" : "#d9f560"} strokeWidth="2.5">
            {isListening ? (
              <rect x="6" y="6" width="12" height="12" rx="1.5" />
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </>
            )}
          </svg>
        </button>

        <span style={{ fontSize: "14px", fontWeight: "700", color: isListening ? "#ffb7b7" : "#aab7b3" }}>
          {isListening ? "Listening... Speak now" : promptText || "Tap microphone to answer by voice"}
        </span>
      </div>

      {interimTranscript && (
        <p style={{ fontStyle: "italic", fontSize: "14px", color: "#aab7b3", margin: "4px 0", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.08)" }}>
          🎙️ "{interimTranscript}"
        </p>
      )}

      {errorMsg && (
        <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.08)", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", margin: 0 }}>
          ⚠️ {errorMsg}
        </p>
      )}
      
      {/* Dynamic Keyframes for Speech Recording Glow */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
