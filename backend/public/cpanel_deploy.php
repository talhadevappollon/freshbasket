<?php
/**
 * Fresh House - cPanel deployment webhook (GitHub push → update this server).
 *
 * Makes the server copy match GitHub's main branch, then runs backend/deploy.sh (composer, migrations, caches).
 *
 * Secret: DEPLOY_SECRET in backend/.env. Use it as the GitHub webhook "Secret" (signed requests), or open
 *   https://<domain>/cpanel_deploy.php?secret=<DEPLOY_SECRET>   to deploy by hand.
 * A server whose .env has no DEPLOY_SECRET still accepts the original shared secret, so older setups keep working.
 */

// A push deploy can take minutes (composer on the first run); GitHub stops waiting after 10 seconds.
ignore_user_abort(true);
@set_time_limit(0);

$backendDir = dirname(__DIR__);       // .../backend
$projectRoot = dirname($backendDir);  // the repository (the site's folder)

function deploySecret(string $envPath): string
{
    if (is_readable($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (preg_match('/^\s*DEPLOY_SECRET\s*=\s*(.*)$/', $line, $m)) {
                $value = trim($m[1]);
                if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && substr($value, -1) === $value[0]) {
                    $value = substr($value, 1, -1);
                }
                if ($value !== '') {
                    return $value;
                }
            }
        }
    }

    return 'freshbasket2026'; // original shared secret, only for servers without DEPLOY_SECRET
}

$SECRET_TOKEN = deploySecret($backendDir . '/.env');
$rawPayload = file_get_contents('php://input');

// 1. Verify the secret (query/post/header value, or GitHub's HMAC-SHA256 signature)
$isValid = false;
$providedKey = (string) ($_GET['secret'] ?? $_POST['secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? ''));
if ($providedKey !== '' && hash_equals($SECRET_TOKEN, $providedKey)) {
    $isValid = true;
} elseif (isset($_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
    $expected = 'sha256=' . hash_hmac('sha256', $rawPayload, $SECRET_TOKEN);
    $isValid = hash_equals($expected, (string) $_SERVER['HTTP_X_HUB_SIGNATURE_256']);
}

if (!$isValid) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Invalid or missing secret.']);
    exit;
}

$githubEvent = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
if ($githubEvent === 'ping') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'event' => 'ping', 'message' => 'Fresh House deployment webhook is connected.']);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
echo "=== Fresh House Automated cPanel Deployment ===\n";
echo "Timestamp: " . date('Y-m-d H:i:s T') . "\n";
echo "Trigger Event: " . ($githubEvent ?: 'push / manual') . "\n";

// The website's own PHP (cPanel → MultiPHP Manager) can differ from the one deploy.sh uses
$needed = ['ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash', 'mbstring', 'openssl', 'pcre', 'pdo', 'pdo_mysql', 'session', 'tokenizer', 'xml'];
$missing = array_values(array_filter($needed, fn ($ext) => !extension_loaded($ext)));
echo "Website PHP: " . PHP_VERSION . (PHP_VERSION_ID < 80300 ? '  <-- TOO OLD: set the domain to PHP 8.3 or 8.4 in cPanel → MultiPHP Manager' : '') . "\n";
echo "Missing PHP extensions: " . ($missing ? implode(', ', $missing) . '  <-- turn these on in cPanel (Select PHP Version / PHP extensions)' : 'none') . "\n";
// Hidden launch (.htaccess): the server must find backend/storage/app under its document root
$docRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
echo 'Hidden launch: paths ' . (is_dir($docRoot . '/backend/storage/app') ? 'OK' : "NOT FOUND under $docRoot")
    . ', shop ' . (file_exists($backendDir . '/storage/app/site-public') ? 'OPEN to everyone' : 'hidden on freshhouse.pk (Coming soon)')
    . ', staff preview key ' . (glob($backendDir . '/storage/app/preview/*') ? 'ready' : 'made at the next staff sign-in') . "\n";
foreach (['storage/logs', 'storage/framework/views', 'storage/framework/cache', 'bootstrap/cache'] as $dir) {
    if (is_dir("$backendDir/$dir") && !is_writable("$backendDir/$dir")) {
        echo "Not writable by the website: backend/$dir\n";
    }
}
echo "\n";

$disabled = array_map('trim', explode(',', (string) ini_get('disable_functions')));
if (!function_exists('shell_exec') || in_array('shell_exec', $disabled, true)) {
    echo "This server does not allow PHP to run commands (shell_exec is disabled).\n";
    echo "Deploy from cPanel instead: Git Version Control → Manage → Pull or Deploy → Update from Remote, then Deploy HEAD Commit.\n";
    exit;
}

// One deploy at a time: a second push waits here, then deploys the newest code
$lock = fopen(sys_get_temp_dir() . '/freshhouse-deploy-' . md5($projectRoot) . '.lock', 'c');
if ($lock) {
    flock($lock, LOCK_EX);
}

// 2. Make the server copy match GitHub exactly, so stale or modified build files can never block an update
echo "[1/2] Updating code from GitHub...\n";
chdir($projectRoot);
$lockFile = $projectRoot . '/.git/index.lock'; // left behind by an interrupted git command
if (file_exists($lockFile)) {
    @unlink($lockFile);
}
// A fetch can clash with one cPanel or a second webhook runs at the same moment ("incorrect old value"): try again
for ($try = 1; $try <= 3; $try++) {
    exec('git fetch origin main 2>&1', $fetchOut, $fetchCode);
    echo implode("\n", $fetchOut) . "\n";
    $fetchOut = [];
    if ($fetchCode === 0) {
        break;
    }
    echo "git fetch failed (try $try of 3)" . ($try < 3 ? ', trying again in 5 seconds...' : '') . "\n";
    if ($try < 3) {
        sleep(5);
    }
}
if ($fetchCode === 0) {
    echo shell_exec('git reset --hard FETCH_HEAD 2>&1 && git clean -fd backend/public/_next 2>&1') . "\n";
} else {
    echo "Could not fetch from GitHub: the code was NOT updated. Open this page again in a minute.\n";
}

// 3. deploy.sh: composer, migrations, caches, first staff account
echo "[2/2] Running deploy.sh (composer, migrations, caches)...\n";
$deployScript = $backendDir . '/deploy.sh';
if (file_exists($deployScript)) {
    echo shell_exec('/bin/bash ' . escapeshellarg($deployScript) . ' 2>&1') . "\n";
} else {
    echo "deploy.sh not found at: $deployScript\n";
}

if ($lock) {
    flock($lock, LOCK_UN);
    fclose($lock);
}
echo "=== Deployment finished ===\n";
