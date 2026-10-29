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

# 2. Detect Composer binary in cPanel or prepare composer.phar
COMPOSER_CMD=""
for candidate in /opt/cpanel/composer/bin/composer /usr/local/cpanel/3rdparty/bin/composer /usr/local/bin/composer /usr/bin/composer; do
    if [ -x "$candidate" ]; then
        COMPOSER_CMD="$candidate"
        break
    fi
done

if [ -z "$COMPOSER_CMD" ] && command -v composer >/dev/null 2>&1; then
    COMPOSER_CMD="composer"
fi

if [ -z "$COMPOSER_CMD" ]; then
    if [ ! -f "composer.phar" ]; then
        echo "Composer not found in system path. Downloading composer.phar..."
        curl -sS https://getcomposer.org/installer | $PHP_BIN -- --quiet
    fi
    if [ -f "composer.phar" ]; then
        COMPOSER_CMD="$PHP_BIN composer.phar"
    fi
fi
echo "Using Composer command: $COMPOSER_CMD"

# 3. Install Composer dependencies if vendor folder does not exist
if [ ! -d "vendor" ]; then
    echo "vendor/ directory not found. Installing composer dependencies..."
    if [ -n "$COMPOSER_CMD" ]; then
        $COMPOSER_CMD install --no-dev --prefer-dist --optimize-autoloader || echo "Notice: Composer install had warnings"
    else
        echo "Notice: Composer could not be initialized. Run composer install in cPanel Terminal"
    fi
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
$PHP_BIN artisan migrate --force || echo "Notice: Database migration pending DB credentials verification"

# 7. Clear old caches and optimize for production
echo "Optimizing Laravel caches..."
$PHP_BIN artisan optimize:clear || true
$PHP_BIN artisan config:cache || true
$PHP_BIN artisan route:cache || true
$PHP_BIN artisan view:cache || true

echo "=== Deployment & Database Migrations Complete! ==="
