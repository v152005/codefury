import React, { useState } from "react";
import useDocumentOCR from "../hooks/useDocumentOCR";

export default function DocumentScanner({ onOCRComplete, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const { scanDocument, loading, progress, error } = useDocumentOCR();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (JPG, PNG, WebP).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    const text = await scanDocument(selectedFile);
    if (text) {
      onOCRComplete(text);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const handleMockScan = () => {
    const mockOCR = `
UNIQUE IDENTIFICATION AUTHORITY OF INDIA
GOVERNMENT OF INDIA
Ramesh Kumar
जन्म तिथि/DOB: 12/03/2004
Address: Bengaluru, Karnataka
1234 5678 9012
Sample Kumar
    `;
    onOCRComplete(mockOCR);
  };

  // Inline styles for complete framework-agnostic reliability
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "14px",
    marginBottom: "20px",
  };

  const uploadBoxStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed rgba(255,255,255,0.15)",
    borderRadius: "16px",
    padding: "30px",
    backgroundColor: "rgba(18, 49, 47, 0.4)",
    textAlign: "center",
  };

  const previewContainerStyle = {
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#051c1b",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: "300px",
    width: "100%",
    position: "relative",
    boxSizing: "border-box",
  };

  const imageStyle = {
    maxHeight: "300px",
    maxWidth: "100%",
    height: "auto",
    width: "auto",
    objectFit: "contain",
  };

  const progressOverlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(9, 45, 44, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    border: "none",
    flex: 1,
    transition: "opacity 0.2s",
  };

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, font: "800 20px 'Outfit', 'Plus Jakarta Sans', Arial", color: "#fff" }}>
            📄 Scan or Upload Document
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#bfbdb7",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px"
            }}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {!previewUrl ? (
          <div style={uploadBoxStyle}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ height: "48px", width: "48px", color: "#d9f560", marginBottom: "16px" }} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#bfbdb7", lineHeight: "1.5" }}>
              Upload or snap a photo of Aadhaar card, Marks card, or Ration card
            </p>
            <label style={{
              cursor: "pointer",
              backgroundColor: "#d9f560",
              color: "#092d2c",
              fontWeight: "800",
              padding: "12px 20px",
              borderRadius: "12px",
              display: "inline-block"
            }}>
              Choose Document File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#6c7b77" }}>
              JPG, PNG, WebP supported
            </p>

            <button 
              type="button" 
              onClick={handleMockScan} 
              style={{
                marginTop: "24px",
                background: "transparent",
                border: "none",
                color: "#d9f560",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px"
              }}
            >
              [ Dev Mode: Simulated Scan Aadhaar ]
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={previewContainerStyle}>
              <img 
                src={previewUrl} 
                alt="Document preview" 
                style={imageStyle}
              />
              {loading && (
                <div style={progressOverlayStyle}>
                  <div style={{ color: "#d9f560", fontWeight: "800", fontSize: "16px", marginBottom: "12px" }}>
                    Scanning document...
                  </div>
                  <div style={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    height: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)",
                    marginBottom: "10px"
                  }}>
                    <div style={{
                      backgroundColor: "#d9f560",
                      height: "100%",
                      width: `${progress}%`,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{progress}% Complete</div>
                  <div style={{ fontSize: "12px", color: "#bfbdb7", marginTop: "4px" }}>
                    Reading document text locally...
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                backgroundColor: "rgba(255,75,75,0.1)",
                border: "1px solid rgba(255,75,75,0.3)",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "13px",
                color: "#ff7575"
              }}>
                ⚠️ {error}
              </div>
            )}

            {!loading && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleReset}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff"
                  }}
                >
                  Choose Another
                </button>
                <button
                  onClick={handleScan}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#d9f560",
                    color: "#092d2c"
                  }}
                >
                  Scan Document
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
