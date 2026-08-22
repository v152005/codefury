import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ApplicationConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useAuth();

  // Retrieve state passed from navigation
  const { applicationId, status, serviceName } = location.state || {
    applicationId: "N/A",
    status: "submitted",
    serviceName: "Application"
  };

  const translations = {
    en: {
      success: "Application Submitted Successfully",
      desc: "Your application has been received and is currently being processed. You can track its status directly from your dashboard.",
      appId: "Application ID",
      service: "Service",
      status: "Status",
      dashboardBtn: "Back to Dashboard",
    },
    hi: {
      success: "आवेदन सफलतापूर्वक जमा हो गया",
      desc: "आपका आवेदन प्राप्त हो गया है और वर्तमान में इस पर कार्रवाई की जा रही है। आप सीधे अपने डैशबोर्ड से इसकी स्थिति को ट्रैक कर सकते हैं।",
      appId: "आवेदन संख्या (ID)",
      service: "सेवा",
      status: "स्थिति",
      dashboardBtn: "डैशबोर्ड पर वापस जाएं",
    },
    kn: {
      success: "ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
      desc: "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಪ್ರಸ್ತುತ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ. ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನೇರವಾಗಿ ಅರ್ಜಿಯ ಸ್ಥಿತಿಯನ್ನು ನೀವು ಗಮನಿಸಬಹುದು.",
      appId: "ಅರ್ಜಿ ಸಂಖ್ಯೆ (ID)",
      service: "ಸೇವೆ",
      status: "ಸ್ಥಿತಿ",
      dashboardBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <div style={{ background: "#092d2c", minHeight: "100vh", color: "#f6f3eb", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
      <div className="grain"></div>

      <div style={{
        background: "rgba(18, 49, 47, 0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(217, 245, 96, 0.15)",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "540px",
        padding: "40px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        {/* Success Icon */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(217, 245, 96, 0.1)",
          color: "#d9f560",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 24px auto",
          fontSize: "36px",
          fontWeight: "900"
        }}>
          ✓
        </div>

        <h1 style={{ font: "800 24px Syne, Arial", margin: "0 0 12px 0", color: "#fff", lineHeight: "1.3" }}>{t.success}</h1>
        <p style={{ color: "#aab7b3", fontSize: "14px", lineHeight: "1.6", margin: "0 0 35px 0" }}>{t.desc}</p>

        {/* Details Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.04)",
          textAlign: "left",
          marginBottom: "35px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div>
            <span style={{ fontSize: "11px", color: "#6c7b77", fontWeight: "700", textTransform: "uppercase" }}>{t.appId}</span>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", fontFamily: "DM Mono, monospace", marginTop: "2px" }}>{applicationId}</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#6c7b77", fontWeight: "700", textTransform: "uppercase" }}>{t.service}</span>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginTop: "2px" }}>{serviceName}</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#6c7b77", fontWeight: "700", textTransform: "uppercase" }}>{t.status}</span>
            <div style={{ marginTop: "4px" }}>
              <span style={{
                background: "rgba(217, 245, 96, 0.15)",
                color: "#d9f560",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase"
              }}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#d9f560",
            border: "none",
            borderRadius: "16px",
            padding: "16px 24px",
            color: "#12312f",
            fontWeight: "800",
            fontSize: "15px",
            width: "100%",
            cursor: "pointer"
          }}
        >
          {t.dashboardBtn}
        </button>
      </div>
    </div>
  );
}
