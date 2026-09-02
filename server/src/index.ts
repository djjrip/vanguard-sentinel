import express from 'express';
import cors from 'cors';
import { evaluateAimbotHeuristics } from './heuristics/aimbot.js';
import { evaluateIntegrityHeuristics } from './heuristics/integrity.js';
import type { TelemetryPayload, TelemetryFrame } from './telemetry/validator.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory investigation database
interface InvestigationCase {
  id: string;
  playerId: string;
  matchId: string;
  game: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'BANNED' | 'DISMISSED';
  threatScore: number;
  maxAngularVelocity: number;
  aimbotViolations: number;
  zeroOvershoots: number;
  focusViolations: number;
  hwidSpoofed: boolean;
  suspiciousProcess: boolean;
  details: string[];
  frames: TelemetryFrame[];
  aiDossier?: {
    summary: string;
    confidence: number;
    recommendedAction: string;
    evidence: string[];
  };
}

const mockCases: InvestigationCase[] = [
  {
    id: 'case_val_8812',
    playerId: 'usr_phantom_99',
    matchId: 'match_na_ranked_481',
    game: 'VALORANT (Competitive)',
    timestamp: new Date().toISOString(),
    status: 'PENDING_REVIEW',
    threatScore: 92,
    maxAngularVelocity: 5673,
    aimbotViolations: 3,
    zeroOvershoots: 2,
    focusViolations: 4,
    hwidSpoofed: true,
    suspiciousProcess: true,
    details: [
      'Instantaneous 94.2° angular flick executed in 16.6ms (1 game tick)',
      'Crosshair lock-on exhibited zero biological muscle deceleration overshoot',
      'Combat inputs fired during 4 unfocused OS frames (headless injection pattern)',
      'Hardware ID hash matches low-entropy virtualization spoofer signature'
    ],
    frames: [
      { tick: 101, timestamp: 1000, yaw: 12.4, pitch: 1.1, isFiring: false, isInForeground: true, targetVisible: false },
      { tick: 102, timestamp: 1016, yaw: 13.1, pitch: 1.4, isFiring: false, isInForeground: true, targetVisible: false },
      { tick: 103, timestamp: 1032, yaw: 107.3, pitch: 14.8, isFiring: true, isInForeground: false, targetVisible: true, hitboxHit: 'HEAD' },
      { tick: 104, timestamp: 1048, yaw: 107.3, pitch: 14.8, isFiring: true, isInForeground: false, targetVisible: true, hitboxHit: 'HEAD' },
      { tick: 105, timestamp: 1064, yaw: 107.3, pitch: 14.8, isFiring: true, isInForeground: false, targetVisible: true, hitboxHit: 'HEAD' },
      { tick: 106, timestamp: 1080, yaw: 24.5, pitch: 3.2, isFiring: false, isInForeground: true, targetVisible: false }
    ]
  },
  {
    id: 'case_val_8813',
    playerId: 'usr_clean_duelist',
    matchId: 'match_na_ranked_482',
    game: 'VALORANT (Competitive)',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'DISMISSED',
    threatScore: 14,
    maxAngularVelocity: 840,
    aimbotViolations: 0,
    zeroOvershoots: 0,
    focusViolations: 0,
    hwidSpoofed: false,
    suspiciousProcess: false,
    details: [
      'Normal biomechanical acceleration curves verified',
      'Human overshoot and sub-pixel micro-corrections present on all target acquisitions',
      'OS focus and HWID entropy verified compliant'
    ],
    frames: [
      { tick: 201, timestamp: 2000, yaw: 45.0, pitch: 0.0, isFiring: false, isInForeground: true, targetVisible: false },
      { tick: 202, timestamp: 2016, yaw: 48.2, pitch: 0.5, isFiring: false, isInForeground: true, targetVisible: true },
      { tick: 203, timestamp: 2032, yaw: 55.4, pitch: 1.8, isFiring: true, isInForeground: true, targetVisible: true, hitboxHit: 'BODY' },
      { tick: 204, timestamp: 2048, yaw: 56.1, pitch: 2.0, isFiring: true, isInForeground: true, targetVisible: true, hitboxHit: 'HEAD' }
    ]
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', engine: 'Vanguard Sentinel Platform Services v1.0', uptime: process.uptime() });
});

app.get('/api/investigations', (req, res) => {
  res.json(mockCases);
});

app.get('/api/investigations/:id', (req, res) => {
  const c = mockCases.find((item) => item.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

// Agentic AI Triage Endpoint
app.post('/api/investigations/:id/ai-triage', (req, res) => {
  const c = mockCases.find((item) => item.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });

  // Generate structured investigative dossier
  const confidence = c.threatScore > 50 ? 98.4 : 12.1;
  const recommendedAction = c.threatScore > 50 ? 'PERMANENT_HWID_BAN' : 'CLOSE_FALSE_POSITIVE';
  
  const dossier = {
    summary: c.threatScore > 50 
      ? `High-confidence adversarial signature detected. Subject executed unnatural instantaneous aim flick (${c.maxAngularVelocity}°/s) across 1 tick while window focus was revoked by the client OS.`
      : 'Natural human motor-control telemetry verified. Biomechanical curve exhibits proper human jerk profiles and micro-overshoot.',
    confidence,
    recommendedAction,
    evidence: c.details
  };

  c.aiDossier = dossier;
  res.json(dossier);
});

// Enforcement Action
app.post('/api/investigations/:id/enforce', (req, res) => {
  const { action } = req.body;
  const c = mockCases.find((item) => item.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });

  c.status = action === 'BAN' ? 'BANNED' : 'DISMISSED';
  res.json({ success: true, caseId: c.id, newStatus: c.status, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[VANGUARD SENTINEL] Platform Services API running on http://localhost:${PORT}`);
});
