@echo off
echo =========================================================================
echo Starting Fresh Basket Pakistan Full-Stack System (Laravel CRM + Next.js)
echo =========================================================================

start "FreshBasket Laravel Backend (Port 8000)" cmd /k "cd backend && php artisan serve --port=8000"
timeout /t 2 /nobreak >nul
start "FreshBasket Next.js Storefront (Port 3000)" cmd /k "cd frontend && npx next start -p 3000"

echo.
echo Both servers are launching!
echo Storefront: http://localhost:3000
echo Admin CRM:  http://localhost:8000/admin
echo API Base:   http://localhost:8000/api/v1
echo Database:   MySQL/MariaDB (Port 3307, freshbasket_db)
echo.
pause

