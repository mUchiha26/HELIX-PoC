<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class ScanResult
{
    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO scan_results (performed_by, target, port, protocol, status)
             VALUES (:performed_by, :target, :port, :protocol, :status)'
        );
        $stmt->execute([
            ':performed_by' => $data['performed_by'],
            ':target'       => $data['target'],
            ':port'         => $data['port'],
            ':protocol'     => $data['protocol'] ?? 'TCP',
            ':status'       => $data['status'],
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.*, u.username as performed_by_name
             FROM scan_results s
             LEFT JOIN users u ON s.performed_by = u.id
             WHERE s.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByUser(int $userId, int $limit = 50): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT s.*, u.username as performed_by_name
             FROM scan_results s
             LEFT JOIN users u ON s.performed_by = u.id
             WHERE s.performed_by = ?
             ORDER BY s.scanned_at DESC LIMIT ?'
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }

    public static function findByTarget(string $target, int $limit = 50): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM scan_results WHERE target = ? ORDER BY scanned_at DESC LIMIT ?'
        );
        $stmt->execute([$target, $limit]);
        return $stmt->fetchAll();
    }
}
