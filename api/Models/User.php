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

    public static function updateProfile(int $id, array $data): bool
    {
        $db = Database::getInstance();
        $fields = [];
        $values = [];

        if (isset($data['email'])) {
            $fields[] = 'email = ?';
            $values[] = $data['email'];
        }
        if (isset($data['role'])) {
            $fields[] = 'role = ?';
            $values[] = $data['role'];
        }
        if (isset($data['is_active'])) {
            $fields[] = 'is_active = ?';
            $values[] = (bool) $data['is_active'];
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $db->prepare($sql);
        return $stmt->execute($values);
    }

    public static function findAll(int $limit = 50, int $offset = 0): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT id, username, email, role, is_active, created_at, last_login
             FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function count(): int
    {
        $db = Database::getInstance();
        return (int) $db->query('SELECT COUNT(*) as count FROM users')->fetch()['count'];
    }

    public static function countByRole(): array
    {
        $db = Database::getInstance();
        $stmt = $db->query(
            'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
        );
        return $stmt->fetchAll();
    }

    public static function toggleActive(int $id): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?'
        );
        return $stmt->execute([$id]);
    }

    public static function changeRole(int $id, string $role): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE users SET role = ? WHERE id = ?'
        );
        return $stmt->execute([$role, $id]);
    }

    public static function delete(int $id): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function countActive(): int
    {
        $db = Database::getInstance();
        return (int) $db->query("SELECT COUNT(*) as count FROM users WHERE is_active = 1")->fetch()['count'];
    }

    public static function countInactive(): int
    {
        $db = Database::getInstance();
        return (int) $db->query("SELECT COUNT(*) as count FROM users WHERE is_active = 0")->fetch()['count'];
    }

    public static function countCreatedToday(): int
    {
        $db = Database::getInstance();
        $stmt = $db->query(
            "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()"
        );
        return (int) $stmt->fetch()['count'];
    }
}