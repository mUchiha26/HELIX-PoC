# HELIX — Cybersecurity Operations Platform

## PoC Engineering Roadmap · Learn & Build Hybrid Approach

### Version 2.0 · Adapted to Actual Project Structure · Academic Year 2025–2026

> **Document Purpose:** This is your personal engineering execution blueprint, adapted to your actual project architecture: a decoupled SPA frontend, a layered PHP API (Controller → Service → Model), a Python ML module, and a Java utility module. Every file reference in this roadmap maps to a real file in your tree. Follow it sequentially, create files only when you reach them, and mark your progress as you go.

---

## How to Use This Roadmap

```
[ ] Not started
[~] In progress
[x] Completed
[!] Blocked / Needs review
```

**Core principle:** You do not move to the next phase until the current phase's **Definition of Done** is satisfied. You create files only when you need them — not before.

---

## Architecture Reference

Before starting, internalize this flow. Every feature you build will follow it:

```
Browser (frontend/)
    │
    │  HTTP fetch() via api.js
    ▼
api/index.php          ← Front Controller: parses route, applies middleware, dispatches
    │
    ├── middleware/AuthMiddleware.php     ← Is the user logged in?
    ├── middleware/RoleMiddleware.php     ← Is the user allowed?
    │
    ▼
api/controllers/XController.php         ← Parse request, call service, return response
    │
    ▼
api/services/XService.php               ← All business logic lives here
    │
    ▼
api/models/X.php                        ← All DB queries live here (PDO)
    │
    ▼
MySQL (helix_db)
```

**Key architectural decisions already made:**

- The frontend is completely decoupled — it never touches PHP directly
- `api/index.php` is the single entry point — all routes go through it
- `api/config/Cors.php` handles CORS because frontend and API are on different paths
- `api/helpers/Response.php` standardizes all JSON responses
- `api/helpers/Validator.php` centralizes input validation
- `api/services/JavaBridge.php` is the only place that touches `shell_exec()`

---

## Global Phase Map

```
PHASE 0 → PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6 → PHASE 7 → PHASE 8 → PHASE 9 → PHASE 10
  │           │           │           │           │           │           │           │           │          │           │
Setup     Architecture  Auth +    Dashboard   Log         Alert       ML          AI        Scanner  Integration  Docker
& Git     & DB Design   RBAC      & Routing  Ingestion   Module     Detection  Assistant    Module   & Testing   & Deploy
```

**Dependency chain (strict):**

- Phase 1 requires Phase 0
- Phase 2 requires Phase 1 (DB schema + routing foundation in place)
- Phase 3 requires Phase 2 (auth middleware working, frontend routing exists)
- Phase 4 requires Phase 3 (dashboard shell exists as UI home)
- Phase 5 requires Phase 4 (log data is the raw input for alerts + ML)
- Phase 6 requires Phase 5 (alerts are generated from scored logs)
- Phase 7 requires Phase 5 (ML needs log data to score)
- Phase 8 requires Phase 6 (AI analyzes alerts enriched by ML scores)
- Phase 9 requires Phase 2 (scanner only needs auth, independent of logs/ML)
- Phase 10 requires Phases 2–9 (all modules complete and individually tested)
- Phase 11 requires Phase 10 (containerize only a stable application)

---

## PHASE 0 — Project Setup, Git Workflow & Development Environment

> **Why this comes first:** Without a reproducible environment and version control, everything you build is fragile. One wrong XAMPP config, one missing `.gitignore`, and you lose hours. This phase costs 2 hours and saves 20.

### Objective

Establish the complete development environment, Git discipline, Apache serving strategy, Composer setup, and Python environment — before writing a single line of application logic.

### Learning Goals

