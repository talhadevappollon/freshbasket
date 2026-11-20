<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>


# Fresh House: project notes

## Addresses (routes)

| What | Live (client) | Test copy |
|---|---|---|
| Public website | https://freshhouse.pk | https://freshbasket.aneetakomal.com |
| Admin panel | https://freshhouse.pk/admin (sign in at `/admin/login`) | https://freshbasket.aneetakomal.com/admin |
| Shop data (API) | `/api/v1/...` | `/api/v1/...` |
| "Coming soon" page | `/coming-soon.html` | not used |
| Private preview link | `/admin/preview/<key>` (copy it from the Dashboard) | not used |
| Deploy webhook | `/cpanel_deploy.php?secret=...` | `/cpanel_deploy.php?secret=...` |

The site must sit at the top of its domain. The website build loads `/_next/...` and calls `/api/v1`, and the admin lives at `/admin`, so a sub-folder such as `/staging` does not work. A staging copy needs its own subdomain, e.g. `staging.freshhouse.pk`.

## Hidden launch ("Coming soon"), on freshhouse.pk only

Until the shop is opened, visitors to freshhouse.pk get `backend/public/coming-soon.html` for every page and API call: no products, no checkout. The test site is never hidden.

**Who still sees the whole website:**
- **Signed-in staff.** Every admin page gives the browser the `fh_preview` cookie.
- **Anyone who opens the private preview link** (Dashboard). The cookie lasts 30 days on that device.

**What is never blocked:**
- `/admin`
- the deploy webhook
- `/.well-known` (certificate checks)
- static files (`/_next`, pictures, fonts)

**To open or hide the shop:** use the card at the top of Admin → Dashboard, "Open the shop to everyone" / "Hide behind Coming soon".

**How it works:**
- **The rules:** they live in the root `.htaccess`, with the same check in `backend/public/.htaccess` for addresses typed with `/backend/public/` directly.
- **The cookie check:** a cookie counts only when its value names a file in `backend/storage/app/preview/`, so no secret is kept in the code.
- **The open switch:** the file `backend/storage/app/site-public` exists while the shop is open.
- **Where these live:** both files are server-only (`storage/app` is not in git), so deploys never change them.
- **The code:** `app/Support/ShopPreview.php`, `app/Http/Middleware/GrantShopPreview.php`, the `admin.website_visibility` and `admin.preview` routes.
- **The deploy page:** it reports "Hidden launch: paths OK / shop hidden or open".
