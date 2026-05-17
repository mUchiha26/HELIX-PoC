# HELIX — Project Session Summary

> Generated from the opencode development session.
> Date: May 16, 2026

---

## 1. Project Overview

**HELIX** is a modular cybersecurity operations platform for academic research and education. It unifies Blue Team monitoring, Red Team orchestration, AI-assisted analysis, and ML-driven anomaly detection.

**Current Stage:** Proof of Concept (PoC)
**Roadmap:** PoC → MVP → Production-ready startup

---

## 2. Technology Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | HTML5 / CSS3 / JavaScript | User interface and visualization |
| Backend / API | PHP | REST API, authentication, business logic |
| Database | MySQL (XAMPP) | Data persistence and querying |
| ML Service | Python (scikit-learn) | Isolation Forest anomaly detection |
| Java Module | Java JDK | Hash scanning and log parsing |
| AI Integration | OpenAI API | Alert explanation and analysis |
| Version Control | Git / GitHub | Source control |

---

## 3. Documentation Files Created

| File | Path | Purpose |
|---|---|---|
| README | `README.md` | Project overview, quick start, roadmap |
| SRS | `docs/SRS.tex` | Software Requirements Specification (LaTeX) |
| Use Case Overview | `docs/UML/usecase_overview.puml` | High-level use case diagram (no relationships) |
| Use Case Detailed | `docs/UML/usecase_detailed.puml` | Comprehensive use case diagram (with <<include>> / <<extend>>) |
| Use Case Descriptions | `docs/UML/use_case/UseCase_Descriptions.tex` | 33 UC textual descriptions (LaTeX) |
| Use Case Diagram PNG | `docs/UML/use_case/usecase_detailed.png` | Rendered detailed diagram embedded in report |

---

## 4. Actors (8 Total)

| ID | Actor | Type | Phase |
|---|---|---|---|
| A0 | **Authenticated User** | Abstract generalization | PoC |
| A1 | **Administrator** | Primary (human) | PoC |
| A2 | **Blue Team Operator** | Primary (human) | PoC |
| A3 | **Red Team Operator** | Primary (human) | PoC |
| A4 | **Purple Team Operator** | Primary (human) | PoC |
| A5 | **Visitor** | Primary (unauthenticated) | PoC |
| A6 | **Learner** | Primary (human) | PoC |
| A7 | **Detection Engine** | Secondary (system) | PoC |

### Actor Hierarchy

```
Visitor (unauthenticated)
Authenticated User (abstract)
    ├── Administrator
    ├── Blue Team Operator
    ├── Red Team Operator
    │       └── Purple Team Operator (inherits Blue + Red)
    └── Learner
Detection Engine (system actor, outside boundary)
```

---

## 5. Use Case Diagrams — Two-Diagram Approach (Option A)

### Diagram 1: Global Overview (`usecase_overview.puml`)
- All actors + all use cases
- **No** `<<include>>` / `<<extend>>` relationships
- Only use cases directly linked to at least one actor
- Purpose: shows full scope at a glance

### Diagram 2: Comprehensive Detailed (`usecase_detailed.puml`)
- All actors + all use cases
- **With** all `<<include>>` / `<<extend>>` relationships
- Purpose: demonstrates UML relationship modeling depth

### Package Color Coding

| Package | Color |
|---|---|
| Access Control | Default (white) |
| Security Operations | `#E8F4FD` (light blue) |
| Detection Pipeline | `#FDF3DC` (light amber) |
| Red Team Orchestration | `#FFE0E6` (light pink) |
| Collaboration & Knowledge Base | `#F0E6FF` (light lavender) |
| Learner Workspace | `#FFF8DC` (light cream) |
| AI Assistance | `#D4F5D6` (light mint green) |

---

## 6. Use Cases — Full List (33 Total)

### Phase Breakdown

| # | Use Case | Phase |
|---|---|---|
| UC-01 | Register Account | **PoC** |
| UC-02 | Log In | **PoC** |
| UC-03 | Manage Profile | **PoC** |
| UC-04 | Manage Users | **PoC** |
| UC-05 | Configure System | **PoC** |
| UC-06 | Subscribe | **PoC** |
| UC-07 | View Security Dashboard | **PoC** |
| UC-08 | Monitor Security Events | **PoC** |
| UC-09 | Manage Incidents | **PoC** |
| UC-10 | Generate Report | **PoC** |
| UC-11 | Automated Detection | **PoC** |
| UC-12 | Ingest Logs | **PoC** |
| UC-13 | Pre-filter Noise | **PoC** |
| UC-14 | Score Anomalies | **PoC** |
| UC-15 | Generate Alerts | **PoC** |
| UC-16 | Use ML Scoring | **PoC** |
| UC-17 | Run Reconnaissance | **PoC** |
| UC-18 | Launch Exploitation | **Future MVP** |
| UC-19 | Post-Exploitation Lab | **Future MVP** |
| UC-20 | Create a Writeup | **PoC** |
| UC-21 | Browse Public Content | **PoC** |
| UC-22 | Search Knowledge Base | **PoC** |
| UC-23 | Publish Article | **PoC** |
| UC-24 | Collaborate on Incidents | **Future MVP** |
| UC-25 | Share Findings | **Future MVP** |
| UC-26 | Moderate Knowledge Base | **PoC** |
| UC-27 | Study with Premium Materials | **PoC** |
| UC-28 | Manage Personal Notes | **PoC** |
| UC-29 | Track Progress | **PoC** |
| UC-30 | Participate in Events | **Future MVP** |
| UC-31 | Use AI Assistant | **PoC** |
| UC-32 | Provide Reliable Fixes | **PoC** |
| UC-33 | Suggest Attack Methods | **PoC** |