- Understand Git branching strategy for solo development
- Understand how Apache serves two directories under one vhost (frontend + api)
- Understand Composer as PHP's dependency manager and autoloader
- Understand `pyproject.toml` vs `requirements.txt` (and why you're using the former)
- Understand the Front Controller pattern (`api/index.php`)

### Key Theoretical Concepts

- **Git Flow (simplified):** `main` = stable releases, `dev` = integration branch, `feature/*` = active work
- **Apache vhost + Alias directive:** How to serve `frontend/` at `/` and `api/` at `/api` from one domain
- **Composer autoloading (PSR-4):** How `use App\Controllers\AuthController` resolves to a file path automatically
- **Front Controller:** One entry point that routes all requests — no 30 separate PHP files each handling their own routing
- **CORS (Cross-Origin Resource Sharing):** Why the browser blocks your `fetch('/api/...')` without the right headers

### Practical Tasks

#### 0.1 — Git Repository Setup

- [x] Create private repository on GitHub/GitLab
- [x] Clone locally into your project root
- [x] Create `.gitignore`:

```
# PHP
vendor/
composer.lock (optional — some teams commit this, decide now)

# Python
python-module/.venv/
python-module/__pycache__/
python-module/models/*.joblib

# Java
java-module/build/*.class

# Environment
api/config/.env
.env

# IDE
.vscode/
.idea/
*.DS_Store
```

- [ ] Create `CHANGELOG.md` — update at end of every phase
- [ ] Initial commit: `git commit -m "chore: initialize HELIX project"`
- [ ] Create `dev` branch: `git checkout -b dev`

**Branching strategy:**

- Work on `feature/*` branches cut from `dev`
- Merge `feature/*` → `dev` when a phase is complete and tested
- Merge `dev` → `main` only when a full milestone works end-to-end

#### 0.2 — Apache Vhost Configuration (Fedora/RHEL)

This is the critical decision from the review. You have `frontend/` and `api/` as siblings. Define how Apache serves both under `helix.local`. On Fedora, Apache config lives in `/etc/httpd/`.

**Step 1: Install Apache, PHP, and dependencies**

```bash
sudo dnf install httpd php php-cli
sudo dnf install php-pdo php-pdo_mysql php-json  # Runtime deps
sudo systemctl start httpd
sudo systemctl enable httpd  # Start on boot
```

Verify Apache is running:

```bash
curl http://localhost
```

**Step 2: Create vhost configuration**

Create `/etc/httpd/conf.d/helix.conf` (requires `sudo`):

```apache
<VirtualHost *:80>
    ServerName helix.local
    DocumentRoot /home/yasseene/HELIX/frontend

    # Serve frontend at root
    <Directory /home/yasseene/HELIX/frontend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing: send all requests to index.html except actual files
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ index.html [QSA,L]
        </IfModule>
    </Directory>

    # Serve API under /api path
    Alias /api /home/yasseene/HELIX/api

    <Directory /home/yasseene/HELIX/api>
        Options FollowSymLinks
        AllowOverride All
        Require all granted

        # Front controller: route everything to index.php
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /api
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ index.php?path=$1 [QSA,L]
        </IfModule>
    </Directory>

    # PHP handler
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

    ErrorLog /var/log/httpd/helix_error.log
    CustomLog /var/log/httpd/helix_access.log combined
</VirtualHost>
```

**Step 3: Enable mod_rewrite (if not already enabled)**

On Fedora/RHEL, `mod_rewrite` is usually enabled by default. Verify:

```bash
grep -i "rewrite" /etc/httpd/conf.modules.d/*.conf
```

If not found, enable it:

```bash
sudo dnf install mod_rewrite  # or already included
```

**Step 4: Add to system hosts file**

```bash
echo "127.0.0.1    helix.local" | sudo tee -a /etc/hosts
```

Verify:

```bash
ping helix.local
```

**Step 5: Fix file permissions**

Apache runs as `apache` user. Ensure it can read your project files:

```bash
# Make frontend/api readable by Apache
sudo usermod -a -G $(id -gn) apache  # Add apache to your group
chmod 755 /home/yasseene/HELIX  # Group readable
chmod 755 /home/yasseene/HELIX/{frontend,api}
```

**Step 6: Validate and restart Apache**

```bash
# Check syntax
sudo httpd -t

# Restart
sudo systemctl restart httpd

# Check status
sudo systemctl status httpd
```

**Consequence for `api.js`:** All frontend API calls will use:

```javascript
const API_BASE = "/api"; // relative — works on same origin
```

Never hardcode `http://localhost/...` — relative paths survive domain changes.

- [x] Install Apache, PHP, and dependencies: `sudo dnf install httpd php php-cli php-pdo php-pdo_mysql php-json`
- [x] Create `/etc/httpd/conf.d/helix.conf` with vhost above
- [x] Add `127.0.0.1 helix.local` to `/etc/hosts`: `echo "127.0.0.1    helix.local" | sudo tee -a /etc/hosts`
- [x] Fix permissions: `chmod 755 /home/yasseene/HELIX{,/frontend,/api}`
- [x] Verify mod_rewrite: `grep -i "rewrite" /etc/httpd/conf.modules.d/*.conf`
- [x] Run `sudo httpd -t` (syntax check)
- [x] Run `sudo systemctl restart httpd`
- [x] Verify: `http://helix.local` serves `frontend/index.html`
- [x] Create `api/index.php` with `echo "API OK";` temporarily
- [x] Verify: `http://helix.local/api` returns "API OK"
- [x] Check logs: `tail -f /var/log/httpd/helix_error.log` if anything fails

#### 0.3 — MySQL Setup

- [x] Start MySQL in XAMPP
- [x] Create database: `helix_db`
- [x] Create dedicated user with limited privileges:

```sql
CREATE USER 'helix_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON helix_db.* TO 'helix_user'@'localhost';
FLUSH PRIVILEGES;
```

- [ ] Verify connection via phpMyAdmin

#### 0.4 — PHP Composer Setup

`composer.json` (already exists in your tree — populate it):

```json
{
  "name": "helix/api",
  "description": "HELIX Cybersecurity Platform API",
  "type": "project",
  "require": {
    "php": ">=8.1"
  },
  "require-dev": {
    "phpunit/phpunit": "^10.0"
  },
  "autoload": {
    "psr-4": {
      "App\\": "api/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "Tests\\": "tests/php/"
    }
  }
}
```

- [ ] Run: `composer install`
- [ ] Verify `vendor/autoload.php` was created
- [ ] Add `require_once __DIR__ . '/../../vendor/autoload.php';` to `api/index.php`

**Why PSR-4 matters:** With this config, `use App\Controllers\AuthController` automatically maps to `api/controllers/AuthController.php`. You never write manual `require` statements for your own classes.

#### 0.5 — Environment Configuration

`api/config/Environment.php`:

```php
<?php
namespace App\Config;

class Environment
{
    private static array $vars = [];

    public static function load(string $envFile): void
    {
        if (!file_exists($envFile)) return;

        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            [$key, $value] = explode('=', $line, 2);
            self::$vars[trim($key)] = trim($value);
            $_ENV[trim($key)] = trim($value);
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::$vars[$key] ?? $_ENV[$key] ?? getenv($key) ?: $default;
    }
}
```

Create `api/config/.env` (gitignored):

```
DB_HOST=localhost
DB_NAME=helix_db
DB_USER=helix_user
DB_PASS=your_password
OPENAI_API_KEY=sk-...
SESSION_LIFETIME=3600
PYTHON_PATH=C:/path/to/.venv/Scripts/python.exe
PYTHON_SCRIPT=python-module/anomaly_detector.py
JAVA_BUILD_PATH=java-module/build
```

Create `api/config/.env.example` (committed to git — no real values):

```
DB_HOST=localhost
DB_NAME=helix_db
DB_USER=helix_user
DB_PASS=
OPENAI_API_KEY=
SESSION_LIFETIME=3600
PYTHON_PATH=
PYTHON_SCRIPT=python-module/anomaly_detector.py
JAVA_BUILD_PATH=java-module/build
```

#### 0.6 — Database Config

`api/config/Database.php`:

```php
<?php
namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $host = Environment::get('DB_HOST', 'localhost');
            $name = Environment::get('DB_NAME');
            $user = Environment::get('DB_USER');
            $pass = Environment::get('DB_PASS');

            $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Never expose DB errors to client
                error_log("DB connection failed: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Database unavailable']);
                exit;
            }
        }

        return self::$instance;
    }
}
```

- [ ] Test: add a `Database::getInstance();` call to `api/index.php` temporarily → no error

#### 0.7 — CORS Configuration

`api/config/Cors.php`:

```php
<?php
namespace App\Config;

class Cors
{
    public static function handle(): void
    {
        $allowedOrigins = ['http://helix.local', 'http://localhost'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');

        // Preflight: browsers send OPTIONS before real request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
```

#### 0.8 — Helper Classes

`api/helpers/Response.php`:

```php
<?php
namespace App\Helpers;

class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): void
    {
        self::json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['success' => false, 'error' => $message], $status);
    }

    public static function unauthorized(): void
    {
        self::error('Unauthorized', 401);
    }

    public static function forbidden(): void
    {
        self::error('Forbidden', 403);
    }
}
```

`api/helpers/Validator.php`:

```php
<?php
namespace App\Helpers;

class Validator
{
    private array $errors = [];

    public function required(string $field, mixed $value): self
    {
        if (empty($value) && $value !== '0') {
            $this->errors[$field] = "{$field} is required";
        }
        return $this;
    }

    public function email(string $field, mixed $value): self
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "{$field} must be a valid email";
        }
        return $this;
    }

    public function minLength(string $field, mixed $value, int $min): self
    {
        if (strlen((string)$value) < $min) {
            $this->errors[$field] = "{$field} must be at least {$min} characters";
        }
        return $this;
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }
}
```

#### 0.9 — Front Controller Bootstrap

`api/index.php` — the single entry point for all API calls:

```php
<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Environment;
use App\Config\Cors;
use App\Helpers\Response;

// 1. Load environment
Environment::load(__DIR__ . '/config/.env');

// 2. Handle CORS (must be before any output)
Cors::handle();

// 3. Parse route
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api prefix (added by Apache Alias)
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';

// 4. Route dispatch (will grow with each phase)
$routes = [];

// Each phase will add routes here:
// $routes['POST']['/auth/login'] = [AuthController::class, 'login'];

// 5. Dispatch
if (isset($routes[$method][$uri])) {
    [$controllerClass, $action] = $routes[$method][$uri];
    $controller = new $controllerClass();
    $controller->$action();
} else {
    Response::error('Route not found', 404);
}
```

- [ ] Verify: `http://helix.local/api/nonexistent` returns `{"success":false,"error":"Route not found"}`

#### 0.10 — Python Environment

- [ ] Confirm Python ≥ 3.10: `python --version`
- [ ] Create virtual environment inside `python-module/`:

```bash
cd python-module
python -m venv .venv
```

- [ ] create `pyproject.toml`:

```toml
[project]
name = "helix-python-module"
version = "0.1.0"
description = "Isolation Forest anomaly detection for HELIX"
requires-python = ">=3.10"

[project.dependencies]
scikit-learn = ">=1.3.0"
pandas = ">=2.0.0"
numpy = ">=1.24.0"
joblib = ">=1.3.0"
mysql-connector-python = ">=8.0.0"

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
]

[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.backends.legacy:BuildBackend"
```

- [ ] Install: `pip install -e ".[dev]"` (inside `.venv`)
- [ ] Update `PYTHON_PATH` in `.env` to point to `.venv` python binary

#### 0.11 — Java Environment

- [x] Confirm JDK ≥ 17: `java -version`, `javac -version`
- [] Review `java-module/compile.sh` — understand what it does:

```bash
#!/bin/bash
mkdir -p build
javac -d build src/LogFormat.java src/ParseResult.java src/LogParser.java src/HashScanner.java
echo "Compilation complete"
```

- [ ] Run `compile.sh` (or equivalent on Windows with `javac`)
- [ ] Verify `.class` files appear in `java-module/build/`

### Deliverables

- Git repo with clean structure, `.gitignore`, `CHANGELOG.md`
- Apache vhost serving `frontend/` at root, `api/` at `/api`
- Composer installed with PSR-4 autoloading configured
- `api/config/Environment.php`, `Database.php`, `Cors.php`
- `api/helpers/Response.php`, `Validator.php`
- `api/index.php` Front Controller with basic routing skeleton
- `python-module/pyproject.toml` (replacing `requirements.txt`)
- Java module compiling without errors

### Validation Criteria

- [ ] `http://helix.local` → serves `frontend/index.html`
- [ ] `http://helix.local/api` → JSON response (not HTML)
- [ ] `http://helix.local/api/nonexistent` → `{"success":false,"error":"Route not found"}`
- [ ] `composer dump-autoload` runs without errors
- [ ] Python: `python -c "import sklearn; print('OK')"` inside `.venv`
- [ ] Java: `javac` compiles all source files
- [ ] Git log shows meaningful commits

### Common Mistakes to Avoid

- ❌ Skipping the Apache Alias directive — frontend won't be able to call `/api/*`
- ❌ Committing `.env` — real credentials must stay out of git
- ❌ Keeping `requirements.txt` — you decided to use `pyproject.toml`
- ❌ Not setting up PSR-4 autoloading — you'll write manual `require` statements everywhere
- ❌ Writing route logic directly in `api/index.php` instead of dispatching to controllers

---

## PHASE 1 — Architecture Design, Database Schema & UML

> **Why this comes before coding:** You already have `.puml` diagram files. This phase is about validating them, locking the database schema, and mapping every SRS requirement to a concrete implementation path. Changing the schema after writing 5 models is expensive.

### Objective

Finalize and validate the complete database schema, UML diagrams, API contract, and traceability matrix. Nothing functional gets built in this phase — only design artifacts.

### Learning Goals

- Understand relational database normalization (1NF, 2NF, 3NF)
- Understand how to derive a schema from use cases and actors
- Understand REST API contract-first design
- Understand what each UML diagram type communicates and to whom

### Key Theoretical Concepts

- **Entity-Relationship vs Class Diagram:** ER models data; Class models code structure
- **Foreign key CASCADE rules:** `ON DELETE CASCADE` vs `ON DELETE SET NULL` — when to use each
- **ENUM vs lookup table:** ENUMs are fast and sufficient for a PoC; lookup tables scale better
- **REST resource naming:** `/alerts` not `/getAlerts`; `/alerts/{id}/status` not `/updateAlertStatus`
- **HTTP status codes:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error

### Practical Tasks

#### 1.1 — Database Schema

`database/schema.sql` — finalize all tables before writing a single model:

```sql
CREATE DATABASE IF NOT EXISTS helix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helix_db;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('administrator','blue_team','red_team','purple_team','learner') NOT NULL,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP    NULL
);

CREATE TABLE log_entries (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    filename    VARCHAR(255),
    source_ip   VARCHAR(45),
    timestamp   TIMESTAMP    NOT NULL,
    severity    ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
    event_type  VARCHAR(100),
    message     TEXT         NOT NULL,
    raw_line    TEXT,
    ingested_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ingested_by INT          NULL,
    FOREIGN KEY (ingested_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE anomaly_scores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    log_entry_id  INT   NOT NULL,
    score         FLOAT NOT NULL,
    severity_label ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    computed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id) REFERENCES log_entries(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    log_entry_id     INT  NULL,
    anomaly_score_id INT  NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    severity         ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    status           ENUM('open','investigating','resolved') DEFAULT 'open',
    assigned_to      INT  NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id)     REFERENCES log_entries(id)    ON DELETE SET NULL,
    FOREIGN KEY (anomaly_score_id) REFERENCES anomaly_scores(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to)      REFERENCES users(id)          ON DELETE SET NULL
);

CREATE TABLE chat_sessions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT  NOT NULL,
    alert_id     INT  NULL,
    message_role ENUM('user','assistant') NOT NULL,
    content      TEXT NOT NULL,
    sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL
);

CREATE TABLE scan_results (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    performed_by INT NOT NULL,
    target       VARCHAR(255) NOT NULL,
    port         INT NOT NULL,
    protocol     VARCHAR(10),
    status       ENUM('open','closed','filtered') NOT NULL,
    scanned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);
```

- [ ] Verify schema matches your `er_diagram.puml`
- [ ] Import: `mysql -u helix_user -p helix_db < database/schema.sql`
- [ ] Confirm all 6 tables appear in phpMyAdmin

**Note on migrations:** Your `database/migrations/001_add_anomaly_score.sql` already exists. This tells me the schema evolved. From now on, every schema change after the initial import must be a new migration file: `002_`, `003_`, etc. Never re-edit `schema.sql` to fix an existing column — add a migration.

#### 1.2 — API Route Contract

Document every route in `docs/SDD/API_REFERENCE.md`. For each route define: method, path, required role, request body, success response, error responses.

**Complete route table:**

| Method | Path                | Controller.Method            | Required Role       | FR     |
| ------ | ------------------- | ---------------------------- | ------------------- | ------ |
| POST   | /auth/register      | AuthController.register      | public              | FR-007 |
| POST   | /auth/login         | AuthController.login         | public              | FR-001 |
| POST   | /auth/logout        | AuthController.logout        | any authenticated   | FR-005 |
| GET    | /auth/me            | AuthController.me            | any authenticated   | FR-003 |
| GET    | /dashboard/stats    | DashboardController.stats    | any authenticated   | FR-010 |
| POST   | /logs/upload        | LogController.upload         | admin, blue, purple | FR-020 |
| GET    | /logs               | LogController.index          | any authenticated   | FR-022 |
| GET    | /logs/{id}          | LogController.show           | any authenticated   | FR-023 |
| GET    | /alerts             | AlertController.index        | any authenticated   | FR-030 |
| GET    | /alerts/{id}        | AlertController.show         | any authenticated   | FR-034 |
| PUT    | /alerts/{id}/status | AlertController.updateStatus | admin, blue, purple | FR-033 |
| POST   | /ml/score           | MLController.score           | administrator       | FR-040 |
| GET    | /ml/scores          | MLController.index           | any authenticated   | FR-044 |
| POST   | /ai/chat            | AIController.chat            | any authenticated   | FR-050 |
| GET    | /ai/history         | AIController.history         | any authenticated   | FR-053 |
| POST   | /scanner/scan       | ScannerController.scan       | admin, red, purple  | FR-060 |
| GET    | /scanner/results    | ScannerController.results    | admin, red, purple  | FR-062 |

- [ ] Add this table to `docs/SDD/API_REFERENCE.md`
- [ ] Add every route to your `api/index.php` routing table (as empty stubs for now)

#### 1.3 — UML Diagram Validation

You already have `.puml` files. This task is about reviewing them for correctness:

- [ ] `use_case.puml` — Does it show all 7 actors (A0–A7)? Are `<<extend>>` / `<<include>>` used correctly?
- [ ] `er_diagram.puml` — Does it match `schema.sql` exactly? Check column names, types, FK arrows
- [ ] `class_services.puml` — Does it show Controller → Service → Model relationships?
- [ ] `sequence_auth.puml` — Does it show: browser → index.php → AuthMiddleware → AuthController → AuthService → User model → MySQL?
- [ ] `sequence_log_ingest.puml` — Does it show the pipeline: upload → LogService → JavaBridge → LogParser → LogEntry model → MLService trigger?
- [ ] `sequence_ai_chat.puml` — Does it show: AIController → AIService → OpenAI API → ChatSession model?
- [ ] `component.puml` — Does it show: Browser, Apache (frontend + api), PHP (controllers/services/models), Python ML, Java module, MySQL?
- [ ] `activity_alert.puml` — Does it show the full alert lifecycle: log ingested → scored → alert created → triaged → resolved?

Export all diagrams as PNG into `docs/UML/png/`.

#### 1.4 — SRS Traceability Matrix

`docs/traceability_matrix.md`:

| FR ID  | Description           | Route            | Controller.Method    | DB Table | Status |
| ------ | --------------------- | ---------------- | -------------------- | -------- | ------ |
| FR-001 | Login                 | POST /auth/login | AuthController.login | users    | [ ]    |
| FR-002 | Failed login handling | POST /auth/login | AuthController.login | users    | [ ]    |
| FR-003 | Session persistence   | GET /auth/me     | AuthController.me    | users    | [ ]    |
| ...    | ...                   | ...              | ...                  | ...      | ...    |

- [ ] Map every FR-001 to FR-063 to a route, controller method, and DB table
- [ ] This matrix is your implementation checklist — check FRs off as you build

#### 1.5 — Seed File

`database/seed.sql`:

```sql
-- Admin user (password: Admin@1234)
-- Generate hash: php -r "echo password_hash('Admin@1234', PASSWORD_BCRYPT, ['cost'=>12]);"
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@helix.local', '$2y$12$GENERATED_HASH_HERE', 'administrator'),
('blue1', 'blue@helix.local',  '$2y$12$GENERATED_HASH_HERE', 'blue_team'),
('red1',  'red@helix.local',   '$2y$12$GENERATED_HASH_HERE', 'red_team');
```

- [ ] Generate real bcrypt hashes and update seed.sql
- [ ] Import: `mysql -u helix_user -p helix_db < database/seed.sql`

### Deliverables

- `database/schema.sql` — final, importable, 6 tables
- `docs/SDD/API_REFERENCE.md` — complete route contract
- All UML diagrams validated and exported to PNG
- `docs/traceability_matrix.md` — all FRs mapped
- `database/seed.sql` — 3 test users

### Validation Criteria

- [ ] Schema imports without error
- [ ] All 6 tables visible in phpMyAdmin
- [ ] All UML diagrams reviewed and corrected
- [ ] All FR-001 to FR-063 appear in traceability matrix
- [ ] All routes registered as stubs in `api/index.php`
- [ ] Git commit: `docs: finalize schema, API contract, UML and traceability matrix`

### Common Mistakes to Avoid

- ❌ Editing `schema.sql` after first import instead of creating a migration
- ❌ Skipping the traceability matrix — you will lose track of which FRs are done
- ❌ Routes in `api/index.php` pointing to non-existent controller methods (causes autoload errors)
- ❌ UML diagrams that don't match the actual code structure

---

## PHASE 2 — Authentication Module (FR-001 to FR-007)

> **Why this comes before all other modules:** Every other feature is gated behind authentication. You cannot build role-based features without a working session system. Auth is also your highest-security concern — if it's broken, everything built on it is insecure.

### Objective

Implement the complete authentication flow: register, login, logout, session validation — with bcrypt hashing, PHP sessions, and role middleware enforcing access control on every protected route.

### Learning Goals

- Understand bcrypt and why password hashing ≠ encryption
- Understand PHP session security: `session_regenerate_id()`, cookie flags
- Understand the difference between Authentication (who are you?) and Authorization (what can you do?)
- Understand how middleware chains work in a Front Controller pattern

### Key Theoretical Concepts

- **bcrypt cost factor:** Each increment doubles computation time — cost 12 is ~300ms, which is too slow to brute-force
- **Session fixation attack:** Why `session_regenerate_id(true)` is mandatory after login
- **HttpOnly cookie flag:** Prevents JavaScript from reading the session cookie (XSS protection)
- **SameSite=Strict:** Prevents the browser from sending the cookie on cross-site requests (CSRF protection)
- **Generic error messages:** "Invalid credentials" — never "User not found" or "Wrong password"

### Practical Tasks

#### 2.1 — Auth Middleware

`api/middleware/AuthMiddleware.php`:

```php
<?php
namespace App\Middleware;

use App\Helpers\Response;

class AuthMiddleware
{
    public static function handle(): void
    {
        self::startSecureSession();

        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized();
        }
    }

    public static function startSecureSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', '1');
            ini_set('session.cookie_samesite', 'Strict');
            ini_set('session.gc_maxlifetime', (string)($_ENV['SESSION_LIFETIME'] ?? 3600));
            session_start();
        }
    }

    public static function currentUser(): array
    {
        return [
            'id'   => $_SESSION['user_id']   ?? null,
            'role' => $_SESSION['user_role'] ?? null,
        ];
    }
}
```

`api/middleware/RoleMiddleware.php`:

```php
<?php
namespace App\Middleware;

use App\Helpers\Response;

class RoleMiddleware
{
    public static function require(array $allowedRoles): void
    {
        AuthMiddleware::handle(); // Auth check first

        $userRole = $_SESSION['user_role'] ?? '';

        if (!in_array($userRole, $allowedRoles, true)) {
            Response::forbidden();
        }
    }
}
```

#### 2.2 — User Model

`api/models/User.php`:

```php
<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class User
{
    public static function findByUsername(string $username): ?array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(string $username, string $email, string $passwordHash, string $role = 'learner'): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$username, $email, $passwordHash, $role]);
        return (int) $db->lastInsertId();
    }

    public static function updateLastLogin(int $id): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
        $stmt->execute([$id]);
    }

    public static function emailOrUsernameExists(string $username, string $email): bool
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
        $stmt->execute([$username, $email]);
        return (bool) $stmt->fetch();
    }
}
```

#### 2.3 — Auth Service

`api/services/AuthService.php`:

```php
<?php
namespace App\Services;

use App\Models\User;
use App\Middleware\AuthMiddleware;

class AuthService
{
    public function register(array $data): array
    {
        if (User::emailOrUsernameExists($data['username'], $data['email'])) {
            return ['error' => 'Username or email already exists', 'code' => 409];
        }

        $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $id   = User::create($data['username'], $data['email'], $hash);

        return ['user_id' => $id];
    }

    public function login(string $username, string $password): array
    {
        $user = User::findByUsername($username);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['error' => 'Invalid credentials', 'code' => 401];
        }

        AuthMiddleware::startSecureSession();
        session_regenerate_id(true); // Prevent session fixation

        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        User::updateLastLogin($user['id']);

        return [
            'user' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role'],
            ]
        ];
    }

    public function logout(): void
    {
        AuthMiddleware::startSecureSession();
        $_SESSION = [];
        session_destroy();
    }

    public function currentUser(): ?array
    {
        $id = $_SESSION['user_id'] ?? null;
        return $id ? User::findById((int)$id) : null;
    }
}
```

#### 2.4 — Auth Controller

`api/controllers/AuthController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\AuthService;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Helpers\Validator;

class AuthController
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService();
    }

    public function register(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $v = (new Validator())
            ->required('username', $body['username'] ?? '')
            ->required('email', $body['email'] ?? '')
            ->required('password', $body['password'] ?? '')
            ->email('email', $body['email'] ?? '')
            ->minLength('password', $body['password'] ?? '', 8);

        if (!$v->passes()) {
            Response::error(json_encode($v->errors()), 422);
        }

        $result = $this->service->register($body);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success($result, 'Account created', 201);
    }

    public function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $result = $this->service->login(
            $body['username'] ?? '',
            $body['password'] ?? ''
        );

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success($result['user'], 'Login successful');
    }

    public function logout(): void
    {
        AuthMiddleware::handle();
        $this->service->logout();
        Response::success(null, 'Logged out');
    }

    public function me(): void
    {
        AuthMiddleware::handle();
        $user = $this->service->currentUser();

        if (!$user) {
            Response::unauthorized();
        }

        Response::success($user);
    }
}
```

#### 2.5 — Register Auth Routes

In `api/index.php`, add to the routes array:

```php
use App\Controllers\AuthController;

$routes['POST']['/auth/register'] = [AuthController::class, 'register'];
$routes['POST']['/auth/login']    = [AuthController::class, 'login'];
$routes['POST']['/auth/logout']   = [AuthController::class, 'logout'];
$routes['GET']['/auth/me']        = [AuthController::class, 'me'];
```

#### 2.6 — Frontend: Login Page

`frontend/login.html` — already exists in your tree. Build it now:

- HTML form: username + password fields
- No page refresh — use JavaScript `fetch()`

`frontend/js/auth.js`:

```javascript
async function login(username, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Send session cookie
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.success) {
    // Store role for client-side nav rendering (not for security)
    sessionStorage.setItem("userRole", data.data.role);
    window.location.href = "/dashboard.html";
  } else {
    showError(data.error);
  }
}
```

`frontend/js/api.js` — the shared API client module:

```javascript
const API_BASE = "/api";

async function apiFetch(path, options = {}) {
  const defaults = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  const res = await fetch(`${API_BASE}${path}`, { ...defaults, ...options });

  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  return await res.json();
}

// Named exports for each module to use
const api = {
  get: (path) => apiFetch(path),
  post: (path, body) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) =>
    apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
};
```

**Why `credentials: 'include'`:** Without this, the browser won't send the session cookie with cross-path requests. This is the most common cause of "keeps logging me out" bugs.

#### 2.7 — Auth Tests

`tests/php/AuthServiceTest.php` (PHPUnit):

```php
<?php
namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\AuthService;

class AuthServiceTest extends TestCase
{
    public function test_register_returns_user_id(): void
    {
        // Use a test database or mock Database
        $this->markTestIncomplete('Requires test DB setup');
    }

    public function test_login_returns_error_on_wrong_password(): void
    {
        $service = new AuthService();
        $result  = $this->invokeMethod($service, 'validateCredentials', ['nonexistent', 'wrongpass']);
        $this->assertArrayHasKey('error', $result);
    }

    // Helper to test private methods
    private function invokeMethod(object $obj, string $method, array $args = []): mixed
    {
        $ref = new \ReflectionMethod($obj, $method);
        $ref->setAccessible(true);
        return $ref->invokeArgs($obj, $args);
    }
}
```

#### 2.8 — Manual Test Checklist

`tests/manual/auth_tests.md`:

- [ ] POST `/api/auth/register` valid data → 201, user_id returned
- [ ] POST `/api/auth/register` duplicate username → 409
- [ ] POST `/api/auth/register` invalid email → 422
- [ ] POST `/api/auth/login` valid credentials → 200, role returned, cookie set
- [ ] POST `/api/auth/login` wrong password → 401, "Invalid credentials" (not "Wrong password")
- [ ] GET `/api/auth/me` with cookie → 200, user data
- [ ] GET `/api/auth/me` without cookie → 401
- [ ] POST `/api/auth/logout` → 200, cookie destroyed
- [ ] GET `/api/auth/me` after logout → 401
- [ ] Test route requiring admin role as learner → 403

Test all using Postman or Insomnia — configure "Send cookies" option.

### Deliverables

- `api/middleware/AuthMiddleware.php`, `RoleMiddleware.php`
- `api/models/User.php`
- `api/services/AuthService.php`
- `api/controllers/AuthController.php`
- `frontend/login.html` functional form
- `frontend/js/auth.js`, `frontend/js/api.js`
- Auth routes registered in `api/index.php`
- `tests/manual/auth_tests.md` all checks passing

### Validation Criteria

- [ ] FR-001 to FR-007 checked in traceability matrix
- [ ] Passwords stored as bcrypt (verify in phpMyAdmin — hash starts with `$2y$`)
- [ ] Wrong password returns same error message as non-existent user
- [ ] `session_regenerate_id(true)` called on every login
- [ ] Frontend redirects to login on 401 (handled in `api.js`)
- [ ] Git commit: `feat(auth): implement authentication, RBAC middleware, login frontend`

### Common Mistakes to Avoid

- ❌ Checking roles only in the frontend JavaScript — always enforce in `RoleMiddleware`
- ❌ Returning "User not found" vs "Wrong password" separately — merge into one message
- ❌ Forgetting `credentials: 'include'` in every `fetch()` call — session cookie won't be sent
- ❌ Using `md5()` or `sha1()` for passwords
- ❌ Not calling `session_regenerate_id()` — session fixation vulnerability

---

## PHASE 3 — Dashboard Module (FR-010 to FR-014)

> **Why now:** The dashboard is the shell of the application — the first page after login. Building it now, even with placeholder data, establishes the UI framework, client-side router, and nav structure that all subsequent modules will plug into.

### Objective

Build the dashboard frontend shell (with routing), implement the stats API endpoint, and render security metrics with Chart.js. Use placeholder/zero data for sections not yet implemented.

### Learning Goals

- Understand client-side routing without a framework (`router.js`)
- Understand the HTML5 History API (`pushState`, `popstate`)
- Understand Chart.js configuration and data binding
- Understand role-based UI rendering in JavaScript

### Key Theoretical Concepts

- **SPA routing:** The browser loads one HTML page; JavaScript swaps content based on URL without full page reload
- **`history.pushState()`:** Changes the URL without navigating — the foundation of client-side routing
- **Dashboard as aggregation endpoint:** The dashboard API doesn't own data; it queries multiple tables and returns a summary
- **Graceful empty states:** Your dashboard must not crash when the DB is empty (it will be during early development)

### Practical Tasks

#### 3.1 — Client-Side Router

`frontend/js/router.js`:

```javascript
const routes = {
  "/dashboard": () => import("./dashboard.js").then((m) => m.render()),
  "/logs": () => import("./logs.js").then((m) => m.render()),
  "/alerts": () => import("./alerts.js").then((m) => m.render()),
  "/ai": () => import("./chat.js").then((m) => m.render()),
  "/scanner": () => import("./scanner.js").then((m) => m.render()),
};

async function navigate(path) {
  const handler = routes[path];

  if (!handler) {
    document.getElementById("app").innerHTML = "<h2>404 — Page not found</h2>";
    return;
  }

  history.pushState({}, "", path);
  document.getElementById("app").innerHTML =
    '<div class="loading">Loading...</div>';
  await handler();
}

// Handle browser back/forward
window.addEventListener("popstate", () => navigate(location.pathname));

// Intercept nav link clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-route]");
  if (link) {
    e.preventDefault();
    navigate(link.dataset.route);
  }
});

export { navigate };
```

#### 3.2 — Dashboard Shell

`frontend/dashboard.html` — the single page that everything renders into:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HELIX — Dashboard</title>
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="stylesheet" href="/css/dashboard.css" />
  </head>
  <body>
    <div id="layout">
      <nav id="sidebar">
        <!-- Role-aware links populated by ui.js -->
      </nav>
      <main id="app">
        <!-- Router swaps content here -->
      </main>
    </div>
    <script type="module" src="/js/ui.js"></script>
    <script type="module" src="/js/router.js"></script>
  </body>
</html>
```

`frontend/js/ui.js` — builds the sidebar based on user role:

```javascript
import { navigate } from "./router.js";

const roleNavMap = {
  administrator: ["/dashboard", "/logs", "/alerts", "/ai", "/scanner"],
  blue_team: ["/dashboard", "/logs", "/alerts", "/ai"],
  red_team: ["/dashboard", "/scanner", "/ai"],
  purple_team: ["/dashboard", "/logs", "/alerts", "/ai", "/scanner"],
  learner: ["/dashboard", "/ai"],
};

async function initUI() {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) {
    window.location.href = "/login.html";
    return;
  }

  const { data: user } = await res.json();
  const allowedPaths = roleNavMap[user.role] ?? [];

  buildSidebar(allowedPaths, user);
  navigate("/dashboard"); // Initial route
}

