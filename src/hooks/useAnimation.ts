import { useEffect, useRef, useState } from 'react';
import type { GenevaParams } from '../geneva/params';

/**
 * Returns {driveAngleDeg, wheelAngleDeg} updated each animation frame.
 *
 * Replicates the genevaDrawingController.js logic:
 *  - Drive spins at ~60°/sec when enabled.
 *  - Wheel angle = atan2(pin.y, pin.x − wheelX) when pin is inside the wheel
 *    (distance from origin ≤ b); else snaps to the halfway-between-slots
 *    locked position (180/n degrees).
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

  // Engagement threshold: the pin's OUTER edge (not its center) must be at or
  // inside the wheel rim. Using `b - p/2` accounts for the pin's finite radius
  // so the wheel doesn't appear to "jump" before the pin is visibly in a slot.
  const engagementRadius = params.b - params.p / 2;

  let wheelAngleDeg: number;
  if (distFromWheelCenter <= engagementRadius) {
    wheelAngleDeg = (Math.atan2(pinY, pinX) * 180) / Math.PI;
  } else {
    wheelAngleDeg = 180 / params.n;
  }

  return { driveAngleDeg, wheelAngleDeg };
}
