<?php
// F-10: Python ML scoring via stdout-only capture (no direct DB writes from Python)
namespace App\Services;

use App\Config\Database;
use App\Config\Environment;
use App\Models\AnomalyScore;
use App\Models\LogEntry;
use PDO;

class MLService
{
    private string $pythonPath;
    private string $scriptPath;

    public function __construct()
    {
        $this->pythonPath = Environment::get('PYTHON_PATH', 'python3');
        $this->scriptPath = Environment::get(
            'ML_SCRIPT_PATH',
            __DIR__ . '/../../python-module/anomaly_detector.py'
        );
    }

    /**
     * Score a batch of log entries via the Python Isolation Forest model.
     * Python writes ONLY to stdout (JSON). PHP reads stdout and inserts via the Model layer.
     */
    public function scoreBatch(int $batchSize = 100): array
    {
        $db = Database::getInstance();

        $stmt = $db->prepare(
            'SELECT id, source_ip, event_type, severity, message
             FROM log_entries
             WHERE id NOT IN (SELECT log_entry_id FROM anomaly_scores)
             LIMIT ?'
        );
        $stmt->execute([$batchSize]);
        $entries = $stmt->fetchAll();

        if (empty($entries)) {
            return ['scored' => 0, 'errors' => 0];
        }

        $inputJson = json_encode($entries);
        $tempFile = tempnam(sys_get_temp_dir(), 'ml_input_');
        file_put_contents($tempFile, $inputJson);

        $scores = [];

        try {
            $safeScript = escapeshellarg($this->scriptPath);
            $safeInput = escapeshellarg($tempFile);

            $cmd = "{$this->pythonPath} {$safeScript} {$safeInput} 2>&1";
            $rawOutput = shell_exec($cmd);

            if ($rawOutput === null) {
                throw new \RuntimeException('Python ML script execution failed');
            }

            $outputData = json_decode(trim($rawOutput), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException('Invalid JSON from ML script: ' . json_last_error_msg());
            }

            foreach ($outputData as $item) {
                AnomalyScore::create(
                    (int) $item['log_entry_id'],
                    (float) $item['score'],
                    $item['severity_label']
                );
                $scores[] = $item;
            }
        } catch (\Exception $e) {
            error_log('ML scoring error: ' . $e->getMessage());
            return ['scored' => 0, 'errors' => 1, 'error' => $e->getMessage()];
        } finally {
            if (file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }

        return ['scored' => count($scores), 'errors' => 0, 'scores' => $scores];
    }

    /**
     * Score a single log entry.
     */
    public function scoreSingle(int $logEntryId): array
    {
        $entry = LogEntry::findById($logEntryId);
        if (!$entry) {
            throw new \InvalidArgumentException("Log entry not found: {$logEntryId}");
        }

        $inputJson = json_encode([$entry]);
        $tempFile = tempnam(sys_get_temp_dir(), 'ml_single_');
        file_put_contents($tempFile, $inputJson);

        try {
            $safeScript = escapeshellarg($this->scriptPath);
            $safeInput = escapeshellarg($tempFile);

            $cmd = "{$this->pythonPath} {$safeScript} {$safeInput} 2>&1";
            $rawOutput = shell_exec($cmd);
            $outputData = json_decode(trim($rawOutput), true);

            if (!empty($outputData[0])) {
                $item = $outputData[0];
                AnomalyScore::create(
                    (int) $item['log_entry_id'],
                    (float) $item['score'],
                    $item['severity_label']
                );
                return $item;
            }
        } finally {
            if (file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }

        return ['error' => 'Scoring failed'];
    }
}
