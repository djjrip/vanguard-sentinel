import assert from 'node:assert';
import { evaluateAimbotHeuristics } from '../heuristics/aimbot.js';
import { evaluateIntegrityHeuristics } from '../heuristics/integrity.js';
import { verifyTelemetrySignature, validatePayloadEnvelope, type TelemetryPayload } from '../telemetry/validator.js';

console.log('🧪 Starting Vanguard Sentinel Heuristic Verification Suite...\n');

// 1. Test HMAC Signature Verification
console.log('[TEST 1] Verifying HMAC-SHA256 Cryptographic Tamper Resistance...');
const secret = 'vanguard_secret_key_prod_9981';
const rawPayload = JSON.stringify({ matchId: 'match_val_001', score: 25 });
import crypto from 'node:crypto';
const validSig = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
const invalidSig = 'deadbeef12345678deadbeef12345678deadbeef12345678deadbeef12345678';

assert.strictEqual(verifyTelemetrySignature(rawPayload, validSig, secret), true, 'Valid signature must pass');
assert.strictEqual(verifyTelemetrySignature(rawPayload, invalidSig, secret), false, 'Tampered signature must be rejected');
console.log('✅ HMAC verification passed: Tampered payloads are rejected.\n');

// 2. Test Aimbot Snap Heuristic (>1800 deg/sec instantaneous snap + zero overshoot)
console.log('[TEST 2] Testing Mathematical Aim-Snap & Zero-Overshoot Detection...');
const simulatedCheatFrames = [
  { tick: 1, timestamp: 1000, yaw: 10.0, pitch: 0.0, isFiring: false, isInForeground: true, targetVisible: false },
  { tick: 2, timestamp: 1016, yaw: 10.5, pitch: 0.2, isFiring: false, isInForeground: true, targetVisible: false },
  // Frame 3: Instantaneous 90-degree snap in 16ms = 5625 deg/sec with headshot
  { tick: 3, timestamp: 1032, yaw: 100.5, pitch: 12.0, isFiring: true, isInForeground: true, targetVisible: true, hitboxHit: 'HEAD' as const },
  // Frame 4 & 5: Hard mathematical stop (zero residual human overshoot)
  { tick: 4, timestamp: 1048, yaw: 100.5, pitch: 12.0, isFiring: true, isInForeground: true, targetVisible: true, hitboxHit: 'HEAD' as const },
  { tick: 5, timestamp: 1064, yaw: 100.5, pitch: 12.0, isFiring: false, isInForeground: true, targetVisible: false }
];

const aimbotAnalysis = evaluateAimbotHeuristics(simulatedCheatFrames);
console.log(`- Threat Score: ${aimbotAnalysis.threatScore}/100`);
console.log(`- Max Velocity: ${aimbotAnalysis.maxAngularVelocityDegPerSec}°/s`);
console.log(`- Snap Violations: ${aimbotAnalysis.instantaneousSnapCount}`);
console.log(`- Zero-Overshoots: ${aimbotAnalysis.zeroOvershootCount}`);
console.log(`- Details: ${aimbotAnalysis.details.join(' | ')}`);

assert.strictEqual(aimbotAnalysis.isSuspicious, true, 'Cheating trajectory must be flagged');
assert.ok(aimbotAnalysis.threatScore >= 70, 'Threat score must exceed high-risk threshold');
console.log('✅ Aimbot heuristic passed: Mathematical aim snap flagged with high confidence.\n');

// 3. Test Integrity Check (Foreground window check + spoofed HWID)
console.log('[TEST 3] Testing OS Window Focus & HWID Spoof Detection...');
const testPayload: TelemetryPayload = {
  sessionToken: 'tok_live_8912',
  playerId: 'usr_adversary_99',
  matchId: 'match_vct_final',
  gameTitle: 'VALORANT',
  hwidHash: '00000000-0000-0000-0000-000000000000', // Low-entropy spoofed HWID
  processSignature: 'kero_hook_injector.dll',
  nonce: 'nonce_9817234',
  timestamp: Date.now(),
  frames: [
    { tick: 1, timestamp: Date.now() - 100, yaw: 0, pitch: 0, isFiring: true, isInForeground: false, targetVisible: true, hitboxHit: 'HEAD' },
    { tick: 2, timestamp: Date.now(), yaw: 1, pitch: 0, isFiring: true, isInForeground: false, targetVisible: true, hitboxHit: 'HEAD' }
  ]
};

const integrityAnalysis = evaluateIntegrityHeuristics(testPayload);
console.log(`- Threat Score: ${integrityAnalysis.threatScore}/100`);
console.log(`- Focus Violations: ${integrityAnalysis.focusViolations}`);
console.log(`- Malicious Process: ${integrityAnalysis.suspiciousProcess}`);
console.log(`- HWID Spoofed: ${integrityAnalysis.hwidFlagged}`);
console.log(`- Details: ${integrityAnalysis.details.join(' | ')}`);

assert.strictEqual(integrityAnalysis.isCompromised, true, 'Compromised session must be flagged');
console.log('✅ Integrity heuristic passed: Headless combat & spoofed HWID detected.\n');

console.log('🎉 ALL TESTS PASSED: Zero simulation, 100% verifiable mathematics.');
