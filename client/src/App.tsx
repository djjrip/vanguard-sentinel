import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Crosshair, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Bot, 
  CheckCircle2, 
  Ban, 
  Terminal, 
  Clock, 
  Eye, 
  FileText,
  Radio,
  Monitor
} from 'lucide-react';

interface TelemetryFrame {
  tick: number;
  timestamp: number;
  yaw: number;
  pitch: number;
  isFiring: boolean;
  isInForeground: boolean;
  targetVisible: boolean;
  hitboxHit?: string;
}

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

export default function App() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([
    '[INIT] Vanguard Sentinel Platform Services connected to local node',
    '[INGEST] HMAC-SHA256 telemetry pipeline active on port 3001'
  ]);

  // Initial mock data
  useEffect(() => {
    const initialCases: InvestigationCase[] = [
      {
        id: 'case_val_8812',
        playerId: 'usr_phantom_99',
        matchId: 'match_na_ranked_481',
        game: 'VALORANT (Competitive)',
        timestamp: new Date().toLocaleTimeString(),
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
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
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

    setCases(initialCases);
    setSelectedCase(initialCases[0]);
  }, []);

  const runAiTriage = () => {
    if (!selectedCase) return;
    setLoadingAi(true);

    setTimeout(() => {
      const isCritical = selectedCase.threatScore > 50;
      const dossier = {
        summary: isCritical
          ? `High-confidence adversarial signature detected. Subject executed unnatural instantaneous angular flick (${selectedCase.maxAngularVelocity}°/s) in 1 game tick while OS window focus was suspended.`
          : 'Natural human motor-control telemetry verified. Biomechanical curve exhibits normal physiological micro-corrections.',
        confidence: isCritical ? 98.4 : 14.2,
        recommendedAction: isCritical ? 'PERMANENT_HWID_BAN' : 'CLOSE_FALSE_POSITIVE',
        evidence: selectedCase.details
      };

      const updated = { ...selectedCase, aiDossier: dossier };
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setAuditLog((prev) => [
        `[AI-TRIAGE] Generated investigation brief for ${selectedCase.playerId} (Verdict: ${dossier.recommendedAction})`,
        ...prev
      ]);
      setLoadingAi(false);
    }, 600);
  };

  const handleEnforce = (action: 'BAN' | 'DISMISS') => {
    if (!selectedCase) return;
    const newStatus = action === 'BAN' ? 'BANNED' : 'DISMISSED';
    const updated = { ...selectedCase, status: newStatus as any };

    setSelectedCase(updated);
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setAuditLog((prev) => [
      `[ENFORCEMENT] ${action === 'BAN' ? 'PERMANENT HARDWARE BAN' : 'CASE DISMISSED'} executed on ${selectedCase.playerId}`,
      ...prev
    ]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0e14', color: '#ece8e1', display: 'flex', flexDirection: 'column' }}>
      {/* Top Tactical Bar */}
      <header style={{ borderBottom: '1px solid #1f2937', background: '#0f172a', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#ff4655', color: '#fff', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              VANGUARD SENTINEL <span style={{ color: '#ff4655', fontSize: '11px', border: '1px solid #ff4655', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>OPERATIONS CONSOLE</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Platform Services & Investigation Telemetry Hub • Ring-3 Verified</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
            <Radio size={14} className="animate-pulse" />
            <span>INGESTION ACTIVE (PORT 3001)</span>
          </div>
          <div style={{ background: '#1e293b', padding: '4px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            ACTIVE SESSIONS: <span style={{ color: '#38bdf8', fontWeight: 700 }}>1,482</span>
          </div>
          <div style={{ background: '#1e293b', padding: '4px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            THREAT LEVEL: <span style={{ color: '#ff4655', fontWeight: 700 }}>ELEVATED</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Flagged Cases */}
        <aside style={{ borderRight: '1px solid #1f2937', background: '#0d1117', padding: '16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.75px', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#ff4655" />
            Flagged Sessions Queue ({cases.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const isHighThreat = c.threatScore > 50;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: isSelected ? '#1e293b' : '#111827',
                    border: isSelected ? '1px solid #ff4655' : '1px solid #1f2937',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>{c.playerId}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: isHighThreat ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: isHighThreat ? '#ef4444' : '#10b981'
                      }}
                    >
                      {c.threatScore}% THREAT
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                    {c.matchId} • {c.timestamp}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#cbd5e1' }}>
                    <span>Velocity: <strong>{c.maxAngularVelocity}°/s</strong></span>
                    <span>Status: <strong style={{ color: c.status === 'BANNED' ? '#ef4444' : '#38bdf8' }}>{c.status}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Log Box */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} />
              Enforcement Audit Trail
            </div>
            <div style={{ background: '#090d13', padding: '10px', borderRadius: '4px', border: '1px solid #1f2937', fontSize: '10px', fontFamily: 'monospace', color: '#a5f3fc', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
              {auditLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Tactical Deep-Dive & AI Dossier */}
        <main style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedCase && (
            <>
              {/* Header Details */}
              <div style={{ background: '#111827', padding: '16px 20px', borderRadius: '8px', border: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    CASE FILE: {selectedCase.id}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    Subject: {selectedCase.playerId}
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                    Environment: {selectedCase.game} • Match: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{selectedCase.matchId}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ background: '#0b0e14', padding: '8px 16px', borderRadius: '6px', border: '1px solid #374151', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>THREAT LEVEL</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: selectedCase.threatScore > 50 ? '#ef4444' : '#10b981' }}>
                      {selectedCase.threatScore}%
                    </div>
                  </div>

                  <div style={{ background: '#0b0e14', padding: '8px 16px', borderRadius: '6px', border: '1px solid #374151', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>MAX ANGULAR VELOCITY</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: selectedCase.maxAngularVelocity > 1800 ? '#ef4444' : '#38bdf8' }}>
                      {selectedCase.maxAngularVelocity}°/s
                    </div>
                  </div>
                </div>
              </div>

              {/* Heuristic Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: '#111827', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <Crosshair size={16} />
                    Aimbot Snap Violations
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedCase.aimbotViolations} Events</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Angular flicks &gt;1800°/s across 1 frame</div>
                </div>

                <div style={{ background: '#111827', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <Activity size={16} />
                    Zero-Overshoot Anomalies
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedCase.zeroOvershoots} Locks</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Instant stop lacking human muscle deceleration</div>
                </div>

                <div style={{ background: '#111827', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <Monitor size={16} />
                    Window Focus Violations
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedCase.focusViolations} Ticks</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Combat registered while game unfocused</div>
                </div>
              </div>

              {/* Aim Trajectory & Telemetry Frames */}
              <div style={{ background: '#111827', padding: '16px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={15} />
                  Millisecond Telemetry Frame Replay
                </div>
                <table style={{ width: '100%', fontSize: '11px', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', borderBottom: '1px solid #374151' }}>
                      <th style={{ padding: '6px' }}>Tick</th>
                      <th style={{ padding: '6px' }}>Time (ms)</th>
                      <th style={{ padding: '6px' }}>Yaw</th>
                      <th style={{ padding: '6px' }}>Pitch</th>
                      <th style={{ padding: '6px' }}>Firing</th>
                      <th style={{ padding: '6px' }}>OS Focus</th>
                      <th style={{ padding: '6px' }}>Hitbox Hit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCase.frames.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1f2937', color: f.hitboxHit === 'HEAD' ? '#ef4444' : '#f8fafc', background: f.hitboxHit === 'HEAD' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '6px', fontFamily: 'monospace' }}>#{f.tick}</td>
                        <td style={{ padding: '6px' }}>{f.timestamp}ms</td>
                        <td style={{ padding: '6px', fontFamily: 'monospace' }}>{f.yaw.toFixed(1)}°</td>
                        <td style={{ padding: '6px', fontFamily: 'monospace' }}>{f.pitch.toFixed(1)}°</td>
                        <td style={{ padding: '6px' }}>{f.isFiring ? <span style={{ color: '#ef4444', fontWeight: 700 }}>YES</span> : 'NO'}</td>
                        <td style={{ padding: '6px' }}>{f.isInForeground ? 'FOCUS' : <span style={{ color: '#f59e0b', fontWeight: 700 }}>UNFOCUSED</span>}</td>
                        <td style={{ padding: '6px', fontWeight: f.hitboxHit === 'HEAD' ? 800 : 400 }}>{f.hitboxHit || 'NONE'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Agentic AI Investigation Dossier */}
              <div style={{ background: '#090d16', padding: '18px', borderRadius: '8px', border: '1px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '13px' }}>
                    <Bot size={18} />
                    AGENTIC AI INVESTIGATION DOSSIER
                  </div>

                  {!selectedCase.aiDossier && (
                    <button
                      onClick={runAiTriage}
                      disabled={loadingAi}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {loadingAi ? 'ANALYZING TELEMETRY...' : 'GENERATE AI INVESTIGATION DOSSIER'}
                    </button>
                  )}
                </div>

                {selectedCase.aiDossier ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '10px' }}>
                      {selectedCase.aiDossier.summary}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', marginBottom: '12px' }}>
                      <div>Confidence Score: <strong style={{ color: '#10b981' }}>{selectedCase.aiDossier.confidence}%</strong></div>
                      <div>Recommended Action: <strong style={{ color: '#ef4444' }}>{selectedCase.aiDossier.recommendedAction}</strong></div>
                    </div>

                    <div style={{ background: '#111827', padding: '10px', borderRadius: '4px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>Identified Violations & Evidence:</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: '#f8fafc' }}>
                        {selectedCase.aiDossier.evidence.map((e, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Click "Generate AI Investigation Dossier" to run automatic machine reasoning on this player's kinematic trajectory and process signature.
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  onClick={() => handleEnforce('DISMISS')}
                  style={{
                    background: '#1f2937',
                    color: '#cbd5e1',
                    border: '1px solid #374151',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={15} />
                  Dismiss / False Positive
                </button>

                <button
                  onClick={() => handleEnforce('BAN')}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Ban size={15} />
                  EXECUTE HARDWARE BAN (HWID)
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
