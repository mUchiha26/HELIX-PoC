<?php
namespace App\Config;

class Environment
{
    private static array $vars = [];

    public static function load(string $envFile): void
    {
        if (!file_exists($envFile)) return;

        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            [$key, $value] = explode('=', $line, 2);
            self::$vars[trim($key)] = trim($value);
            $_ENV[trim($key)] = trim($value);
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::$vars[$key] ?? $_ENV[$key] ?? getenv($key) ?: $default;
    }
}
