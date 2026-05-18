<?php
namespace App\Middleware;

use App\Helpers\Response;

class RoleMiddleware
{
    public static function require(array $allowedRoles): void
    {
        AuthMiddleware::handle(); // Auth check first

        $userRole = $_SESSION['user_role'] ?? '';

        if (!in_array($userRole, $allowedRoles, true)) {
            Response::forbidden();
        }
    }
}
?>