// Speech Synthesis and Recognition Helper Utility

export const getLocaleForLang = (lang = "en") => {
  const map = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };
  return map[lang] || "en-IN";
};

/**
 * Speaks text using Web Speech API Synthesis and triggers onEnd callback.
 */
export const speakText = (text, lang = "en", onEnd = null) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 300);
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const locale = getLocaleForLang(lang);
  utterance.lang = locale;
  utterance.rate = 1.1; // Fast and clear conversational pace
  utterance.pitch = 1.0;

  // Try to find a voice matching the language/country
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang === locale || v.lang.startsWith(locale.substring(0, 2))
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  let hasEnded = false;
  const finish = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd) onEnd();
    }
  };

  utterance.onend = finish;
  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    finish();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const cancelSpeech = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Checks if Speech Recognition is supported in the browser.
 */
export const isSpeechRecognitionSupported = () => {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Helper to match user voice input with available services.
 */
export const matchSpokenService = (transcript, services = []) => {
  if (!transcript || !services || services.length === 0) return null;

  const clean = transcript.toLowerCase().trim();

  // Explicit keywords mapping
  const keywordMap = [
    {
      id: "pension-certificate",
      keywords: ["pension", "old age", "widow", "ವೃದ್ಧಾಪ್ಯ", "ಪಿಂಚಣಿ", "ವಿಧವೆ", "ಪೆಂಶನ್", "पेंशन", "वृद्धावस्था", "विधवा"]
    },
    {
      id: "disability-certificate",
      keywords: ["disability", "disabled", "handicap", "udid", "ಅಂಗವಿಕಲ", "ವಿಕಲಾಂಗ", "ದಿವ್ಯಾಂಗ", "दिव्यांग", "विकलांग"]
    },
    {
      id: "income-certificate",
      keywords: ["income", "revenue", "salary", "ಆದಾಯ", "ಇನ್‌ಕಮ್", "आय", "इनकम"]
    }
  ];

  for (const item of keywordMap) {
    if (item.keywords.some(k => clean.includes(k.toLowerCase()))) {
      const match = services.find(s => s.id === item.id);
      if (match) return match;
    }
  }

  // Generic name matching
  for (const s of services) {
    const sId = s.id?.toLowerCase();
    if (clean.includes(sId)) return s;

    if (typeof s.name === "string" && clean.includes(s.name.toLowerCase())) {
      return s;
    }

    if (s.name && typeof s.name === "object") {
      for (const val of Object.values(s.name)) {
        if (typeof val === "string" && clean.includes(val.toLowerCase())) {
          return s;
        }
      }
    }
  }

  return null;
};

/**
 * Checks if user's voice input signifies affirmative confirmation ("yes", "correct", etc.)
 */
export const isConfirmationAffirmative = (transcript = "") => {
  if (!transcript) return false;
  const clean = transcript
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .trim();

  const yesWords = [
    "yes", "yeah", "yep", "yup", "ya", "correct", "confirm", "confirmed", "sure", "ok", "okay",
    "right", "fine", "proceed", "submit", "submitting", "accept", "true", "done", "next",
    "perfect", "good", "haan", "ha", "sahi", "theek", "theek hai", "ji haan", "haudhu",
    "haudu", "sari", "aaytu", "khachita", "mundhuvari", "yes please",
    "ಹೌದು", "ಸರಿ", "ಖಚಿತ", "ಮುಂದುವರಿಯಿರಿ", "ಸಲ್ಲಿಸಿ", "ಆಯ್ತು", "ಹಾ",
    "हाँ", "सही", "पुष्टि", "ठीक", "आगे", "जमा", "सबमिट", "हां"
  ];

  const tokens = clean.split(/\s+/);
  return yesWords.some(w => clean === w || clean.includes(w) || tokens.includes(w));
};

/**
 * Checks if user's voice input signifies negative confirmation ("no", "wrong", etc.)
 */
export const isConfirmationNegative = (transcript = "") => {
  if (!transcript) return false;
  const clean = transcript
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .trim();

  const noWords = [
    "no", "nope", "nah", "wrong", "change", "incorrect", "cancel", "repeat", "retry",
    "false", "redo", "not correct", "illa", "thappu", "beda", "matthe",
    "nahi", "galat", "na", "badlo", "dobara", "phir se", "no change", "no wrong",
    "ಇಲ್ಲ", "ತಪ್ಪು", "ಬೇಡ", "ಮತ್ತೆ",
    "नहीं", "गलत", "ना", "बदलो", "दोबारा", "नाही"
  ];

  const tokens = clean.split(/\s+/);
  return noWords.some(w => clean === w || clean.includes(w) || tokens.includes(w));
};
