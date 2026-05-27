import { useEffect, useRef, useState } from 'react';
import type { GenevaParams } from '../geneva/params';

/**
 * Returns {driveAngleDeg, wheelAngleDeg} updated each animation frame.
 *
 * Note: when `enabled` is false the drive freezes, but wheelAngleDeg is still
 * derived from the current driveAngleDeg so a paused frame stays valid.
 */
export function useAnimation(params: GenevaParams, enabled: boolean) {
  const [driveAngleDeg, setDriveAngleDeg] = useState(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      lastTimeRef.current = 0;
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      const dt = lastTimeRef.current === 0 ? 0 : (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      setDriveAngleDeg((prev) => (prev + 60 * dt) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTimeRef.current = 0;
    };
  }, [enabled]);

  const pinStart = Math.PI - Math.atan(params.b / params.a);
  const pinAngle = pinStart + (driveAngleDeg * Math.PI) / 180;
  const pinX = params.c + params.a * Math.cos(pinAngle);
  const pinY = params.a * Math.sin(pinAngle);
  const distFromWheelCenter = Math.hypot(pinX, pinY);

  // Engagement boundary is the wheel's outer rim (distance = b). At that
  // boundary atan2(pinY, pinX) lands on ±180/n exactly — the same as the
  // parked angle — so the wheel-exit step from -180/n to +180/n is a clean
  // slot pitch (360/n) and the n-fold symmetry hides it. Tightening the
  // threshold by p/2 makes the exit step *not* a clean pitch and produces a
  // visible micro-rotation when the pin leaves.
  let wheelAngleDeg: number;
  if (distFromWheelCenter <= params.b) {
    wheelAngleDeg = (Math.atan2(pinY, pinX) * 180) / Math.PI;
  } else {
    wheelAngleDeg = 180 / params.n;
  }

  return { driveAngleDeg, wheelAngleDeg };
}
