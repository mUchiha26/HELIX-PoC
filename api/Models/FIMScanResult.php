<?php
namespace App\Models;

use App\Config\Database;

class FIMScanResult
{
    public static function batchInsert(int $baselineId, array $results): array
    {
        if (empty($results)) return [];

        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO fim_scan_results (baseline_id, file_path, sha256, file_size, status)
             VALUES (?, ?, ?, ?, ?)'
        );

        $changes = ['added' => 0, 'modified' => 0, 'deleted' => 0, 'unchanged' => 0];

        foreach ($results as $r) {
            $stmt->execute([
                $baselineId,
                $r['path'],
                $r['sha256'] ?? null,
                $r['size'] ?? 0,
                $r['status']
            ]);
            if ($r['status'] !== 'unchanged' && isset($changes[$r['status']])) {
                $changes[$r['status']]++;
            }
        }

        return $changes;
    }

    public static function byBaseline(int $baselineId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT file_path, sha256, file_size, status, scanned_at
             FROM fim_scan_results
             WHERE baseline_id = ?
             ORDER BY status DESC'
        );
        $stmt->execute([$baselineId]);
        return $stmt->fetchAll();
    }
}
