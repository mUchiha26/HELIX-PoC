<?php
namespace App\Config;

class Cors
{
    public static function handle(): void #the method's job is to send HTTP headers.
    {
        $allowedOrigins = [
            'http://helix.local',
            'http://localhost',
            'http://127.0.0.1',
            'http://localhost:80',
            'http://localhost:8080',
            'http://127.0.0.1:80',
            'http://127.0.0.1:8080',
            'null',
        ];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');

        // Preflight: browsers send OPTIONS before real request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}