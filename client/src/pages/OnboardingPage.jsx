import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OnboardingPage() {
  const { lang, setLanguage, token } = useAuth();
  const navigate = useNavigate();

  // Multi-step profile state
  const [step, setStep] = useState(1);
  const [preferredLanguage, setPreferredLanguageState] = useState(lang || "en");
  
  const [interactionPreferences, setInteractionPreferences] = useState({
    voiceInput: false,
    voiceOutput: false,
    transcription: false,
    conversationalGuidance: false,
    simplifiedInstructions: false,
  });

  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Multilingual translations localized for Onboarding UI
  const translations = {
    en: {
      title: "Set Your Preferences",
      subtitle: "Personalize Vocalyze to match your exact needs.",
      stepLabel: "Step",
      of: "of",
      next: "Continue",
      back: "Go Back",
      finish: "Complete Onboarding",
      skip: "Skip to Dashboard",
      
      // Step 1: Language
      step1Title: "Preferred Language",
      step1Desc: "What language would you prefer to use on Vocalyze?",
      
      // Step 2: Interaction
      step2Title: "Interaction Preferences",
      step2Desc: "How would you like to interact with the application? (Select all that apply)",
      voiceInputLabel: "Speak instead of typing",
      voiceInputDesc: "Use your microphone to speak your inputs.",
      voiceOutputLabel: "Hear information through voice",
      voiceOutputDesc: "Listen to text narrated by the app.",
      transcriptionLabel: "See spoken words as text",
      transcriptionDesc: "Provide transcriptions for audio prompts.",
      conversationalGuidanceLabel: "Get conversational guidance",
      conversationalGuidanceDesc: "Simpler, friendly dialogues to guide you.",
      simplifiedInstructionsLabel: "Receive simplified instructions",
      simplifiedInstructionsDesc: "Use easy English/regional phrases.",

      // Step 3: Accessibility Needs
      step3Title: "Accessibility Needs",
      step3Desc: "What kind of assistance would help you most? (Select all that apply)",
      needReading: "Difficulty reading text",
      needHearing: "Difficulty hearing audio",
      needInteraction: "Difficulty using keyboard/mouse",
      needUnderstanding: "Difficulty understanding complex instructions",
      needVoice: "Prefer voice-based interaction",
      needVisual: "Prefer visual assistance",
      needNone: "None / No assistance needed",
      
      errorDefault: "An error occurred. Please try again.",
    },
    hi: {
      title: "अपनी प्राथमिकताएँ सेट करें",
      subtitle: "अपनी आवश्यकताओं के अनुसार Vocalyze को अनुकूलित करें।",
      stepLabel: "चरण",
      of: "का",
      next: "आगे बढ़ें",
      back: "पीछे जाएं",
      finish: "सेटअप पूरा करें",
      skip: "सीधे डैशबोर्ड पर जाएं",

      // Step 1: Language
      step1Title: "पसंदीदा भाषा",
      step1Desc: "आप Vocalyze पर किस भाषा का उपयोग करना पसंद करेंगे?",

      // Step 2: Interaction
      step2Title: "बातचीत की प्राथमिकताएं",
      step2Desc: "आप ऐप के साथ कैसे बातचीत करना चाहेंगे? (जो भी लागू हों चुनें)",
      voiceInputLabel: "लिखने के बजाय बोलें",
      voiceInputDesc: "अपने इनपुट बोलने के लिए माइक्रोफ़ोन का उपयोग करें।",
      voiceOutputLabel: "आवाज़ के ज़रिए जानकारी सुनें",
      voiceOutputDesc: "ऐप द्वारा पढ़े जाने वाले टेक्स्ट को सुनें।",
      transcriptionLabel: "बोले गए शब्दों को टेक्स्ट के रूप में देखें",
      transcriptionDesc: "ऑडियो संकेतों के लिए ट्रांसक्रिप्शन प्रदान करें।",
      conversationalGuidanceLabel: "संवाद मार्गदर्शन प्राप्त करें",
      conversationalGuidanceDesc: "मार्गदर्शन के लिए सरल और अनुकूल संवाद।",
      simplifiedInstructionsLabel: "सरल निर्देश प्राप्त करें",
      simplifiedInstructionsDesc: "सरल हिंदी/अंग्रेजी वाक्यांशों का उपयोग करें।",

      // Step 3: Accessibility Needs
      step3Title: "पहुंच आवश्यकताएं",
      step3Desc: "किस प्रकार की सहायता से आपको सबसे अधिक मदद मिलेगी? (लागू होने वाले चुनें)",
      needReading: "टेक्स्ट पढ़ने में कठिनाई",
      needHearing: "ऑडियो सुनने में कठिनाई",
      needInteraction: "कीबोर्ड/माउस का उपयोग करने में कठिनाई",
      needUnderstanding: "जटिल निर्देशों को समझने में कठिनाई",
      needVoice: "आवाज़ आधारित बातचीत पसंद है",
      needVisual: "दृश्य सहायता पसंद है",
      needNone: "कोई नहीं / किसी सहायता की आवश्यकता नहीं है",

      errorDefault: "एक त्रुटि हुई। कृपया पुन: प्रयास करें।",
    },
    kn: {
      title: "ನಿಮ್ಮ ಆದ್ಯತೆಗಳನ್ನು ಹೊಂದಿಸಿ",
      subtitle: "ನಿಮ್ಮ ನಿಖರವಾದ ಅಗತ್ಯಗಳಿಗೆ ಸರಿಹೊಂದುವಂತೆ Vocalyze ಅನ್ನು ವೈಯಕ್ತೀಕರಿಸಿ.",
      stepLabel: "ಹಂತ",
      of: "ರ",
      next: "ಮುಂದುವರಿಯಿರಿ",
      back: "ಹಿಂದೆ ಹೋಗಿ",
      finish: "ಸೆಟಪ್ ಪೂರ್ಣಗೊಳಿಸಿ",
      skip: "ನೇರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ",

      // Step 1: Language
      step1Title: "ಆದ್ಯತೆಯ ಭಾಷೆ",
      step1Desc: "Vocalyze ನಲ್ಲಿ ನೀವು ಯಾವ ಭಾಷೆಯನ್ನು ಬಳಸಲು ಬಯಸುತ್ತೀರಿ?",

      // Step 2: Interaction
      step2Title: "ಸಂವಹನ ಆದ್ಯತೆಗಳು",
      step2Desc: "ಅಪ್ಲಿಕೇಶನ್‌ನೊಂದಿಗೆ ನೀವು ಹೇಗೆ ಸಂವಹನ ನಡೆಸಲು ಬಯಸುತ್ತೀರಿ? (ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ)",
      voiceInputLabel: "ಟೈಪ್ ಮಾಡುವ ಬದಲು ಮಾತನಾಡಿ",
      voiceInputDesc: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಇನ್‌ಪುಟ್ ಮಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಬಳಸಿ.",
      voiceOutputLabel: "ಧ್ವನಿಯ ಮೂಲಕ ಮಾಹಿತಿ ಆಲಿಸಿ",
      voiceOutputDesc: "ಅಪ್ಲಿಕೇಶನ್ ಓದುವ ಪಠ್ಯವನ್ನು ಕೇಳಿ.",
      transcriptionLabel: "ಮಾತನಾಡಿದ ಪದಗಳನ್ನು ಪಠ್ಯವಾಗಿ ನೋಡಿ",
      transcriptionDesc: "ಧ್ವನಿ ಪ್ರಾಂಪ್ಟ್‌ಗಳಿಗೆ ಪ್ರತಿಲಿಪಿಗಳನ್ನು ಒದಗಿಸಿ.",
      conversationalGuidanceLabel: "ಸಂಭಾಷಣೆಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ",
      conversationalGuidanceDesc: "ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸರಳವಾದ ಸಂಭಾಷಣೆಗಳು.",
      simplifiedInstructionsLabel: "ಸರಳೀಕೃತ ಸೂಚನೆಗಳನ್ನು ಪಡೆಯಿರಿ",
      simplifiedInstructionsDesc: "ಸರಳ ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್ ನುಡಿಗಟ್ಟುಗಳನ್ನು ಬಳಸಿ.",

      // Step 3: Accessibility Needs
      step3Title: "ಪ್ರವೇಶ ಅಗತ್ಯತೆಗಳು",
      step3Desc: "ಯಾವ ರೀತಿಯ ಸಹಾಯವು ನಿಮಗೆ ಹೆಚ್ಚು ಸಹಾಯ ಮಾಡುತ್ತದೆ? (ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ)",
      needReading: "ಪಠ್ಯವನ್ನು ಓದಲು ತೊಂದರೆ",
      needHearing: "ಧ್ವನಿಯನ್ನು ಕೇಳಲು ತೊಂದರೆ",
      needInteraction: "ಕೀಬೋರ್ಡ್/ಮೌಸ್ ಬಳಸಲು ತೊಂದರೆ",
      needUnderstanding: "ಸಂಕೀರ್ಣ ಸೂಚನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ತೊಂದರೆ",
      needVoice: "ಧ್ವನಿ ಆಧಾರಿತ ಸಂವಹನಕ್ಕೆ ಆದ್ಯತೆ",
      needVisual: "ದೃಶ್ಯ ಸಹಾಯಕ್ಕೆ ಆದ್ಯತೆ",
      needNone: "ಯಾವುದೂ ಇಲ್ಲ / ಯಾವುದೇ ಸಹಾಯದ ಅಗತ್ಯವಿಲ್ಲ",

      errorDefault: "ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
    }
  };

  const t = translations[preferredLanguage] || translations.en;

  const handleLanguageSelect = (languageCode) => {
    setPreferredLanguageState(languageCode);
    setLanguage(languageCode); // Syncs context & storage zoom/language layout
  };

  const togglePreference = (key) => {
    setInteractionPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAccessibilityNeed = (need) => {
    if (need === "none") {
      // If none is selected, clear everything else
      setAccessibilityNeeds(["none"]);
    } else {
      setAccessibilityNeeds((prev) => {
        const filtered = prev.filter((item) => item !== "none");
        if (filtered.includes(need)) {
          return filtered.filter((item) => item !== need);
        } else {
          return [...filtered, need];
        }
      });
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step < 3) {
      nextStep(e);
      return;
    }
    setIsSubmitting(true);
    setError("");

    const profilePayload = {
      preferredLanguage,
      interactionPreferences,
      accessibilityNeeds,
    };

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profilePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errorDefault);
      }

      // Update the user profile locally in Context if appropriate
      if (token) {
        // We trigger verification call which updates local auth context automatically
        // Let's force redirect to home
      }

      navigate("/");
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      setError(err.message || t.errorDefault);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page onboarding-page" style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
      <div className="grain"></div>

      <div className="onboarding-card" style={{
        background: "rgba(18, 49, 47, 0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(217, 245, 96, 0.15)",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "680px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ font: "800 28px Syne, Arial", margin: 0, color: "#fff" }}>{t.title}</h1>
            <p style={{ margin: "5px 0 0 0", color: "#6c7b77", fontSize: "14px" }}>{t.subtitle}</p>
          </div>
          <div style={{ background: "rgba(219, 245, 96, 0.1)", color: "#d9f560", padding: "6px 12px", borderRadius: "14px", font: "700 12px 'DM Mono'" }}>
            {t.stepLabel} {step} {t.of} 3
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: "rgba(255,255,255,0.08)", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "40px" }}>
          <div style={{ width: `${(step / 3) * 100}%`, height: "100%", background: "#d9f560", transition: "width 0.3s ease" }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: LANGUAGE SELECTION */}
          {step === 1 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px", color: "#fff" }}>{t.step1Title}</h2>
              <p style={{ color: "#aab7b3", fontSize: "14px", marginBottom: "25px" }}>{t.step1Desc}</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                {[
                  { code: "en", label: "English", sub: "English" },
                  { code: "hi", label: "हिंदी", sub: "Hindi" },
                  { code: "kn", label: "ಕನ್ನಡ", sub: "Kannada" }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleLanguageSelect(item.code)}
                    style={{
                      background: preferredLanguage === item.code ? "rgba(217, 245, 96, 0.15)" : "rgba(255,255,255,0.03)",
                      border: preferredLanguage === item.code ? "2px solid #d9f560" : "2px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      padding: "24px",
                      textAlign: "center",
                      color: preferredLanguage === item.code ? "#d9f560" : "#fff",
                      transition: "all 0.2s ease",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: "800" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "#6c7b77", marginTop: "4px" }}>{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTION PREFERENCES */}
          {step === 2 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px", color: "#fff" }}>{t.step2Title}</h2>
              <p style={{ color: "#aab7b3", fontSize: "14px", marginBottom: "25px" }}>{t.step2Desc}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { key: "voiceInput", label: t.voiceInputLabel, desc: t.voiceInputDesc },
                  { key: "voiceOutput", label: t.voiceOutputLabel, desc: t.voiceOutputDesc },
                  { key: "transcription", label: t.transcriptionLabel, desc: t.transcriptionDesc },
                  { key: "conversationalGuidance", label: t.conversationalGuidanceLabel, desc: t.conversationalGuidanceDesc },
                  { key: "simplifiedInstructions", label: t.simplifiedInstructionsLabel, desc: t.simplifiedInstructionsDesc },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    onClick={() => togglePreference(pref.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: interactionPreferences[pref.key] ? "rgba(217, 245, 96, 0.08)" : "rgba(255,255,255,0.02)",
                      border: interactionPreferences[pref.key] ? "1px solid #d9f560" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      padding: "16px 24px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{pref.label}</div>
                      <div style={{ fontSize: "12px", color: "#6c7b77", marginTop: "2px" }}>{pref.desc}</div>
                    </div>
                    <div style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: interactionPreferences[pref.key] ? "none" : "2px solid rgba(255,255,255,0.3)",
                      background: interactionPreferences[pref.key] ? "#d9f560" : "transparent",
                      display: "grid",
                      placeItems: "center",
                      color: "#12312f",
                      fontWeight: "900",
                      fontSize: "14px"
                    }}>
                      {interactionPreferences[pref.key] && "✓"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: ACCESSIBILITY NEEDS */}
          {step === 3 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px", color: "#fff" }}>{t.step3Title}</h2>
              <p style={{ color: "#aab7b3", fontSize: "14px", marginBottom: "25px" }}>{t.step3Desc}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "reading", label: t.needReading },
                  { key: "hearing", label: t.needHearing },
                  { key: "interaction", label: t.needInteraction },
                  { key: "understanding", label: t.needUnderstanding },
                  { key: "voice", label: t.needVoice },
                  { key: "visual", label: t.needVisual },
                  { key: "none", label: t.needNone },
                ].map((need) => {
                  const isChecked = accessibilityNeeds.includes(need.key);
                  return (
                    <div
                      key={need.key}
                      onClick={() => toggleAccessibilityNeed(need.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isChecked ? "rgba(217, 245, 96, 0.08)" : "rgba(255,255,255,0.02)",
                        border: isChecked ? "1px solid #d9f560" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        padding: "14px 24px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{need.label}</span>
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: isChecked ? "none" : "2px solid rgba(255,255,255,0.3)",
                        background: isChecked ? "#d9f560" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        color: "#12312f",
                        fontWeight: "900",
                        fontSize: "12px"
                      }}>
                        {isChecked && "✓"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.07)", padding: "12px 18px", borderRadius: "12px", fontSize: "13px", marginTop: "24px" }}>
              ⚠️ {error}
            </p>
          )}

          {/* Navigation Controls */}
          <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={(e) => prevStep(e)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: "700"
                }}
              >
                ← {t.back}
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={(e) => nextStep(e)}
                style={{
                  flex: 2,
                  background: "#d9f560",
                  border: "none",
                  color: "#12312f",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: "800",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {t.next} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || accessibilityNeeds.length === 0}
                style={{
                  flex: 2,
                  background: isSubmitting || accessibilityNeeds.length === 0 ? "rgba(217, 245, 96, 0.3)" : "#d9f560",
                  border: "none",
                  color: isSubmitting || accessibilityNeeds.length === 0 ? "rgba(18, 49, 47, 0.5)" : "#12312f",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: "800",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: isSubmitting || accessibilityNeeds.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "..." : t.finish} ✓
              </button>
            )}
          </div>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", fontSize: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
          <button onClick={handleSkip} style={{ background: "none", border: "none", color: "#6c7b77", padding: 0 }}>
            {t.skip} ↗
          </button>
          <Link to="/" style={{ color: "#6c7b77" }}>← Back to home</Link>
        </div>
      </div>
    </main>
  );
}
