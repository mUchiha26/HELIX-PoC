# HELIX

> A modular cybersecurity operations platform for academic research and education.

HELIX unifies **Blue Team monitoring**, **Red Team tool orchestration**, **AI-assisted analysis**, and **ML-driven anomaly detection** into a single, extensible platform.

Built as an academic proof-of-concept — designed to scale.

---

## What HELIX Does

| Capability | Description |
|---|---|
| **Blue Team** | Log ingestion, alert visualization, and real-time threat monitoring |
| **Red Team** | Controlled security tool orchestration with role-based access |
| **AI Assistant** | OpenAI-powered alert explanation and remediation guidance |
| **ML Engine** | Isolation Forest anomaly detection on security logs |

---

## Architecture

```
Frontend (HTML/CSS/JS)
        │
        ▼
  api/ (PHP REST API)
        │
   ┌────┼──────────────────┐
   ▼    ▼                  ▼
 MySQL  python-module/    java-module/
        anomaly_detector  HashScanner
              │
              ▼
        OpenAI API
```

**Stack:** PHP · MySQL (XAMPP) · Python · Java · OpenAI API

---

## Quick Start

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL + PHP)
- Python 3.x
- Java JDK
- OpenAI API key

### Setup

1. Clone the repository
2. Import `database/schema.sql` into MySQL via phpMyAdmin
3. Configure database credentials in `api/Config/.env` (copy `.env.example`)
4. Install Python dependencies:
   ```bash
   pip install scikit-learn pandas
   ```
5. Set your OpenAI API key in `api/Config/.env`
6. Start Apache and MySQL in XAMPP
7. Navigate to `http://localhost/HELIX/frontend/`

---

## Project Structure

```
HELIX/
├── api/               # PHP REST API (Controllers, Services, Models)
├── frontend/          # HTML/CSS/JS interface
├── python-module/     # Python anomaly detection
├── java-module/       # SHA-256 hashing and file scanning
├── database/          # SQL schema and migrations
└── docs/              # Technical documentation and UML
```

---

## Documentation

- `docs/SRS.tex` — Software Requirements Specification
- `docs/UML/` — Use Case, Class, Sequence, State Machine, Activity, Deployment diagrams
- `docs/SDD/API_REFERENCE.md` — Complete REST API route reference

---

## License

Academic use only. Not for production deployment.

---

<p align="center">
  <em>HELIX — Where defense meets intelligence.</em>
</p>
