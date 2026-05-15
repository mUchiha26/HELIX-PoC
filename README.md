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
  PHP Backend / API
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
 MySQL  Python ML   Java Module
        (scikit)    (hash scan)
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
3. Configure database credentials in `backend/config/db.php`
4. Install Python dependencies:
   ```bash
   pip install scikit-learn pandas
   ```
5. Set your OpenAI API key in the configuration
6. Start Apache and MySQL in XAMPP
7. Navigate to `http://localhost/HELIX`

---

## Project Structure

```
HELIX/
├── backend/          # PHP API and business logic
├── frontend/         # HTML/CSS/JS interface
├── ml_service/       # Python anomaly detection
├── java_module/      # Hash scanning utilities
├── database/         # SQL schema and migrations
└── docs/             # Technical documentation and UML
```

---

## Roadmap

- [x] Project architecture and design
- [ ] Authentication + RBAC
- [ ] Dashboard and metrics
- [ ] Log ingestion pipeline
- [ ] Alert visualization
- [ ] ML anomaly scoring
- [ ] AI assistant integration
- [ ] Red Team tool module
- [ ] UML diagrams and documentation

---

## License

Academic use only. Not for production deployment.

---

<p align="center">
  <em>HELIX — Where defense meets intelligence.</em>
</p>
