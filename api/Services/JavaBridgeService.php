<?php
// F-06: Sanitized Java subprocess execution with escapeshellarg()
namespace App\Services;

use App\Config\Environment;

class JavaBridgeService
{
    private string $buildPath;

    public function __construct()
    {
        $this->buildPath = Environment::get('JAVA_BUILD_PATH', __DIR__ . '/../../java-module/build');
    }

    /**
     * Execute a Java class with sanitized arguments.
     * All arguments MUST pass through escapeshellarg() before shell execution.
     */
    public function execute(string $className, array $args): string
    {
        $safeClass = escapeshellarg($className);
        $safeArgs = array_map('escapeshellarg', $args);

        $cmd = sprintf(
            'java -cp %s %s %s 2>&1',
            escapeshellarg($this->buildPath),
            $safeClass,
            implode(' ', $safeArgs)
        );

        $output = shell_exec($cmd);

        if ($output === null) {
            throw new \RuntimeException("Java execution failed: {$className}");
        }

        return trim($output);
    }
}
