<?php
namespace App\Controllers;

use App\Services\UserService;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Helpers\Response;

class UserController
{
    private UserService $service;

    public function __construct()
    {
        $this->service = new UserService();
    }

    public function index(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $limit  = min((int)($_GET['limit'] ?? 50), 100);
        $offset = max((int)($_GET['offset'] ?? 0), 0);

        $users = $this->service->listUsers($limit, $offset);
        Response::success($users, 'Users loaded');
    }

    public function show(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $id = (int) ($this->extractId() ?? 0);
        $user = $this->service->getUser($id);

        if (!$user) {
            Response::error('User not found', 404);
        }

        Response::success($user, 'User loaded');
    }

    public function changeRole(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $id = (int) ($this->extractId() ?? 0);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $role = trim($body['role'] ?? '');

        if ($role === '') {
            Response::error('Role is required', 400);
        }

        $result = $this->service->changeRole($id, $role);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success(null, $result['message']);
    }

    public function toggleActive(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $id = (int) ($this->extractId() ?? 0);
        $result = $this->service->toggleActive($id);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success(null, $result['message']);
    }

    public function delete(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $id = (int) ($this->extractId() ?? 0);
        $result = $this->service->deleteUser($id);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success(null, $result['message']);
    }

    public function stats(): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require(['administrator']);

        $stats = $this->service->getStats();
        Response::success($stats, 'User stats loaded');
    }

    private function extractId(): ?string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = preg_replace('#^/api#', '', $uri);
        $parts = explode('/', trim($uri, '/'));
        return $parts[1] ?? null;
    }
}
