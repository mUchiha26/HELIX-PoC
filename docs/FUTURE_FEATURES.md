# HELIX — Future Features & Improvements

> Organized by Phase and Field. Each entry includes description, priority, estimated effort, dependencies, and rationale.
> Last updated: May 18, 2026

---

## How to Read This Document

| Priority | Meaning |
|---|---|
| **P0** | Critical — blocks other features or core to platform value |
| **P1** | High — should be done in this phase |
| **P2** | Medium — valuable but can wait |
| **P3** | Low — nice to have, exploratory |

| Effort | Meaning |
|---|---|
| **S** | Small — 1-4 hours |
| **M** | Medium — 1-2 days |
| **L** | Large — 3-5 days |
| **XL** | Very Large — 1+ week |

---

## PHASE 1 — PoC Completion (Immediate)

> Features needed to complete the current Proof of Concept. All depend on existing incomplete modules.

### Java Module

#### SIEM Correlation Engine
- **Description:** Correlate multiple low-severity log events into high-severity alerts using rule-based logic (e.g., "5 failed logins from same IP in 60s → brute force alert").
- **Priority:** P1
- **Effort:** M (1-2 days)
- **Dependencies:** FIM complete (Phase 8), Log Ingestion Pipeline working, Alert module exists
- **Why it matters:** Transforms HELIX from passive log viewer to active threat detection platform

### Backend (PHP)

#### Log Ingestion Pipeline
- **Description:** Manual file upload (CSV/TXT/syslog), parsing via Java LogParser, storage in `log_entries` table. Supports drag-and-drop upload with file validation.
- **Priority:** P0
- **Effort:** M (1-2 days)
- **Dependencies:** Auth module complete, Java LogParser compiled
- **Why it matters:** Raw fuel for everything — alerts, ML scoring, AI analysis all depend on log data

#### Alert Management Module
- **Description:** CRUD for alerts, severity classification, status workflow (open → investigating → resolved), assignment to users, filtering and sorting.
- **Priority:** P0
- **Effort:** M (1-2 days)
- **Dependencies:** Log Ingestion Pipeline complete
- **Why it matters:** Core Blue Team workflow — without alerts, there's nothing to triage or respond to

#### Report Generation
- **Description:** Generate PDF/CSV reports from scan results, alert history, and anomaly scores. Exportable for compliance or academic submission.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** All data-generating modules complete
- **Why it matters:** Academic deliverable — you need reports to show in your defense

### Frontend

#### Logs Dashboard
- **Description:** Table view of ingested logs with filtering (severity, date range, source IP), search, and pagination.
- **Priority:** P0
- **Effort:** S (2-4 hours)
- **Dependencies:** Log Ingestion Pipeline complete
- **Why it matters:** Primary interface for Blue Team operators

#### Alerts Visualization
- **Description:** Alert list with severity color-coding, status badges, detail modal, and bulk actions. Chart.js integration for severity distribution.
- **Priority:** P0
- **Effort:** S (2-4 hours)
- **Dependencies:** Alert Management Module complete
- **Why it matters:** Makes the detection pipeline visible and actionable

#### Scanner UI Enhancement
- **Description:** Improve the existing scanner page with real-time progress, result export, and scan comparison over time.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** Scanner module complete
- **Why it matters:** Better UX for Red Team workflow

### Python/ML

#### Anomaly Detection Integration
- **Description:** Connect Isolation Forest model to ingested logs. PHP triggers Python script, scores are stored in `anomaly_scores`, displayed on dashboard.
- **Priority:** P0
- **Effort:** M (1-2 days)
- **Dependencies:** Log Ingestion Pipeline complete, Python environment working
- **Why it matters:** HELIX's ML differentiator — without it, you're just a log viewer

#### Model Retraining Pipeline
- **Description:** Automated retraining of the Isolation Forest model when new labeled data is available. Triggered manually or on schedule.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** Anomaly Detection Integration complete
- **Why it matters:** Keeps ML model relevant as log patterns evolve

### AI

#### Alert Remediation Suggestions
- **Description:** OpenAI-powered analysis of alerts with specific remediation steps, CVE references, and MITRE ATT&CK mapping.
- **Priority:** P1
- **Effort:** S (2-4 hours)
- **Dependencies:** Alert module complete, OpenAI API configured
- **Why it matters:** AI's highest-value use case in HELIX — actionable guidance, not just explanation

---

## PHASE 2 — MVP Features

> Features that elevate HELIX from PoC to a minimum viable product. Suitable for a startup pitch or advanced academic project.

### Java Module

#### YARA Rule Engine
- **Description:** Execute YARA rules against files to detect malware patterns, suspicious strings, and file characteristics. Users can write, test, and manage their own rules.
- **Priority:** P1
- **Effort:** L (3-5 days)
- **Dependencies:** FIM complete (shared infrastructure), JavaBridge stable
- **Why it matters:** Industry-standard detection engineering (used by CrowdStrike, FireEye, VirusTotal). High academic credibility.

