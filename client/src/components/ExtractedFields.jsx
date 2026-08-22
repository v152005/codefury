import React, { useState } from "react";

export default function ExtractedFields({ extractedData, requiredFields, currentLanguage, onConfirm, onCancel }) {
  const [editedFields, setEditedFields] = useState({ ...extractedData.fields });

  const handleFieldChange = (key, val) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleUseDetails = () => {
    onConfirm(editedFields);
  };

  const getConfidenceLevel = (field) => {
    const score = extractedData.confidence?.[field] ?? 0.0;
    if (score >= 0.90) return "high";
    if (score >= 0.70) return "medium";
    return "low";
  };

  const getFieldLabel = (field) => {
    const mapping = {
      fullName: { en: "Full Name", hi: "पूरा नाम", kn: "ಪೂರ್ಣ ಹೆಸರು" },
      dateOfBirth: { en: "Date of Birth", hi: "जन्म तिथि", kn: "ಜನ್ಮ ದಿನಾಂಕ" },
      address: { en: "Address", hi: "पता", kn: "ವಿಳಾಸ" },
    };
    return mapping[field]?.[currentLanguage] || field;
  };

  // Inline styles for full Vanilla CSS compatibility
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    backdropFilter: "blur(6px)",
  };

  const containerStyle = {
    backgroundColor: "#092d2c",
    border: "1px solid rgba(219, 245, 96, 0.15)",
    borderRadius: "24px",
    padding: "28px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    color: "#f6f3eb",
    boxSizing: "border-box",
  };

  const headerStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "14px",
    marginBottom: "20px",
  };

  const fieldsWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "350px",
    overflowY: "auto",
    paddingRight: "6px",
  };

  const inputStyle = (level) => ({
    width: "100%",
    backgroundColor: "#0b3332",
    color: "#f6f3eb",
    border: `1px solid ${
      level === "high"
        ? "rgba(219, 245, 96, 0.3)"
        : level === "medium"
        ? "rgba(234, 179, 8, 0.5)"
        : "rgba(239, 68, 68, 0.5)"
    }`,
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  });

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    border: "none",
    flex: 1,
  };

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, font: "800 20px Syne, Arial", color: "#fff" }}>
            🔍 Review Extracted Details
          </h3>
          <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#bfbdb7", lineHeight: "1.4" }}>
            Please verify the information extracted from your document. You can make corrections directly.
          </p>
        </div>

        <div style={fieldsWrapperStyle}>
          {requiredFields.map((field) => {
            const level = getConfidenceLevel(field);
            const value = editedFields[field] || "";
            const rawConfidence = extractedData.confidence?.[field] ?? 0.0;

            return (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ fontWeight: "700", color: "#f6f3eb" }}>{getFieldLabel(field)}</span>
                  
                  {level === "high" && (
                    <span style={{ color: "#4ade80", fontSize: "11px", fontWeight: "700" }}>
                      ✓ Auto-filled ({Math.round(rawConfidence * 100)}%)
                    </span>
                  )}
                  {level === "medium" && (
                    <span style={{ color: "#facc15", fontSize: "11px", fontWeight: "700" }}>
                      ⚠ Review needed ({Math.round(rawConfidence * 100)}%)
                    </span>
                  )}
                  {level === "low" && (
                    <span style={{ color: "#f87171", fontSize: "11px", fontWeight: "700" }}>
                      ✗ Not found
                    </span>
                  )}
                </div>

                <input
                  type={field === "dateOfBirth" ? "date" : "text"}
                  value={value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  style={inputStyle(level)}
                  placeholder={`Enter ${getFieldLabel(field)}`}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
          <button
            onClick={onCancel}
            style={{
              ...buttonStyle,
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUseDetails}
            style={{
              ...buttonStyle,
              backgroundColor: "#d9f560",
              color: "#092d2c"
            }}
          >
            Use These Details
          </button>
        </div>
      </div>
    </div>
  );
}
