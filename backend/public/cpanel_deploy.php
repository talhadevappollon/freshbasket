<?php
/**
 * Fresh Basket - cPanel Automated Git Deployment & Migration Webhook
 * 
 * Usage:
 * Supports:
 * 1. GitHub Webhook with Secret field: freshbasket2026
 * 2. GitHub Webhook with URL: https://freshbasket.aneetakomal.com/cpanel_deploy.php?secret=freshbasket2026
 * 3. Browser / cURL instant triggers
 */

$SECRET_TOKEN = 'freshbasket2026';

// Read raw request payload
$rawPayload = file_get_contents('php://input');

// 1. Verify Secret Key (query param, post param, custom header, or GitHub HMAC-SHA256)
$isValid = false;
$providedKey = $_GET['secret'] ?? $_POST['secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');

if ($providedKey === $SECRET_TOKEN) {
    $isValid = true;
} elseif (isset($_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
    $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'];
    $expected = 'sha256=' . hash_hmac('sha256', $rawPayload, $SECRET_TOKEN);
    if (hash_equals($expected, $signature)) {
        $isValid = true;
    }
}

if (!$isValid) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid or missing secret key. Pass ?secret=freshbasket2026 or configure GitHub Secret.'
    ]);
    exit;
}

// Handle GitHub Ping event gracefully
$githubEvent = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
if ($githubEvent === 'ping') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'event' => 'ping',
        'message' => 'Fresh Basket deployment webhook is active and successfully connected to GitHub!'
    ]);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
echo "=== Fresh Basket Automated cPanel Deployment ===\n";
echo "Timestamp: " . date('Y-m-d H:i:s T') . "\n";
echo "Trigger Event: " . ($githubEvent ?: 'push / manual') . "\n\n";

$repoRoot = dirname(__DIR__, 1); // backend directory
$projectRoot = dirname($repoRoot); // /home2/aneetako/freshbasket.aneetakomal.com

// 1. Pull latest code from GitHub
echo "[1/4] Pulling latest git changes...\n";
chdir($projectRoot);
$gitOutput = shell_exec('git pull origin main 2>&1');
echo $gitOutput . "\n";

// 2. Execute deploy.sh
echo "[2/4] Executing deploy.sh & Database Migrations...\n";
$deployScript = $repoRoot . '/deploy.sh';
if (file_exists($deployScript)) {
    $deployOutput = shell_exec('/bin/bash ' . escapeshellarg($deployScript) . ' 2>&1');
    echo $deployOutput . "\n";
} else {
    echo "deploy.sh not found at: $deployScript\n";
}

// 3. Status summary
echo "=== Deployment Finished Successfully! ===\n";
