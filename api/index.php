<?php
declare(strict_types=1); #Forces PHP to throw errors if you pass the wrong data type

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Environment;
use App\Config\Cors;
use App\Helpers\Response;

// 1. Load environment
Environment::load(__DIR__ . '/config/.env');

// 2. Handle CORS (must be before any output)
Cors::handle();

// 3. Parse route
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH); #Gets the path part of the URL

// Strip /api prefix (added by Apache Alias)
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';

// 4. Route dispatch (will grow with each phase)
$routes = [];

// Each phase will add routes here:
// $routes['POST']['/auth/login'] = [AuthController::class, 'login'];

// 5. Dispatch
if (isset($routes[$method][$uri])) {
    [$controllerClass, $action] = $routes[$method][$uri];
    $controller = new $controllerClass();
    $controller->$action();
} else {
    Response::error('Route not found', 404);
}
