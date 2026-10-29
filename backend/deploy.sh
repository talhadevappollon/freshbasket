#!/bin/bash
set -e

echo "=== Fresh Basket cPanel Automated Deployment ==="

# Go to backend directory
cd "$(dirname "$0")"

# Put application in brief maintenance mode during migration
php artisan down || true

# 1. Run migrations in production with --force flag
echo "Running database migrations..."
php artisan migrate --force

# 2. Clear old caches and re-cache for production speed
echo "Optimizing Laravel caches..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Bring application back up
php artisan up

echo "=== Deployment & Database Migrations Successful! ==="

