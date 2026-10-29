<?php
/**
 * Fresh Basket - cPanel Automated Git Deployment & Migration Webhook
 * 
 * Usage:
 * Call via GitHub Webhook or Browser:
 * https://freshbasket.aneetakomal.com/cpanel_deploy.php?secret=freshbasket2026
 */

$SECRET_TOKEN = 'freshbasket2026';

// 1. Verify Secret Key
$providedKey = $_GET['secret'] ?? $_POST['secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');
if ($providedKey !== $SECRET_TOKEN) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid or missing secret key. Pass ?secret=freshbasket2026'
    ]);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
echo "=== Fresh Basket Automated cPanel Deployment ===\n";
echo "Timestamp: " . date('Y-m-d H:i:s T') . "\n\n";

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
