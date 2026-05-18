<?php
namespace App\Controllers;

use App\Services\DashboardService;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;

class DashboardController
{
    private DashboardService $service;

    public function __construct()
    {
        $this->service = new DashboardService();
    }

    public function stats(): void
    {
        AuthMiddleware::handle();

        $stats = $this->service->getStats();
        Response::success($stats, 'Dashboard stats loaded');
    }
}
