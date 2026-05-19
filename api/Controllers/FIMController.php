<?php
namespace App\Controllers;

use App\Services\FIMService;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Helpers\Response;

class FIMController
{
    private FIMService $service;

    public function __construct()
    {
        $this->service = new FIMService();
    }

    public function baseline(): void
    {
        RoleMiddleware::require(['administrator', 'blue_team', 'purple_team']);

        $user = AuthMiddleware::currentUser();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $result = $this->service->createBaseline(
                $body['target_dir'] ?? '',
                $user['id']
            );
            Response::success($result, 'Baseline created');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Exception $e) {
            error_log('FIM baseline error: ' . $e->getMessage());
            Response::error('Baseline creation failed', 500);
        }
    }

    public function verify(): void
    {
        RoleMiddleware::require(['administrator', 'blue_team', 'purple_team']);

        $user = AuthMiddleware::currentUser();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $result = $this->service->verifyIntegrity(
                (int) ($body['baseline_id'] ?? 0),
                $user['id']
            );
            Response::success($result, 'Integrity check complete');
        } catch (\Exception $e) {
            error_log('FIM verify error: ' . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }

    public function history(): void
    {
        AuthMiddleware::handle();
        $user = AuthMiddleware::currentUser();
        Response::success($this->service->getHistory($user['id']));
    }

    public function results(): void
    {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $baselineId = (int) ($body['baseline_id'] ?? 0);

        if ($baselineId <= 0) {
            Response::error('Baseline ID required', 400);
        }

        Response::success($this->service->getScanResults($baselineId));
    }
}
