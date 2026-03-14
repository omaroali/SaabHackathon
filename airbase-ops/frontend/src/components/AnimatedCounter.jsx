import { useEffect, useRef, useState } from 'react';

/**
 * Animated number counter — smooth rolling digit animation.
 * Inspired by 21st.dev animated counter components.
 */
export function AnimatedCounter({ value, duration = 800, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (start !== end) {
      animationRef.current = requestAnimationFrame(animate);
    }

    previousValue.current = value;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

/**
 * Animated decimal counter for float values.
 */
export function AnimatedDecimalCounter({ value, decimals = 1, duration = 800, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (start !== end) {
      animationRef.current = requestAnimationFrame(animate);
    }

    previousValue.current = value;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{displayValue.toFixed(decimals)}</span>;
}
