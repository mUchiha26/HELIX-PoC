<?php
namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $host = Environment::get('DB_HOST', 'localhost');
            $name = Environment::get('DB_NAME');
            $user = Environment::get('DB_USER');
            $pass = Environment::get('DB_PASS');

            $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, #Throw errors as exceptions instead of silent failures.
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, #Return query results as associative arrays (['id' => 1]), not numeric arrays.
                PDO::ATTR_EMULATE_PREPARES   => false, #Use real prepared statements (prevents SQL injection).
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Never expose DB errors to client
                error_log("DB connection failed: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Database unavailable']);
                exit;
            }
        }

        return self::$instance;
    }
}
?>