function buildSidebar(paths, user) {
  const labels = {
    "/dashboard": "Dashboard",
    "/logs": "Logs",
    "/alerts": "Alerts",
    "/ai": "AI Assistant",
    "/scanner": "Scanner",
  };
  const nav = document.getElementById("sidebar");
  nav.innerHTML =
    paths
      .map((p) => `<a data-route="${p}" href="${p}">${labels[p]}</a>`)
      .join("") + `<button id="logout-btn">Logout (${user.username})</button>`;

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login.html";
  });
}

initUI();
```

#### 3.3 — Dashboard Stats Endpoint

`api/controllers/DashboardController.php`:

```php
<?php
namespace App\Controllers;

use App\Config\Database;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;

class DashboardController
{
    public function stats(): void
    {
        AuthMiddleware::handle();
        $db = Database::getInstance();

        // Alerts by severity
        $alertsBySeverity = $db->query(
            "SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity"
        )->fetchAll();

        // Total log entries
        $logCount = $db->query("SELECT COUNT(*) as count FROM log_entries")->fetch()['count'];

        // Avg anomaly score
        $avgScore = $db->query("SELECT ROUND(AVG(score), 4) as avg FROM anomaly_scores")->fetch()['avg'] ?? 0;

        // Alert trend: last 7 days
        $trend = $db->query(
            "SELECT DATE(created_at) as date, COUNT(*) as count
             FROM alerts
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        )->fetchAll();

        // Open alerts count
        $openAlerts = $db->query(
            "SELECT COUNT(*) as count FROM alerts WHERE status = 'open'"
        )->fetch()['count'];

        Response::success([
            'alerts_by_severity' => $alertsBySeverity,
            'log_count'          => (int) $logCount,
            'avg_anomaly_score'  => (float) $avgScore,
            'alert_trend'        => $trend,
            'open_alerts'        => (int) $openAlerts,
        ]);
    }
}
```

Register route in `api/index.php`:

```php
$routes['GET']['/dashboard/stats'] = [DashboardController::class, 'stats'];
```

#### 3.4 — Dashboard Frontend Module

`frontend/js/dashboard.js`:

```javascript
import { api } from "./api.js";

