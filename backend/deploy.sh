#!/bin/bash
set -e

echo "=== Fresh Basket cPanel Automated Deployment ==="

# Go to backend directory
cd "$(dirname "$0")"

# 1. Detect PHP binary in cPanel
PHP_BIN="php"
for candidate in /usr/local/bin/ea-php84 /usr/local/bin/ea-php83 /usr/local/bin/ea-php82 /opt/cpanel/ea-php84/root/usr/bin/php /opt/cpanel/ea-php83/root/usr/bin/php /opt/cpanel/ea-php82/root/usr/bin/php; do
    if [ -x "$candidate" ]; then
        PHP_BIN="$candidate"
        break
    fi
done
echo "Using PHP binary: $PHP_BIN"

# 2. Detect Composer binary in cPanel
COMPOSER_BIN="composer"
for candidate in /usr/local/bin/composer /usr/bin/composer; do
    if [ -x "$candidate" ]; then
        COMPOSER_BIN="$candidate"
        break
    fi
done

# 3. Install Composer dependencies if vendor folder does not exist
if [ ! -d "vendor" ]; then
    echo "vendor/ directory not found. Installing composer dependencies..."
    $COMPOSER_BIN install --no-dev --prefer-dist --optimize-autoloader || composer install --no-dev --prefer-dist --optimize-autoloader || echo "Notice: Composer not found in path, please run composer install in cPanel Terminal"
fi

# 4. Generate application key if missing in .env
if [ -f ".env" ] && ! grep -q "^APP_KEY=base64:" .env; then
    echo "Generating application encryption key..."
    $PHP_BIN artisan key:generate --force || true
fi

# 5. Fix permissions for storage and bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# 6. Run database migrations in production with --force flag
echo "Running database migrations..."
$PHP_BIN artisan migrate --force

# 7. Clear old caches and optimize for production
echo "Optimizing Laravel caches..."
$PHP_BIN artisan optimize:clear
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache

echo "=== Deployment & Database Migrations Successful! ==="
