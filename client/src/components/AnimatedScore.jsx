import React, { useEffect, useState, useRef } from "react";

/**
 * AnimatedScore - Animates numbers smoothly using requestAnimationFrame.
 * @param {object} props
 * @param {number} props.value - The final target value.
 * @param {number} [props.duration=400] - Duration of the animation in ms.
 */
export function AnimatedScore({ value, duration = 400 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: Cubic Out
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentVal = Math.round(startValue + (endValue - startValue) * easedProgress);
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}