export async function render() {
  const { data } = await api.get("/dashboard/stats");

  document.getElementById("app").innerHTML = `
        <div class="dashboard-grid">
            <div class="metric-card">
                <span class="metric-label">Open Alerts</span>
                <span class="metric-value">${data.open_alerts}</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Total Logs</span>
                <span class="metric-value">${data.log_count}</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Avg Anomaly Score</span>
                <span class="metric-value">${data.avg_anomaly_score}</span>
            </div>
            <canvas id="severity-chart"></canvas>
            <canvas id="trend-chart"></canvas>
        </div>
    `;

  renderSeverityChart(data.alerts_by_severity);
  renderTrendChart(data.alert_trend);
}

function renderSeverityChart(data) {
  const ctx = document.getElementById("severity-chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((d) => d.severity),
      datasets: [
        {
          label: "Alerts by Severity",
          data: data.map((d) => d.count),
          backgroundColor: ["#16a34a", "#ca8a04", "#ea580c", "#dc2626"],
        },
      ],
    },
  });
}
```

Add Chart.js to `frontend/dashboard.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### 3.5 — CSS Design System

`frontend/css/main.css` — define CSS variables for the entire app:

```css
:root {
  --severity-critical: #dc2626;
  --severity-high: #ea580c;
  --severity-medium: #ca8a04;
  --severity-low: #16a34a;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: #38bdf8;
  --border: #334155;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, sans-serif;
}
```

### Deliverables

- `frontend/js/router.js` — client-side routing
- `frontend/js/ui.js` — role-aware sidebar
- `frontend/dashboard.html` — app shell
- `api/controllers/DashboardController.php`
- `frontend/js/dashboard.js` with Chart.js charts
- `frontend/css/main.css` with design system variables

### Validation Criteria

- [ ] FR-010 to FR-014 checked in traceability matrix
- [ ] Dashboard loads in < 2s with 0 or 1000+ logs
- [ ] Empty DB → shows zeros, no PHP errors, no JS crashes
- [ ] Sidebar shows correct links per role (test with admin, learner, red_team accounts)
- [ ] Browser back/forward buttons work with client-side router
- [ ] Git commit: `feat(dashboard): implement dashboard shell, routing, and stats endpoint`

### Common Mistakes to Avoid

- ❌ Building the layout only for admin and forgetting other roles
- ❌ Fetching stats directly inside `dashboard.html` (mix of concerns) — use `dashboard.js`
- ❌ Not handling empty SQL results (AVG on empty table returns NULL → shows as blank)
- ❌ Forgetting `credentials: 'include'` on the `/auth/me` call in `ui.js` — sidebar won't render

---

## PHASE 4 — Log Ingestion Module (FR-020 to FR-024)

> **Why now:** Logs are the primary data input for every downstream feature. ML scoring, alerts, and dashboard stats all depend on log data. This phase builds the pipeline: upload → Java parse → validate → store → trigger ML.

### Objective

Implement file upload, Java-assisted parsing, validation, batch storage, and ML scoring trigger for CSV and TXT log files.

### Learning Goals

- Understand PHP file upload security (`$_FILES`, MIME validation, size limits)
- Understand how `JavaBridge.php` invokes the Java module safely via `shell_exec`
- Understand the roles of `LogParser.java`, `LogFormat.java`, and `ParseResult.java`
- Understand batch INSERT vs row-by-row INSERT (performance difference)

### Key Theoretical Concepts

- **MIME validation:** Never trust `$_FILES['type']` — it's client-supplied. Use PHP's `finfo` to inspect the actual file
- **Java module design:** `LogFormat` defines the schema, `LogParser` implements parsing, `ParseResult` is the data transfer object. This is the Strategy + DTO pattern
- **`escapeshellarg()`:** The only safe way to pass user-influenced values to shell commands
- **Batch INSERT:** `INSERT INTO t VALUES (...), (...), (...)` is ~50× faster than 500 individual INSERTs

### Practical Tasks

#### 4.1 — Java Bridge Service

`api/services/JavaBridge.php`:

```php
<?php
namespace App\Services;

use App\Config\Environment;
use RuntimeException;

class JavaBridge
{
    private string $buildPath;

    public function __construct()
    {
        $this->buildPath = Environment::get('JAVA_BUILD_PATH', 'java-module/build');
    }

    public function parseLogFile(string $filePath): array
    {
        $classPath  = escapeshellarg($this->buildPath);
        $fileArg    = escapeshellarg($filePath);
        $cmd        = "java -cp {$classPath} LogParser {$fileArg} 2>&1";

        $output     = shell_exec($cmd);

        if ($output === null) {
            throw new RuntimeException('Java process failed to execute');
        }

        // Java outputs JSON: [{"timestamp":"...","source_ip":"...","severity":"...","event_type":"...","message":"..."}]
        $entries = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JavaBridge parse error: " . $output);
            throw new RuntimeException('Java returned invalid JSON: ' . substr($output, 0, 200));
        }

        return $entries;
    }
}
```

**What the Java side must output:** `LogParser.java` should print a JSON array to stdout. Each element is a `ParseResult` object serialized as JSON. This is the contract between PHP and Java.

Update `java-module/src/LogParser.java` to output JSON via `System.out.println(jsonArray)`.

#### 4.2 — Log Entry Model

`api/models/LogEntry.php`:

```php
<?php
namespace App\Models;

use App\Config\Database;

class LogEntry
{
    public static function batchInsert(array $entries, int $userId): int
    {
        if (empty($entries)) return 0;

        $db          = Database::getInstance();
        $placeholders = implode(',', array_fill(0, count($entries), '(?,?,?,?,?,?,?)'));

        $stmt = $db->prepare(
            "INSERT INTO log_entries (filename, source_ip, timestamp, severity, event_type, message, ingested_by)
             VALUES {$placeholders}"
        );

        $params = [];
        foreach ($entries as $e) {
            $params[] = $e['filename']   ?? null;
            $params[] = $e['source_ip']  ?? null;
            $params[] = $e['timestamp']  ?? date('Y-m-d H:i:s');
            $params[] = strtoupper($e['severity'] ?? 'LOW');
            $params[] = $e['event_type'] ?? 'generic';
            $params[] = $e['message']    ?? '';
            $params[] = $userId;
        }

        $stmt->execute($params);
        return (int) $db->lastInsertId();
    }

    public static function paginate(int $page = 1, int $perPage = 20, ?string $severity = null): array
    {
        $db     = Database::getInstance();
        $offset = ($page - 1) * $perPage;
        $where  = $severity ? "WHERE severity = " . $db->quote($severity) : '';

        $rows  = $db->query("SELECT * FROM log_entries {$where} ORDER BY ingested_at DESC LIMIT {$perPage} OFFSET {$offset}")->fetchAll();
        $total = $db->query("SELECT COUNT(*) as c FROM log_entries {$where}")->fetch()['c'];

        return ['data' => $rows, 'total' => (int)$total, 'page' => $page, 'per_page' => $perPage];
    }
}
```

#### 4.3 — Log Service

`api/services/LogService.php`:

```php
<?php
namespace App\Services;

use App\Models\LogEntry;

class LogService
{
    private JavaBridge $java;

    public function __construct()
    {
        $this->java = new JavaBridge();
    }

    public function ingestFile(array $fileInfo, int $userId): array
    {
        $this->validateUpload($fileInfo);

        $tmpPath = $fileInfo['tmp_name'];
        $entries = $this->java->parseLogFile($tmpPath);

        // Tag each entry with the original filename
        $filename = basename($fileInfo['name']);
        foreach ($entries as &$e) {
            $e['filename'] = $filename;
        }

        LogEntry::batchInsert($entries, $userId);

        return ['processed' => count($entries)];
    }

    private function validateUpload(array $fileInfo): void
    {
        if ($fileInfo['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Upload error code: ' . $fileInfo['error']);
        }

        $maxSize = 5 * 1024 * 1024; // 5 MB (NFR-003)
        if ($fileInfo['size'] > $maxSize) {
            throw new \InvalidArgumentException('File exceeds 5 MB limit');
        }

        // MIME validation — never trust $_FILES['type']
        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mime     = $finfo->file($fileInfo['tmp_name']);
        $allowed  = ['text/plain', 'text/csv', 'application/csv'];

        if (!in_array($mime, $allowed, true)) {
            throw new \InvalidArgumentException("Unsupported file type: {$mime}");
        }
    }
}
```

#### 4.4 — Log Controller

`api/controllers/LogController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\LogService;
use App\Services\MLService;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\LogEntry;
use App\Helpers\Response;

class LogController
{
    private LogService $service;

    public function __construct()
    {
        $this->service = new LogService();
    }

    public function upload(): void
    {
        RoleMiddleware::require(['administrator', 'blue_team', 'purple_team']);

        $user = AuthMiddleware::currentUser();

        if (empty($_FILES['logfile'])) {
            Response::error('No file uploaded', 400);
        }

        try {
            $result = $this->service->ingestFile($_FILES['logfile'], $user['id']);

            // Trigger ML scoring asynchronously (stub for now)
            // MLService::triggerScoring();

            Response::success($result, 'Log file processed', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            Response::error('Processing failed', 500);
        }
    }

    public function index(): void
    {
        AuthMiddleware::handle();
        $page     = (int) ($_GET['page'] ?? 1);
        $severity = $_GET['severity'] ?? null;
        Response::success(LogEntry::paginate($page, 20, $severity));
    }

    public function show(): void
    {
        AuthMiddleware::handle();
        // Implement single log entry retrieval
    }
}
```

