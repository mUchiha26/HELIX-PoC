<?php
declare(strict_types=1); #Forces PHP to throw errors if you pass the wrong data type

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Environment;
use App\Config\Cors;
use App\Helpers\Response;

// 1. Load environment
Environment::load(__DIR__ . '/Config/.env');

// 2. Handle CORS (must be before any output)
Cors::handle();

// 3. Parse route
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH); #Gets the path part of the URL

// Strip /api prefix (added by Apache Alias)
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';

use App\Controllers\AuthController;
use App\Controllers\AIController;
use App\Controllers\DashboardController;
use App\Controllers\UserController;

// 4. Route dispatch — exact matches first
$routes = [];

// Auth routes
$routes['POST']['/auth/register'] = [AuthController::class, 'register'];
$routes['POST']['/auth/login']    = [AuthController::class, 'login'];
$routes['POST']['/auth/logout']   = [AuthController::class, 'logout'];
$routes['GET']['/auth/me']        = [AuthController::class, 'me'];

// AI routes
$routes['POST']['/ai/chat']     = [AIController::class, 'chat'];
$routes['GET']['/ai/history']   = [AIController::class, 'history'];

// Dashboard routes
$routes['GET']['/dashboard/stats'] = [DashboardController::class, 'stats'];

// User management routes (admin only)
$routes['GET']['/users']               = [UserController::class, 'index'];
$routes['GET']['/users/stats']         = [UserController::class, 'stats'];
$routes['GET']['/users/{id}']          = [UserController::class, 'show'];
$routes['PUT']['/users/{id}/role']     = [UserController::class, 'changeRole'];
$routes['POST']['/users/{id}/toggle']  = [UserController::class, 'toggleActive'];
$routes['DELETE']['/users/{id}']       = [UserController::class, 'delete'];

// 5. Dispatch — exact match first
if (isset($routes[$method][$uri])) {
    [$controllerClass, $action] = $routes[$method][$uri];
    $controller = new $controllerClass();
    $controller->$action();
    exit;
}

// 6. Fallback — pattern match for /users/{id} style routes
$patternRoutes = [
    'GET'    => ['#^/users/(\d+)$#' => [UserController::class, 'show']],
    'PUT'    => ['#^/users/(\d+)/role$#' => [UserController::class, 'changeRole']],
    'POST'   => ['#^/users/(\d+)/toggle$#' => [UserController::class, 'toggleActive']],
    'DELETE' => ['#^/users/(\d+)$#' => [UserController::class, 'delete']],
];

if (isset($patternRoutes[$method])) {
    foreach ($patternRoutes[$method] as $pattern => [$controllerClass, $action]) {
        if (preg_match($pattern, $uri)) {
            $controller = new $controllerClass();
            $controller->$action();
            exit;
        }
    }
}

Response::error('Route not found', 404);