#### PCAP Parser
- **Description:** Parse PCAP files, extract protocol statistics, detect anomalies (port scans, unusual traffic patterns, suspicious DNS queries).
- **Priority:** P2
- **Effort:** L (3-5 days)
- **Dependencies:** Java module stable
- **Why it matters:** Teaches networking fundamentals alongside security. Very visual output for demos.

#### Certificate Inspector
- **Description:** Analyze SSL/TLS certificates for expiry, weak algorithms, self-signed status, and chain validation.
- **Priority:** P3
- **Effort:** S (2-4 hours)
- **Dependencies:** Java module stable
- **Why it matters:** Practical security tool, demonstrates Java's crypto APIs

### Backend (PHP)

#### Knowledge Base
- **Description:** Browse, search, and publish security articles/writeups. Markdown support, tagging, and role-based publishing (admin/moderator).
- **Priority:** P1
- **Effort:** M (1-2 days)
- **Dependencies:** Auth module complete
- **Why it matters:** Fulfills UC-20 through UC-26 — collaboration and learning features

#### Real-time Log Streaming
- **Description:** Server-Sent Events (SSE) or WebSocket-based live log feed to the frontend dashboard.
- **Priority:** P2
- **Effort:** M (1-2 days)
- **Dependencies:** Log Ingestion Pipeline complete
- **Why it matters:** Transforms dashboard from static to live monitoring

#### Multi-tenant Support
- **Description:** Isolate data by organization/team. Users only see their team's logs, alerts, and scans.
- **Priority:** P2
- **Effort:** L (3-5 days)
- **Dependencies:** Auth module stable, all data modules complete
- **Why it matters:** Required for any SaaS deployment

### Frontend

#### Red Team Dashboard
- **Description:** Dedicated view for Red Team operators: scan results, exploit tracking, post-exploitation notes, and target inventory.
- **Priority:** P1
- **Effort:** S (2-4 hours)
- **Dependencies:** Scanner module complete
- **Why it matters:** Role-specific UX — Red Team needs different data than Blue Team

#### Learner Workspace
- **Description:** Study materials, progress tracking, personal notes, and guided lab exercises. Premium content gating.
- **Priority:** P1
- **Effort:** M (1-2 days)
- **Dependencies:** Knowledge Base complete
- **Why it matters:** Fulfills UC-27 through UC-29 — educational value proposition

#### Incident Collaboration View
- **Description:** Real-time incident timeline, team chat, evidence attachment, and handoff notes.
- **Priority:** P2
- **Effort:** M (1-2 days)
- **Dependencies:** Alert module complete, Knowledge Base complete
- **Why it matters:** Fulfills UC-24 — team-based incident response

### AI

#### MITRE ATT&CK Mapping
- **Description:** AI automatically maps detected alerts to MITRE ATT&CK techniques and tactics. Visualized as a heatmap.
- **Priority:** P1
- **Effort:** S (2-4 hours)
- **Dependencies:** Alert Remediation Suggestions complete
- **Why it matters:** Industry-standard framework — shows professional-grade thinking

#### Threat Intelligence Enrichment
- **Description:** AI enriches alerts with external context: known IOCs, threat actor profiles, recent campaigns.
- **Priority:** P2
- **Effort:** M (1-2 days)
- **Dependencies:** Alert Remediation Suggestions complete, external API access
- **Why it matters:** Turns isolated alerts into contextualized intelligence

### Python/ML

#### Feature Engineering Pipeline
- **Description:** Extract meaningful features from raw logs (frequency, entropy, time-of-day patterns) before ML scoring.
- **Priority:** P1
- **Effort:** M (1-2 days)
- **Dependencies:** Anomaly Detection Integration complete
- **Why it matters:** Better features = better detection. Academic depth for thesis.

#### Supervised Learning Module
- **Description:** Train classification models on labeled alert data (true positive vs false positive). Improves over time.
- **Priority:** P2
- **Effort:** L (3-5 days)
- **Dependencies:** Feature Engineering complete, sufficient labeled data
- **Why it matters:** Evolution from unsupervised to supervised — shows ML maturity

---

## PHASE 3 — Post-MVP / Advanced

> Features for a production-ready platform. Suitable for a startup or enterprise deployment.

### Java Module

#### Anti-Virus Scanner (Signature-Based)
- **Description:** File scanning against a signature database with heuristic analysis. Quarantine suspicious files.
- **Priority:** P2
- **Effort:** XL (1+ week)
- **Dependencies:** YARA Rule Engine complete (shared pattern-matching infrastructure)
- **Why it matters:** Familiar concept, but realistically inferior to existing tools (ClamAV). Build only after YARA proves the pattern-matching foundation.

#### Memory Dump Analyzer
- **Description:** Analyze process memory dumps for injected code, suspicious strings, and hidden processes.
- **Priority:** P3
- **Effort:** XL (1+ week)
- **Dependencies:** PCAP Parser complete, advanced Java binary parsing
- **Why it matters:** Advanced forensics capability — impressive but niche

