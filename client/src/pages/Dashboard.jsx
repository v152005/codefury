import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, token, logout, lang } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Multilingual translations localized for Dashboard UI
  const translations = {
    en: {
      greeting: "Good morning",
      subGreeting: "What would you like to do today?",
      servicesTitle: "Available Services",
      appsTitle: "My Applications",
      logout: "Log out",
      apply: "Apply Now",
      noApps: "No applications found.",
      appId: "Application ID",
      service: "Service",
      date: "Date Submitted",
      status: "Status",
      category: "Category",
      loading: "Loading your dashboard...",
      errorLoading: "Failed to load dashboard data.",
      notSubmitted: "Not Submitted",
      resume: "Resume",
    },
    hi: {
      greeting: "शुभ प्रभात",
      subGreeting: "आज आप क्या करना चाहेंगे?",
      servicesTitle: "उपलब्ध सेवाएं",
      appsTitle: "मेरे आवेदन",
      logout: "लॉग आउट",
      apply: "अभी आवेदन करें",
      noApps: "कोई आवेदन नहीं मिला।",
      appId: "आवेदन संख्या (ID)",
      service: "सेवा",
      date: "जमा करने की तिथि",
      status: "स्थिति",
      category: "श्रेणी",
      loading: "डैशबोर्ड लोड हो रहा है...",
      errorLoading: "डैशबोर्ड डेटा लोड करने में विफल।",
      notSubmitted: "जमा नहीं किया गया",
      resume: "जारी रखें",
    },
    kn: {
      greeting: "ಶುಭೋದಯ",
      subGreeting: "ಇಂದು ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
      servicesTitle: "ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು",
      appsTitle: "ನನ್ನ ಅರ್ಜಿಗಳು",
      logout: "ಲಾಗ್ ಔಟ್",
      apply: "ಈಗಲೇ ಅರ್ಜಿಹಾಕಿ",
      noApps: "ಯಾವುದೇ ಅರ್ಜಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      appId: "ಅರ್ಜಿ ಸಂಖ್ಯೆ (ID)",
      service: "ಸೇವೆ",
      date: "ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ",
      status: "ಸ್ಥಿತಿ",
      category: "ವರ್ಗ",
      loading: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      errorLoading: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.",
      notSubmitted: "ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ",
      resume: "ಮುಂದುವರಿಸಿ",
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch services
        const servicesRes = await fetch("http://localhost:5000/api/services", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const servicesData = await servicesRes.json();

        // Fetch applications
        const appsRes = await fetch("http://localhost:5000/api/applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appsData = await appsRes.json();

        if (servicesRes.ok && appsRes.ok) {
          setServices(servicesData.services || []);
          setApplications(appsData.applications || []);
        } else {
          setError(t.errorLoading);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, lang, t.errorLoading]);

  if (loading) {
    return (
      <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", font: "700 16px Manrope" }}>
        <div className="grain"></div>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", padding: "40px 20px" }}>
      <div className="grain"></div>
      
      <div className="wrap" style={{ maxWidth: "1200px" }}>
        {/* Top Navbar */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px" }}>
          <Link className="brand" to="/" style={{ color: "#fff" }}>
            <span className="brand-mark">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M12 3v18M3 12h18" />
              </svg>
            </span>
            vocalyze
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700" }}>
              {t.greeting}, {user?.name || "User"}
            </span>
            {user?.preferredLanguage && (
              <span style={{ background: "rgba(219, 245, 96, 0.1)", color: "#d9f560", padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                {user.preferredLanguage}
              </span>
            )}
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "14px",
                padding: "8px 16px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              {t.logout}
            </button>
          </div>
        </header>

        {error && (
          <p style={{ color: "#ffb798", background: "rgba(255, 183, 152, 0.07)", padding: "12px 18px", borderRadius: "12px", fontSize: "13px", marginBottom: "30px" }}>
            ⚠️ {error}
          </p>
        )}

        <h2 style={{ font: "800 24px Syne", marginBottom: "8px", color: "#fff" }}>{t.subGreeting}</h2>

        {/* Dynamic Services Grid */}
        <section style={{ marginBottom: "60px", marginTop: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#6c7b77", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>{t.servicesTitle}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {services.map((service) => (
              <article
                key={service.id}
                style={{
                  background: "rgba(18, 49, 47, 0.65)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(217, 245, 96, 0.15)",
                  borderRadius: "20px",
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "200px"
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: "6px", textTransform: "uppercase", color: "#6c7b77" }}>
                    {service.category || t.category}
                  </span>
                  <h4 style={{ font: "800 20px Syne", margin: "12px 0 8px 0", color: "#fff" }}>
                    {service.name && typeof service.name === "object" ? (service.name[lang] || service.name.en) : service.name}
                  </h4>
                  <p style={{ fontSize: "13px", color: "#aab7b3", margin: 0, lineHeight: "1.5" }}>
                    {service.description && typeof service.description === "object" ? (service.description[lang] || service.description.en) : service.description}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/service/${service.id}`)}
                  style={{
                    background: "#d9f560",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px",
                    color: "#12312f",
                    fontWeight: "800",
                    fontSize: "14px",
                    marginTop: "20px",
                    width: "100%",
                    cursor: "pointer"
                  }}
                >
                  {t.apply} →
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Submitted Applications List */}
        <section>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#6c7b77", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>{t.appsTitle}</h3>
          {applications.length === 0 ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px", textAlign: "center", color: "#6c7b77" }}>
              {t.noApps}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(18, 49, 47, 0.45)", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "#6c7b77" }}>
                    <th style={{ padding: "18px 24px" }}>{t.appId}</th>
                    <th style={{ padding: "18px 24px" }}>{t.service}</th>
                    <th style={{ padding: "18px 24px" }}>{t.date}</th>
                    <th style={{ padding: "18px 24px" }}>{t.status}</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "14px" }}>
                  {applications.map((app) => (
                    <tr key={app.applicationId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "18px 24px", fontFamily: "DM Mono", fontWeight: "700" }}>{app.applicationId}</td>
                      <td style={{ padding: "18px 24px", color: "#fff", fontWeight: "700" }}>
                        {(() => {
                          const s = services.find(s => s.id === app.serviceId);
                          if (!s) return app.serviceId;
                          return s.name && typeof s.name === "object" ? (s.name[lang] || s.name.en) : s.name;
                        })()}
                      </td>
                      <td style={{ padding: "18px 24px", color: "#aab7b3" }}>
                        {app.status === "IN_PROGRESS" ? (
                          <span style={{ fontStyle: "italic", color: "#6c7b77" }}>{t.notSubmitted}</span>
                        ) : (() => {
                          if (!app.createdAt) return "-";
                          const seconds = app.createdAt._seconds !== undefined ? app.createdAt._seconds : app.createdAt.seconds;
                          const dateObj = seconds !== undefined ? new Date(seconds * 1000) : new Date(app.createdAt);
                          return isNaN(dateObj.getTime()) ? "-" : dateObj.toLocaleDateString(lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          });
                        })()}
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        {app.status?.toUpperCase() === "IN_PROGRESS" ? (
                          <button
                            onClick={() => {
                              sessionStorage.setItem(`active-app-${app.serviceId}`, app.applicationId);
                              navigate(`/service/${app.serviceId}`);
                            }}
                            style={{
                              background: "#d9f560",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              color: "#12312f",
                              fontWeight: "800",
                              fontSize: "11px",
                              cursor: "pointer",
                              textTransform: "uppercase"
                            }}
                          >
                            {t.resume}
                          </button>
                        ) : (
                          <span style={{
                            background: app.status?.toLowerCase() === "approved" ? "rgba(75, 181, 67, 0.15)" : "rgba(217, 245, 96, 0.15)",
                            color: app.status?.toLowerCase() === "approved" ? "#4bb543" : "#d9f560",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "800",
                            textTransform: "uppercase"
                          }}>
                            {app.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
