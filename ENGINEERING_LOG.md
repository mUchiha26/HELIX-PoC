Composer.json

Think of Composer as two things:

1. Package Installer (like npm for Node or pip for Python)
   When you later need a library — say a JWT library for tokens, or a PDF generator — you run:
   composer require firebase/php-jwt
   Composer downloads it into vendor/ and wires it up automatically. Without Composer, you'd manually download ZIP files, extract them, and figure out which files to require.
2. Autoloader (the bigger benefit for this project)
   Without Composer, every time you want to use a class you write:
   require_once **DIR** . '/controllers/AuthController.php';
   require_once **DIR** . '/services/AuthService.php';
   require_once **DIR** . '/models/User.php';
   require_once **DIR** . '/helpers/Response.php';
   require_once **DIR** . '/helpers/Validator.php';
   require_once **DIR** . '/config/Database.php';
   require_once **DIR** . '/config/Cors.php';
   // ... and so on for every file, in every script
   With Composer + PSR-4, you write one line in api/index.php:
   require_once **DIR** . '/../vendor/autoload.php';
   And then just use classes directly:
   use App\Controllers\AuthController;
   use App\Services\AuthService;
   use App\Models\User;
   $controller = new AuthController(); // PHP finds the file automatically
   Composer reads the autoload section in composer.json:
   "autoload": {
   "psr-4": {
   "App\\": "api/"
   }
   }
   This tells PHP: "When you see App\Controllers\AuthController, look in api/controllers/AuthController.php." It's a naming convention — the namespace maps directly to the folder structure.
   In short
   Without Composer
   20+ require_once statements
   Manual library downloads
   Break if you move a file
   That's its contribution — it eliminates manual file loading and makes adding third-party libraries a one-command operation.

Command When to use
composer install First time setup, or after cloning a repo (installs packages from composer.lock)
composer update When you want to upgrade package versions
composer dump-autoload After changing the autoload section in composer.json (namespace paths, classmaps, etc.)

A namespace is like a folder path for your code. It prevents name collisions.
Imagine you have two classes named Database: one for MySQL and one for MongoDB. Without namespaces, PHP doesn't know which one you mean. Namespaces solve this:

- App\Config\Database (This one)
- App\Legacy\Database (Some other one)
  App\Config maps directly to your folder structure thanks to PSR-4:
- App\ → api/
- Config\ → config/
- So App\Config → api/config/

What is CORS?
CORS (Cross-Origin Resource Sharing) is a browser security feature. It stops a website from secretly calling APIs on other websites without permission.
The Rule: "Same Origin Policy"
Browsers block JavaScript from calling a different Origin.
Origin = Protocol + Domain + Port.
Your Page Is At API Is At Same Origin? Browser Allows?
http://helix.local http://helix.local/api ✅ Yes ✅ Yes
http://helix.local http://api.helix.local ❌ No ❌ Blocked
http://localhost http://helix.local ❌ No ❌ Blocked
http://localhost:3000 http://localhost:80 ❌ No ❌ Blocked
How CORS Fixes It
If the origins are different, the browser sends a pre-check (OPTIONS request) to the API. The API must reply with specific headers saying "I allow this":
Access-Control-Allow-Origin: http://helix.local
If the header is missing, the browser blocks the response. Your JavaScript gets an error, even if the server actually processed the request.
Why It's in Your Project
In your Apache setup, both frontend and API are on helix.local, so they are the same origin. Technically, you don't need CORS right now.
But it's included because:

1.  Dev setups vary: If you open index.html directly from your file folder (file:///...), the origin is null, and the browser will block API calls without CORS.
2.  Future-proofing: If you ever move the API to a different domain or port, CORS is already handled.

3.  What is $_ENV?
$\_ENV is a PHP Superglobal. It is a built-in array that is available everywhere in your script (just like $\_GET, $\_POST, or $\_SESSION).
    Normally, it holds variables passed from the operating system (like server settings). In this code, we manually fill it (line 16) so that other parts of your application can access config values using standard PHP syntax:
    // Anywhere in your app, you can do this:
    echo $\_ENV['DB_HOST'];
    // Output: localhost
    It's a global storage bucket so you don't have to pass the Environment class object around everywhere.

CORS :
The Allowed Headers Explained

- Content-Type: Tells the server "I am sending JSON data, not a standard HTML form". Without this, PHP won't know how to read the body of your request.
- Authorization: Used to send security tokens (like JWTs) in the header. Even though you are using Sessions now, this is standard for APIs and future-proofs your code.
- X-Requested-With: A common header used to distinguish "background" AJAX/Fetch requests from normal page loads.

Why Allow-Credentials: true is Mandatory
PHP Sessions rely on a cookie named PHPSESSID to remember who is logged in.
By default, browsers do not send cookies to APIs for security reasons.
Setting Access-Control-Allow-Credentials: true tells the browser: "Trust me, it is safe to send the session cookie with this request."
If this is missing or false, the browser drops the cookie, $\_SESSION becomes empty, and your users will never stay logged in.