Register routes in `api/index.php`:

```php
$routes['POST']['/logs/upload'] = [LogController::class, 'upload'];
$routes['GET']['/logs']         = [LogController::class, 'index'];
$routes['GET']['/logs/{id}']    = [LogController::class, 'show'];
```

#### 4.5 — Frontend: Log Upload

`frontend/js/logs.js`:

```javascript
import { api } from "./api.js";

export async function render() {
  document.getElementById("app").innerHTML = `
        <div class="page-header"><h1>Log Ingestion</h1></div>
        <div class="upload-zone">
            <input type="file" id="log-file" accept=".csv,.txt">
            <button id="upload-btn">Upload Log File</button>
            <div id="upload-status"></div>
        </div>
        <div id="log-table-container"></div>
    `;

  document.getElementById("upload-btn").addEventListener("click", uploadLog);
  loadLogs();
}

async function uploadLog() {
  const file = document.getElementById("log-file").files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("logfile", file);

  const res = await fetch("/api/logs/upload", {
    method: "POST",
    credentials: "include",
    body: formData, // No Content-Type header — browser sets it with boundary
  });

  const data = await res.json();
  document.getElementById("upload-status").textContent = data.success
    ? `✓ Processed ${data.data.processed} entries`
    : `✗ ${data.error}`;

  if (data.success) loadLogs();
}

async function loadLogs() {
  const { data } = await api.get("/logs?page=1");
  // Render log table
}
```

**Important:** When uploading files with `FormData`, do NOT set `Content-Type: application/json` — the browser handles the multipart boundary automatically.

#### 4.6 — Sample Log Files

`tests/sample_logs/sample_access.csv`:

```
timestamp,source_ip,severity,event_type,message
2025-05-01 14:32:01,192.168.1.100,HIGH,failed_login,Failed SSH login attempt - 5 retries
2025-05-01 14:32:45,10.0.0.5,LOW,access,Successful login
...
```

- [ ] Create 50-row CSV covering all severity levels
- [ ] Create 50-line TXT log file
- [ ] Create malformed CSV to test error handling

### Deliverables

- `api/services/JavaBridge.php`
- `api/services/LogService.php`
- `api/models/LogEntry.php`
- `api/controllers/LogController.php`
- `java-module/src/LogParser.java` outputting JSON to stdout
- `frontend/js/logs.js`
- `tests/sample_logs/` with test files

### Validation Criteria

- [ ] FR-020 to FR-024 checked in traceability matrix
- [ ] Upload 50-row CSV → all rows appear in `log_entries` table
- [ ] File > 5 MB → rejected with 422
- [ ] Non-CSV/TXT file → rejected with 422
- [ ] Malformed rows → skipped, valid rows inserted
- [ ] `LogParser.java` outputs valid JSON that PHP can `json_decode`
- [ ] Git commit: `feat(logs): implement log ingestion with Java parser bridge`

### Common Mistakes to Avoid

- ❌ Trusting `$_FILES['type']` for MIME validation
- ❌ Inserting log entries one-by-one in a loop (use batch INSERT)
- ❌ Setting `Content-Type: application/json` when uploading files with FormData
- ❌ Not `escapeshellarg()`-ing every argument passed to the Java process

---

## PHASE 5 — Alert Module (FR-030 to FR-034)

> **Why now:** Alerts are generated from log scoring. Before building the ML scorer (Phase 6), you need the alert table, model, and UI ready to receive data. This also validates your alert schema before ML populates it automatically.

### Objective

Build complete alert management: list with filtering, detail view, status updates, and color-coded severity display.

### Learning Goals

- Understand alert lifecycle management (open → investigating → resolved)
- Understand SQL filtering with dynamic WHERE clauses
- Understand optimistic UI updates

### Key Theoretical Concepts

- **Dynamic SQL with PDO:** Building WHERE clauses safely when filters are optional
- **HTTP PUT vs PATCH:** PUT replaces a resource entirely; PATCH modifies specific fields — use PUT for status updates since you send the full replacement value
- **Role enforcement on write operations:** Read = any authenticated; Write = restricted roles

### Practical Tasks

#### 5.1 — Alert Model

`api/models/Alert.php`:

```php
<?php
namespace App\Models;

use App\Config\Database;

class Alert
{
    public static function filter(array $params): array
    {
        $db     = Database::getInstance();
        $where  = ['1=1'];
        $values = [];

        if (!empty($params['severity'])) {
            $where[]  = 'severity = ?';
            $values[] = $params['severity'];
        }
        if (!empty($params['status'])) {
            $where[]  = 'status = ?';
            $values[] = $params['status'];
        }
        if (!empty($params['from'])) {
            $where[]  = 'created_at >= ?';
            $values[] = $params['from'];
        }
        if (!empty($params['to'])) {
            $where[]  = 'created_at <= ?';
            $values[] = $params['to'];
        }

        $page   = max(1, (int)($params['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;
        $sql    = 'SELECT * FROM alerts WHERE ' . implode(' AND ', $where) .
                  ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        $values[] = $limit;
        $values[] = $offset;

        $stmt = $db->prepare($sql);
        $stmt->execute($values);

        return $stmt->fetchAll();
    }

    public static function findWithContext(int $id): ?array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT a.*, l.message as log_message, l.source_ip,
                    s.score as anomaly_score
             FROM alerts a
             LEFT JOIN log_entries l   ON a.log_entry_id = l.id
             LEFT JOIN anomaly_scores s ON a.anomaly_score_id = s.id
             WHERE a.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function updateStatus(int $id, string $status): bool
    {
        $allowed = ['open', 'investigating', 'resolved'];
        if (!in_array($status, $allowed, true)) return false;

        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE alerts SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        return $stmt->rowCount() > 0;
    }
}
```

#### 5.2 — Alert Service

`api/services/AlertService.php`:

```php
<?php
namespace App\Services;

use App\Models\Alert;

class AlertService
{
    public function list(array $filters): array
    {
        return Alert::filter($filters);
    }

    public function get(int $id): ?array
    {
        return Alert::findWithContext($id);
    }

    public function updateStatus(int $id, string $status): bool
    {
        return Alert::updateStatus($id, $status);
    }
}
```

#### 5.3 — Alert Controller

`api/controllers/AlertController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\AlertService;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Helpers\Response;

class AlertController
{
    private AlertService $service;

    public function __construct()
    {
        $this->service = new AlertService();
    }

    public function index(): void
    {
        AuthMiddleware::handle();
        Response::success($this->service->list($_GET));
    }

    public function show(): void
    {
        AuthMiddleware::handle();
        $id    = (int)($_GET['id'] ?? 0);
        $alert = $this->service->get($id);
        $alert ? Response::success($alert) : Response::error('Alert not found', 404);
    }

    public function updateStatus(): void
    {
        RoleMiddleware::require(['administrator', 'blue_team', 'purple_team']);

        $id   = (int)($_GET['id'] ?? 0);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $updated = $this->service->updateStatus($id, $body['status'] ?? '');
        $updated ? Response::success(null, 'Status updated') : Response::error('Update failed', 400);
    }
}
```

#### 5.4 — Frontend: Alerts

`frontend/js/alerts.js`:

```javascript
import { api } from "./api.js";

const SEVERITY_COLORS = {
  CRITICAL: "var(--severity-critical)",
  HIGH: "var(--severity-high)",
  MEDIUM: "var(--severity-medium)",
  LOW: "var(--severity-low)",
};

export async function render() {
  document.getElementById("app").innerHTML = `
        <div class="page-header"><h1>Alerts</h1></div>
        <div class="filter-bar">
            <select id="filter-severity">
                <option value="">All Severities</option>
                <option>CRITICAL</option><option>HIGH</option>
                <option>MEDIUM</option><option>LOW</option>
            </select>
            <select id="filter-status">
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
            </select>
            <button id="apply-filters">Filter</button>
        </div>
        <div id="alert-list"></div>
    `;

  document
    .getElementById("apply-filters")
    .addEventListener("click", loadAlerts);
  loadAlerts();
}

async function loadAlerts() {
  const severity = document.getElementById("filter-severity").value;
  const status = document.getElementById("filter-status").value;
  const params = new URLSearchParams({ severity, status }).toString();

  const { data } = await api.get(`/alerts?${params}`);
  const container = document.getElementById("alert-list");

  container.innerHTML =
    data
      .map(
        (a) => `
        <div class="alert-card">
            <span class="badge" style="background:${SEVERITY_COLORS[a.severity]}">${a.severity}</span>
            <span class="alert-title">${a.title}</span>
            <span class="alert-status">${a.status}</span>
            <button onclick="openDetail(${a.id})">View</button>
        </div>
    `,
      )
      .join("") || '<p class="empty">No alerts found.</p>';
}
```

#### 5.5 — Seed Alert Data

`database/seed.sql` — add to existing seed:

```sql
INSERT INTO alerts (title, description, severity, status) VALUES
('Brute Force Detected', 'Multiple failed login attempts from 192.168.1.100', 'CRITICAL', 'open'),
('Port Scan Activity', 'Sequential port probing detected', 'HIGH', 'investigating'),
('Unusual Login Time', 'Login at 3:14 AM outside business hours', 'MEDIUM', 'open'),
('Failed Auth Spike', '47 failed authentications in 5 minutes', 'HIGH', 'open');
```

### Deliverables

- `api/models/Alert.php`, `api/services/AlertService.php`, `api/controllers/AlertController.php`
- `frontend/js/alerts.js` with filtering and severity badges
- Alert routes registered in `api/index.php`
- Seed data inserted

### Validation Criteria

- [ ] FR-030 to FR-034 checked in traceability matrix
- [ ] Filtering by severity + status returns correct subsets
- [ ] Learner can view alerts but receives 403 on status update
- [ ] Alert detail returns joined log message and anomaly score (even if null)
- [ ] Color badges match SRS severity specification
- [ ] Git commit: `feat(alerts): implement alert management module`

---

## PHASE 6 — ML Anomaly Detection Module (FR-040 to FR-044)

> **Why now:** Log data and alert UI are both ready. The ML pipeline reads logs, writes anomaly scores, and auto-creates alerts — completing the data flow from raw log to actionable alert.

### Objective

Implement an Isolation Forest pipeline in Python that scores log entries, stores results, and triggers alert creation for HIGH/CRITICAL anomalies.

### Learning Goals

- Understand Isolation Forest algorithm intuitively
- Understand feature engineering from raw log data
- Understand how PHP invokes Python safely via `MLService.php`
- Understand Python module structure with `config.py` and `db_connector.py`

### Key Theoretical Concepts

- **Isolation Forest:** Anomalies are isolated faster in random trees because they are rare and "different"
- **Feature engineering:** Isolation Forest requires numerical vectors — not raw text
- **`contamination` parameter:** Expected fraction of anomalies in training data (0.05–0.15 for security logs)
- **Score mapping:** scikit-learn's `decision_function` returns values where more negative = more anomalous
- **`joblib` persistence:** Serialize trained model to disk — avoid retraining on every call

### Practical Tasks

#### 6.1 — Python Module Config

`python-module/config.py`:

```python
import os

DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'helix_db')
DB_USER = os.environ.get('DB_USER', 'helix_user')
DB_PASS = os.environ.get('DB_PASS', '')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'isolation_forest.joblib')
```

`python-module/db_connector.py`:

```python
import mysql.connector
from config import DB_HOST, DB_NAME, DB_USER, DB_PASS

def get_connection():
    return mysql.connector.connect(
        host=DB_HOST, database=DB_NAME,
        user=DB_USER, password=DB_PASS
    )

def fetch_unscored_logs(limit: int = 500) -> list[dict]:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT l.* FROM log_entries l
        LEFT JOIN anomaly_scores s ON s.log_entry_id = l.id
        WHERE s.id IS NULL
        LIMIT %s
    """, (limit,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return rows

def save_scores(scores: list[dict]) -> None:
    if not scores: return
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.executemany(
        "INSERT INTO anomaly_scores (log_entry_id, score, severity_label) VALUES (%s, %s, %s)",
        [(s['log_entry_id'], s['score'], s['severity_label']) for s in scores]
    )
    conn.commit()
    cursor.close(); conn.close()
```

#### 6.2 — Feature Engineering

`python-module/feature_engineering.py`:

