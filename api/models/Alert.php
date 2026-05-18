<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Alert
{
    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO alerts (log_entry_id, anomaly_score_id, title, description, severity, status, assigned_to)
             VALUES (:log_entry_id, :anomaly_score_id, :title, :description, :severity, :status, :assigned_to)'
        );
        $stmt->execute([
            ':log_entry_id'    => $data['log_entry_id'] ?? null,
            ':anomaly_score_id' => $data['anomaly_score_id'] ?? null,
            ':title'           => $data['title'],
            ':description'     => $data['description'] ?? null,
            ':severity'        => $data['severity'],
            ':status'          => $data['status'] ?? 'open',
            ':assigned_to'     => $data['assigned_to'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT a.*, u.username as assigned_to_name
             FROM alerts a
             LEFT JOIN users u ON a.assigned_to = u.id
             WHERE a.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findAll(int $limit = 50, int $offset = 0): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT a.*, u.username as assigned_to_name
             FROM alerts a
             LEFT JOIN users u ON a.assigned_to = u.id
             ORDER BY a.created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function updateStatus(int $id, string $status, ?int $assignedTo = null): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE alerts SET status = :status, assigned_to = :assigned_to WHERE id = :id'
        );
        return $stmt->execute([
            ':status'       => $status,
            ':assigned_to'  => $assignedTo,
            ':id'           => $id,
        ]);
    }

    public static function countBySeverity(): array
    {
        $db = Database::getInstance();
        $stmt = $db->query(
            'SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity'
        );
        return $stmt->fetchAll();
    }

    public static function countOpen(): int
    {
        $db = Database::getInstance();
        return (int) $db->query("SELECT COUNT(*) as count FROM alerts WHERE status = 'open'")->fetch()['count'];
    }

    public static function trendLast7Days(): array
    {
        $db = Database::getInstance();
        $stmt = $db->query(
            "SELECT DATE(created_at) as date, COUNT(*) as count
             FROM alerts
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );
        return $stmt->fetchAll();
    }
}
