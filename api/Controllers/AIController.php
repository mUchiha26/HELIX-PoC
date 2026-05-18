<?php
namespace App\Controllers;

use App\Services\AIService;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;

class AIController
{
    private AIService $service;

    public function __construct()
    {
        $this->service = new AIService();
    }

    public function chat(): void
    {
        AuthMiddleware::handle();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $message = trim($body['message'] ?? '');

        if ($message === '') {
            Response::error('Message is required', 400);
        }

        $userId   = (int) $_SESSION['user_id'];
        $alertId  = isset($body['alert_id']) ? (int) $body['alert_id'] : null;

        $result = $this->service->chat($userId, $message, $alertId);

        if (isset($result['error'])) {
            Response::error($result['error'], $result['code']);
        }

        Response::success($result, 'Response generated');
    }

    public function history(): void
    {
        AuthMiddleware::handle();

        $userId  = (int) $_SESSION['user_id'];
        $alertId = isset($_GET['alert_id']) ? (int) $_GET['alert_id'] : null;

        $messages = $this->service->history($userId, $alertId);

        Response::success($messages, 'History loaded');
    }
}
