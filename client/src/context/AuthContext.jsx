import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("vocalyze-token") || null);
  const [lang, setLang] = useState(localStorage.getItem("vocalyze-language") || "en");
  const [size, setSize] = useState(Number(localStorage.getItem("vocalyze-reader-size") || 100));
  const [loading, setLoading] = useState(true);

  // Sync and apply zoom on size change
  useEffect(() => {
    document.documentElement.style.zoom = String(size / 100);
    localStorage.setItem("vocalyze-reader-size", size);
  }, [size]);

  // Sync and apply HTML attribute on language change
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("vocalyze-language", lang);
  }, [lang]);

  const login = (userData, userToken) => {
    setUser(userData);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem("vocalyze-token", userToken);
    }
    if (userData?.preferredLanguage) {
      setLang(userData.preferredLanguage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vocalyze-token");
  };

  // Verify active JWT token on app load
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.profile);
          if (data.profile?.preferredLanguage) {
            setLang(data.profile.preferredLanguage);
          }
        } else {
          // Invalid or expired token
          logout();
        }
      } catch (err) {
        console.error("Token verification failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    verifyUser();
  }, [token]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  const changeSize = (newSize) => {
    const finalSize = Math.max(100, Math.min(140, newSize));
    setSize(finalSize);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        lang,
        size,
        loading,
        login,
        logout,
        setLanguage: changeLanguage,
        setSize: changeSize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