#### Log Normalizer
- **Description:** Convert logs from multiple formats (Apache, Windows Event, syslog, JSON) into a unified HELIX schema.
- **Priority:** P2
- **Effort:** M (1-2 days)
- **Dependencies:** LogParser.java stable
- **Why it matters:** Real-world SIEMs ingest from dozens of sources — normalization is essential

### Backend (PHP)

#### Elasticsearch Integration
- **Description:** Replace MySQL for log storage with Elasticsearch. Full-text search, aggregations, and time-series analytics.
- **Priority:** P1
- **Effort:** L (3-5 days)
- **Dependencies:** Log Ingestion Pipeline complete, Elasticsearch installed
- **Why it matters:** MySQL doesn't scale for log data. Elasticsearch is the industry standard.

#### Redis Caching Layer
- **Description:** Cache dashboard stats, frequent queries, and session data. Reduce database load.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** All modules complete
- **Why it matters:** Performance optimization for production deployment

#### API Rate Limiting
- **Description:** Per-user rate limits on all endpoints. Prevent abuse and ensure fair resource usage.
- **Priority:** P1
- **Effort:** S (2-4 hours)
- **Dependencies:** Auth module stable
- **Why it matters:** Security and reliability requirement for any public API

#### Webhook System
- **Description:** Trigger external HTTP callbacks on alert creation, scan completion, or ML score threshold breach.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** Alert module complete
- **Why it matters:** Integration point for external tools (Slack, PagerDuty, SIEMs)

### Frontend

#### Dark Mode
- **Description:** Full dark theme toggle with persistent preference. SOC operators work in dark rooms.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** CSS architecture stable
- **Why it matters:** UX expectation for security tools. SOC-friendly.

#### Dashboard Customization
- **Description:** Drag-and-drop widget layout, custom metric cards, saved dashboard views per user.
- **Priority:** P3
- **Effort:** M (1-2 days)
- **Dependencies:** Dashboard module stable
- **Why it matters:** Personalization for different operator roles

#### Mobile Responsive Design
- **Description:** Full mobile/tablet support for all pages. On-call alert triage from phone.
- **Priority:** P2
- **Effort:** M (1-2 days)
- **Dependencies:** All frontend pages complete
- **Why it matters:** Accessibility and modern UX expectation

### DevOps

#### Docker Containerization
- **Description:** Docker Compose setup: Apache+PHP, MySQL, Python ML service, Java module as sidecar.
- **Priority:** P0
- **Effort:** M (1-2 days)
- **Dependencies:** All modules complete and tested
- **Why it matters:** Reproducible deployment — essential for academic submission and future scaling

#### CI/CD Pipeline
- **Description:** GitHub Actions: lint, test, build Docker images, deploy on push to main.
- **Priority:** P1
- **Effort:** S (2-4 hours)
- **Dependencies:** Docker Compose working, test suite complete
- **Why it matters:** Professional development workflow

#### Monitoring & Health Checks
- **Description:** `/health` endpoint, uptime monitoring, error alerting. Prometheus + Grafana optional.
- **Priority:** P2
- **Effort:** S (2-4 hours)
- **Dependencies:** Docker Compose working
- **Why it matters:** Production readiness requirement

### Infrastructure

#### Kubernetes Deployment
- **Description:** Helm charts for HELIX microservices. Horizontal pod autoscaling, service mesh.
- **Priority:** P3
- **Effort:** XL (1+ week)
- **Dependencies:** Docker Compose stable, CI/CD working
- **Why it matters:** Enterprise-scale deployment. Overkill for PoC/MVP.

#### Multi-region Deployment
- **Description:** Geo-distributed HELIX instances with data replication and failover.
- **Priority:** P3
- **Effort:** XL (1+ week)
- **Dependencies:** Kubernetes stable
- **Why it matters:** Enterprise HA requirement. Not needed for academic or startup phase.

---

## Feature Dependency Graph

```
FIM (Java) ──────────────────────────────────────────┐
  │                                                    │
  ▼                                                    ▼
SIEM Correlation ← Log Ingestion ← Alert Module ← AI Remediation
  │                      │              │                  │
  │                      ▼              │                  ▼
  │                 ML Scoring ─────────┘            MITRE ATT&CK
  │                      │
  │                      ▼
  └────────────── YARA Rule Engine ────────────── Anti-Virus
                           │
                           ▼
                      PCAP Parser
```

---

## Quick Reference: What to Build When

| When | Build | Time Estimate |
|---|---|---|
| **Today** | File Integrity Monitor (Java) | 1 day |
| **This week** | Log Ingestion + Alert Module + ML Integration | 3-5 days |
| **Next week** | SIEM Correlation + AI Remediation + Frontend pages | 3-5 days |
| **MVP push** | YARA Rule Engine + Knowledge Base + Docker | 1-2 weeks |
| **Post-MVP** | Elasticsearch + CI/CD + Advanced features | 2-4 weeks |
