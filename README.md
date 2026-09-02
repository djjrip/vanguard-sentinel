# 🛡️ Vanguard Sentinel — Anti-Cheat Telemetry Platform & Investigation Console

> **High-throughput Game Telemetry Ingestion, Mathematical Angular-Jerk Anomaly Detection, and Agentic AI Incident Triage.**  
> Built as an open-source reference platform service for competitive esports integrity.

[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-20%2B-green)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/security-HMAC--SHA256-red)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Architectural Highlights

1. **Cryptographic Telemetry Ingestion:**
   - Enforces HMAC-SHA256 message authentication with sliding-window nonce replay protection.
   - Resilient against payload tampering and packet injection attacks.

2. **Mathematical Aimbot & Snap Heuristics:**
   - Evaluates spherical angular velocity ($\omega = \Delta \theta / \Delta t$) across tick frames.
   - Detects instantaneous mechanical snaps ($>1800^\circ/\text{sec}$) and sub-millisecond zero-overshoot anomalies lacking human biomechanical deceleration curves.

3. **Runtime & Environmental Integrity:**
   - Cross-references combat input actions with client OS window focus state (detecting headless overlay injection).
   - Validates Hardware ID (HWID) entropy to flag virtualization spoofers.

4. **Agentic AI Investigation Triage:**
   - Transforms raw match telemetry logs into structured incident investigation dossiers for Player Support & Anti-Cheat Operations teams.

---

## 🚀 Quickstart & Verification

```bash
# Clone the repository
git clone https://github.com/djjrip/vanguard-sentinel.git
cd vanguard-sentinel

# Install dependencies
npm install

# Run the heuristic mathematical test suite
npm test
```

### Verified Test Results
```text
[TEST 1] Verifying HMAC-SHA256 Cryptographic Tamper Resistance...
✅ HMAC verification passed: Tampered payloads are rejected.

[TEST 2] Testing Mathematical Aim-Snap & Zero-Overshoot Detection...
- Threat Score: 75/100
- Max Velocity: 5673°/s
- Snap Violations: 1
- Zero-Overshoots: 1
✅ Aimbot heuristic passed: Mathematical aim snap flagged with high confidence.

[TEST 3] Testing OS Window Focus & HWID Spoof Detection...
- Threat Score: 100/100
- Focus Violations: 2
- Malicious Process: true
- HWID Spoofed: true
✅ Integrity heuristic passed: Headless combat & spoofed HWID detected.
```

---

## 🗺️ System Topology

```
[ Game Client / Rust SDK ]
           │
           │ (HMAC-SHA256 Encrypted Telemetry: Mouse Angles, Process Focus, HWID)
           ▼
[ Platform Services Ingestion API ] (Node.js / TypeScript)
   ├── Cryptographic Signature & Nonce Validator
   ├── Heuristic Anomaly Engine (Angular Velocity Variance, Aim Snap Detection)
   └── Agentic AI Triage Pipeline (Telemetry Summarization & Ban Recommendations)
           │
           ▼
[ Anti-Cheat Operations & Investigation Console ]
   ├── Live Telemetry Event Stream & Metrics Ticker
   ├── Deep-Dive Session Inspector (Aim-Vector Graph, Anomaly Scorecard)
   └── Rapid Enforcement Action Matrix (HWID Ban, Shadowban, Sandbox, Dismiss)
```

---

## 📄 License
MIT © [Jayson Quindao](https://github.com/djjrip). Built for competitive esports integrity.
