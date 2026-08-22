import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import DocumentScanner from "../components/DocumentScanner";
import ExtractedFields from "../components/ExtractedFields";
import { extractFieldsDeterministically } from "../utils/ocrParser";
import {
  speakText,
  cancelSpeech,
  getLocaleForLang,
  isSpeechRecognitionSupported,
  isConfirmationAffirmative,
  isConfirmationNegative
} from "../utils/speechHelper";

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

  // Voice Assistant UI state
  const [voiceMode, setVoiceMode] = useState("idle"); // 'idle' | 'asking_question' | 'listening_answer' | 'asking_confirmation' | 'listening_confirmation' | 'asking_submission' | 'listening_submission' | 'submitting'
  const [assistantSpeech, setAssistantSpeech] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [userSaidText, setUserSaidText] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);

  // Document OCR states
  const [showScanner, setShowScanner] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Synchronous State Refs
  const isMountedRef = useRef(true);
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const activeModeRef = useRef("idle");
  const activeCallbackRef = useRef(null);

  const currentFieldIndexRef = useRef(0);
  const answersRef = useRef({});
  const pendingAnswerRef = useRef("");
  const questionsRef = useRef([]);
  const serviceRef = useRef(null);
  const applicationIdRef = useRef("");
  const tokenRef = useRef(token);
  const langRef = useRef(lang);

  // Sync state to refs
  useEffect(() => {
    currentFieldIndexRef.current = currentFieldIndex;
  }, [currentFieldIndex]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    pendingAnswerRef.current = pendingAnswer;
  }, [pendingAnswer]);

  useEffect(() => {
    questionsRef.current = service?.questions || [];
  }, [service]);

  useEffect(() => {
    serviceRef.current = service;
  }, [service]);

  useEffect(() => {
    applicationIdRef.current = applicationId;
  }, [applicationId]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const translations = {
    en: {
      step: "Question",
      of: "of",
      next: "Continue",
      back: "Go Back",
      review: "Review & Submit",
      loading: "Initializing application...",
      errorLoading: "Failed to initialize application.",
      invalidDate: "Please enter a valid date.",
      submitNow: "Submit Application",
      confirmTitle: "Voice Confirmation",
      youSaid: "You said:",
      detected: "Detected answer:",
      confirm: "Yes, Confirm",
      tryAgain: "No, Try Again",
      sayYesNo: "Say 'Yes' to confirm or 'No' to re-enter.",
      allCompleted: "All 11 questions have been answered. Would you like me to submit your application now? Say 'Submit' or 'Yes' to confirm.",
      submitting: "Submitting application...",
      repeatQuestion: "Repeat Question",
      stopAssistant: "Stop Assistant",
      startAssistant: "Start Assistant"
    },
    hi: {
      step: "प्रश्न",
      of: "का",
      next: "आगे बढ़ें",
      back: "पीछे जाएं",
      review: "समीक्षा और सबमिट",
      loading: "आवेदन शुरू हो रहा है...",
      errorLoading: "आवेदन शुरू करने में विफल।",
      invalidDate: "कृपया एक वैध तिथि दर्ज करें।",
      submitNow: "आवेदन जमा करें",
      confirmTitle: "ध्वनि पुष्टि",
      youSaid: "आपने कहा:",
      detected: "पहचाना गया उत्तर:",
      confirm: "हाँ, पुष्टि करें",
      tryAgain: "नहीं, दोबारा प्रयास करें",
      sayYesNo: "पुष्टि के लिए 'हाँ' कहें या दोबारा बोलने के लिए 'नहीं' कहें।",
      allCompleted: "सभी 11 प्रश्न पूरे हो चुके हैं। क्या आप अभी अपना आवेदन जमा करना चाहते हैं? पुष्टि के लिए 'सबमिट' या 'हाँ' कहें।",
      submitting: "आवेदन जमा हो रहा है...",
      repeatQuestion: "प्रश्न दोबारा सुनें",
      stopAssistant: "सहायक बंद करें",
      startAssistant: "सहायक शुरू करें"
    },
    kn: {
      step: "ಪ್ರಶ್ನೆ",
      of: "ರ",
      next: "ಮುಂದುವರಿಯಿರಿ",
      back: "ಹಿಂದೆ ಹೋಗಿ",
      review: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಲ್ಲಿಸಿ",
      loading: "ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
      errorLoading: "ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ.",
      invalidDate: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ.",
      submitNow: "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ",
      confirmTitle: "ಧ್ವನಿ ದೃಢೀಕರಣ",
      youSaid: "ನೀವು ಹೇಳಿದ್ದು:",
      detected: "ಗುರುತಿಸಲಾದ ಉತ್ತರ:",
      confirm: "ಹೌದು, ದೃಢೀಕರಿಸಿ",
      tryAgain: "ಇಲ್ಲ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      sayYesNo: "ದೃಢೀಕರಿಸಲು 'ಹೌದು' ಅಥವಾ ಮತ್ತೊಮ್ಮೆ ಹೇಳಲು 'ಇಲ್ಲ' ಎಂದು ಹೇಳಿ.",
      allCompleted: "ಎಲ್ಲಾ 11 ಪ್ರಶ್ನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ. ನೀವು ಈಗ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲು ಬಯಸುವಿರಾ? ದೃಢೀಕರಿಸಲು 'ಸಲ್ಲಿಸಿ' ಅಥವಾ 'ಹೌದು' ಎಂದು ಹೇಳಿ.",
      submitting: "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
      repeatQuestion: "ಪ್ರಶ್ನೆ ಮತ್ತೆ ಕೇಳಿ",
      stopAssistant: "ಸಹಾಯಕ ನಿಲ್ಲಿಸಿ",
      startAssistant: "ಸಹಾಯಕ ಪ್ರಾರಂಭಿಸಿ"
    }
  };

  const t = translations[lang] || translations.en;

  // Complete recognition shutdown
  const stopListening = useCallback(() => {
    activeModeRef.current = "idle";
    activeCallbackRef.current = null;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsMicActive(false);
  }, []);

  // Robust Speech Recognition Controller with Auto Keep-Alive
  const startRecognition = useCallback((modeToSet, onResultCallback) => {
    if (!isSpeechRecognitionSupported()) return;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    activeModeRef.current = modeToSet;
    activeCallbackRef.current = onResultCallback;
    setVoiceMode(modeToSet);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = getLocaleForLang(langRef.current);

    rec.onstart = () => {
      if (!isMountedRef.current) return;
      setIsMicActive(true);
    };

    rec.onerror = (e) => {
      if (!isMountedRef.current) return;
      console.warn("Recognition notice:", e.error);
      // If error occurs and we are still in listening mode, auto-retry
      if (activeModeRef.current === modeToSet) {
        restartTimerRef.current = setTimeout(() => {
          if (activeModeRef.current === modeToSet && isMountedRef.current) {
            try {
              rec.start();
            } catch (err) {}
          }
        }, 300);
      }
    };

    rec.onend = () => {
      if (!isMountedRef.current) return;
      setIsMicActive(false);
      // If recognition stopped unexpectedly while we are still waiting for user speech, auto restart!
      if (activeModeRef.current === modeToSet) {
        restartTimerRef.current = setTimeout(() => {
          if (activeModeRef.current === modeToSet && isMountedRef.current) {
            try {
              rec.start();
            } catch (err) {}
          }
        }, 300);
      }
    };

    rec.onresult = (event) => {
      if (!isMountedRef.current || activeModeRef.current !== modeToSet) return;

      let finalStr = "";
      let interimStr = "";

      for (let i = 0; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += text + " ";
        } else {
          interimStr += text;
        }
      }

      const activeText = (finalStr + interimStr).replace(/\s+/g, " ").trim();
      if (activeText) {
        setLiveTranscript(activeText);
        setUserSaidText(activeText);
        setCurrentValue(activeText);
      }

      // Clear any pending silence timer on new speech input
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (activeText.length > 0) {
        const isConfirmMode = modeToSet.includes("confirmation") || modeToSet.includes("submission");
        
        let debounceDelay = 1500; // Default for long spoken answers
        if (isConfirmMode) {
          // If unambiguous affirmative or negative detected, trigger ultra-fast
          if (isConfirmationAffirmative(activeText) || isConfirmationNegative(activeText)) {
            debounceDelay = 100;
          } else {
            debounceDelay = 400;
          }
        } else {
          // Fast path for short single-word answers like Yes, No, Male, Female
          const lower = activeText.toLowerCase();
          if (["yes", "no", "male", "female", "haan", "nahi", "haudu", "illa"].includes(lower)) {
            debounceDelay = 300;
          }
        }

        silenceTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current || activeModeRef.current !== modeToSet) return;

          activeModeRef.current = "processing";
          const callbackToRun = activeCallbackRef.current;
          activeCallbackRef.current = null;

          try {
            rec.abort();
          } catch (e) {}

          setIsMicActive(false);

          if (callbackToRun) {
            callbackToRun(activeText);
          }
        }, debounceDelay);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  }, []);

  // Forward declarations
  const askCurrentQuestionRef = useRef();
  const askForConfirmationRef = useRef();
  const handleConfirmationResponseRef = useRef();
  const handleAffirmativeAnswerRef = useRef();
  const submitFinalApplicationRef = useRef();

  // Initial Load: Fetch Service and Active Application
  useEffect(() => {
    isMountedRef.current = true;

    if (!token) {
      navigate("/login");
      return;
    }

    const initApplication = async () => {
      try {
        setLoading(true);
        // 1. Fetch Service Schema
        const serviceRes = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serviceData = await serviceRes.json();

        if (!serviceRes.ok || !serviceData.service) {
          setError(t.errorLoading);
          setLoading(false);
          return;
        }
        setService(serviceData.service);

        // 2. Resolve Active Application
        let appId = sessionStorage.getItem(`active-app-${serviceId}`);
        let appData = null;

        if (appId) {
          const appRes = await fetch(`${API_BASE_URL}/api/applications/${appId}`, {
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
          const createRes = await fetch(`${API_BASE_URL}/api/applications`, {
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

        const questionsList = serviceData.service.questions || [];
        let startIndex = 0;
        for (let i = 0; i < questionsList.length; i++) {
          if (appData.answers && appData.answers[questionsList[i].id]) {
            startIndex = i + 1 < questionsList.length ? i + 1 : i;
          } else {
            startIndex = i;
            break;
          }
        }

        setCurrentFieldIndex(startIndex);
        if (questionsList[startIndex]) {
          setCurrentValue(appData.answers?.[questionsList[startIndex].id] || "");
        }
      } catch (err) {
        console.error("Error initializing ServiceForm workflow:", err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    initApplication();

    return () => {
      isMountedRef.current = false;
      cancelSpeech();
      stopListening();
    };
  }, [serviceId, token, navigate, lang, t.errorLoading, stopListening]);

  const questions = service?.questions || [];
  const currentQuestion = questions[currentFieldIndex];
  const labelText = currentQuestion
    ? (currentQuestion.label[lang] || currentQuestion.label.en || currentQuestion.label)
    : "";

  // Ask User for Audio Confirmation ("You said X, is this correct?")
  const askForConfirmation = useCallback((parsedVal) => {
    cancelSpeech();
    stopListening();

    setPendingAnswer(parsedVal);
    pendingAnswerRef.current = parsedVal;
    setCurrentValue(parsedVal);
    setUserSaidText(parsedVal);

    const curLang = langRef.current;
    const confirmPhrases = {
      en: `You said: ${parsedVal}. Correct? Say 'Yes' or 'No'.`,
      hi: `${parsedVal}। सही है? 'हाँ' या 'नहीं' कहें।`,
      kn: `${parsedVal}। ಸರಿಯೇ? 'ಹೌದು' ಅಥವಾ 'ಇಲ್ಲ' ಎಂದು ಹೇಳಿ.`
    };

    const confirmMsg = confirmPhrases[curLang] || confirmPhrases.en;
    setAssistantSpeech(confirmMsg);
    setVoiceMode("asking_confirmation");

    speakText(confirmMsg, curLang, () => {
      if (!isMountedRef.current) return;
      // Start listening for Yes / No confirmation
      startRecognition("listening_confirmation", (response) => {
        handleConfirmationResponseRef.current(response, parsedVal);
      });
    });
  }, [startRecognition, stopListening]);

  askForConfirmationRef.current = askForConfirmation;

  // Handle Spoken Answer from User
  const handleAnswerSpoken = useCallback(async (transcript) => {
    const curIdx = currentFieldIndexRef.current;
    const curQ = questionsRef.current[curIdx];
    if (!curQ) return;

    setLiveTranscript(transcript);
    setUserSaidText(transcript);
    setPendingAnswer(transcript);
    pendingAnswerRef.current = transcript;

    const curLang = langRef.current;
    const curToken = tokenRef.current;
    const qLabel = curQ.label[curLang] || curQ.label.en || curQ.label;
    const cleanLower = transcript.toLowerCase().trim();

    // Instant local normalization for common questions (0ms network delay)
    if (curQ.id === "gender") {
      if (cleanLower.includes("female") || cleanLower.includes("woman") || cleanLower.includes("mahila") || cleanLower.includes("stree") || cleanLower.includes("ಹೆಣ್ಣು") || cleanLower.includes("ಮಹಿಳೆ")) {
        askForConfirmationRef.current("Female");
        return;
      }
      if (cleanLower.includes("male") || cleanLower.includes("man") || cleanLower.includes("purush") || cleanLower.includes("gandu") || cleanLower.includes("ಗಂಡು") || cleanLower.includes("ಪುರುಷ")) {
        askForConfirmationRef.current("Male");
        return;
      }
    }

    if (curQ.id === "ppoNumber" || isConfirmationAffirmative(transcript) || isConfirmationNegative(transcript)) {
      if (isConfirmationAffirmative(transcript)) {
        askForConfirmationRef.current("Yes");
        return;
      }
      if (isConfirmationNegative(transcript)) {
        askForConfirmationRef.current("No");
        return;
      }
    }

    // Normalization / AI extraction fallback for complex inputs
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/parse-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${curToken}`
        },
        body: JSON.stringify({
          field: curQ.id,
          question: qLabel,
          response: transcript,
          language: curLang
        })
      });

      const parsedData = await res.json();
      const finalVal = parsedData.value || transcript;
      askForConfirmationRef.current(finalVal);
    } catch (err) {
      console.warn("Using transcript directly:", err);
      askForConfirmationRef.current(transcript);
    }
  }, []);

  // Handle Confirmation Voice Input ('Yes' / 'No' / Correction)
  const handleConfirmationResponse = useCallback((response, valToSave) => {
    const curLang = langRef.current;
    setLiveTranscript(response);

    if (isConfirmationAffirmative(response)) {
      // User said Yes / Confirm -> Advance to next question
      handleAffirmativeAnswerRef.current(valToSave || pendingAnswerRef.current);
    } else if (isConfirmationNegative(response)) {
      // User said No / Wrong -> Re-ask current question
      setPendingAnswer("");
      pendingAnswerRef.current = "";
      setUserSaidText("");
      setCurrentValue("");

      const retryPhrases = {
        en: "Okay, let's try again.",
        hi: "ठीक है, फिर से प्रयास करते हैं।",
        kn: "ಸರಿ, ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸೋಣ."
      };
      const retryMsg = retryPhrases[curLang] || retryPhrases.en;
      setAssistantSpeech(retryMsg);

      speakText(retryMsg, curLang, () => {
        if (!isMountedRef.current) return;
        askCurrentQuestionRef.current();
      });
    } else {
      // User spoke a new value directly during confirmation (e.g. changed "Male" to "Female")
      const newAnswer = response.trim();
      if (newAnswer.length > 0) {
        setUserSaidText(newAnswer);
        askForConfirmationRef.current(newAnswer);
      } else {
        askForConfirmationRef.current(valToSave || pendingAnswerRef.current);
      }
    }
  }, []);

  handleConfirmationResponseRef.current = handleConfirmationResponse;

  // Ask Question via Audio
  const askCurrentQuestion = useCallback(() => {
    cancelSpeech();
    stopListening();

    const curIdx = currentFieldIndexRef.current;
    const curQ = questionsRef.current[curIdx];
    if (!curQ) return;

    const curLang = langRef.current;
    const qLabel = curQ.label[curLang] || curQ.label.en || curQ.label;
    const qNum = curIdx + 1;
    const totalQ = questionsRef.current.length;

    const questionPrompts = {
      en: `Question ${qNum} of ${totalQ}: ${qLabel}`,
      hi: `प्रश्न ${qNum} का ${totalQ}: ${qLabel}`,
      kn: `ಪ್ರಶ್ನೆ ${qNum} ರ ${totalQ}: ${qLabel}`
    };

    const questionSpeech = questionPrompts[curLang] || questionPrompts.en;
    setAssistantSpeech(questionSpeech);
    setVoiceMode("asking_question");
    setPendingAnswer("");
    pendingAnswerRef.current = "";
    setUserSaidText("");
    setLiveTranscript("");

    speakText(questionSpeech, curLang, () => {
      if (!isMountedRef.current) return;
      // Start listening for answer
      startRecognition("listening_answer", (transcript) => {
        handleAnswerSpoken(transcript);
      });
    });
  }, [startRecognition, handleAnswerSpoken, stopListening]);

  askCurrentQuestionRef.current = askCurrentQuestion;

  // Prompt Final Application Submission
  const promptFinalSubmission = useCallback(() => {
    cancelSpeech();
    stopListening();

    const curLang = langRef.current;
    const totalQ = questionsRef.current.length;
    const prompts = {
      en: `All ${totalQ} questions have been answered. Would you like me to submit your application now? Say 'Submit' or 'Yes' to confirm.`,
      hi: `सभी ${totalQ} प्रश्न पूरे हो चुके हैं। क्या आप अभी अपना आवेदन जमा करना चाहते हैं? पुष्टि के लिए 'सबमिट' या 'हाँ' कहें।`,
      kn: `ಎಲ್ಲಾ ${totalQ} ಪ್ರಶ್ನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ. ನೀವು ಈಗ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲು ಬಯಸುವಿರಾ? ದೃಢೀಕರಿಸಲು 'ಸಲ್ಲಿಸಿ' ಅಥವಾ 'ಹೌದು' ಎಂದು ಹೇಳಿ.`
    };

    const promptText = prompts[curLang] || prompts.en;
    setVoiceMode("asking_submission");
    setAssistantSpeech(promptText);
    setUserSaidText("");
    setLiveTranscript("");

    speakText(promptText, curLang, () => {
      if (!isMountedRef.current) return;
      startRecognition("listening_submission", (response) => {
        if (isConfirmationAffirmative(response)) {
          submitFinalApplicationRef.current();
        } else if (isConfirmationNegative(response)) {
          const cancelMsg = "You can review your answers or press the submit button whenever you are ready.";
          setAssistantSpeech(cancelMsg);
          speakText(cancelMsg, curLang);
          setVoiceMode("idle");
        } else {
          // If user uttered any submission response
          submitFinalApplicationRef.current();
        }
      });
    });
  }, [startRecognition, stopListening]);

  // Submit Application
  const submitFinalApplication = useCallback(async () => {
    cancelSpeech();
    stopListening();

    const curLang = langRef.current;
    const submittingPhrases = {
      en: "Submitting your application now...",
      hi: "आपका आवेदन जमा किया जा रहा है...",
      kn: "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ..."
    };

    const subMsg = submittingPhrases[curLang] || submittingPhrases.en;
    setVoiceMode("submitting");
    setAssistantSpeech(subMsg);
    speakText(subMsg, curLang);

    const curAppId = applicationIdRef.current;
    const curToken = tokenRef.current;
    const curService = serviceRef.current;

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${curAppId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${curToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem(`active-app-${serviceId}`);
        const nameVal = curService?.name[curLang] || curService?.name?.en || "Service Application";
        navigate("/service/confirmation", {
          state: {
            applicationId: curAppId,
            status: "SUBMITTED",
            serviceName: nameVal
          }
        });
      } else {
        const errorMsg = data.error || "Submission failed. Please check validation.";
        setFieldError(errorMsg);
        setVoiceMode("idle");
        speakText(errorMsg, curLang);
      }
    } catch (err) {
      console.error("Submission error:", err);
      const errorMsg = "Failed to submit application. Please check your connection.";
      setFieldError(errorMsg);
      setVoiceMode("idle");
      speakText(errorMsg, curLang);
    }
  }, [serviceId, navigate, stopListening]);

  submitFinalApplicationRef.current = submitFinalApplication;

  // Save confirmed answer and advance to next question
  const handleAffirmativeAnswer = useCallback(async (confirmedVal) => {
    const curIdx = currentFieldIndexRef.current;
    const curQ = questionsRef.current[curIdx];
    if (!curQ) return;

    const valClean = (confirmedVal || "").trim();
    const updatedAnswers = {
      ...answersRef.current,
      [curQ.id]: valClean
    };

    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
    setPendingAnswer("");
    pendingAnswerRef.current = "";

    // Save to Firestore backend via PATCH
    const curAppId = applicationIdRef.current;
    const curToken = tokenRef.current;
    if (curAppId && curToken) {
      try {
        await fetch(`${API_BASE_URL}/api/applications/${curAppId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curToken}`
          },
          body: JSON.stringify({ answers: { [curQ.id]: valClean } })
        });
      } catch (err) {
        console.error("Error saving updated answers:", err);
      }
    }

    const nextIndex = curIdx + 1;
    const totalQ = questionsRef.current.length;

    if (nextIndex < totalQ) {
      const nextQ = questionsRef.current[nextIndex];
      currentFieldIndexRef.current = nextIndex;
      setCurrentFieldIndex(nextIndex);
      setCurrentValue(updatedAnswers[nextQ.id] || "");
      setUserSaidText("");
      setLiveTranscript("");
      askCurrentQuestionRef.current();
    } else {
      // All questions confirmed!
      promptFinalSubmission();
    }
  }, [promptFinalSubmission]);

  handleAffirmativeAnswerRef.current = handleAffirmativeAnswer;

  // Start voice assistant on initial service load
  useEffect(() => {
    if (!loading && service && currentQuestion) {
      const timer = setTimeout(() => {
        askCurrentQuestion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, service]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual Form Submission / Next Handlers
  const handleManualNext = (e) => {
    e.preventDefault();
    if (currentQuestion?.required && (!currentValue || currentValue.trim() === "")) {
      setFieldError(`"${labelText}" is required.`);
      return;
    }
    handleAffirmativeAnswer(currentValue);
  };

  const handleBack = () => {
    cancelSpeech();
    stopListening();
    setFieldError("");
    setPendingAnswer("");
    pendingAnswerRef.current = "";
    setUserSaidText("");
    setLiveTranscript("");

    const curIdx = currentFieldIndexRef.current;
    if (curIdx > 0) {
      const prevIndex = curIdx - 1;
      currentFieldIndexRef.current = prevIndex;
      setCurrentFieldIndex(prevIndex);
      setCurrentValue(answersRef.current[questions[prevIndex].id] || "");
      askCurrentQuestion();
    } else {
      navigate("/dashboard");
    }
  };

  const handleOCRComplete = async (ocrText) => {
    setShowScanner(false);
    const requiredFields = questions.map((q) => q.id);
    const deterministic = extractFieldsDeterministically(ocrText, requiredFields);

    const missingOrLowConfidence = requiredFields.filter(
      (field) => !deterministic.fields[field] || deterministic.confidence[field] < 0.90
    );

    if (missingOrLowConfidence.length > 0 && token) {
      setIsExtracting(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/parse-document`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            documentType: "aadhaar",
            ocrText,
            requiredFields: missingOrLowConfidence
          })
        });

        if (res.ok) {
          const geminiResult = await res.json();
          requiredFields.forEach((field) => {
            if (geminiResult.fields?.[field] !== undefined && geminiResult.fields[field] !== null) {
              if (!deterministic.fields[field] || (geminiResult.confidence?.[field] || 0) > deterministic.confidence[field]) {
                deterministic.fields[field] = geminiResult.fields[field];
                deterministic.confidence[field] = geminiResult.confidence?.[field] ?? 0.85;
              }
            }
          });
        }
      } catch (err) {
        console.error("Gemini document parsing error:", err);
      } finally {
        setIsExtracting(false);
      }
    }

    setExtractedData(deterministic);
  };

  const handleConfirmExtractedFields = async (confirmedFields) => {
    const updatedAnswers = {
      ...answers,
      ...confirmedFields
    };
    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;
    setExtractedData(null);

    if (applicationId && token) {
      try {
        await fetch(`${API_BASE_URL}/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers: updatedAnswers })
        });
      } catch (err) {
        console.error("Error saving updated application answers:", err);
      }
    }

    // Advance to next unfilled question
    let nextIndex = currentFieldIndex;
    for (let i = 0; i < questions.length; i++) {
      if (!updatedAnswers[questions[i].id]) {
        nextIndex = i;
        break;
      }
    }

    currentFieldIndexRef.current = nextIndex;
    setCurrentFieldIndex(nextIndex);
    setCurrentValue(updatedAnswers[questions[nextIndex].id] || "");
    askCurrentQuestion();
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
        <Link to="/dashboard" style={{ color: "#d9f560", fontWeight: "700" }}>← Back to Dashboard</Link>
      </div>
    );
  }

  const progressPercent = ((currentFieldIndex + 1) / questions.length) * 100;

  return (
    <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
      <div className="grain"></div>

      <div
        style={{
          background: "rgba(18, 49, 47, 0.85)",
          backdropFilter: "blur(24px)",
          border: "2px solid rgba(217, 245, 96, 0.25)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "680px",
          padding: "36px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
        role="region"
        aria-label="Vocalyze Voice Assisted Application Form"
      >
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#fff",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                boxShadow: "0 0 16px rgba(217, 245, 96, 0.35)",
                border: "2px solid #d9f560",
                flexShrink: 0
              }}
            >
              <img src="/vocalyze-logo.png" alt="Vocalyze Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#d9f560", textTransform: "uppercase", letterSpacing: "1px" }}>
                Vocalyze • Voice Form
              </span>
              <h1 style={{ font: "800 22px 'Outfit', 'Plus Jakarta Sans', Arial", margin: "2px 0 0 0", color: "#fff" }}>
                {service.name[lang] || service.name.en || service.name}
              </h1>
            </div>
          </div>
          <div style={{ background: "rgba(219, 245, 96, 0.15)", color: "#d9f560", padding: "6px 14px", borderRadius: "14px", font: "800 13px 'DM Mono'" }}>
            {t.step} {currentFieldIndex + 1} {t.of} {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: "rgba(255,255,255,0.08)", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "25px" }}>
          <div style={{ width: `${progressPercent}%`, height: "100%", background: "#d9f560", transition: "width 0.4s ease" }}></div>
        </div>

        {/* AI Voice Assistant Conversational Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(217, 245, 96, 0.08), rgba(0,0,0,0.35))",
            border: isMicActive ? "2px solid #ff4b4b" : "1px solid rgba(217, 245, 96, 0.3)",
            borderRadius: "20px",
            padding: "22px",
            marginBottom: "25px",
            boxShadow: isMicActive ? "0 0 25px rgba(255, 75, 75, 0.25)" : "none",
            transition: "all 0.3s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: isMicActive ? "#ff4b4b" : "#d9f560",
                  color: "#12312f",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "15px",
                  fontWeight: "900",
                  boxShadow: isMicActive ? "0 0 12px #ff4b4b" : "0 0 10px rgba(217,245,96,0.3)"
                }}
              >
                🎙️
              </div>
              <span style={{ fontSize: "12px", fontWeight: "800", color: isMicActive ? "#ff7b7b" : "#d9f560", textTransform: "uppercase" }}>
                {isMicActive
                  ? (voiceMode.includes("confirmation") ? "Listening for Confirmation ('Yes' / 'No')..." : "Listening for your Answer...")
                  : (voiceMode.startsWith("asking") ? "Speaking to you..." : "AI Assistant Ready")}
              </span>
            </div>

            <button
              type="button"
              onClick={askCurrentQuestion}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#d9f560",
                borderRadius: "10px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              🔊 {t.repeatQuestion}
            </button>
          </div>

          {/* Assistant Voice Line */}
          <div style={{ fontSize: "15px", color: "#fff", lineHeight: "1.5", marginBottom: "12px" }}>
            🗣️ <strong style={{ color: "#d9f560" }}>Vocalyze:</strong> {assistantSpeech || labelText}
          </div>

          {/* Persistent "You said" and Detected Answer display */}
          {(userSaidText || liveTranscript) && (
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(217, 245, 96, 0.2)",
                borderRadius: "14px",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ fontSize: "14px", color: "#d9f560", fontWeight: "700" }}>
                🎙️ {t.youSaid} <span style={{ color: "#fff" }}>"{userSaidText || liveTranscript}"</span>
              </div>
              {pendingAnswer && (
                <div style={{ fontSize: "12px", color: "#aab7b3" }}>
                  ✓ {t.detected} <strong style={{ color: "#d9f560" }}>{pendingAnswer}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question Form */}
        <form onSubmit={handleManualNext}>
          <div style={{ minHeight: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <label htmlFor="wizard-input" style={{ display: "block", font: "700 17px Manrope", margin: 0, color: "#fff", lineHeight: "1.4" }}>
                {labelText}
              </label>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                style={{
                  background: "rgba(219, 245, 96, 0.08)",
                  border: "1px solid rgba(219, 245, 96, 0.3)",
                  color: "#d9f560",
                  borderRadius: "12px",
                  padding: "6px 12px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                📄 Scan Document
              </button>
            </div>

            {/* Answer Input Field */}
            <input
              id="wizard-input"
              type={currentQuestion?.type === "date" ? "date" : "text"}
              value={currentValue}
              onChange={(e) => {
                setFieldError("");
                setCurrentValue(e.target.value);
              }}
              placeholder={currentQuestion?.type === "date" ? "YYYY-MM-DD" : "Speak into microphone or type answer..."}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(217, 245, 96, 0.3)",
                borderRadius: "16px",
                padding: "16px 20px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                boxSizing: "border-box"
              }}
            />

            {fieldError && (
              <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.08)", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", marginTop: "14px" }}>
                ⚠️ {fieldError}
              </p>
            )}
          </div>

          {/* Voice Confirmation Card if pending */}
          {pendingAnswer && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(217, 245, 96, 0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
                marginTop: "20px"
              }}
            >
              <div style={{ fontSize: "13px", color: "#aab7b3", marginBottom: "12px" }}>
                {t.sayYesNo}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setPendingAnswer("");
                    pendingAnswerRef.current = "";
                    setUserSaidText("");
                    setCurrentValue("");
                    askCurrentQuestion();
                  }}
                  style={{
                    flex: 1,
                    background: "rgba(255,75,75,0.15)",
                    border: "1px solid rgba(255,75,75,0.4)",
                    color: "#ff8b8b",
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  ✗ {t.tryAgain}
                </button>
                <button
                  type="button"
                  onClick={() => handleAffirmativeAnswer(pendingAnswer || currentValue)}
                  style={{
                    flex: 2,
                    background: "#d9f560",
                    border: "none",
                    color: "#12312f",
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  ✓ {t.confirm}
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "16px", marginTop: "30px" }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: "16px",
                padding: "14px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              ← {t.back}
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                background: "#d9f560",
                border: "none",
                color: "#12312f",
                borderRadius: "16px",
                padding: "14px",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {currentFieldIndex === questions.length - 1 ? t.submitNow : t.next} →
            </button>
          </div>
        </form>
      </div>

      {showScanner && (
        <DocumentScanner
          onOCRComplete={handleOCRComplete}
          onClose={() => setShowScanner(false)}
        />
      )}

      {isExtracting && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#092d2c", border: "1px solid #1e4a47", borderRadius: "16px", padding: "24px", color: "#f6f3eb", fontWeight: "700" }}>
            Extracting document fields with AI...
          </div>
        </div>
      )}

      {extractedData && (
        <ExtractedFields
          extractedData={extractedData}
          requiredFields={questions.map((q) => q.id)}
          currentLanguage={lang}
          onConfirm={handleConfirmExtractedFields}
          onCancel={() => setExtractedData(null)}
        />
      )}
    </div>
  );
}
