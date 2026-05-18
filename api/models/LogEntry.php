<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class LogEntry
{
    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO log_entries (filename, source_ip, timestamp, severity, event_type, message, raw_line, ingested_by)
             VALUES (:filename, :source_ip, :timestamp, :severity, :event_type, :message, :raw_line, :ingested_by)'
        );
        $stmt->execute([
            ':filename'    => $data['filename'] ?? null,
            ':source_ip'   => $data['source_ip'] ?? null,
            ':timestamp'   => $data['timestamp'] ?? date('Y-m-d H:i:s'),
            ':severity'    => $data['severity'] ?? 'LOW',
            ':event_type'  => $data['event_type'] ?? null,
            ':message'     => $data['message'],
            ':raw_line'    => $data['raw_line'] ?? null,
            ':ingested_by' => $data['ingested_by'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM log_entries WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findRecent(int $limit = 50, int $offset = 0): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM log_entries ORDER BY timestamp DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function count(): int
    {
        $db = Database::getInstance();
        return (int) $db->query('SELECT COUNT(*) as count FROM log_entries')->fetch()['count'];
    }

    public static function findBySeverity(string $severity, int $limit = 50): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM log_entries WHERE severity = ? ORDER BY timestamp DESC LIMIT ?'
        );
        $stmt->execute([$severity, $limit]);
        return $stmt->fetchAll();
    }
}
