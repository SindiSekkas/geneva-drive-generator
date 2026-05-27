import { useEffect, useRef, useState } from 'react';
import type { GenevaParams } from '../geneva/params';

/**
 * Returns {driveAngleDeg, wheelAngleDeg} updated each animation frame.
 *
 * Replicates the genevaDrawingController.js logic:
 *  - Drive spins at ~60°/sec when enabled.
 *  - Wheel angle = atan2(pinY, pinX) when the pin center is inside the
 *    wheel (distance ≤ b); else snaps to the halfway-between-slots locked
 *    position (180/n degrees).
 *
 * When `enabled` is false, the drive freezes but the wheel angle is still
 * computed from the current driveAngleDeg so the parts look stationary in
 * a valid configuration.
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

  // Compute wheel angle from current drive angle + params.
  const pinStart = Math.PI - Math.atan(params.b / params.a);
  const pinAngle = pinStart + (driveAngleDeg * Math.PI) / 180;
  const pinX = params.c + params.a * Math.cos(pinAngle);
  const pinY = params.a * Math.sin(pinAngle);
  const distFromWheelCenter = Math.hypot(pinX, pinY);

  // Engagement boundary is the wheel's outer rim (distance = b). At that exact
  // boundary atan2(pinY, pinX) evaluates to ±180/n — the same as the parked
  // angle — so the wheel's rotation is continuous at engagement entry, and the
  // -180/n → +180/n step at engagement exit is exactly one slot pitch (360/n),
  // which the n-fold symmetric wheel renders identically. Tightening the
  // threshold by p/2 makes the exit step *not* a clean pitch and creates a
  // visible micro-rotation when the pin leaves.
  let wheelAngleDeg: number;
  if (distFromWheelCenter <= params.b) {
    wheelAngleDeg = (Math.atan2(pinY, pinX) * 180) / Math.PI;
  } else {
    wheelAngleDeg = 180 / params.n;
  }

  return { driveAngleDeg, wheelAngleDeg };
}
