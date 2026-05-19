<?php
namespace App\Services;

use App\Config\Environment;
use App\Models\FIMBaseline;
use App\Models\FIMScanResult;

class FIMService
{
    public function createBaseline(string $targetDir, int $userId): array
    {
        $this->validateDirectory($targetDir);

        $baselineFile = sys_get_temp_dir() . '/helix_baseline_' . uniqid() . '.dat';

        $output = $this->runJava('baseline', $targetDir, $baselineFile);
        $result = json_decode($output, true);

        if (isset($result['error'])) {
            @unlink($baselineFile);
            throw new \RuntimeException($result['error']);
        }

        $baselineData = '';
        if (file_exists($baselineFile)) {
            $baselineData = file_get_contents($baselineFile);
        }

        $baselineId = FIMBaseline::create(
            $targetDir,
            $baselineData,
            $result['file_count'] ?? 0,
            $userId
        );

        @unlink($baselineFile);

        return ['baseline_id' => $baselineId, 'file_count' => $result['file_count'] ?? 0];
    }

    public function verifyIntegrity(int $baselineId, int $userId): array
    {
        $baseline = FIMBaseline::findById($baselineId);
        if (!$baseline) {
            throw new \RuntimeException("Baseline not found");
        }

        $baselineFile = sys_get_temp_dir() . '/helix_verify_' . uniqid() . '.dat';
        file_put_contents($baselineFile, $baseline['baseline_data']);

        $output = $this->runJava('verify', $baseline['target_path'], $baselineFile);
        $result = json_decode($output, true);

        if (isset($result['error'])) {
            @unlink($baselineFile);
            throw new \RuntimeException($result['error']);
        }

        $changes = FIMScanResult::batchInsert($baselineId, $result['results'] ?? []);

        @unlink($baselineFile);

        return [
            'baseline_id' => $baselineId,
            'target'      => $baseline['target_path'],
            'changes'     => $changes,
            'results'     => $result['results'] ?? [],
        ];
    }

    public function getHistory(int $userId): array
    {
        return FIMBaseline::history($userId);
    }

    public function getScanResults(int $baselineId): array
    {
        return FIMScanResult::byBaseline($baselineId);
    }

    private function runJava(string $mode, string $targetDir, string $baselineFile): string
    {
        $javaBuildPath = Environment::get('JAVA_BUILD_PATH', __DIR__ . '/../../java-module/build');

        $cmd = sprintf(
            'java -cp %s fim.FileIntegrityMonitor %s %s %s 2>&1',
            escapeshellarg($javaBuildPath),
            escapeshellarg($mode),
            escapeshellarg($targetDir),
            escapeshellarg($baselineFile)
        );

        $output = shell_exec($cmd);
        if ($output === null) {
            throw new \RuntimeException('Java FIM execution failed');
        }

        return trim($output);
    }

    private function validateDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            throw new \InvalidArgumentException("Not a directory: {$dir}");
        }

        $realPath = realpath($dir);
        if ($realPath === false) {
            throw new \InvalidArgumentException("Cannot resolve directory: {$dir}");
        }
    }
}
