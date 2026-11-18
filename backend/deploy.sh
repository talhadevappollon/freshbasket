#!/bin/bash
set -e

echo "=== Fresh House cPanel Automated Deployment ==="

# Home folder of the cPanel account running this (the web process may not set HOME)
ACCOUNT_HOME="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f6)"
if [ -n "$ACCOUNT_HOME" ] && [ -d "$ACCOUNT_HOME" ]; then
    export HOME="$ACCOUNT_HOME"
fi
export COMPOSER_HOME="${HOME}/.composer"
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH

# Go to backend directory
cd "$(dirname "$0")"

# 1. Pick a PHP that can run the shop: 8.3 or newer (Laravel 13) with the MySQL driver (pdo_mysql).
#    A server can have a PHP version installed without its extensions, so each one is tested, not just found.
PHP_BIN=""
for candidate in /usr/local/bin/ea-php84 /usr/local/bin/ea-php83 /usr/local/bin/ea-php85 /opt/cpanel/ea-php84/root/usr/bin/php /opt/cpanel/ea-php83/root/usr/bin/php /opt/cpanel/ea-php85/root/usr/bin/php php; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -r 'exit(PHP_VERSION_ID >= 80300 && extension_loaded("pdo_mysql") ? 0 : 1);' >/dev/null 2>&1; then
        PHP_BIN="$candidate"
        break
    fi
done
if [ -z "$PHP_BIN" ]; then
    echo "STOP: no PHP 8.3+ with the pdo_mysql extension found. In cPanel → MultiPHP Manager set the site to PHP 8.3 or 8.4,"
    echo "and in Select PHP Version / PHP Extensions turn on pdo_mysql, then deploy again."
    exit 1
fi
echo "Using PHP binary: $PHP_BIN ($($PHP_BIN -r 'echo PHP_VERSION;'))"

# One deploy at a time (cPanel's "Deploy HEAD Commit" and the webhook can start together)
if command -v flock >/dev/null 2>&1; then
    exec 9>"${HOME}/.freshhouse-deploy.lock"
    flock 9
fi

# 2. Composer: a local composer.phar run by the PHP above (the server's own composer may run on an older PHP)
COMPOSER_CMD=""
if [ -f "composer.phar" ] && ! $PHP_BIN composer.phar --version --no-interaction >/dev/null 2>&1; then
    echo "composer.phar is damaged: downloading it again..."
    rm -f composer.phar
fi
if [ ! -f "composer.phar" ]; then
    echo "Downloading composer.phar..."
    rm -rf .composer-setup && mkdir -p .composer-setup
    if curl -sS https://getcomposer.org/installer | $PHP_BIN -- --quiet --install-dir=.composer-setup; then
        mv -f .composer-setup/composer.phar composer.phar
    fi
    rm -rf .composer-setup
fi
# Shared hosting limits open files and processes: download and unpack one package at a time
export COMPOSER_MAX_PARALLEL_HTTP=1
export COMPOSER_MAX_PARALLEL_PROCESSES=1
export COMPOSER_MEMORY_LIMIT=-1
export COMPOSER_NO_INTERACTION=1
echo "Server limits: open files $(ulimit -n 2>/dev/null), processes $(ulimit -u 2>/dev/null)"
if [ -f "composer.phar" ]; then
    COMPOSER_CMD="$PHP_BIN composer.phar"
else
    for candidate in /opt/cpanel/composer/bin/composer /usr/local/cpanel/3rdparty/bin/composer /usr/local/bin/composer /usr/bin/composer; do
        if [ -x "$candidate" ]; then
            COMPOSER_CMD="$candidate"
            break
        fi
    done
    if [ -z "$COMPOSER_CMD" ] && command -v composer >/dev/null 2>&1; then
        COMPOSER_CMD="composer"
    fi
fi
echo "Using Composer command: $COMPOSER_CMD"

# 3. Ensure required storage and framework directories exist
mkdir -p storage/framework/views storage/framework/cache/data storage/framework/sessions storage/logs bootstrap/cache public/uploads
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# 4. Install Composer dependencies on the first deploy, and again whenever composer.lock changes
if [ ! -f "vendor/autoload.php" ] || [ "composer.lock" -nt "vendor/composer/installed.json" ]; then
    echo "Installing composer dependencies (first deploy or composer.lock changed)..."
    if [ -n "$COMPOSER_CMD" ]; then
        $COMPOSER_CMD install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader || echo "Notice: Composer install had warnings"
    else
        echo "Notice: Composer could not be initialized. Run composer install in cPanel Terminal"
    fi
fi

if [ ! -f "vendor/autoload.php" ]; then
    echo "STOP: Laravel's libraries (backend/vendor) could not be installed; see the composer messages above."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "STOP: backend/.env is missing. Copy backend/.env.production.example to backend/.env, fill it in, then deploy again."
    exit 1
fi

# 5. Generate application key if missing in .env
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "Generating application encryption key..."
    $PHP_BIN artisan key:generate --force || true
fi

# 6. Run database migrations in production with --force flag
echo "Running database migrations..."
$PHP_BIN artisan migrate --force || echo "Notice: Database migration pending DB credentials verification"

# 7. Clear old caches and optimize for production
echo "Optimizing Laravel caches..."
$PHP_BIN artisan optimize:clear || true
$PHP_BIN artisan config:cache || true
$PHP_BIN artisan route:cache || true
$PHP_BIN artisan view:cache || true

# 8. First staff account for /admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env (create only, never overwrites)
$PHP_BIN artisan admin:user --from-env || echo "Notice: staff account from .env not created (see the message above)"

echo "=== Deployment & Database Migrations Complete! ==="
