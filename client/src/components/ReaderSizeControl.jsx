import React, { useEffect, useState } from "react";
import { AnimatedScore } from "./AnimatedScore";

/**
 * Accessible font-size control component.
 * Converts the TypeScript specification to standard JavaScript React.
 */
export default function ReaderSizeControl({
  initialSize = 100,
  minSize = 100,
  maxSize = 140,
  step = 10,
  onChange,
}) {
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    document.documentElement.style.zoom = String(size / 100);
    onChange?.(size);
    return () => {
      document.documentElement.style.zoom = "";
    };
  }, [size, onChange]);

  const updateSize = (nextSize) => {
    setSize(Math.max(minSize, Math.min(maxSize, nextSize)));
  };

  return (
    <div className="reader-tools" aria-label="Reading size control">
      <button
        type="button"
        onClick={() => updateSize(size - step)}
        disabled={size <= minSize}
        aria-label="Decrease font size"
        className="size-button"
      >
        −
      </button>
      <output
        className="size-readout"
        aria-live="polite"
      >
        <AnimatedScore value={size} />%
      </output>
      <button
        type="button"
        onClick={() => updateSize(size + step)}
        disabled={size >= maxSize}
        aria-label="Increase font size"
        className="size-button"
      >
        +
      </button>
    </div>
  );
}