```python
import pandas as pd
from datetime import datetime

SEVERITY_MAP = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3}

def extract_features(logs: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(logs)

    if df.empty:
        return df

    df['timestamp']      = pd.to_datetime(df['timestamp'], errors='coerce')
    df['hour_of_day']    = df['timestamp'].dt.hour
    df['severity_num']   = df['severity'].map(SEVERITY_MAP).fillna(0)
    df['msg_length']     = df['message'].str.len().fillna(0)
    df['has_ip']         = df['source_ip'].notna().astype(int)

    features = ['hour_of_day', 'severity_num', 'msg_length', 'has_ip']
    return df[features].fillna(0)
```

#### 6.3 — Anomaly Detector

`python-module/anomaly_detector.py`:

```python
import sys
import os
import json
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

import config
from db_connector import fetch_unscored_logs, save_scores
from feature_engineering import extract_features

def score_to_severity(raw_score: float) -> str:
    if raw_score < -0.5:  return 'CRITICAL'
    if raw_score < -0.2:  return 'HIGH'
    if raw_score <  0.0:  return 'MEDIUM'
    return 'LOW'

def load_or_train_model(X):
    os.makedirs(os.path.dirname(config.MODEL_PATH), exist_ok=True)
    try:
        return joblib.load(config.MODEL_PATH)
    except FileNotFoundError:
        model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        model.fit(X)
        joblib.dump(model, config.MODEL_PATH)
        return model

def main():
    logs = fetch_unscored_logs(limit=500)

    if not logs:
        print(json.dumps({'status': 'SUCCESS', 'scored': 0}))
        return

    X     = extract_features(logs)
    model = load_or_train_model(X)
    raw   = model.decision_function(X)

    scores = []
    for i, log in enumerate(logs):
        scores.append({
            'log_entry_id':  log['id'],
            'score':         float(raw[i]),
            'severity_label': score_to_severity(float(raw[i]))
        })

    save_scores(scores)

    print(json.dumps({'status': 'SUCCESS', 'scored': len(scores)}))

if __name__ == '__main__':
    main()
```

- [ ] Test standalone: `python anomaly_detector.py` → `{"status": "SUCCESS", "scored": N}`

#### 6.4 — ML Service (PHP)

`api/services/MLService.php`:

```php
<?php
namespace App\Services;

use App\Config\Environment;
use RuntimeException;

class MLService
{
    public function triggerScoring(): array
    {
        $python = Environment::get('PYTHON_PATH');
        $script = Environment::get('PYTHON_SCRIPT');

        if (!$python || !$script) {
            throw new RuntimeException('Python path or script not configured');
        }

        $cmd    = escapeshellcmd($python) . ' ' . escapeshellarg($script) . ' 2>&1';
        $output = shell_exec($cmd);

        $result = json_decode($output ?? '', true);

        if (!$result || $result['status'] !== 'SUCCESS') {
            error_log("ML scoring failed: " . $output);
            throw new RuntimeException('ML scoring failed');
        }

        return $result;
    }
}
```

#### 6.5 — ML Controller

`api/controllers/MLController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\MLService;
use App\Middleware\RoleMiddleware;
use App\Helpers\Response;

class MLController
{
    public function score(): void
    {
        RoleMiddleware::require(['administrator']);

        try {
            $result = (new MLService())->triggerScoring();
            Response::success($result, 'Scoring complete');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function index(): void
    {
        // Return anomaly scores — implement with AnomalyScore model
    }
}
```

#### 6.6 — Update pyproject.toml

```toml
[project.dependencies]
scikit-learn = ">=1.3.0"
pandas = ">=2.0.0"
numpy = ">=1.24.0"
joblib = ">=1.3.0"
mysql-connector-python = ">=8.0.0"
```

Reinstall: `pip install -e ".[dev]"`

#### 6.7 — Python Tests

`tests/python/test_detector.py`:

```python
import pytest
import sys
sys.path.insert(0, 'python-module')

from feature_engineering import extract_features

def test_extract_features_returns_correct_shape():
    logs = [
        {'timestamp': '2025-05-01 14:00:00', 'severity': 'HIGH',
         'message': 'Failed login', 'source_ip': '192.168.1.1'}
    ]
    df = extract_features(logs)
    assert len(df) == 1
    assert 'severity_num' in df.columns
    assert 'hour_of_day' in df.columns

def test_empty_logs_returns_empty_dataframe():
    df = extract_features([])
    assert df.empty
```

Run: `pytest tests/python/`

### Deliverables

- `python-module/config.py`, `db_connector.py`, `feature_engineering.py`, `anomaly_detector.py`
- `api/services/MLService.php`, `api/controllers/MLController.php`
- `tests/python/test_detector.py` passing
- Updated `pyproject.toml`
- `python-module/models/` directory (gitignored `.joblib` files)

### Validation Criteria

- [ ] FR-040 to FR-044 checked in traceability matrix
- [ ] `python anomaly_detector.py` runs standalone → scores appear in DB
- [ ] POST `/api/ml/score` (as admin) → triggers scoring → returns count
- [ ] HIGH/CRITICAL anomalies trigger alert creation
- [ ] `pytest tests/python/` all tests pass
- [ ] Git commit: `feat(ml): implement Isolation Forest anomaly detection pipeline`

### Common Mistakes to Avoid

- ❌ Passing raw text to Isolation Forest — it only accepts numerical features
- ❌ Retraining the model every invocation — load from `joblib` if it exists
- ❌ Not handling empty log table — `fetch_unscored_logs()` returns `[]`, not an error
- ❌ Not setting `DB_PASS` env variable before running Python — connector silently fails

---

## PHASE 7 — AI Assistant Module (FR-050 to FR-054)

> **Why now:** The AI assistant analyzes alerts with full context: log message, anomaly score, severity. Both are now populated. The AI becomes useful only when it has real data to reference.

### Objective

Build a role-aware chat interface backed by the OpenAI API with conversation history, contextual alert analysis, and prompt engineering tailored to each user role.

### Learning Goals

- Understand OpenAI Chat Completions API (messages array, roles, max_tokens)
- Understand prompt engineering: system prompt, context injection, role adaptation
- Understand why the API key must never appear in frontend code
- Understand token budget management

### Key Theoretical Concepts

- **System prompt:** Sets AI persona and constraints before the conversation starts
- **Context injection:** Embed the alert's structured data in the prompt — without it the AI is generic
- **API key security:** Key lives only in `.env` → read by `Environment.php` → used only in `AIService.php`. It never reaches the browser
- **Token limits:** `gpt-4o-mini` supports ~128K tokens but billing is per token — be concise in prompts

### Practical Tasks

#### 7.1 — Chat Session Model

`api/models/ChatSession.php`:

```php
<?php
namespace App\Models;

use App\Config\Database;

class ChatSession
{
    public static function save(int $userId, ?int $alertId, string $role, string $content): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO chat_sessions (user_id, alert_id, message_role, content) VALUES (?,?,?,?)'
        );
        $stmt->execute([$userId, $alertId, $role, $content]);
        return (int) $db->lastInsertId();
    }

    public static function history(int $userId, ?int $alertId = null): array
    {
        $db     = Database::getInstance();
        $where  = $alertId ? 'AND alert_id = ?' : '';
        $params = $alertId ? [$userId, $alertId] : [$userId];
        $stmt   = $db->prepare(
            "SELECT message_role as role, content FROM chat_sessions
             WHERE user_id = ? {$where} ORDER BY sent_at ASC LIMIT 50"
        );
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
```

#### 7.2 — AI Service

`api/services/AIService.php`:

```php
<?php
namespace App\Services;

use App\Config\Environment;
use App\Models\ChatSession;
use App\Config\Database;
use RuntimeException;

class AIService
{
    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = Environment::get('OPENAI_API_KEY', '');
    }

    public function chat(int $userId, string $userRole, ?int $alertId, string $userMessage): string
    {
        $alertContext = $alertId ? $this->loadAlertContext($alertId) : '';
        $history      = ChatSession::history($userId, $alertId);

        $messages = [
            ['role' => 'system', 'content' => $this->buildSystemPrompt($userRole, $alertContext)],
            ...$history,
            ['role' => 'user', 'content' => $userMessage],
        ];

        $reply = $this->callOpenAI($messages);

        // Persist both messages
        ChatSession::save($userId, $alertId, 'user',      $userMessage);
        ChatSession::save($userId, $alertId, 'assistant', $reply);

        return $reply;
    }

    private function buildSystemPrompt(string $role, string $context): string
    {
        $base = "You are HELIX-AI, a cybersecurity assistant embedded in the HELIX SOC platform.";

        $roleInstructions = match($role) {
            'learner'      => "Explain concepts simply. Define technical terms. Be educational and patient.",
            'blue_team'    => "Provide SOC analyst guidance. Suggest triage steps and remediation actions.",
            'red_team'     => "Explain offensive techniques, detection methods, and evasion considerations.",
            'purple_team'  => "Correlate offensive techniques with defensive gaps. Suggest detection improvements.",
            'administrator'=> "Provide full technical analysis including system impact and platform recommendations.",
            default        => "Provide clear security guidance."
        };

        return $base . "\n" . $roleInstructions . ($context ? "\n\n" . $context : '');
    }

    private function loadAlertContext(int $alertId): string
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT a.title, a.severity, a.status, a.description,
                    l.message as log_message, l.source_ip,
                    s.score as anomaly_score
             FROM alerts a
             LEFT JOIN log_entries l   ON a.log_entry_id = l.id
             LEFT JOIN anomaly_scores s ON a.anomaly_score_id = s.id
             WHERE a.id = ?"
        );
        $stmt->execute([$alertId]);
        $alert = $stmt->fetch();

        if (!$alert) return '';

        return sprintf(
            "ALERT CONTEXT:\n- Title: %s\n- Severity: %s\n- Status: %s\n- Description: %s\n- Log: %s\n- Source IP: %s\n- Anomaly score: %s",
            $alert['title'], $alert['severity'], $alert['status'],
            $alert['description'], $alert['log_message'] ?? 'N/A',
            $alert['source_ip'] ?? 'N/A', $alert['anomaly_score'] ?? 'N/A'
        );
    }

    private function callOpenAI(array $messages): string
    {
        $payload = json_encode([
            'model'      => 'gpt-4o-mini',
            'messages'   => $messages,
            'max_tokens' => 500,
        ]);

        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT        => 15,
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new RuntimeException("OpenAI API returned HTTP {$httpCode}");
        }

        $data = json_decode($response, true);
        return $data['choices'][0]['message']['content'] ?? 'No response generated.';
    }
}
```

#### 7.3 — AI Controller

`api/controllers/AIController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\AIService;
use App\Models\ChatSession;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;

class AIController
{
    public function chat(): void
    {
        AuthMiddleware::handle();
        $user = AuthMiddleware::currentUser();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['message'])) {
            Response::error('Message is required', 422);
        }

        try {
            $reply = (new AIService())->chat(
                $user['id'],
                $user['role'],
                isset($body['alert_id']) ? (int)$body['alert_id'] : null,
                $body['message']
            );
            Response::success(['reply' => $reply]);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            Response::error('AI service unavailable', 503);
        }
    }

    public function history(): void
    {
        AuthMiddleware::handle();
        $user    = AuthMiddleware::currentUser();
        $alertId = isset($_GET['alert_id']) ? (int)$_GET['alert_id'] : null;
        Response::success(ChatSession::history($user['id'], $alertId));
    }
}
```

#### 7.4 — Frontend: AI Chat

`frontend/js/chat.js`:

```javascript
import { api } from "./api.js";

export async function render() {
  document.getElementById("app").innerHTML = `
        <div class="chat-layout">
            <div class="chat-controls">
                <select id="alert-selector">
                    <option value="">General question</option>
                </select>
            </div>
            <div id="chat-messages" class="chat-window"></div>
            <div class="chat-input-row">
                <input type="text" id="chat-input" placeholder="Ask HELIX-AI...">
                <button id="send-btn">Send</button>
            </div>
        </div>
    `;

  await loadAlertOptions();
  await loadHistory();

  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document.getElementById("chat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

async function sendMessage() {
  const message = document.getElementById("chat-input").value.trim();
  const alertId = document.getElementById("alert-selector").value || null;

  if (!message) return;

  appendMessage("user", message);
  document.getElementById("chat-input").value = "";
  appendMessage("assistant", "⏳ Analyzing...");

  const { data } = await api.post("/ai/chat", {
    message,
    alert_id: alertId ? +alertId : null,
  });

  // Replace loading indicator with real reply
  const msgs = document.querySelectorAll(".msg-assistant");
  msgs[msgs.length - 1].textContent = data.reply;
}

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message msg-${role}`;
  div.textContent = text;
  document.getElementById("chat-messages").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}
