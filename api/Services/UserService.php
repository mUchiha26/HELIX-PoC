<?php
namespace App\Services;

use App\Models\User;

class UserService
{
    private const ALLOWED_ROLES = ['administrator', 'blue_team', 'red_team', 'purple_team', 'learner'];

    public function listUsers(int $limit = 50, int $offset = 0): array
    {
        return User::findAll($limit, $offset);
    }

    public function getUser(int $id): ?array
    {
        return User::findById($id);
    }

    public function changeRole(int $id, string $role): array
    {
        if (!in_array($role, self::ALLOWED_ROLES, true)) {
            return ['error' => 'Invalid role', 'code' => 400];
        }

        if (!User::changeRole($id, $role)) {
            return ['error' => 'Failed to update role', 'code' => 500];
        }

        return ['message' => 'Role updated'];
    }

    public function toggleActive(int $id): array
    {
        if (!User::toggleActive($id)) {
            return ['error' => 'Failed to update status', 'code' => 500];
        }

        return ['message' => 'User status toggled'];
    }

    public function deleteUser(int $id): array
    {
        $user = User::findById($id);

        if (!$user) {
            return ['error' => 'User not found', 'code' => 404];
        }

        if ($user['role'] === 'administrator') {
            return ['error' => 'Cannot delete administrator account', 'code' => 403];
        }

        if (!User::delete($id)) {
            return ['error' => 'Failed to delete user', 'code' => 500];
        }

        return ['message' => 'User deleted'];
    }

    public function getStats(): array
    {
        return [
            'total_users'   => User::count(),
            'active_users'  => User::countActive(),
            'inactive_users' => User::countInactive(),
            'new_today'     => User::countCreatedToday(),
            'users_by_role' => User::countByRole(),
        ];
    }
}
