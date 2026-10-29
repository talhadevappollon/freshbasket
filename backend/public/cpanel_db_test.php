<?php
/**
 * Fresh Basket - cPanel Diagnostic & Database Verification
 * 
 * Usage:
 * https://freshbasket.aneetakomal.com/backend/public/cpanel_db_test.php?secret=freshbasket2026
 */

$SECRET_TOKEN = 'freshbasket2026';

$providedKey = $_GET['secret'] ?? $_POST['secret'] ?? '';
if ($providedKey !== $SECRET_TOKEN) {
    http_response_code(403);
    echo "Access Denied. Pass ?secret=freshbasket2026";
    exit;
}

$backendDir = dirname(__DIR__, 1);
$projectDir = dirname($backendDir);
$envPath = $backendDir . '/.env';

// Handle updating .env from UI
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_env'])) {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = trim($_POST['db_pass'] ?? '');

    if (file_exists($envPath)) {
        $envContent = file_get_contents($envPath);
        $envContent = preg_replace('/^DB_HOST=.*$/m', 'DB_HOST=' . $dbHost, $envContent);
        $envContent = preg_replace('/^DB_DATABASE=.*$/m', 'DB_DATABASE=' . $dbName, $envContent);
        $envContent = preg_replace('/^DB_USERNAME=.*$/m', 'DB_USERNAME=' . $dbUser, $envContent);
        $envContent = preg_replace('/^DB_PASSWORD=.*$/m', 'DB_PASSWORD=' . $dbPass, $envContent);
        file_put_contents($envPath, $envContent);
        $msg = "Environment (.env) updated successfully!";
    }
}