```

### Deliverables

- `api/services/AIService.php` with role-based system prompts
- `api/models/ChatSession.php`
- `api/controllers/AIController.php`
- `frontend/js/chat.js` chat interface
- `OPENAI_API_KEY` in `.env` (never in code)

### Validation Criteria

- [ ] FR-050 to FR-054 checked in traceability matrix
- [ ] API key is NOT visible in page source or network tab
- [ ] Learner role receives simplified response; Blue Team receives SOC-level guidance
- [ ] Conversation history persists within the session
- [ ] AI response returns in < 8 seconds (NFR-004)
- [ ] Git commit: `feat(ai): implement AI assistant with OpenAI integration`

### Common Mistakes to Avoid

- ❌ Calling OpenAI API from JavaScript (exposes your API key to anyone using DevTools)
- ❌ Not storing history — the model loses all context every message
- ❌ Not handling `curl_exec` returning `false` (timeout or network error)
- ❌ Using `gpt-4` when `gpt-4o-mini` handles this use case and costs 20× less

---

## PHASE 8 — Scanner Module (FR-060 to FR-063)

> **Why now:** The scanner is the most security-sensitive module. It uses `JavaBridge` (already learned in Phase 4), requires strict role enforcement (auth is rock-solid from Phase 2), and is independent of the log/alert/ML pipeline. Building it last among feature modules is deliberate.

### Objective

Implement a controlled port scanner and hash scanner using the Java module, with result persistence and audit trail.

### Learning Goals

- Understand how `HashScanner.java` and `LogParser.java` serve different purposes from the same Java module
- Understand why every scan must be persisted (regulatory audit trail)
- Understand input validation for network targets (IP + hostname validation)

### Key Theoretical Concepts

- **TCP port states:** Open (SYN-ACK received), Closed (RST received), Filtered (no response)
- **Hash scanner use case:** Compare file hashes against known malicious hashes — common IOC technique
- **Audit trail:** Every scan, by every user, at every timestamp, must be recorded — this is a compliance requirement
- **`escapeshellarg()` is non-negotiable:** User inputs a target IP — this must never reach `shell_exec()` raw

### Practical Tasks

#### 8.1 — Java Module Review

Your `java-module/src/` already contains:

- `HashScanner.java` — compares file hashes against a known-bad list
- `LogParser.java` — parses log files (used in Phase 4)
- `LogFormat.java` — log format definition
- `ParseResult.java` — DTO for parsed results

For the scanner module, you will primarily use `HashScanner.java`. Review it:

- [ ] Understand its input format (command-line arguments)
- [ ] Understand its output format (ensure it's JSON to stdout)
- [ ] Update `compile.sh` if needed to compile all Java files
- [ ] Test: `java -cp build HashScanner <test-input>` → verify output

#### 8.2 — Scanner Service

`api/services/ScannerService.php`:

```php
<?php
namespace App\Services;

use App\Models\ScanResult;

class ScannerService
{
    private JavaBridge $java;

    public function __construct()
    {
        $this->java = new JavaBridge();
    }

    public function portScan(string $target, string $portRange, int $userId): array
    {
        $this->validateTarget($target);
        $this->validatePortRange($portRange);

        $results = $this->java->runPortScan($target, $portRange);

        // Persist every result — audit trail
        ScanResult::batchInsert($results, $target, $userId);

        return $results;
    }

    public function hashScan(string $filePath, int $userId): array
    {
        $results = $this->java->runHashScan($filePath);
        return $results;
    }

    private function validateTarget(string $target): void
    {
        if (!filter_var($target, FILTER_VALIDATE_IP) && !$this->isValidHostname($target)) {
            throw new \InvalidArgumentException("Invalid target: {$target}");
        }
    }

    private function validatePortRange(string $range): void
    {
        if (!preg_match('/^\d+(-\d+)?$/', $range)) {
            throw new \InvalidArgumentException("Invalid port range: {$range}");
        }
    }

    private function isValidHostname(string $h): bool
    {
        return (bool) preg_match('/^[a-zA-Z0-9][a-zA-Z0-9\-.]{0,253}[a-zA-Z0-9]$/', $h);
    }
}
```

Add `runPortScan()` and `runHashScan()` methods to `api/services/JavaBridge.php`.

#### 8.3 — Scan Result Model

`api/models/ScanResult.php`:

```php
<?php
namespace App\Models;

use App\Config\Database;

class ScanResult
{
    public static function batchInsert(array $results, string $target, int $userId): void
    {
        if (empty($results)) return;

        $db           = Database::getInstance();
        $placeholders = implode(',', array_fill(0, count($results), '(?,?,?,?,?)'));
        $stmt         = $db->prepare(
            "INSERT INTO scan_results (performed_by, target, port, protocol, status) VALUES {$placeholders}"
        );

        $params = [];
        foreach ($results as $r) {
            $params[] = $userId;
            $params[] = $target;
            $params[] = $r['port'];
            $params[] = $r['protocol'] ?? 'tcp';
            $params[] = $r['status'];
        }

        $stmt->execute($params);
    }

