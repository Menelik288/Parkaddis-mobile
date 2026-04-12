import { useState, useCallback, useRef } from 'react';

export function useBearingSmoothing() {
  const [smoothedBearing, setSmoothedBearing] = useState(0);
  const lastBearing = useRef(0);

  const updateBearing = useCallback((newBearing: number) => {
    // Simple low-pass filter for smooth bearing transitions
    // smoothed = last + alpha * (new - last)
    const alpha = 0.15; // Lower = smoother but slower
    
    // Handle degree wrapping (e.g., from 350 to 10)
    let diff = newBearing - lastBearing.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    const nextBearing = (lastBearing.current + alpha * diff + 360) % 360;
    
    setSmoothedBearing(nextBearing);
    lastBearing.current = nextBearing;
  }, []);

  return { smoothedBearing, updateBearing };
}
