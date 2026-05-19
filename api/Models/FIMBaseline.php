<?php
namespace App\Models;

use App\Config\Database;

class FIMBaseline
{
    public static function create(string $targetPath, string $baselineData, int $fileCount, int $userId): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO fim_baselines (target_path, baseline_data, file_count, created_by) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$targetPath, $baselineData, $fileCount, $userId]);
        return (int) $db->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM fim_baselines WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function history(int $userId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT fb.id, fb.target_path, fb.file_count, fb.created_at,
                    SUM(fsr.status != "unchanged") as total_changes,
                    SUM(fsr.status = "added") as added,
                    SUM(fsr.status = "modified") as modified,
                    SUM(fsr.status = "deleted") as deleted
             FROM fim_baselines fb
             LEFT JOIN fim_scan_results fsr ON fb.id = fsr.baseline_id
             WHERE fb.created_by = ?
             GROUP BY fb.id
             ORDER BY fb.created_at DESC LIMIT 50'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}
