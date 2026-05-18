<?php
namespace App\Controllers;

use App\Services\AuthService;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Helpers\Validator;

class AuthController
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService();
    }

    public function register(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $v = (new Validator())
            ->required('username', $body['username'] ?? '')
            ->required('email', $body['email'] ?? '')
            ->required('password', $body['password'] ?? '')
            ->email('email', $body['email'] ?? '')
            ->minLength('password', $body['password'] ?? '', 8);

        if (!$v->passes()) {
            Response::error(json_encode($v->errors()), 422);
        }

        $result = $this->service->register($body);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success($result, 'Account created', 201);
    }

    public function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $result = $this->service->login(
            $body['username'] ?? '',
            $body['password'] ?? ''
        );

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success($result['user'], 'Login successful');
    }

    public function logout(): void
    {
        AuthMiddleware::handle();
        $this->service->logout();
        Response::success(null, 'Logged out');
    }

    public function me(): void
    {
        AuthMiddleware::handle();
        $user = $this->service->currentUser();

        if (!$user) {
            Response::unauthorized();
        }

        Response::success($user);
    }
}