### Future MVP Use Cases (5)

| UC | Name | Reason |
|---|---|---|
| UC-18 | Launch Exploitation | Requires full exploit framework, legal guardrails |
| UC-19 | Post-Exploitation Lab | Requires containerized lab environment |
| UC-24 | Collaborate on Incidents | Requires real-time collaboration infrastructure |
| UC-25 | Share Findings | Requires cross-team notification system |
| UC-30 | Participate in Events | Requires event management and leaderboard system |

### Include / Extend Relationships

| Parent | Relationship | Child |
|---|---|---|
| UC-11 (Automated Detection) | `<<include>>` | UC-12 (Ingest Logs) |
| UC-11 (Automated Detection) | `<<include>>` | UC-13 (Pre-filter Noise) |
| UC-11 (Automated Detection) | `<<include>>` | UC-14 (Score Anomalies) |
| UC-11 (Automated Detection) | `<<include>>` | UC-15 (Generate Alerts) |
| UC-11 (Automated Detection) | `<<include>>` | UC-31 (Use AI Assistant) |
| UC-14 (Score Anomalies) | `<<include>>` | UC-16 (Use ML Scoring) |
| UC-15 (Generate Alerts) | `<<include>>` | UC-14 (Score Anomalies) |
| UC-27 (Study with Premium Materials) | `<<include>>` | UC-29 (Track Progress) |
| UC-27 (Study with Premium Materials) | `<<extend>>` | UC-28 (Manage Personal Notes) |
| UC-31 (Use AI Assistant) | `<<include>>` | UC-32 (Provide Reliable Fixes) |
| UC-31 (Use AI Assistant) | `<<include>>` | UC-33 (Suggest Attack Methods) |

---

## 7. SRS Document Structure (`docs/SRS.tex`)

| Chapter | Content |
|---|---|
| 1 | Project Presentation (identity, stack, PoC scope) |
| 2 | Context and Problem Statement (industry context, problem, existing solutions, positioning) |
| 3 | Project Objectives (general, functional, academic, non-functional) |
| 4 | User Roles and System Actors (8 actors with hierarchy) |
| 5 | Functional and Non-Functional Requirements (7 modules, NFRs for performance, security, maintainability, usability, deployability) |

### Functional Requirements by Module

| Module | FR IDs | Count |
|---|---|---|
| Authentication & Access Control | FR-001 to FR-007 | 7 |
| Dashboard | FR-010 to FR-014 | 5 |
| Log Ingestion | FR-020 to FR-024 | 5 |
| Alert Visualization | FR-030 to FR-034 | 5 |
| ML Anomaly Detection | FR-040 to FR-044 | 5 |
| AI Assistant | FR-050 to FR-054 | 5 |
| Red Team Tool | FR-060 to FR-063 | 4 |

All FRs marked as **PoC** phase.

---

## 8. Use Case Descriptions Document (`docs/UML/use_case/UseCase_Descriptions.tex`)

- **33 use cases** across 7 chapters
- Each UC follows: Name, Actors, **Phase**, Preconditions, Postconditions, Main Scenario, Alternative Scenarios
- Phase field renders: **PoC** in teal, **Future MVP** in amber
- Detailed use case diagram embedded as PNG
- Cover page, table of contents, actor summary table, conclusion

---

## 9. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Two use case diagrams (overview + detailed) | Standard academic approach: breadth + depth |
| Abstract `Authenticated User` actor | Factors out shared use cases, avoids duplication |
| Purple Team inherits Blue + Red | Reflects real-world hybrid role |
| Detection Engine as secondary system actor | Autonomous, not user-initiated |
| Phase column in UC descriptions | Distinguishes PoC scope from full platform vision |
| Pastel color coding for packages | Professional, readable, accessible |
| No microservice orchestration complexity | PoC scope — simplicity first |
| OpenAI API for AI assistant | Real integration, not mock |
| Python script invoked by PHP for ML | No separate service infrastructure needed |

---

## 10. Core Principles

1. **Simplicity first** — deliver PoC on time
2. **Avoid overengineering** — build only what's necessary
3. **Modular and extensible** — support MVP evolution
4. **Reliability, maintainability, security** — non-negotiable
5. **Clean folder structure and naming** — consistent conventions
6. **Incremental improvements over rewrites**
7. **Mock/simulated when speed matters**

---

## 11. What Should NOT Be Built Now

- Microservice orchestration complexity
- Kubernetes
- Advanced CI/CD
- Distributed systems
- Multi-tenant architecture
- Plugin marketplaces
- Advanced real-time infrastructure
- Production scaling optimizations

---

## 12. Pending Deliverables

| Item | Status | Priority |
|---|---|---|
| Class Diagram | Generated (`class_diagram.puml`) | Done |
| Sequence Diagrams (×3) | Not started | High |
| Component Diagram | Not started | Medium |
| Deployment Diagram | Not started | Medium |
| Database Schema (`schema.sql`) | Not started | Medium |
| API Specification | Not started | Low |

---

## 13. PoC Scope Summary

| Module | Description | Phase |
|---|---|---|
| Auth + RBAC | 6 roles, PHP sessions, bcrypt | PoC |
| Dashboard | Metrics, charts, role-based views | PoC |
| Log Ingestion | Manual upload, CSV/TXT parsing | PoC |
| Alert Visualization | Severity classification, filtering | PoC |
| ML Anomaly Scoring | Isolation Forest, Python script | PoC |
| AI Assistant | OpenAI API, alert explanation | PoC |
| Red Team Tool | Port scanner, result display | PoC |
| UML + Documentation | This document + LaTeX reports | PoC |
