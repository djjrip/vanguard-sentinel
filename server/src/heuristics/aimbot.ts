import type { TelemetryFrame } from '../telemetry/validator.js';

export interface AimbotAnalysis {
  isSuspicious: boolean;
  threatScore: number; // 0 - 100
  maxAngularVelocityDegPerSec: number;
  instantaneousSnapCount: number;
  zeroOvershootCount: number;
  headshotBurstRatio: number;
  details: string[];
}

// Angular distance considering spherical coordinates
export function calculateAngularDistance(
  yaw1: number,
  pitch1: number,
  yaw2: number,
  pitch2: number
): number {
  let deltaYaw = Math.abs(yaw1 - yaw2) % 360;
  if (deltaYaw > 180) deltaYaw = 360 - deltaYaw;

  const deltaPitch = Math.abs(pitch1 - pitch2);
  return Math.sqrt(deltaYaw * deltaYaw + deltaPitch * deltaPitch);
}

export function evaluateAimbotHeuristics(frames: TelemetryFrame[]): AimbotAnalysis {
  if (frames.length < 5) {
    return {
      isSuspicious: false,
      threatScore: 0,
      maxAngularVelocityDegPerSec: 0,
      instantaneousSnapCount: 0,
      zeroOvershootCount: 0,
      headshotBurstRatio: 0,
      details: ['Insufficient frame buffer for statistical confidence']
    };
  }

  let maxVelocity = 0;
  let instantaneousSnapCount = 0;
  let zeroOvershootCount = 0;
  let totalHeadshots = 0;
  let totalHits = 0;
  const details: string[] = [];

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    const dt = (curr.timestamp - prev.timestamp) / 1000; // seconds

    if (dt <= 0 || dt > 1.0) continue; // Ignore dropped frames or stalls

    const angleDelta = calculateAngularDistance(prev.yaw, prev.pitch, curr.yaw, curr.pitch);
    const angularVelocity = angleDelta / dt; // deg/sec

    if (angularVelocity > maxVelocity) {
      maxVelocity = angularVelocity;
    }

    // Heuristic 1: Impossible angular velocity (>1800 deg/sec in 1 frame while firing)
    if (angularVelocity > 1800 && curr.isFiring) {
      instantaneousSnapCount++;
    }

    // Heuristic 2: Zero-overshoot snap check (Target acquired, massive flick, next 2 frames movement is 0)
    if (angularVelocity > 900 && i < frames.length - 2) {
      const next1 = frames[i + 1];
      const postSnapAngle = calculateAngularDistance(curr.yaw, curr.pitch, next1.yaw, next1.pitch);
      if (postSnapAngle < 0.1 && curr.hitboxHit === 'HEAD') {
        zeroOvershootCount++;
      }
    }

    // Hit tally
    if (curr.hitboxHit && curr.hitboxHit !== 'NONE') {
      totalHits++;
      if (curr.hitboxHit === 'HEAD') totalHeadshots++;
    }
  }

  const headshotRatio = totalHits > 0 ? totalHeadshots / totalHits : 0;

  // Composite Threat Scoring Model
  let threatScore = 0;

  if (instantaneousSnapCount >= 1) {
    threatScore += 35;
    details.push(`Detected ${instantaneousSnapCount} unnatural instantaneous angular flick(s) (>1800°/s)`);
  }

  if (zeroOvershootCount >= 1) {
    threatScore += 40;
    details.push(`Detected ${zeroOvershootCount} zero-overshoot lock-on event(s) lacking human biomechanical deceleration`);
  }

  if (headshotRatio >= 0.8 && totalHits >= 3) {
    threatScore += 25;
    details.push(`Abnormal headshot efficiency (${(headshotRatio * 100).toFixed(1)}% across ${totalHits} confirmed hits)`);
  }

  return {
    isSuspicious: threatScore >= 50,
    threatScore: Math.min(100, threatScore),
    maxAngularVelocityDegPerSec: Math.round(maxVelocity),
    instantaneousSnapCount,
    zeroOvershootCount,
    headshotBurstRatio: Number(headshotRatio.toFixed(2)),
    details: details.length > 0 ? details : ['Normal human biomechanical distribution verified']
  };
}
