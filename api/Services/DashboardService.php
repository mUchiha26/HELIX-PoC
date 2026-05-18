<?php
namespace App\Services;

use App\Models\Alert;
use App\Models\LogEntry;
use App\Models\AnomalyScore;
use App\Models\ScanResult;
use App\Models\User;

class DashboardService
{
    public function getStats(): array
    {
        return [
            'open_alerts'          => Alert::countOpen(),
            'log_count'            => LogEntry::count(),
            'avg_anomaly_score'    => AnomalyScore::average(),
            'alerts_by_severity'   => Alert::countBySeverity(),
            'alert_trend'          => Alert::trendLast7Days(),
            'total_users'          => User::count(),
            'users_by_role'        => User::countByRole(),
            'total_scans'          => $this->countScans(),
            'resolved_today'       => $this->countResolvedToday(),
        ];
    }

    private function countScans(): int
    {
        $db = \App\Config\Database::getInstance();
        return (int) $db->query('SELECT COUNT(*) as count FROM scan_results')->fetch()['count'];
    }

    private function countResolvedToday(): int
    {
        $db = \App\Config\Database::getInstance();
        $stmt = $db->query(
            "SELECT COUNT(*) as count FROM alerts
             WHERE status = 'resolved'
             AND updated_at >= CURDATE()"
        );
        return (int) $stmt->fetch()['count'];
    }
}