// Parse .env
$env = [];
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($k, $v) = explode('=', $line, 2);
            $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
        }
    }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Fresh Basket cPanel Diagnostics</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 25px; margin: 0; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 820px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid #334155; }
        h1 { color: #10b981; margin-top: 0; font-size: 24px; }
        h3 { color: #e2e8f0; margin-bottom: 8px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 13px; }
        .badge-success { background: #065f46; color: #34d399; }
        .badge-fail { background: #7f1d1d; color: #f87171; }
        pre { background: #090d16; padding: 12px; border-radius: 8px; overflow-x: auto; color: #93c5fd; font-size: 13px; }
        .step { margin-bottom: 22px; border-bottom: 1px solid #334155; padding-bottom: 18px; }
        a.btn, button.btn { background: #10b981; color: white; padding: 9px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; border: none; cursor: pointer; }
        a.btn-blue { background: #3b82f6; }
        input[type="text"], input[type="password"] { background: #0f172a; border: 1px solid #475569; color: #f8fafc; padding: 8px 12px; border-radius: 6px; width: 100%; box-sizing: border-box; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .notice { background: #1e3a8a; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 4px; margin-bottom: 15px; }
    </style>
</head>
<body>
<div class="card">
    <h1>🛒 Fresh Basket — Live Deployment Diagnostics</h1>
    <?php if ($msg): ?>
        <div class="notice"><?= htmlspecialchars($msg) ?></div>
    <?php endif; ?>

    <div class="step">
        <h3>1. PHP & Composer Status</h3>
        <p>PHP Version: <strong><?= phpversion() ?></strong></p>
        <p>Composer Vendor: <?= file_exists($backendDir . '/vendor/autoload.php') ? '<span class="badge badge-success">INSTALLED</span>' : '<span class="badge badge-fail">MISSING (Needs composer install)</span>' ?></p>
        <p>composer.phar: <?= file_exists($backendDir . '/composer.phar') ? '<span class="badge badge-success">Downloaded</span>' : '<span class="badge badge-fail">Not Present</span>' ?></p>
        <?php if (!file_exists($backendDir . '/vendor/autoload.php')): ?>
            <div style="background: #312e81; padding: 12px; border-radius: 8px; margin-top: 10px;">
                <strong>⚡ To Install Composer Vendor:</strong>
                <p style="margin: 5px 0 0 0;">Open <strong>Terminal</strong> in cPanel and paste this one command:</p>
                <pre>cd /home2/aneetako/freshbasket.aneetakomal.com/backend && composer install --no-dev</pre>
            </div>
        <?php endif; ?>
    </div>

    <div class="step">
        <h3>2. Database Connection Test</h3>
        <?php
        $dbHost = $env['DB_HOST'] ?? '127.0.0.1';
        $dbName = $env['DB_DATABASE'] ?? '';
        $dbUser = $env['DB_USERNAME'] ?? '';
        $dbPass = $env['DB_PASSWORD'] ?? '';

        echo "<p>Testing Connection to <code>$dbUser@$dbHost / $dbName</code>...</p>";

        $pdo = null;
        $connectedHost = null;

        // Try configured host first, then localhost fallback
        $hostsToTry = array_unique([$dbHost, 'localhost', '127.0.0.1']);
        $lastError = '';

        foreach ($hostsToTry as $tryHost) {
            try {
                $dsn = "mysql:host={$tryHost};dbname={$dbName};charset=utf8mb4";
                $pdo = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 4
                ]);
                $connectedHost = $tryHost;
                break;
            } catch (Exception $e) {
                $lastError = $e->getMessage();
            }
        }

        if ($pdo) {
            echo "<p><span class=\"badge badge-success\">CONNECTED SUCCESSFULLY via $connectedHost!</span></p>";
            if ($connectedHost !== $dbHost) {
                echo "<p style='color: #fbbf24;'>Note: Connected using <strong>$connectedHost</strong> instead of <strong>$dbHost</strong>. Please update DB_HOST to <code>$connectedHost</code> in .env below.</p>";
            }

            // Tables check
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "<p>Existing Tables: <strong>" . count($tables) . "</strong></p>";

            if (in_array('products', $tables)) {
                $count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
                echo "<p>Catalog Loaded: <strong>$count Products Ready</strong></p>";
            } else {
                echo '<p style="color: #fbbf24;">Database tables are not imported yet. Click button below to populate all 745 products:</p>';
                echo '<p><a class="btn" href="?secret=freshbasket2026&action=import_sql">Import freshbasket_database.sql (745 Products)</a></p>';
            }
        } else {
            echo "<p><span class=\"badge badge-fail\">Connection Failed:</span> " . htmlspecialchars($lastError) . "</p>";
            echo "<div style='background: #450a0a; padding: 12px; border-radius: 8px; margin-top: 10px;'>
                    <strong>⚠️ Common cPanel MySQL fix:</strong><br>
                    1. In cPanel > <strong>MySQL® Databases</strong>, scroll down to <strong>Add User To Database</strong>.<br>
                    2. Select User <code>$dbUser</code> and Database <code>$dbName</code>, click <strong>Add</strong>.<br>
                    3. Check <strong>ALL PRIVILEGES</strong> and click <strong>Make Changes</strong>.<br>
                    4. Ensure password matches what you set when creating the user.
                  </div>";
        }

        // Direct SQL import action
        if (isset($_GET['action']) && $_GET['action'] === 'import_sql' && $pdo) {
            $sqlFile = $backendDir . '/database/freshbasket_database.sql';
            if (file_exists($sqlFile)) {
                echo "<p>Importing catalog SQL file...</p>";
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
                echo "<p><span class=\"badge badge-success\">Catalog Imported Successfully! 745 Products Loaded.</span></p>";
                echo "<script>setTimeout(() => { window.location.href='?secret=freshbasket2026'; }, 2000);</script>";
            } else {
                echo "<p><span class=\"badge badge-fail\">SQL file not found at: $sqlFile</span></p>";
            }
        }
        ?>
    </div>

    <div class="step">
        <h3>3. Edit Database (.env) Settings</h3>
        <form method="POST" action="?secret=freshbasket2026">
            <input type="hidden" name="update_env" value="1">
            <div class="grid">
                <div>
                    <label>DB Host (use <code>localhost</code> or <code>127.0.0.1</code>)</label>
                    <input type="text" name="db_host" value="<?= htmlspecialchars($env['DB_HOST'] ?? 'localhost') ?>">
                </div>
                <div>
                    <label>DB Name</label>
                    <input type="text" name="db_name" value="<?= htmlspecialchars($env['DB_DATABASE'] ?? '') ?>">
                </div>
                <div>
                    <label>DB Username</label>
                    <input type="text" name="db_user" value="<?= htmlspecialchars($env['DB_USERNAME'] ?? '') ?>">
                </div>
                <div>
                    <label>DB Password</label>
                    <input type="password" name="db_pass" value="<?= htmlspecialchars($env['DB_PASSWORD'] ?? '') ?>">
                </div>
            </div>
            <button type="submit" class="btn">Update .env Credentials</button>
        </form>
    </div>

    <div class="step">
        <h3>4. Quick Links</h3>
        <p>
            <a class="btn" href="/admin" target="_blank">Open Admin CRM (/admin)</a> &nbsp;
            <a class="btn btn-blue" href="/backend/public/cpanel_deploy.php?secret=freshbasket2026" target="_blank">Run deploy.sh Trigger</a>
        </p>
    </div>
</div>
</body>
</html>
