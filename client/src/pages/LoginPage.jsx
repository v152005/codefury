import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginTranslations } from "../utils/translations";


export default function LoginPage() {
  const { lang, setLanguage, login, size, setSize } = useAuth();
  const t = loginTranslations[lang] || loginTranslations.en;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleLanguageChange = (selectedLang) => {
    setLanguage(selectedLang);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsSuccess(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setStatus(t.invalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setStatus(t.success);
      setIsSuccess(true);

      // Fetch profile to check if onboarding is complete
      let hasProfile = false;
      try {
        const profileRes = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.profile && profileData.profile.preferredLanguage) {
            hasProfile = true;
          }
        }
      } catch (profileErr) {
        console.error("Failed to check profile status on login:", profileErr);
      }

      login(data.user, data.token);

      setTimeout(() => {
        if (hasProfile) {
          navigate("/");
        } else {
          navigate("/onboarding");
        }
      }, 950);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="panel">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </span>
          vocalyze
        </Link>
        <h1 dangerouslySetInnerHTML={{ __html: t.panelTitle }} />
        <p>{t.panelText}</p>
        <div className="feature">{t.feature}</div>
      </section>

      <section className="form-side">
        <div className="topbar">
          <div className="language" aria-label="Language selection">
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => handleLanguageChange("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              className={lang === "hi" ? "active" : ""}
              onClick={() => handleLanguageChange("hi")}
              aria-pressed={lang === "hi"}
            >
              हिं
            </button>
            <button
              className={lang === "kn" ? "active" : ""}
              onClick={() => handleLanguageChange("kn")}
              aria-pressed={lang === "kn"}
            >
              ಕಂ
            </button>
          </div>
          
          <div className="font">
            <button 
              id="smaller" 
              onClick={() => handleSizeChange(size - 10)} 
              disabled={size <= 100}
              aria-label="Decrease font size"
            >
              −
            </button>
            <output id="size" style={{ font: "700 11px 'DM Mono', monospace", minWidth: "35px", textAlign: "center" }}>
              {size}%
            </output>
            <button 
              id="larger" 
              onClick={() => handleSizeChange(size + 10)} 
              disabled={size >= 140}
              aria-label="Increase font size"
            >
              +
            </button>
          </div>
        </div>

        <div className="form-header">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <div className="password-row">
              <label htmlFor="password">{t.password}</label>
              <a className="forgot" href="#" onClick={(e) => e.preventDefault()}>
                {t.forgot}
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "..." : t.submit}
          </button>
          
          {status && (
            <p className={`status ${isSuccess ? "success" : ""}`} id="status" aria-live="polite">
              {status}
            </p>
          )}
        </form>

        <p className="switch">
          <span>{t.new}</span>{" "}
          <Link to="/signup">{t.signup}</Link>
        </p>
        <p className="home">
          <Link to="/">← Return to home</Link>
        </p>
      </section>
    </main>
  );
}
