<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class AnomalyScore
{
    public static function create(int $logEntryId, float $score, string $severityLabel): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO anomaly_scores (log_entry_id, score, severity_label)
             VALUES (:log_entry_id, :score, :severity_label)'
        );
        $stmt->execute([
            ':log_entry_id'  => $logEntryId,
            ':score'         => $score,
            ':severity_label' => $severityLabel,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findByLogEntryId(int $logEntryId): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM anomaly_scores WHERE log_entry_id = ? ORDER BY computed_at DESC LIMIT 1'
        );
        $stmt->execute([$logEntryId]);
        return $stmt->fetch() ?: null;
    }

    public static function average(): float
    {
        $db = Database::getInstance();
        $result = $db->query('SELECT ROUND(AVG(score), 4) as avg FROM anomaly_scores')->fetch();
        return (float) ($result['avg'] ?? 0);
    }

    public static function countBySeverity(): array
    {
        $db = Database::getInstance();
        $stmt = $db->query(
            'SELECT severity_label, COUNT(*) as count FROM anomaly_scores GROUP BY severity_label'
        );
        return $stmt->fetchAll();
    }
}