    public static function history(int $userId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT target, scanned_at, COUNT(*) as total_ports,
                    SUM(status = 'open') as open_ports
             FROM scan_results WHERE performed_by = ?
             GROUP BY target, scanned_at ORDER BY scanned_at DESC LIMIT 50"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}
```

#### 8.4 — Scanner Controller

`api/controllers/ScannerController.php`:

```php
<?php
namespace App\Controllers;

use App\Services\ScannerService;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\ScanResult;
use App\Helpers\Response;

class ScannerController
{
    private ScannerService $service;

    public function __construct()
    {
        $this->service = new ScannerService();
    }

    public function scan(): void
    {
        RoleMiddleware::require(['administrator', 'red_team', 'purple_team']);

        $user = AuthMiddleware::currentUser();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $results = $this->service->portScan(
                $body['target']     ?? '',
                $body['port_range'] ?? '1-1024',
                $user['id']
            );
            Response::success(['results' => $results, 'count' => count($results)]);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            Response::error('Scan failed', 500);
        }
    }

    public function results(): void
    {
        RoleMiddleware::require(['administrator', 'red_team', 'purple_team']);
        $user = AuthMiddleware::currentUser();
        Response::success(ScanResult::history($user['id']));
    }
}
```

#### 8.5 — Frontend: Scanner

`frontend/js/scanner.js`:

```javascript
import { api } from "./api.js";

export async function render() {
  document.getElementById("app").innerHTML = `
        <div class="page-header">
            <h1>Red Team Scanner</h1>
            <div class="warning-banner">⚠ Only scan systems you are authorized to test</div>
        </div>
        <div class="scan-form">
            <input type="text" id="scan-target" placeholder="Target IP or hostname">
            <input type="text" id="port-range"  placeholder="Port range (e.g. 1-1024)" value="1-1024">
            <button id="scan-btn">Run Scan</button>
        </div>
        <div id="scan-results"></div>
        <h2>Scan History</h2>
        <div id="scan-history"></div>
    `;

  document.getElementById("scan-btn").addEventListener("click", runScan);
  loadHistory();
}

async function runScan() {
  const target = document.getElementById("scan-target").value;
  const portRange = document.getElementById("port-range").value;

  document.getElementById("scan-results").innerHTML = "<p>Scanning...</p>";

  const { data, error } = await api.post("/scanner/scan", {
    target,
    port_range: portRange,
  });

  if (error) {
    document.getElementById("scan-results").innerHTML =
      `<p class="error">${error}</p>`;
    return;
  }

  const openPorts = data.results.filter((r) => r.status === "open");
  document.getElementById("scan-results").innerHTML = `
        <p>${data.count} ports scanned · ${openPorts.length} open</p>
        ${openPorts.map((r) => `<div class="port-open">${r.port}/tcp — OPEN</div>`).join("")}
    `;

  loadHistory();
}
```

### Deliverables

- `api/services/ScannerService.php` with target validation
- `api/services/JavaBridge.php` extended with `runPortScan()`, `runHashScan()`
- `api/models/ScanResult.php`
- `api/controllers/ScannerController.php`
- `frontend/js/scanner.js`
- Java module updated and recompiled

### Validation Criteria

- [ ] FR-060 to FR-063 checked in traceability matrix
- [ ] Blue Team + Learner roles receive 403 on scanner endpoints
- [ ] Invalid IP/hostname rejected before Java invocation
- [ ] Scan results persisted in `scan_results` table
- [ ] Scan history endpoint returns grouped results by target
- [ ] Git commit: `feat(scanner): implement port and hash scanner with Java module`

---

## PHASE 9 — Integration Testing, Debugging & SRS Compliance Audit

> **Why a dedicated phase:** Each module was tested in isolation. This phase verifies that all modules work together, that the complete user journey succeeds end-to-end, and that every SRS requirement is implemented. This is the quality gate before Docker.

### Objective

Execute full end-to-end test scenarios for all 5 actor types, audit every SRS FR and NFR, fix all bugs, and clean the codebase.

### Practical Tasks

#### 9.1 — PHPUnit Test Suite

`tests/php/AuthServiceTest.php`, `LogServiceTest.php`, `ValidatorTest.php` — already scaffolded. Complete them now:

```bash
./vendor/bin/phpunit tests/php/
```

Focus on:

- `ValidatorTest.php`: test required, email, minLength rules with valid and invalid input
- `AuthServiceTest.php`: test login returns error on bad credentials
- `LogServiceTest.php`: test file validation rejects oversized/wrong-type files

#### 9.2 — Python Test Suite

```bash
cd python-module
pytest ../tests/python/ -v
```

Add tests for:

- `test_feature_engineering.py`: feature extraction produces correct columns and shapes
- `test_score_mapping.py`: score thresholds map to correct severity labels

#### 9.3 — End-to-End Scenarios

`tests/manual/e2e_scenarios.md`:

**Scenario A — Blue Team Full Flow:**

1. [ ] Login as blue_team → dashboard visible
2. [ ] Upload CSV log → entries appear in logs page
3. [ ] Trigger ML scoring (admin) → scores appear
4. [ ] View alerts → HIGH/CRITICAL alerts visible
5. [ ] Filter by severity CRITICAL
6. [ ] Update alert status to "investigating"
7. [ ] Open AI assistant → select alert → ask "What does this mean?"
8. [ ] Verify SOC-analyst-level response
9. [ ] Try accessing `/api/scanner/scan` → 403

**Scenario B — Red Team:**

1. [ ] Login as red_team → dashboard + scanner visible; logs/alerts not in nav
2. [ ] Run port scan on `127.0.0.1`, ports `80-90`
3. [ ] Verify results appear
4. [ ] Verify scan persisted in scan_results table
5. [ ] Try accessing `/api/alerts` → 200 (read-only access) ✓
6. [ ] Try updating alert status → 403 ✓

**Scenario C — Learner:**

1. [ ] Login as learner → dashboard + AI only
2. [ ] Ask AI a general question → educational response
3. [ ] Try `/api/scanner/scan` → 403
4. [ ] Try `/api/logs/upload` → 403

**Scenario D — Role Boundary Attacks:**

1. [ ] Without session: GET `/api/alerts` → 401
2. [ ] Without session: POST `/api/auth/login` with wrong password → 401 (same message as wrong user)
3. [ ] As learner: POST `/api/ml/score` → 403
4. [ ] SQL injection in login username: `' OR '1'='1` → 401 (prepared statements prevent bypass)

#### 9.4 — Performance Validation

| Test                     | Target | Method                            |
| ------------------------ | ------ | --------------------------------- |
| Dashboard load           | < 2s   | Browser DevTools Network tab      |
| ML scoring (500 entries) | < 5s   | Time `python anomaly_detector.py` |
| File upload (5 MB CSV)   | < 10s  | Browser DevTools                  |
| AI response              | < 8s   | Browser DevTools                  |

#### 9.5 — SRS Compliance Audit

`docs/srs_compliance_report.md`:

| FR     | Description  | Status | Notes                 |
| ------ | ------------ | ------ | --------------------- |
| FR-001 | Login        | ✅     |                       |
| FR-002 | Failed login | ✅     | Generic error message |
| ...    | ...          | ...    | ...                   |

Mark every FR-001 to FR-063 as ✅ Implemented, ⚠ Partial, or ❌ Missing.

#### 9.6 — Codebase Cleanup

- [ ] Remove all `var_dump()`, `print_r()`, `echo` debug statements
- [ ] Remove all `console.log()` debug statements from JS
- [ ] Add `declare(strict_types=1);` to every PHP file
- [ ] Verify all API responses use `Response::success()` or `Response::error()` — no raw `echo`
- [ ] Verify all DB queries go through Model classes — no raw SQL in controllers
- [ ] Verify `JavaBridge.php` uses `escapeshellarg()` on every argument
- [ ] Update `CHANGELOG.md`

#### 9.7 — Git Final Cleanup

- [ ] Merge all `feature/*` branches into `dev`
- [ ] Ensure `dev` passes all tests
- [ ] Merge `dev` → `main`
- [ ] Tag: `git tag v1.0.0-poc`
- [ ] Push all branches and tags

### Deliverables

- `tests/php/` — all PHPUnit tests passing
- `tests/python/` — all pytest tests passing
- `tests/manual/e2e_scenarios.md` — all scenarios documented and passing
- `docs/srs_compliance_report.md` — all FRs audited
- `main` branch tagged `v1.0.0-poc`

### Validation Criteria

- [ ] All three E2E scenarios pass without errors
- [ ] All FR-001 to FR-063 marked ✅
- [ ] All NFR performance benchmarks met
- [ ] Zero HIGH priority open bugs
- [ ] PHPUnit and pytest both exit with 0 failures
- [ ] Git: clean history, no debug commits, meaningful messages

---

## PHASE 10 — Containerization & Deployment (Docker)

> **Why this comes last:** Docker packages the application — it does not fix it. A broken application in a container is still a broken application. You containerize after the PoC passes all integration tests.

### Objective

Containerize HELIX using Docker and docker-compose, enabling one-command deployment on any machine.

### Learning Goals

- Understand Docker image layers and caching
- Understand docker-compose service orchestration
- Understand how environment variables replace `.env` files in production
- Understand volume mounts for persistent MySQL data

### Key Theoretical Concepts

- **Image vs container:** Image is a template; container is a running instance
- **Multi-service compose:** Each process (Apache/PHP, MySQL) gets its own container
- **Volume mounts:** MySQL data lives in a named volume — not lost when container restarts
- **`depends_on`:** Container start order — web waits for db to be ready

### Practical Tasks

#### 10.1 — PHP/Apache Dockerfile

`docker/php/Dockerfile`:

```dockerfile
FROM php:8.2-apache

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# System tools needed
RUN apt-get update && apt-get install -y \
    curl \
    default-jdk \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache mod_rewrite for routing
RUN a2enmod rewrite

# Copy application
WORKDIR /var/www/html
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Python dependencies
RUN cd python-module && pip3 install -e . --break-system-packages

# Compile Java
RUN cd java-module && bash compile.sh

# Apache config
COPY docker/apache/helix.conf /etc/apache2/sites-available/000-default.conf
```

`docker/apache/helix.conf`:

```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html/frontend

    Alias /api /var/www/html/api

    <Directory /var/www/html/frontend>
        AllowOverride All
        Require all granted
    </Directory>

    <Directory /var/www/html/api>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### 10.2 — docker-compose.yml

```yaml
version: "3.9"

services:
  web:
    build: .
    dockerfile: docker/php/Dockerfile
    ports:
      - "8080:80"
    environment:
      DB_HOST: db
      DB_NAME: helix_db
      DB_USER: helix_user
      DB_PASS: ${DB_PASS}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SESSION_LIFETIME: 3600
      PYTHON_PATH: python3
      PYTHON_SCRIPT: python-module/anomaly_detector.py
      JAVA_BUILD_PATH: java-module/build
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/var/www/html/uploads

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: helix_db
      MYSQL_USER: helix_user
      MYSQL_PASSWORD: ${DB_PASS}
      MYSQL_ROOT_PASSWORD: ${ROOT_PASS}
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02_seed.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
  uploads:
```

#### 10.3 — Environment for Docker

`.env.example` (update from Phase 0):

```
DB_PASS=
ROOT_PASS=
OPENAI_API_KEY=
```

`api/config/Environment.php` already reads `$_ENV` — docker-compose injects these as environment variables automatically. No changes needed to PHP code.

#### 10.4 — Build and Verify

```bash
docker-compose build
docker-compose up -d
```

- [ ] `http://localhost:8080` → HELIX login page
- [ ] `http://localhost:8080/api/auth/me` → 401 (API responding)
- [ ] Login with seeded admin user → dashboard loads
- [ ] Run E2E Scenario A inside Docker deployment
- [ ] `docker-compose down && docker-compose up -d` → data persists (volume working)

#### 10.5 — README Final Update

`README.md`:

```markdown
## Quick Start (Docker)

1. `git clone <repo>`
2. `cp api/config/.env.example api/config/.env`
3. Edit `.env` with your values
4. `docker-compose up -d`
5. Open `http://localhost:8080`

## Development (XAMPP)

1. Configure Apache vhost (see docs/ARCHITECTURE.md)
2. Import `database/schema.sql` and `database/seed.sql`
3. `composer install`
4. `cd python-module && pip install -e ".[dev]"`
5. `cd java-module && bash compile.sh`
6. Open `http://helix.local`
```

### Deliverables

- `docker/php/Dockerfile`
- `docker/apache/helix.conf`
- `docker-compose.yml`
- `.env.example` updated
- `README.md` with both XAMPP and Docker setup instructions
- Application running end-to-end in Docker

---

## Global Project Progression Map

```
Phase 0         Phase 1          Phase 2         Phase 3
Environment  →  Architecture  →  Auth &       →  Dashboard
& Tooling       & DB Design      RBAC             Shell + Routing
[FOUNDATION]    [DESIGN]         [SECURITY]       [UI FRAME]

Phase 4         Phase 5          Phase 6         Phase 7
Log          →  Alert         →  ML            →  AI
Ingestion       Management       Detection        Assistant
[DATA IN]       [DISPLAY]        [INTELLIGENCE]   [GUIDANCE]

Phase 8         Phase 9          Phase 10
Scanner      →  Integration   →  Docker
Module          Testing &        & Deploy
[RED TEAM]      Audit            [SHIP IT]
```

---

## Phase Dependencies Summary

| Phase | Strict Dependency | Why                                                 |
| ----- | ----------------- | --------------------------------------------------- |
| 0     | —                 | Foundation for everything                           |
| 1     | 0                 | Schema before any model                             |
| 2     | 1                 | Auth uses `users` table; middleware needed by all   |
| 3     | 2                 | Dashboard requires session; router is UI foundation |
| 4     | 3                 | Log data is input for ML + alerts                   |
| 5     | 4                 | Alerts reference log entries                        |
| 6     | 4, 5              | ML reads logs, writes scores, creates alerts        |
| 7     | 5, 6              | AI needs alerts + anomaly scores for context        |
| 8     | 2, 4              | Scanner uses JavaBridge (Phase 4) + auth (Phase 2)  |
| 9     | 2–8               | Tests all modules together                          |
| 10    | 9                 | Containerize only stable application                |

**Parallelizable after Phase 4:**

- Phase 5 (Alerts) and Phase 6 (ML) can overlap
- Phase 7 (AI) and Phase 8 (Scanner) can overlap

---

## Definition of Done — HELIX PoC

### Functional Completeness

- [ ] All 7 modules implemented (Auth, Dashboard, Logs, Alerts, ML, AI, Scanner)
- [ ] All FR-001 to FR-063 marked ✅ in `docs/srs_compliance_report.md`
- [ ] All 5 actor roles tested: administrator, blue_team, red_team, purple_team, learner
- [ ] Role enforcement returns 403 — tested by direct API calls
- [ ] Full pipeline works: log upload → ML scoring → alert creation → AI analysis
- [ ] Port scanner returns and persists results

### Non-Functional Completeness

- [ ] Dashboard load < 2s (NFR-001)
- [ ] ML scoring < 5s for 500 entries (NFR-002)
- [ ] File upload < 10s for 5 MB (NFR-003)
- [ ] AI response < 8s (NFR-004)
- [ ] bcrypt cost ≥ 10 (NFR-010)
- [ ] All SQL via PDO prepared statements (NFR-013)

### Architecture Completeness

- [ ] Front Controller pattern: all requests through `api/index.php`
- [ ] Controller → Service → Model layering respected (no DB queries in controllers)
- [ ] `JavaBridge.php` is the only file using `shell_exec()`
- [ ] `AIService.php` is the only file holding the OpenAI API key reference
- [ ] `Response` helper used for all API responses

### Documentation Completeness

- [ ] `database/schema.sql` importable, all 6 tables
- [ ] `docs/SDD/API_REFERENCE.md` complete route contract
- [ ] `docs/traceability_matrix.md` all FRs mapped
- [ ] `docs/srs_compliance_report.md` all FRs audited
- [ ] `docs/UML/png/` all diagrams exported
- [ ] `README.md` with XAMPP + Docker setup
- [ ] `CHANGELOG.md` updated
- [ ] `python-module/pyproject.toml` — no `requirements.txt`

### Code Quality

- [ ] Zero debug statements (`var_dump`, `console.log`, `print_r`)
- [ ] No credentials or API keys in any committed file
- [ ] `api/config/.env.example` committed as template
- [ ] `declare(strict_types=1)` in all PHP files
- [ ] PHPUnit tests pass: `./vendor/bin/phpunit tests/php/`
- [ ] pytest tests pass: `pytest tests/python/`
- [ ] `main` branch tagged `v1.0.0-poc`

---

## Post-PoC Evolution Path

### MVP Phase 1 — Production Hardening

- Replace `shell_exec()` ML invocation with a `FastAPI` microservice (HTTP call instead of subprocess)
- Replace `shell_exec()` Java invocation with a compiled JAR served as a REST endpoint
- Add HTTPS via Let's Encrypt
- Add PHP Monolog for structured logging
- Add rate limiting middleware

### MVP Phase 2 — Real-Time SIEM Features

- WebSocket or Server-Sent Events for live alert streaming
- Elasticsearch for log storage at scale (MySQL won't scale past ~10M rows for logs)
- Real-time anomaly score chart on dashboard
- Detection rule engine: user-defined alerting rules beyond ML scores

### MVP Phase 3 — Multi-User Collaboration

- User invitation system (admin invites by email)
- Alert assignment: assign to specific Blue Team members
- Alert comments and activity timeline
- Global audit log: every action by every user

### MVP Phase 4 — Advanced ML

- LSTM or Transformer-based sequential anomaly detection
- Automated model retraining pipeline
- MITRE ATT&CK framework mapping for detected techniques
- Threat intelligence feed integration (VirusTotal API, AbuseIPDB)

### MVP Phase 5 — Platform & DevOps

- GitHub Actions CI/CD: lint → test → build → deploy
- Kubernetes (replace docker-compose for multi-instance deployment)
- Prometheus + Grafana for platform health monitoring
- Multi-tenant architecture

---

## Recommended Tools & Resources

### Development

| Tool               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| VS Code            | PHP Intelephense + Pylance + Extension Pack for Java   |
| Postman / Insomnia | API testing — configure cookie jar for session testing |
| phpMyAdmin         | MySQL inspection (XAMPP bundled)                       |
| draw.io            | UML diagrams (your `.puml` files)                      |
| Git + GitHub       | Version control                                        |

### Testing

| Tool                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| PHPUnit 10                   | PHP unit tests (`vendor/bin/phpunit`)            |
| pytest                       | Python unit tests                                |
| Browser DevTools Network tab | API call inspection, timing, cookie verification |

### Documentation

| Tool              | Purpose                            |
| ----------------- | ---------------------------------- |
| Obsidian / Notion | Paste this roadmap, track progress |
| Mermaid           | Diagrams-as-code inside Markdown   |

### Learning Resources

| Topic                   | Resource                                                                        |
| ----------------------- | ------------------------------------------------------------------------------- |
| PSR-4 Autoloading       | php-fig.org/psr/psr-4                                                           |
| PDO Prepared Statements | php.net/manual/en/pdo.prepare.php                                               |
| Isolation Forest        | scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html |
| OpenAI Chat API         | platform.openai.com/docs/api-reference/chat                                     |
| bcrypt internals        | auth0.com/blog/hashing-in-action-understanding-bcrypt                           |
| OWASP PHP Security      | cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html       |
| Git branching           | nvie.com/posts/a-successful-git-branching-model                                 |

---

_HELIX PoC Roadmap v2.0 · Adapted to actual project structure · Academic Year 2025–2026 · Tek-Up University, Ariana, Tunisia_
_Previous version: v1.0 (generic structure) · This version: adapted to actual tree_
