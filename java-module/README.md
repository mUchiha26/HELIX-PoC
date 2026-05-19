# FIM - Complete Mission Breakdown

## What It Does

FIM answers one question: "Has anything on this system changed without authorization?"

It works in two steps:

1. Step 1 - Baseline: You point it at a directory (e.g., /etc, /var/www, /opt/app). It walks every file, computes SHA-256 hashes, and saves a snapshot. This is your "known good" state.
2. Step 2 - Verify: You run it again later. It re-scans the same directory, compares the new hashes against the saved baseline, and reports exactly what changed:

- Added - new file appeared (could be a backdoor, web shell, or unauthorized software)
- Modified - existing file's content changed (could be a config tampering or code injection)
- Deleted - file disappeared (could be log wiping or evidence destruction)
- Unchanged - file is exactly as it was

## Why It's Useful in HELIX

1. Fills the Java module gap - Your architecture has 4 languages (PHP, Python, Java, JS). Java was the empty slot. FIM makes it real, demoable, and academically defensible.
2. Core security concept - File Integrity Monitoring is a foundational security control. Tripwire, OSSEC, Wazuh, and every compliance framework (PCI-DSS, HIPAA, CIS) require it. You're not building a toy - you're implementing an industry-standard capability.
3. Integrates with your existing pipeline - FIM results flow naturally into HELIX's alert system:

   FIM detects modified file -> Alert created with severity "HIGH" -> AI analyzes the alert -> Dashboard shows it

   This connects your Java module to your PHP backend, MySQL database, and frontend - proving the multi-language architecture works.

4. Real-world use cases you can demo:

- Web server monitoring: Baseline /var/www/html, then simulate an attacker uploading a web shell. FIM catches it instantly.
- Config tampering detection: Baseline /etc/ssh/sshd_config, then modify it. FIM reports the change.
- Log integrity: Baseline /var/log/, then detect if someone tries to wipe evidence.

5. Academic value - In your thesis defense, you can explain:

- Cryptographic hashing (SHA-256 properties)
- Baseline-based detection model
- Change classification logic
- Why FIM is a detective control in the CIA triad

6. Foundation for future features - FIM's architecture (core -> ports -> adapters) is the same pattern used for the YARA Rule Engine and SIEM Correlation Engine. Building FIM first proves the hexagonal pattern works, making those future features faster to implement.

---

# SIEM Correlation Engine - Simple Breakdown

## What It Is

A SIEM (Security Information and Event Management) Correlation Engine takes multiple low-severity events and combines them into one high-severity alert using rules.

Think of it like this:

- Without correlation: 5 failed logins = 5 separate "LOW" alerts -> you ignore them
- With correlation: 5 failed logins from same IP in 60 seconds = 1 "HIGH" alert: "Brute force attack detected"

## How It Works

3 simple steps:

1. Ingest events - reads log entries from your log_entries table (failed logins, port scans, file changes, etc.)
2. Apply rules - checks each event against correlation rules like:

- "5 failed logins from same IP in 60s" -> brute force
- "3 FIM modifications in 5 minutes" -> active tampering
- "Port scan + file upload from same IP" -> exploitation attempt

3. Generate alerts - when a rule fires, it creates an alert in your alerts table with elevated severity

## Why It Matters in HELIX

Right now your logs and alerts are disconnected. The correlation engine is the bridge between them. It's what transforms HELIX from a "log viewer" into a "threat detector."
