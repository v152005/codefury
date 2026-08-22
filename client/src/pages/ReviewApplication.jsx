import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ReviewApplication() {
  const { serviceId } = useParams();
  const { token, lang } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [answers, setAnswers] = useState({});
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Review Your Application",
      desc: "Please review the details below before submitting.",
      confirmLabel: "I confirm that all details provided are correct and true.",
      submitBtn: "Submit Application",
      backBtn: "Go Back & Edit",
      loading: "Loading review details...",
      errorLoading: "Failed to load application schema.",
      errorSubmit: "Submission failed. Please check validation or try again.",
      missingAnswers: "No active application session found. Please start over.",
    },
    hi: {
      title: "अपने आवेदन की समीक्षा करें",
      desc: "कृपया सबमिट करने से पहले नीचे दिए गए विवरणों की समीक्षा करें.",
      confirmLabel: "मैं पुष्टि करता/करती हूँ कि प्रदान किए गए सभी विवरण सही और सत्य हैं।",
      submitBtn: "आवेदन जमा करें",
      backBtn: "पीछे जाएं और संपादित करें",
      loading: "समीक्षा विवरण लोड हो रहा है...",
      errorLoading: "सेवा प्रारूप लोड करने में विफल।",
      errorSubmit: "जमा करना विफल रहा। कृपया सत्यापन जांचें या फिर से प्रयास करें।",
      missingAnswers: "कोई सक्रिय आवेदन सत्र नहीं मिला। कृपया पुनः प्रारंभ करें।",
    },
    kn: {
      title: "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿ",
      desc: "ದಯವಿಟ್ಟು ಸಲ್ಲಿಸುವ ಮೊದಲು ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      confirmLabel: "ನೀಡಲಾದ ಎಲ್ಲಾ ವಿವರಗಳು ಸರಿಯಾದವು ಮತ್ತು ಸತ್ಯವಾದವು ಎಂದು ನಾನು ದೃಢೀಕರಿಸುತ್ತೇನೆ.",
      submitBtn: "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ",
      backBtn: "ಹಿಂದೆ ಹೋಗಿ ಮತ್ತು ತಿದ್ದುಪಡಿ ಮಾಡಿ",
      loading: "ಪರಿಶೀಲನಾ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      errorLoading: "ಸೇವಾ ನಮೂನೆ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.",
      errorSubmit: "ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      missingAnswers: "ಯಾವುದೇ ಸಕ್ರಿಯ ಅರ್ಜಿ ಅವಧಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ.",
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReviewDetails = async () => {
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

        // 2. Fetch Active Application
        const appId = sessionStorage.getItem(`active-app-${serviceId}`);
        if (!appId) {
          setError(t.missingAnswers);
          setLoading(false);
          return;
        }
        setApplicationId(appId);

        const appRes = await fetch(`http://localhost:5000/api/applications/${appId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appData = await appRes.json();

        if (appRes.ok) {
          setAnswers(appData.application.answers || {});
        } else {
          setError(t.errorLoading);
        }
      } catch (err) {
        console.error("Error loading review details:", err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [serviceId, token, navigate, lang, t.errorLoading, t.missingAnswers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      // POST submit to backend REST API
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Clear saved active application from sessionStorage
        sessionStorage.removeItem(`active-app-${serviceId}`);
        
        // Navigate to confirmation page
        const nameVal = service.name[lang] || service.name.en || service.name;
        navigate("/service/confirmation", {
          state: {
            applicationId,
            status: "SUBMITTED",
            serviceName: nameVal
          }
        });
      } else {
        setError(data.error || t.errorSubmit);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(t.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    navigate(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", font: "700 16px Manrope" }}>
        <div className="grain"></div>
        {t.loading}
      </div>
    );
  }

  if (error && !service) {
    return (
      <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px" }}>
        <div className="grain"></div>
        <p style={{ color: "#ffb798" }}>⚠️ {error}</p>
        <Link to="/" style={{ color: "#d9f560", fontWeight: "700" }}>← Back to Dashboard</Link>
      </div>
    );
  }

  const questions = service.questions || [];

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
        <h1 style={{ font: "800 22px 'Outfit', 'Plus Jakarta Sans', Arial", margin: 0, color: "#fff" }}>{t.title}</h1>
        <p style={{ margin: "5px 0 30px 0", color: "#6c7b77", fontSize: "14px" }}>{t.desc}</p>

        {/* Display Answers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "30px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.04)" }}>
          {questions.map((q) => (
            <div key={q.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "#6c7b77", fontWeight: "700" }}>
                {q.label[lang] || q.label.en || q.label}
              </span>
              <div style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                marginTop: "4px",
                fontFamily: q.type === "date" ? "DM Mono, monospace" : "inherit"
              }}>
                {answers[q.id] || "—"}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.07)", padding: "12px 18px", borderRadius: "12px", fontSize: "13px", marginBottom: "24px" }}>
            ⚠️ {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Consent Checkbox */}
          <div
            onClick={() => setIsConfirmed(!isConfirmed)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              background: isConfirmed ? "rgba(217, 245, 96, 0.04)" : "transparent",
              border: isConfirmed ? "1px solid rgba(217, 245, 96, 0.3)" : "1px solid rgba(255,255,255,0.08)",
              padding: "16px 20px",
              borderRadius: "16px",
              marginBottom: "30px",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              border: isConfirmed ? "none" : "2px solid rgba(255,255,255,0.3)",
              background: isConfirmed ? "#d9f560" : "transparent",
              display: "grid",
              placeItems: "center",
              color: "#12312f",
              fontWeight: "900",
              fontSize: "12px"
            }}>
              {isConfirmed && "✓"}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "700", color: isConfirmed ? "#fff" : "#6c7b77", lineHeight: "1.4" }}>
              {t.confirmLabel}
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              type="button"
              onClick={handleBackToEdit}
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
              ← {t.backBtn}
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isSubmitting}
              style={{
                flex: 2,
                background: !isConfirmed || isSubmitting ? "rgba(217, 245, 96, 0.3)" : "#d9f560",
                border: "none",
                color: !isConfirmed || isSubmitting ? "rgba(18, 49, 47, 0.5)" : "#12312f",
                borderRadius: "16px",
                padding: "16px",
                fontWeight: "800",
                cursor: !isConfirmed || isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {isSubmitting ? "..." : t.submitBtn} ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
