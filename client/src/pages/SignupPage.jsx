import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupTranslations } from "../utils/translations";
import { API_BASE_URL } from "../config";

export default function SignupPage() {
  const { lang, setLanguage, login, size, setSize } = useAuth();
  const t = signupTranslations[lang] || signupTranslations.en;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setStatus(t.invalid);
      return;
    }

    if (password.length < 6) {
      setStatus(t.short);
      return;
    }

    if (password !== confirm) {
      setStatus(t.mismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setStatus(t.success);
      setIsSuccess(true);
      login(data.user, data.token);

      setTimeout(() => {
        navigate("/onboarding");
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
            <label htmlFor="name">{t.name}</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirm">{t.confirm}</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
          <span>{t.existing}</span>{" "}
          <Link to="/login">{t.login}</Link>
        </p>
        <p className="home">
          <Link to="/">← Return to home</Link>
        </p>
      </section>

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
    </main>
  );
}
