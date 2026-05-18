<?php
namespace App\Middleware;

use App\Helpers\Response;

class AuthMiddleware
{
    public static function handle(): void
    {
        // 1. Start session with secure settings
        self::startSecureSession();

        // 2. Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized();
        }

        // 3. Check Session Timeout (Anti-Expiry)
        if (self::isTimedOut()) {
            self::destroySession();
        }

        // 4. Check Session Integrity (Anti-Hijacking)
        if (!self::verifyFingerprint()) {
            self::destroySession();
        }

        // 5. Update last activity time
        $_SESSION['last_activity'] = time();
    }

    // ── SECURE CONFIGURATION  ──
    public static function startSecureSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', '1');      // Anti-XSS
            ini_set('session.cookie_samesite', 'Strict'); // Anti-CSRF
            ini_set('session.use_strict_mode', '1');      // Anti-Fixation
            ini_set('session.gc_maxlifetime', (string)($_ENV['SESSION_LIFETIME'] ?? 3600));

            // ⚠️ Only enable Secure if using HTTPS
            if (!empty($_SERVER['HTTPS'])) {
                ini_set('session.cookie_secure', '1');
            }

            session_start();
        }
    }

    // ── VÉRIFICATION d'intégrité (anti-hijacking) ──
    private static function verifyFingerprint(): bool
    {
        $current_ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $current_ip = $_SERVER['REMOTE_ADDR'] ?? '';

        // First visit: save fingerprint
        if (!isset($_SESSION['fingerprint'])) {
            $_SESSION['fingerprint'] = hash('sha256', $current_ua . $current_ip);
            return true;
        }

        // Subsequent visits: compare
        return $_SESSION['fingerprint'] === hash('sha256', $current_ua . $current_ip);
    }

    // ── Session Expiry Check ──
    private static function isTimedOut(): bool
    {
        $timeout = $_ENV['SESSION_LIFETIME'] ?? 3600; // Default 1 hour
        return isset($_SESSION['last_activity']) 
            && (time() - $_SESSION['last_activity']) > $timeout;
    }

    private static function destroySession(): void
    {
        session_destroy();
        Response::error('Session expired or invalid', 401);
    }

    public static function currentUser(): array
    {
        return [
            'id'   => $_SESSION['user_id']   ?? null,
            'role' => $_SESSION['user_role'] ?? null,
        ];
    }
}
