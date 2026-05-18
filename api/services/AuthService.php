<?php
namespace App\Services;

use App\Models\User;
use App\Middleware\AuthMiddleware;

class AuthService
{
    public function register(array $data): array
    {
        if (User::emailOrUsernameExists($data['username'], $data['email'])) {
            return ['error' => 'Username or email already exists', 'code' => 409];
        }

        $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $id   = User::create($data['username'], $data['email'], $hash);

        return ['user_id' => $id];
    }

    public function login(string $username, string $password): array
    {
        $user = User::findByUsername($username);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['error' => 'Invalid credentials', 'code' => 401];
        }

        AuthMiddleware::startSecureSession();
        session_regenerate_id(true); // Prevent session fixation

        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        User::updateLastLogin($user['id']);

        return [
            'user' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role'],
            ]
        ];
    }

    public function logout(): void
    {
        AuthMiddleware::startSecureSession();
        $_SESSION = [];
        session_destroy();
    }

    public function currentUser(): ?array
    {
        $id = $_SESSION['user_id'] ?? null;
        return $id ? User::findById((int)$id) : null;
    }
}