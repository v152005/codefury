import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { speakText, cancelSpeech, getLocaleForLang, matchSpokenService, isSpeechRecognitionSupported } from "../utils/speechHelper";

export default function DashboardVoiceAssistant({ user, services = [], lang = "en" }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // 'idle' | 'speaking' | 'listening' | 'processing' | 'navigating'
  const [transcript, setTranscript] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  const userName = user?.name || "User";

  // Multi-lingual spoken prompts
  const voicePrompts = {
    en: {
      greeting: `Hello ${userName}, welcome to Vocalyze. The services available on this portal are: Pension Certificate, Disability Certificate, and Income Certificate. Which service would you like to apply for? Please say the name of the service.`,
      listening: "Listening for your choice... (e.g. 'Pension Certificate')",
      directing: (name) => `You selected ${name}. Directing you to the application form now.`,
      notUnderstood: "I couldn't match that service. Please say Pension Certificate, Disability Certificate, or Income Certificate.",
      micBlocked: "Microphone permission is required. Please tap the microphone button to enable it.",
      repeatBtn: "Hear Instructions Again",
      startMic: "Start Speaking",
      stopMic: "Stop Listening"
    },
    hi: {
      greeting: `नमस्ते ${userName}, Vocalyze में आपका स्वागत है। इस पोर्टल पर उपलब्ध सेवाएं हैं: पेंशन प्रमाण पत्र, दिव्यांगता प्रमाण पत्र, और आय प्रमाण पत्र। आप किस सेवा के लिए आवेदन करना चाहते हैं? कृपया सेवा का नाम बोलें।`,
      listening: "आपकी आवाज़ सुनी जा रही है... (उदा. 'पेंशन प्रमाण पत्र')",
      directing: (name) => `आपने ${name} चुना है। आपको आवेदन पत्र पर ले जाया जा रहा है।`,
      notUnderstood: "मैं समझ नहीं पाया। कृपया पेंशन प्रमाण पत्र, दिव्यांगता प्रमाण पत्र, या आय प्रमाण पत्र बोलें।",
      micBlocked: "माइक्रोफ़ोन की अनुमति आवश्यक है। कृपया माइक्रोफ़ोन बटन दबाएँ।",
      repeatBtn: "निर्देश पुनः सुनें",
      startMic: "बोलना शुरू करें",
      stopMic: "सुनना बंद करें"
    },
    kn: {
      greeting: `ನಮಸ್ಕಾರ ${userName}, Vocalyze ಗೆ ಸುಸ್ವಾಗತ. ಈ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು: ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರ, ವಿಕಲಾಂಗತಾ ಪ್ರಮಾಣಪತ್ರ, ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ. ನೀವು ಯಾವ ಸೇವೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೀರಿ? ದಯವಿಟ್ಟು ಸೇವೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.`,
      listening: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ... (ಉದಾ. 'ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರ')",
      directing: (name) => `ನೀವು ${name} ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ನಿಮ್ಮನ್ನು ಅರ್ಜಿ ನಮೂನೆಗೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ.`,
      notUnderstood: "ಸೇವೆ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರ, ವಿಕಲಾಂಗತಾ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಎಂದು ಹೇಳಿ.",
      micBlocked: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ.",
      repeatBtn: "ಸೂಚನೆಗಳನ್ನು ಮತ್ತೆ ಕೇಳಿ",
      startMic: "ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ",
      stopMic: "ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ"
    }
  };

  const t = voicePrompts[lang] || voicePrompts.en;

  // Initialize Speech Recognition
  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = getLocaleForLang(lang);

    rec.onstart = () => {
      if (!isMountedRef.current) return;
      setStatus("listening");
      setIsMicActive(true);
      setTranscript("");
    };

    rec.onerror = (e) => {
      if (!isMountedRef.current) return;
      console.warn("Recognition error:", e.error);
      setIsMicActive(false);
      if (e.error === "no-speech") {
        setStatus("idle");
      }
    };

    rec.onend = () => {
      if (!isMountedRef.current) return;
      setIsMicActive(false);
    };

    rec.onresult = (event) => {
      if (!isMountedRef.current) return;
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
        setTranscript(interimStr);
      }

      if (finalStr) {
        setTranscript(finalStr);
        handleVoiceSelection(finalStr);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  }, [lang, services]);

  // Handle service matching
  const handleVoiceSelection = useCallback((spokenText) => {
    setStatus("processing");
    const matched = matchSpokenService(spokenText, services);

    if (matched) {
      const sName = matched.name && typeof matched.name === "object"
        ? (matched.name[lang] || matched.name.en)
        : (matched.name || "Selected Service");

      const msg = t.directing(sName);
      setAssistantMessage(msg);
      setStatus("navigating");

      speakText(msg, lang, () => {
        navigate(`/service/${matched.id}`);
      });
    } else {
      const retryMsg = t.notUnderstood;
      setAssistantMessage(retryMsg);
      speakText(retryMsg, lang, () => {
        startListening();
      });
    }
  }, [services, lang, navigate, t, startListening]);

  // Speak greeting on mount
  const runGreeting = useCallback(() => {
    cancelSpeech();
    setStatus("speaking");
    setAssistantMessage(t.greeting);

    speakText(t.greeting, lang, () => {
      if (!isMountedRef.current) return;
      startListening();
    });
  }, [t.greeting, lang, startListening]);

  useEffect(() => {
    isMountedRef.current = true;

    // Small delay to allow page render
    const timer = setTimeout(() => {
      runGreeting();
    }, 600);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      cancelSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [runGreeting]);

  const toggleMic = () => {
    if (isMicActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsMicActive(false);
      setStatus("idle");
    } else {
      cancelSpeech();
      startListening();
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(18, 49, 47, 0.95), rgba(10, 36, 35, 0.95))",
        backdropFilter: "blur(20px)",
        border: "2px solid #d9f560",
        borderRadius: "24px",
        padding: "24px 30px",
        marginBottom: "40px",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4), 0 0 25px rgba(217, 245, 96, 0.12)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        overflow: "hidden"
      }}
      role="region"
      aria-label="Vocalyze Voice Assistant for Dashboard"
    >
      {/* Decorative Glow */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217, 245, 96, 0.2) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(217, 245, 96, 0.4)",
              border: "2px solid #d9f560",
              flexShrink: 0
            }}
          >
            <img src="/vocalyze-logo.png" alt="Vocalyze Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#fff" }}>
                Vocalyze Voice Assistant
              </h2>
              <span
                style={{
                  background: status === "listening" ? "rgba(255, 75, 75, 0.2)" : "rgba(217, 245, 96, 0.15)",
                  color: status === "listening" ? "#ff7b7b" : "#d9f560",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: status === "listening" ? "#ff4b4b" : "#d9f560",
                    animation: "pulse 1.5s infinite"
                  }}
                />
                {status === "speaking" && "Speaking..."}
                {status === "listening" && "Listening..."}
                {status === "processing" && "Processing..."}
                {status === "navigating" && "Opening Service..."}
                {status === "idle" && "Ready"}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#aab7b3" }}>
              Voice navigation enabled for hands-free and screen-free operation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={runGreeting}
            type="button"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px",
              padding: "10px 18px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            🔊 {t.repeatBtn}
          </button>

          <button
            onClick={toggleMic}
            type="button"
            style={{
              background: isMicActive ? "#ff4b4b" : "#d9f560",
              border: "none",
              borderRadius: "14px",
              padding: "10px 20px",
              color: isMicActive ? "#fff" : "#12312f",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isMicActive ? "0 0 20px rgba(255, 75, 75, 0.4)" : "0 0 16px rgba(217, 245, 96, 0.3)",
              transition: "all 0.2s"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
            {isMicActive ? t.stopMic : t.startMic}
          </button>
        </div>
      </div>

      {/* Spoken Text Feedback Card */}
      <div
        style={{
          background: "rgba(0,0,0,0.25)",
          borderRadius: "16px",
          padding: "16px 20px",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <div style={{ fontSize: "14px", color: "#f6f3eb", lineHeight: "1.5" }}>
          🗣️ <strong style={{ color: "#d9f560" }}>Vocalyze:</strong> {assistantMessage || t.greeting}
        </div>

        {transcript && (
          <div style={{ fontSize: "14px", color: "#aab7b3", fontStyle: "italic", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "8px" }}>
            🎙️ <strong>You:</strong> "{transcript}"
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
