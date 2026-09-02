import crypto from 'node:crypto';

export interface TelemetryFrame {
  tick: number;
  timestamp: number;
  yaw: number;
  pitch: number;
  isFiring: boolean;
  isInForeground: boolean;
  targetVisible: boolean;
  hitboxHit?: 'HEAD' | 'BODY' | 'LEG' | 'NONE';
}

export interface TelemetryPayload {
  sessionToken: string;
  playerId: string;
  matchId: string;
  gameTitle: string;
  hwidHash: string;
  processSignature: string;
  nonce: string;
  timestamp: number;
  frames: TelemetryFrame[];
}

export interface VerificationResult {
  isValid: boolean;
  errorCode?: 'INVALID_SIGNATURE' | 'EXPIRED_TIMESTAMP' | 'NONCE_REPLAY' | 'MALFORMED_PAYLOAD';
  message?: string;
}

// In-memory sliding window for nonces to defeat replay attacks
const seenNonces = new Set<string>();
const MAX_TIME_DRIFT_MS = 30_000; // 30 seconds max clock skew

// Clean up nonces older than 60s
setInterval(() => {
  seenNonces.clear();
}, 60_000);

export function verifyTelemetrySignature(
  rawPayload: string,
  providedSignature: string,
  secretKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(rawPayload);
  const expectedSignature = hmac.digest('hex');

  // Timing-safe comparison to prevent side-channel timing attacks
  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(providedSignature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );
}

export function validatePayloadEnvelope(payload: TelemetryPayload): VerificationResult {
  const now = Date.now();

  // 1. Clock skew check
  if (Math.abs(now - payload.timestamp) > MAX_TIME_DRIFT_MS) {
    return {
      isValid: false,
      errorCode: 'EXPIRED_TIMESTAMP',
      message: `Payload timestamp drift exceeds ${MAX_TIME_DRIFT_MS}ms tolerance`
    };
  }

  // 2. Nonce replay check
  const nonceKey = `${payload.playerId}:${payload.nonce}`;
  if (seenNonces.has(nonceKey)) {
    return {
      isValid: false,
      errorCode: 'NONCE_REPLAY',
      message: 'Nonce has already been consumed for this player session'
    };
  }
  seenNonces.add(nonceKey);

  // 3. Envelope sanity check
  if (!payload.playerId || !payload.matchId || !payload.hwidHash || !Array.isArray(payload.frames)) {
    return {
      isValid: false,
      errorCode: 'MALFORMED_PAYLOAD',
      message: 'Missing mandatory platform telemetry fields'
    };
  }

  return { isValid: true };
}
