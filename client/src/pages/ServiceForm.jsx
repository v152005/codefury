import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VoiceInput from "../components/VoiceInput";

const langLocales = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
};

export default function ServiceForm() {
  const { serviceId } = useParams();
  const { user, token, lang } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form progression state
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentValue, setCurrentValue] = useState("");
  const [fieldError, setFieldError] = useState("");

  // AI & Voice Helpers state
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedConfirmation, setParsedConfirmation] = useState(null);



  const translations = {
    en: {
      step: "Question",
      of: "of",
      next: "Continue",
      back: "Go Back",
      review: "Review Details",
      loading: "Initializing application...",
      errorLoading: "Failed to initialize application.",
      invalidDate: "Please enter a valid date.",
      invalidPhone: "Please enter a valid 10-digit phone number.",
      explain: "Explain this",
      listening: "Listening...",
      speakBtn: "Speak Answer",
      parsing: "Analyzing response...",
      youSaid: "You said:",
      detected: "Detected value:",
      confirm: "Confirm",
      tryAgain: "Try Again",
      needsReview: "Confidence is low. Please confirm or correct this value.",
      micBlocked: "Microphone is blocked. Please enter text instead."
    },
    hi: {
      step: "प्रश्न",
      of: "का",
      next: "आगे बढ़ें",
      back: "पीछे जाएं",
      review: "विवरण की समीक्षा करें",
      loading: "आवेदन शुरू हो रहा है...",
      errorLoading: "आवेदन शुरू करने में विफल।",
      invalidDate: "कृपया एक वैध तिथि दर्ज करें।",
      invalidPhone: "कृपया एक वैध 10-अंकीय फ़ोन नंबर दर्ज करें।",
      explain: "इसे समझाएं",
      listening: "सुन रहा हूँ...",
      speakBtn: "उत्तर बोलें",
      parsing: "उत्तर का विश्लेषण कर रहा हूँ...",
      youSaid: "आपने कहा:",
      detected: "पहचाना गया मूल्य:",
      confirm: "पुष्टि करें",
      tryAgain: "फिर से प्रयास करें",
      needsReview: "विश्वास कम है। कृपया इस मूल्य की पुष्टि करें या सुधारें।",
      micBlocked: "माइक्रोफ़ोन अवरुद्ध है। कृपया उत्तर टाइप करें।"
    },
    kn: {
      step: "ಪ್ರಶ್ನೆ",
      of: "ರ",
      next: "ಮುಂದುವರಿಯಿರಿ",
      back: "ಹಿಂದೆ ಹೋಗಿ",
      review: "ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
      loading: "ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
      errorLoading: "ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ.",
      invalidDate: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ.",
      invalidPhone: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      explain: "ಇದನ್ನು ವಿವರಿಸಿ",
      listening: "ಕೇಳಿಸಲಾಗುತ್ತಿದೆ...",
      speakBtn: "ಉತ್ತರವನ್ನು ಹೇಳಿ",
      parsing: "ಉತ್ತರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      youSaid: "ನೀವು ಹೇಳಿದ್ದು:",
      detected: "ಗುರುತಿಸಲಾದ ಮೌಲ್ಯ:",
      confirm: "ದೃಢೀಕರಿಸಿ",
      tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      needsReview: "ನಿಖರತೆಯ ನಂಬಿಕೆ ಕಡಿಮೆಯಿದೆ. ದಯವಿಟ್ಟು ಈ ಮೌಲ್ಯವನ್ನು ಖಚಿತಪಡಿಸಿ ಅಥವಾ ತಿದ್ದಿ.",
      micBlocked: "ಮೈಕ್ರೊಫೋನ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ."
    }
  };

  const t = translations[lang] || translations.en;

  const preferences = user?.interactionPreferences || {
    voiceInput: false,
    voiceOutput: false,
    transcription: false,
    conversationalGuidance: false,
    simplifiedInstructions: false,
    captions: false
  };

  const speak = useCallback((text) => {
    if (!preferences.voiceOutput || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langLocales[lang] || "en-US";
    window.speechSynthesis.speak(utterance);
  }, [lang, preferences.voiceOutput]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const initApplication = async () => {
      try {
        setLoading(true);
        // 1. Fetch Service Schema
        const serviceRes = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serviceData = await serviceRes.json();

        if (!serviceRes.ok) {
          setError(t.errorLoading);
          setLoading(false);
          return;
        }
        setService(serviceData.service);

        // 2. Resolve Active Application (Create or Resume)
        let appId = sessionStorage.getItem(`active-app-${serviceId}`);
        let appData = null;

        if (appId) {
          const appRes = await fetch(`http://localhost:5000/api/applications/${appId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (appRes.ok) {
            const resObj = await appRes.json();
            if (resObj.application && resObj.application.status === "IN_PROGRESS") {
              appData = resObj.application;
            }
          }
        }

        if (!appData) {
          // Create new application context
          const createRes = await fetch("http://localhost:5000/api/applications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ serviceId })
          });
          const createData = await createRes.json();
          if (createRes.ok) {
            appId = createData.applicationId;
            appData = createData.application;
            sessionStorage.setItem(`active-app-${serviceId}`, appId);
          } else {
            setError(t.errorLoading);
            setLoading(false);
            return;
          }
        }

        setApplicationId(appId);
        setAnswers(appData.answers || {});
        
        // Find current question index based on already saved answers
        const questions = serviceData.service.questions || [];
        let startIndex = 0;
        for (let i = 0; i < questions.length; i++) {
          if (appData.answers && appData.answers[questions[i].id]) {
            startIndex = i;
          } else {
            startIndex = i;
            break;
          }
        }

        setCurrentFieldIndex(startIndex);
        if (questions[startIndex]) {
          setCurrentValue(appData.answers?.[questions[startIndex].id] || "");
        }
      } catch (err) {
        console.error("Error initializing ServiceForm workflow:", err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    initApplication();
  }, [serviceId, token, navigate, lang, t.errorLoading]);

  const questions = service?.questions || [];
  const currentQuestion = questions[currentFieldIndex];
  const labelText = currentQuestion ? (currentQuestion.label[lang] || currentQuestion.label.en || currentQuestion.label) : "";

  // Trigger Gemini explanations on question activation
  useEffect(() => {
    if (loading || !currentQuestion || !labelText) return;

    const loadExplanation = async () => {
      // Narrate original label
      speak(labelText);

      if (!preferences.simplifiedInstructions) return;

      try {
        setExplaining(true);
        const res = await fetch("http://localhost:5000/api/ai/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            question: labelText,
            language: lang
          })
        });

        if (res.ok) {
          const data = await res.json();
          setExplanation(data.explanation);
          
          // Narrate simplified text
          speak(data.explanation);
        }
      } catch (err) {
        console.error("AI Explanation fetch error:", err);
      } finally {
        setExplaining(false);
      }
    };

    loadExplanation();
  }, [currentFieldIndex, loading, labelText, token, lang, preferences.simplifiedInstructions, preferences.voiceOutput, speak, currentQuestion]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVoiceTranscript = async (transcript) => {
    if (!currentQuestion) return;

    setIsParsing(true);
    setFieldError("");
    setParsedConfirmation(null);

    try {
      const res = await fetch("http://localhost:5000/api/ai/parse-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          field: currentQuestion.id,
          question: labelText,
          response: transcript,
          language: lang
        })
      });

      const parsedData = await res.json();

      if (res.ok && parsedData.value) {
        setCurrentValue(parsedData.value);
        setParsedConfirmation({
          transcript,
          value: parsedData.value,
          confidence: parsedData.confidence,
          needsConfirmation: parsedData.needsConfirmation || parsedData.confidence < 0.90,
          clarification: parsedData.clarification
        });
      } else {
        setFieldError(parsedData.clarification || "We couldn't extract a clear answer. Please try speaking again or type your answer.");
        speak(parsedData.clarification || "We couldn't extract a clear answer. Please try again.");
      }
    } catch (err) {
      console.error("Response parsing error:", err);
      setFieldError("Failed to parse voice response. Please type your response.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveAndProgress = async (valToSave) => {
    setFieldError("");

    // Validate type formatting
    if (currentQuestion.type === "date" && valToSave) {
      const parsed = Date.parse(valToSave.trim());
      if (isNaN(parsed)) {
        setFieldError(t.invalidDate);
        return;
      }
    }

    try {
      const updatedAnswers = {
        ...answers,
        [currentQuestion.id]: valToSave.trim()
      };

      // PATCH answers to backend REST API
      const patchRes = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: { [currentQuestion.id]: valToSave.trim() } })
      });

      if (!patchRes.ok) {
        const patchData = await patchRes.json();
        setFieldError(patchData.error || "Failed to save field answer.");
        return;
      }

      setAnswers(updatedAnswers);
      setParsedConfirmation(null);
      setExplanation("");

      // Move to next step or review page
      if (currentFieldIndex < questions.length - 1) {
        const nextIndex = currentFieldIndex + 1;
        setCurrentFieldIndex(nextIndex);
        setCurrentValue(updatedAnswers[questions[nextIndex].id] || "");
      } else {
        // Form completed, navigate to review screen
        navigate(`/service/${serviceId}/review`);
      }
    } catch (err) {
      console.error("Save answer error:", err);
      setFieldError("Server connection error. Please try again.");
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentQuestion.required && (!currentValue || currentValue.trim() === "")) {
      setFieldError(`"${labelText}" is required.`);
      return;
    }
    handleSaveAndProgress(currentValue);
  };

  const handleBack = () => {
    setFieldError("");
    setParsedConfirmation(null);
    setExplanation("");

    if (currentFieldIndex > 0) {
      const prevIndex = currentFieldIndex - 1;
      setCurrentFieldIndex(prevIndex);
      setCurrentValue(answers[questions[prevIndex].id] || "");
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", font: "700 16px Manrope" }}>
        <div className="grain"></div>
        {t.loading}
      </div>
    );
  }

  if (error || !service || questions.length === 0) {
    return (
      <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px" }}>
        <div className="grain"></div>
        <p style={{ color: "#ffb798" }}>⚠️ {error || t.errorLoading}</p>
        <Link to="/" style={{ color: "#d9f560", fontWeight: "700" }}>← Back to Dashboard</Link>
      </div>
    );
  }

  const progressPercent = (currentFieldIndex / questions.length) * 100;

  return (
    <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
      <div className="grain"></div>

      <div style={{
        background: "rgba(18, 49, 47, 0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(217, 245, 96, 0.15)",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "600px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ font: "800 22px Syne, Arial", margin: 0, color: "#fff" }}>
              {service.name[lang] || service.name.en || service.name}
            </h1>
          </div>
          <div style={{ background: "rgba(219, 245, 96, 0.1)", color: "#d9f560", padding: "6px 12px", borderRadius: "14px", font: "700 12px 'DM Mono'" }}>
            {t.step} {currentFieldIndex + 1} {t.of} {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: "rgba(255,255,255,0.08)", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "30px" }}>
          <div style={{ width: `${progressPercent}%`, height: "100%", background: "#d9f560", transition: "width 0.3s ease" }}></div>
        </div>

        {/* Simplified Instructions/AI Explanation Box */}
        {preferences.simplifiedInstructions && (explanation || explaining) && (
          <div style={{
            background: "rgba(219, 245, 96, 0.04)",
            border: "1px solid rgba(219, 245, 96, 0.15)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "30px",
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#d9f560", fontWeight: "800", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ⓘ AI Assistant
              </span>
              {preferences.voiceOutput && (
                <button
                  type="button"
                  onClick={() => speak(explanation)}
                  style={{ background: "transparent", border: "none", color: "#d9f560", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                >
                  🔊 Listen
                </button>
              )}
            </div>
            {explaining ? (
              <span style={{ color: "#6c7b77", fontStyle: "italic" }}>Simplifying question...</span>
            ) : (
              <p style={{ margin: 0, color: "#f6f3eb" }}>{explanation}</p>
            )}
          </div>
        )}

        {/* Form Question */}
        <form onSubmit={handleNext}>
          <div style={{ minHeight: "130px" }}>
            <label htmlFor="wizard-input" style={{ display: "block", font: "700 18px Manrope", marginBottom: "16px", color: "#fff", lineHeight: "1.4" }}>
              {labelText}
            </label>

            {/* AI Confirmation Screen Banner */}
            {parsedConfirmation ? (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "20px"
              }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#aab7b3" }}>
                  {t.youSaid} <strong style={{ color: "#fff" }}>"{parsedConfirmation.transcript}"</strong>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#6c7b77", fontWeight: "800", textTransform: "uppercase" }}>
                    {t.detected}
                  </span>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(219, 245, 96, 0.3)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "700"
                    }}
                  />
                </div>

                {parsedConfirmation.needsConfirmation && (
                  <p style={{ color: "#ffb798", fontSize: "12px", margin: "10px 0 0 0" }}>
                    ⚠️ {t.needsReview}
                  </p>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedConfirmation(null);
                      setCurrentValue("");
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(255,75,75,0.1)",
                      border: "1px solid rgba(255,75,75,0.3)",
                      color: "#ff7575",
                      borderRadius: "12px",
                      padding: "12px",
                      fontWeight: "700",
                      fontSize: "13px"
                    }}
                  >
                    ✗ {t.tryAgain}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAndProgress(currentValue)}
                    style={{
                      flex: 2,
                      background: "#d9f560",
                      border: "none",
                      color: "#12312f",
                      borderRadius: "12px",
                      padding: "12px",
                      fontWeight: "800",
                      fontSize: "13px"
                    }}
                  >
                    ✓ {t.confirm}
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Input Field */
              <input
                id="wizard-input"
                type={currentQuestion.type === "date" ? "date" : "text"}
                value={currentValue}
                onChange={(e) => {
                  setFieldError("");
                  setCurrentValue(e.target.value);
                }}
                autoFocus
                placeholder={currentQuestion.type === "date" ? "YYYY-MM-DD" : ""}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  color: "#fff",
                  fontSize: "16px"
                }}
              />
            )}

            {isParsing && (
              <p style={{ color: "#d9f560", fontSize: "13px", fontStyle: "italic", marginTop: "12px" }}>
                ⏳ {t.parsing}
              </p>
            )}

            {fieldError && (
              <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.07)", padding: "12px 18px", borderRadius: "12px", fontSize: "13px", marginTop: "18px" }}>
                ⚠️ {fieldError}
              </p>
            )}
          </div>

          {/* Voice Input Microphone Widget */}
          {preferences.voiceInput && !parsedConfirmation && (
            <VoiceInput
              lang={lang}
              onTranscript={handleVoiceTranscript}
              promptText={t.speakBtn}
            />
          )}

          {/* Standard Navigation Controls */}
          {!parsedConfirmation && (
            <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
              <button
                type="button"
                onClick={handleBack}
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
              <button
                type="submit"
                disabled={isParsing}
                style={{
                  flex: 2,
                  background: isParsing ? "rgba(217, 245, 96, 0.4)" : "#d9f560",
                  border: "none",
                  color: isParsing ? "rgba(18, 49, 47, 0.5)" : "#12312f",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: "800",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {currentFieldIndex === questions.length - 1 ? t.review : t.next} →
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
