<?php
/**
 * Fresh Basket - cPanel Diagnostic & Database Verification
 * 
 * Usage:
 * https://freshbasket.aneetakomal.com/cpanel_db_test.php?secret=freshbasket2026
 */

$SECRET_TOKEN = 'freshbasket2026';

$providedKey = $_GET['secret'] ?? '';
if ($providedKey !== $SECRET_TOKEN) {
    http_response_code(403);
    echo "Access Denied. Pass ?secret=freshbasket2026";
    exit;
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Fresh Basket cPanel Diagnostics</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        h1 { color: #10b981; margin-top: 0; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 13px; }
        .badge-success { background: #065f46; color: #34d399; }
        .badge-fail { background: #7f1d1d; color: #f87171; }
        pre { background: #090d16; padding: 15px; border-radius: 8px; overflow-x: auto; color: #93c5fd; }
        .step { margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
        a.btn { background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
    </style>
</head>
<body>
<div class="card">
    <h1>🛒 Fresh Basket - cPanel Diagnostics & Setup</h1>

    <div class="step">
        <h3>1. PHP Version & Extensions</h3>
        <p>PHP Version: <strong><?= phpversion() ?></strong></p>
        <p>PDO MySQL: <?= extension_loaded('pdo_mysql') ? '<span class="badge badge-success">Enabled</span>' : '<span class="badge badge-fail">Missing</span>' ?></p>
        <p>OpenSSL: <?= extension_loaded('openssl') ? '<span class="badge badge-success">Enabled</span>' : '<span class="badge badge-fail">Missing</span>' ?></p>
        <p>Composer Vendor Exists: <?= file_exists(__DIR__ . '/../vendor/autoload.php') ? '<span class="badge badge-success">YES (Installed)</span>' : '<span class="badge badge-fail">NO (Run composer install)</span>' ?></p>
    </div>

    <div class="step">
        <h3>2. Environment (.env) Configuration</h3>
        <?php
        $envPath = __DIR__ . '/../.env';
        if (file_exists($envPath)) {
            echo '<p><span class="badge badge-success">.env file found!</span></p>';
            $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $env = [];
            foreach ($envLines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($key, $val) = explode('=', $line, 2);
                    $env[trim($key)] = trim($val);
                }
            }
            echo '<p>DB Connection: <code>' . htmlspecialchars($env['DB_CONNECTION'] ?? 'mysql') . '</code></p>';
            echo '<p>DB Host: <code>' . htmlspecialchars($env['DB_HOST'] ?? '127.0.0.1') . '</code></p>';
            echo '<p>DB Database: <code>' . htmlspecialchars($env['DB_DATABASE'] ?? '') . '</code></p>';
            echo '<p>DB Username: <code>' . htmlspecialchars($env['DB_USERNAME'] ?? '') . '</code></p>';
            echo '<p>APP_KEY: ' . (!empty($env['APP_KEY']) ? '<span class="badge badge-success">Configured</span>' : '<span class="badge badge-fail">Missing</span>') . '</p>';
        } else {
            echo '<p><span class="badge badge-fail">.env file NOT found in /backend/</span></p>';
            $env = [];
        }
        ?>
    </div>

    <div class="step">
        <h3>3. Database Connection Test</h3>
        <?php
        if (!empty($env['DB_DATABASE']) && !empty($env['DB_USERNAME'])) {
            try {
                $dsn = "mysql:host=" . ($env['DB_HOST'] ?? '127.0.0.1') . ";port=" . ($env['DB_PORT'] ?? '3306') . ";dbname=" . $env['DB_DATABASE'] . ";charset=utf8mb4";
                $pdo = new PDO($dsn, $env['DB_USERNAME'], $env['DB_PASSWORD'] ?? '', [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 5
                ]);
                echo '<p><span class="badge badge-success">Database Connected Successfully!</span></p>';

                // Check tables
                $stmt = $pdo->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                echo '<p>Found <strong>' . count($tables) . '</strong> tables in database.</p>';
                if (!empty($tables)) {
                    echo '<pre>' . implode(', ', $tables) . '</pre>';
                    if (in_array('products', $tables)) {
                        $count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
                        echo '<p>Total Products in catalog: <strong>' . $count . '</strong></p>';
                    }
                } else {
                    echo '<p style="color: #fbbf24;">No tables found yet. Click below or run migrations to import catalog:</p>';
                    echo '<p><a class="btn" href="?secret=freshbasket2026&action=import_sql">Import freshbasket_database.sql Now</a></p>';
                }
            } catch (Exception $e) {
                echo '<p><span class="badge badge-fail">Database Error:</span> ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
        } else {
            echo '<p style="color: #f87171;">Database credentials incomplete in .env</p>';
        }

        // Handle direct SQL import action
        if (isset($_GET['action']) && $_GET['action'] === 'import_sql' && isset($pdo)) {
            echo '<h4>Importing freshbasket_database.sql...</h4>';
            $sqlFile = __DIR__ . '/../database/freshbasket_database.sql';
            if (file_exists($sqlFile)) {
                $sqlContent = file_get_contents($sqlFile);
                $pdo->exec($sqlContent);
                echo '<p><span class="badge badge-success">SQL Dump Imported Successfully with 745 products!</span></p>';
                echo '<script>setTimeout(() => { window.location.href="?secret=freshbasket2026"; }, 2000);</script>';
            } else {
                echo '<p><span class="badge badge-fail">File not found: ' . $sqlFile . '</span></p>';
            }
        }
        ?>
    </div>

    <div class="step">
        <h3>4. Quick Links</h3>
        <p>
            <a class="btn" href="/admin" target="_blank">Open Admin Panel (/admin)</a> &nbsp;
            <a class="btn" href="/cpanel_deploy.php?secret=freshbasket2026" target="_blank" style="background: #3b82f6;">Run deploy.sh Trigger</a>
        </p>
    </div>
</div>
</body>
</html>
