import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";

/**
 * Custom React hook for running Tesseract.js client-side OCR.
 */
export default function useDocumentOCR() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const scanDocument = useCallback(async (imageFile) => {
    if (!imageFile) {
      setError("No file provided.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError("");
    setText("");

    let worker = null;
    try {
      // Create and initialize worker with english lang
      worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Perform OCR
      const { data: { text: recognizedText } } = await worker.recognize(imageFile);
      setText(recognizedText);
      return recognizedText;
    } catch (err) {
      console.error("Tesseract.js OCR Error:", err);
      setError("Failed to recognize text in document. Please try again with a clearer photo.");
      return null;
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setLoading(false);
    }
  }, []);

  return {
    scanDocument,
    loading,
    progress,
    text,
    error,
  };
}
