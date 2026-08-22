import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";
import { landingTranslations } from "../utils/translations";
import ReaderSizeControl from "../components/ReaderSizeControl";
import { AnimatedScore } from "../components/AnimatedScore";

// Viewport counter using IntersectionObserver
function ViewportCounter({ value, suffix = "" }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref}>
      {isInView ? <AnimatedScore value={value} duration={1200} /> : "0"}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { user, logout, lang, setLanguage, size, setSize } = useAuth();
  const t = landingTranslations[lang] || landingTranslations.en;
  const navigate = useNavigate();

  // Redirect to onboarding if user is logged in but hasn't completed onboarding
  useEffect(() => {
    if (user && !user.preferredLanguage) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  const [activeMode, setActiveMode] = useState("vision");
  const [joinedList, setJoinedList] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply reveal animations on scroll
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });

    return () => revealObserver.disconnect();
  }, []);

  // Speech Narration Handler
  const handleNarration = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(t.story);
    
    // Choose appropriate voice lang
    const voiceLangMap = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN",
    };
    utterance.lang = voiceLangMap[lang] || "en-IN";

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().slice(0, 2))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.9;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = (selectedLang) => {
    setLanguage(selectedLang);
  };

  const handleJoinList = () => {
    setJoinedList(true);
  };

  // Accessibility modes content structure
  const modesData = {
    en: {
      vision: {
        title: "For clear, confident choices.",
        card: "Large type, clean contrast and audio guidance make every step comfortable.",
        text: "Vocalyze remembers the tools that work for you, then lets you change them anytime. Every experience stays complete, respectful and fully yours.",
        items: ["◉ Read this page aloud", "◐ High contrast is on", "↗ Text size: extra large"],
      },
      hearing: {
        title: "Every message, made visible.",
        card: "Captions, transcripts and visual signals make sure nothing important is missed.",
        text: "Text-first flows and Indian Sign Language prompts keep conversations and services open to everyone.",
        items: ["▣ Live captions enabled", "↗ Visual call alerts on", "◫ Key steps in text"],
      },
      motor: {
        title: "Move at your own pace.",
        card: "Voice controls and generous targets make precision taps a thing of the past.",
        text: "Use your voice, keyboard or assisted input to navigate essential tasks without friction.",
        items: ["● Voice navigation ready", "▢ Larger touch targets on", "↔ Switch input supported"],
      },
      language: {
        title: "Speak your language.",
        card: "Guidance that sounds familiar, in the words that make sense to you.",
        text: "Vocalyze brings regional language text and voice together, so English is never the only doorway.",
        items: ["अ Hindi available", "ಅ Kannada available", "A English available"],
      },
    },
    hi: {
      vision: {
        title: "स्पष्ट और आत्मविश्वासपूर्ण चुनावों के लिए।",
        card: "बड़ा अक्षर, स्पष्ट कंट्रास्ट और ऑडियो मार्गदर्शन हर चरण को आरामदायक बनाते हैं।",
        text: "Vocalyze आपकी पसंदीदा सुविधाओं को याद रखता है और उन्हें कभी भी बदलने की आज़ादी देता है।",
        items: ["◉ यह पेज सुनें", "◐ उच्च कंट्रास्ट चालू है", "↗ बहुत बड़ा पाठ"],
      },
      hearing: {
        title: "हर संदेश, अब दिखाई देगा।",
        card: "कैप्शन, ट्रांसक्रिप्ट और दृश्य संकेत यह सुनिश्चित करते हैं कि कोई महत्वपूर्ण बात न छूटे।",
        text: "टेक्स्ट-प्रथम प्रवाह और भारतीय सांकेतिक भाषा के संकेत सभी के लिए संवाद खुला रखते हैं।",
        items: ["▣ लाइव कैप्शन चालू है", "↗ दृश्य कॉल अलर्ट चालू है", "◫ महत्वपूर्ण चरण पाठ में"],
      },
      motor: {
        title: "अपनी गति से आगे बढ़ें।",
        card: "आवाज़ नियंत्रण और बड़े लक्ष्य सटीक टैप की बाधा हटाते हैं।",
        text: "ज़रूरी कार्यों को बिना परेशानी के करने के लिए आवाज़, कीबोर्ड या सहायक इनपुट का उपयोग करें।",
        items: ["● आवाज़ नेविगेशन तैयार है", "▢ बड़े टच लक्ष्य चालू हैं", "↔ स्विच इनपुट समर्थित है"],
      },
      language: {
        title: "अपनी भाषा में बोलें।",
        card: "परिचित शब्दों में मार्गदर्शन जो समझ में आता है।",
        text: "Vocalyze क्षेत्रीय भाषा के पाठ और आवाज़ को एक साथ लाता है।",
        items: ["अ हिंदी उपलब्ध है", "ಅ कन्नड़ उपलब्ध है", "A अंग्रेज़ी उपलब्ध है"],
      },
    },
    kn: {
      vision: {
        title: "ಸ್ಪಷ್ಟ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಆಯ್ಕೆಗಳಿಗಾಗಿ.",
        card: "ದೊಡ್ಡ ಅಕ್ಷರ, ಸ್ಪಷ್ಟ ಕಾಂಟ್ರಾಸ್ಟ್ ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನವು ಪ್ರತಿ ಹಂತವನ್ನು ಸುಲಭಗೊಳಿಸುತ್ತದೆ.",
        text: "Vocalyze ನಿಮಗೆ ಸೂಕ್ತವಾದ ಸೌಲಭ್ಯಗಳನ್ನು ನೆನಪಿಟ್ಟುಕೊಂಡು, ಅವನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಲು ಅವಕಾಶ ನೀಡುತ್ತದೆ.",
        items: ["◉ ಈ ಪುಟವನ್ನು ಆಲಿಸಿ", "◐ ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್ ಚಾಲನೆಯಲ್ಲಿದೆ", "↗ ಅತ್ಯಂತ ದೊಡ್ಡ ಅಕ್ಷರ"],
      },
      hearing: {
        title: "ಪ್ರತಿ ಸಂದೇಶವೂ ಗೋಚರಿಸುತ್ತದೆ.",
        card: "ಶೀರ್ಷಿಕೆಗಳು, ಪ್ರತಿಲಿಪಿಗಳು ಮತ್ತು ದೃಶ್ಯ ಸಂಕೇತಗಳು ಮುಖ್ಯವಾದುದು ತಪ್ಪದಂತೆ ನೋಡಿಕೊಳ್ಳುತ್ತವೆ.",
        text: "ಪಠ್ಯ-ಮೊದಲಿನ ಹರಿವುಗಳು ಮತ್ತು ಭಾರತೀಯ ಸಂಕೇತ ಭಾಷೆಯ ಸೂಚನೆಗಳು ಎಲ್ಲರಿಗೂ ಸಂವಹನವನ್ನು ಮುಕ್ತವಾಗಿರಿಸುತ್ತವೆ.",
        items: ["▣ ನೇರ ಶೀರ್ಷಿಕೆಗಳು ಚಾಲನೆಯಲ್ಲಿವೆ", "↗ ದೃಶ್ಯ ಕರೆ ಎಚ್ಚರಿಕೆಗಳು ಚಾಲನೆಯಲ್ಲಿವೆ", "◫ ಮುಖ್ಯ ಹಂತಗಳು ಪಠ್ಯದಲ್ಲಿ"],
      },
      motor: {
        title: "ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ.",
        card: "ಧ್ವನಿ ನಿಯಂತ್ರಣ ಮತ್ತು ದೊಡ್ಡ ಗುರಿಗಳು ನಿಖರ ಟ್ಯಾಪ್ ಮಾಡುವ ಅಡಚಣೆಯನ್ನು ತೆಗೆದುಹಾಕುತ್ತವೆ.",
        text: "ಅಗತ್ಯ ಕಾರ್ಯಗಳನ್ನು ಸುಲಭವಾಗಿ ನಡೆಸಲು ಧ್ವನಿ, ಕೀಬೋರ್ಡ್ ಅಥವಾ ಸಹಾಯಕ ಇನ್‌ಪುಟ್ ಬಳಸಿ.",
        items: ["● ಧ್ವನಿ ನ್ಯಾವಿಗೇಶನ್ ಸಿದ್ಧವಾಗಿದೆ", "▢ ದೊಡ್ಡ ಟಚ್ ಗುರಿಗಳು ಚಾಲನೆಯಲ್ಲಿದೆ", "↔ ಸ್ವಿಚ್ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿದೆ"],
      },
      language: {
        title: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ.",
        card: "ನಿಮಗೆ ಪರಿಚಿತವಾದ ಮತ್ತು ಅರ್ಥವಾಗುವ ಪದಗಳಲ್ಲಿ ಮಾರ್ಗದರ್ಶನ.",
        text: "Vocalyze ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ ಪಠ್ಯ ಮತ್ತು ಧ್ವನಿಯನ್ನು ಒಟ್ಟುಗೂಡಿಸುತ್ತದೆ.",
        items: ["अ ಹಿಂದಿ ಲಭ್ಯವಿದೆ", "ಅ ಕನ್ನಡ ಲಭ್ಯವಿದೆ", "A ಇಂಗ್ಲಿಷ್ ಲಭ್ಯವಿದೆ"],
      },
    },
  };

  const currentModeContent =
    (modesData[lang] || modesData.en)[activeMode] || modesData.en.vision;

  // If user is logged in and has completed onboarding, render Dashboard instead of landing page
  if (user && user.preferredLanguage) {
    return <Dashboard />;
  }

  return (
    <>
      <div className="grain"></div>
      
      <section className="hero">
        <div className="wrap">
          <nav className="nav">
            <Link className="brand" to="/">
              <span className="brand-mark">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </span>
              vocalyze
            </Link>
            
            <div className="navlinks">
              <a href="#doors">{lang === "hi" ? "यह कैसे काम करता है" : lang === "kn" ? "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" : "How it works"}</a>
              <a href="#modes">{lang === "hi" ? "पहुँच मोड" : lang === "kn" ? "ಪ್ರವೇಶ ವಿಧಾನಗಳು" : "Access modes"}</a>
              <a href="#impact">{lang === "hi" ? "हमारा प्रभाव" : lang === "kn" ? "ನಮ್ಮ ಪ್ರಭಾವ" : "Our impact"}</a>
            </div>

            <div className="nav-actions">
              {user ? (
                <>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginRight: "8px" }}>
                    {lang === "hi" ? `नमस्ते, ${user.name}` : lang === "kn" ? `ನಮಸ್ತೆ, ${user.name}` : `Hello, ${user.name}`}
                  </span>
                  <button className="outline" onClick={logout}>
                    {lang === "hi" ? "लॉग आउट" : lang === "kn" ? "ಲಾಗ್ ಔಟ್" : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link className="outline" to="/login">
                    {t.login}
                  </Link>
                  <Link className="solid" to="/signup">
                    {t.signup}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div id="top" className="hero-grid">
            <div className="reveal">
              <span className="eyebrow">{t.techDignity}</span>
              <h1 dangerouslySetInnerHTML={{ __html: t.hero }} />
              <p className="hero-copy">{t.heroCopy}</p>
              
              <div className="hero-actions">
                <a className="solid" href="#doors">
                  {t.exploreBtn}
                </a>
                <button className="outline" id="hear" onClick={handleNarration}>
                  {isSpeaking ? "■ Stop Listening" : t.hearStory}
                </button>
              </div>
              
              <div className="trust-line">
                <div className="faces">
                  <span className="face">V</span>
                  <span className="face">O</span>
                  <span className="face">C</span>
                </div>
                {t.designPromise}
              </div>
            </div>

            <div className="hero-visual reveal">
              <div className="orbit"></div>
              <div className="floating voice-note">
                {t.listeningKn}
                <span>{t.kannadaSpeech}</span>
              </div>
              
              <div className="phone">
                <div className="phone-inner">
                  <div className="notch"></div>
                  <div className="screen-row">
                    <span>{t.goodMorningRadha}</span>
                    <span className="lang">ಕನ್ನಡ⌄</span>
                  </div>
                  
                  <div className="screen-title" dangerouslySetInnerHTML={{ __html: lang === 'hi' ? 'आप क्या करना<br>चाहेंगी?' : lang === 'kn' ? 'ನೀವು ಏನು ಮಾಡಲು<br>ಬಯಸುತ್ತೀರಿ?' : 'What would you<br>like to do?' }}></div>
                  <div className="screen-small">Choose a task, or tell Vocalyze in your own words.</div>
                  
                  <div className="task">
                    <div className="task-top">
                      <span className="ico">▤</span>
                      <span>{t.pensionTask}</span>
                    </div>
                    <div className="progress">
                      <i style={{ width: "40%", background: "#12312f", display: "block", height: "100%", borderRadius: "inherit" }}></i>
                    </div>
                    <div className="screen-small">{t.stepTitle}</div>
                  </div>
                  
                  <div className="question">{t.dobQuestion}</div>
                  <div className="speak">
                    <span className="mic">●</span> {t.tapAnswer}
                  </div>
                </div>
              </div>
              <div className="floating check">
                <b>✓</b> {t.formSaved}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="access-strip">
        <div className="marquee">
          <span>
            {t.marqueeItems.map((item, index) => (
              <React.Fragment key={index}>
                {item} <i />
              </React.Fragment>
            ))}
          </span>
          <span>
            {t.marqueeItems.map((item, index) => (
              <React.Fragment key={index}>
                {item} <i />
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>

      <main>
        <section className="preferences">
          <div className="wrap preferences-grid">
            <article className="preference-card reveal">
              <span className="eyebrow">{lang === "hi" ? "अपनी भाषा चुनें" : lang === "kn" ? "ನಿಮ್ಮ ಭಾಷೆ ಆರಿಸಿ" : "Choose your language"}</span>
              <h3>{t.languageTitle}</h3>
              <p>{t.languageCopy}</p>
              <div className="language-options" aria-label="Select language">
                <button
                  className={lang === "en" ? "active" : ""}
                  onClick={() => handleLanguageChange("en")}
                  aria-pressed={lang === "en"}
                >
                  English
                </button>
                <button
                  className={lang === "hi" ? "active" : ""}
                  onClick={() => handleLanguageChange("hi")}
                  aria-pressed={lang === "hi"}
                >
                  हिंदी
                </button>
                <button
                  className={lang === "kn" ? "active" : ""}
                  onClick={() => handleLanguageChange("kn")}
                  aria-pressed={lang === "kn"}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </article>

            <article className="preference-card reveal">
              <span className="eyebrow">{lang === "hi" ? "पढ़ने में आराम" : lang === "kn" ? "ಓದುವ ಸೌಕರ್ಯ" : "Reading comfort"}</span>
              <h3>{t.readerTitle}</h3>
              <p>{t.readerCopy}</p>
              <ReaderSizeControl initialSize={size} onChange={(newSize) => setSize(newSize)} />
              <p className="size-note">{t.sizeNote}</p>
            </article>
          </div>
        </section>

        <section className="section wrap" id="doors">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow" style={{ color: "#35615b" }}>{lang === "hi" ? "आपके लिए बनाया गया" : lang === "kn" ? "ನಿಮಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ" : "Built around you"}</span>
              <h2>{t.doors}</h2>
            </div>
            <p className="section-desc">
              {lang === "hi"
                ? "हर व्यक्ति डिजिटल दुनिया को अलग तरह से उपयोग करता है। Vocalyze किसी को पीछे छोड़े बिना अपने-आप ढलता है।"
                : lang === "kn"
                ? "ಪ್ರತಿಯೊಬ್ಬರೂ ಡಿಜಿಟಲ್ ಜಗತ್ತನ್ನು ವಿಭಿನ್ನವಾಗಿ ಬಳಸುತ್ತಾರೆ. Vocalyze ಯಾರನ್ನೂ ಹಿಂದೆ ಬಿಡದೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ."
                : "No two people navigate the digital world in exactly the same way. Vocalyze adapts without making anyone feel left behind."}
            </p>
          </div>

          <div className="door-grid">
            <article className="door reveal">
              <span className="num">{t.doorNumPrefix}1 / {lang === "hi" ? "आवाज़" : lang === "kn" ? "ಧ್ವನಿ" : "VOICE"}</span>
              <h3>{t.doorTitles[0]}</h3>
              <p>{t.doorDescs[0]}</p>
              <span className="door-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
                </svg>
              </span>
            </article>

            <article className="door reveal">
              <span className="num">{t.doorNumPrefix}2 / {lang === "hi" ? "दृष्टि" : lang === "kn" ? "ದೃಷ್ಟಿ" : "VISION"}</span>
              <h3>{t.doorTitles[1]}</h3>
              <p>{t.doorDescs[1]}</p>
              <span className="door-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="2.8" />
                </svg>
              </span>
            </article>

            <article className="door reveal">
              <span className="num">{t.doorNumPrefix}3 / {lang === "hi" ? "सरलता" : lang === "kn" ? "ಸರಳತೆ" : "SIMPLICITY"}</span>
              <h3>{t.doorTitles[2]}</h3>
              <p>{t.doorDescs[2]}</p>
              <span className="door-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M5 6h14M5 12h14M5 18h8" />
                  <circle cx="4" cy="6" r="1" fill="currentColor" />
                  <circle cx="4" cy="12" r="1" fill="currentColor" />
                  <circle cx="4" cy="18" r="1" fill="currentColor" />
                </svg>
              </span>
            </article>
          </div>
        </section>

        <section className="mode" id="modes">
          <div className="wrap mode-grid">
            <article className="mode-card reveal">
              <span className="eyebrow">{t.profileTitle}</span>
              <h3>{currentModeContent.title}</h3>
              <p>{currentModeContent.card}</p>
              <div className="mode-list">
                {currentModeContent.items.map((item, idx) => (
                  <div key={idx}>{item}</div>
                ))}
              </div>
            </article>

            <div className="mode-right reveal">
              <span className="eyebrow" style={{ color: "#35615b" }}>{t.accessStartingPoint}</span>
              <h2>{lang === "hi" ? "पहुँच कोई सेटिंग नहीं, यह शुरुआती बिंदु है।" : lang === "kn" ? "ಪ್ರವೇಶವು ಒಂದು ಸೆಟ್ಟಿಂಗ್ ಅಲ್ಲ. ಅದು ಆರಂಭಿಕ ಹಂತ." : "Access is not a setting. It’s a starting point."}</h2>
              
              <div className="mode-tabs">
                <button
                  className={activeMode === "vision" ? "active" : ""}
                  onClick={() => setActiveMode("vision")}
                >
                  {lang === "hi" ? "दृष्टि" : lang === "kn" ? "ದೃಷ್ಟಿ" : "Vision"}
                </button>
                <button
                  className={activeMode === "hearing" ? "active" : ""}
                  onClick={() => setActiveMode("hearing")}
                >
                  {lang === "hi" ? "श्रवण" : lang === "kn" ? "ಶ್ರವಣ" : "Hearing"}
                </button>
                <button
                  className={activeMode === "motor" ? "active" : ""}
                  onClick={() => setActiveMode("motor")}
                >
                  {lang === "hi" ? "गतिशीलता" : lang === "kn" ? "ಚಲನೆ" : "Motor"}
                </button>
                <button
                  className={activeMode === "language" ? "active" : ""}
                  onClick={() => setActiveMode("language")}
                >
                  {lang === "hi" ? "भाषा" : lang === "kn" ? "ಭಾಷೆ" : "Language"}
                </button>
              </div>

              <p className="mode-text">{currentModeContent.text}</p>
            </div>
          </div>
        </section>

        <section className="impact" id="impact">
          <div className="wrap reveal">
            <span className="eyebrow" style={{ color: "#31514e" }}>
              {lang === "hi" ? "भारत की वास्तविक डिजिटल दुनिया के लिए" : lang === "kn" ? "ಭಾರತದ ನೈಜ ಡಿಜಿಟಲ್ ಜಗತ್ತಿಗಾಗಿ" : "Designed for India’s real digital world"}
            </span>
            <h2>{t.impact}</h2>
            
            <div className="stats">
              <div className="stat">
                <b className="stats-counter" aria-label="6 or more">
                  <ViewportCounter value={6} suffix="+" />
                </b>
                <span>{t.statLabel1}</span>
              </div>
              <div className="stat">
                <b className="stats-counter" aria-label="3">
                  <ViewportCounter value={3} />
                </b>
                <span>{t.statLabel2}</span>
              </div>
              <div className="stat">
                <b className="stats-counter" aria-label="48 pixels">
                  <ViewportCounter value={48} suffix="px" />
                </b>
                <span>{t.statLabel3}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cta" id="start">
          <div className="wrap reveal">
            <span className="eyebrow">{lang === "hi" ? "अधिक सुलभ कल" : lang === "kn" ? "ಹೆಚ್ಚು ಸೌಲಭ್ಯಯುತ ನಾಳೆ" : "A more accessible tomorrow"}</span>
            <h2>{t.cta}</h2>
            <p>{t.ctaDesc}</p>
            <button
              className="solid"
              onClick={handleJoinList}
              style={joinedList ? { background: "#fff", borderColor: "#fff", color: "#12312f" } : {}}
            >
              {joinedList ? t.ctaBtnSuccess : t.ctaBtn}
            </button>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap reveal">
            <span className="eyebrow" style={{ color: "#35615b" }}>{lang === "hi" ? "आइए बात करें" : lang === "kn" ? "ಮಾತನಾಡೋಣ" : "Let’s talk"}</span>
            <h2>{t.connectTitle}</h2>
            <p className="contact-copy">{t.connectDesc}</p>
            
            <div className="contact-flip" aria-label="Contact Vocalyze">
              <a className="contact-tile" style={{ "--i": 0 }} href="#" title="GitHub">
                <span className="front">C</span>
                <span className="back">⌘</span>
              </a>
              <a className="contact-tile" style={{ "--i": 1 }} href="#" title="Twitter">
                <span className="front">O</span>
                <span className="back">◌</span>
              </a>
              <a className="contact-tile" style={{ "--i": 2 }} href="#" title="LinkedIn">
                <span className="front">N</span>
                <span className="back">in</span>
              </a>
              <a className="contact-tile" style={{ "--i": 3 }} href="#" title="Instagram">
                <span className="front">T</span>
                <span className="back">◎</span>
              </a>
              <a className="contact-tile" style={{ "--i": 4 }} href="#" title="Facebook">
                <span className="front">A</span>
                <span className="back">f</span>
              </a>
              <a className="contact-tile" style={{ "--i": 5 }} href="mailto:hello@vocalyze.in" title="Email Vocalyze">
                <span className="front">C</span>
                <span className="back">✉</span>
              </a>
              <a className="contact-tile" style={{ "--i": 6 }} href="#" title="Discord">
                <span className="front">T</span>
                <span className="back">◉</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-row">
          <Link className="brand" to="/">
            <span className="brand-mark">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M12 3v18M3 12h18" />
              </svg>
            </span>
            vocalyze
          </Link>
          <span>{t.footerCopyright}</span>
        </div>
      </footer>
    </>
  );
}
