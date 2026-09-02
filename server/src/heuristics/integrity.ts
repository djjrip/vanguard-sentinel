import type { TelemetryPayload } from '../telemetry/validator.js';

export interface IntegrityAnalysis {
  isCompromised: boolean;
  threatScore: number; // 0 - 100
  focusViolations: number;
  hwidFlagged: boolean;
  suspiciousProcess: boolean;
  details: string[];
}

// Known malicious process signatures & memory hook strings
const KNOWN_CHEAT_SIGNATURES = [
  'cheatengine',
  'injector',
  'kero_hook',
  'aimmy',
  'vanguard_bypass',
  'interception.sys',
  'kdmapper'
];

export function evaluateIntegrityHeuristics(payload: TelemetryPayload): IntegrityAnalysis {
  let threatScore = 0;
  let focusViolations = 0;
  const details: string[] = [];

  // 1. Foreground window focus integrity
  // Check if player registers combat actions while the client OS window reports out-of-focus
  for (const frame of payload.frames) {
    if (!frame.isInForeground && frame.isFiring && frame.hitboxHit && frame.hitboxHit !== 'NONE') {
      focusViolations++;
    }
  }

  if (focusViolations > 0) {
    threatScore += 45;
    details.push(`Combat input registered during ${focusViolations} unfocused OS frame(s) (potential headless overlay or virtual driver input)`);
  }

  // 2. Process signature check
  const procLower = payload.processSignature.toLowerCase();
  const matchedCheat = KNOWN_CHEAT_SIGNATURES.find((sig) => procLower.includes(sig));
  let suspiciousProcess = false;

  if (matchedCheat) {
    threatScore += 60;
    suspiciousProcess = true;
    details.push(`Blacklisted driver/loader signature identified in user space: [${matchedCheat}]`);
  }

  // 3. HWID Entropy Check (Detect zeroed out or mock UUIDs common with ring-0 HWID spoofers)
  const isSpoofedHWID =
    payload.hwidHash === '00000000-0000-0000-0000-000000000000' ||
    payload.hwidHash.length < 16 ||
    /^([a-f0-9])\1+$/i.test(payload.hwidHash); // repeated single characters

  if (isSpoofedHWID) {
    threatScore += 50;
    details.push('Hardware ID exhibits synthetic low-entropy patterns characteristic of virtualization spoofers');
  }

  return {
    isCompromised: threatScore >= 50,
    threatScore: Math.min(100, threatScore),
    focusViolations,
    hwidFlagged: isSpoofedHWID,
    suspiciousProcess,
    details: details.length > 0 ? details : ['Session environment and hardware integrity verified']
  };
}
