<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Creates a staff account for the admin panel, or sets a new password on an existing one.
 *
 *   php artisan admin:user manager@example.com --name="Store Manager"   (asks for the password)
 *   php artisan admin:user --from-env                                    (deploys: ADMIN_EMAIL / ADMIN_PASSWORD, create only)
 */
class AdminUser extends Command
{
    protected $signature = 'admin:user
        {email? : Staff email address}
        {--name= : Name shown in the admin panel}
        {--password= : Password (asked for when left out)}
        {--from-env : Create the account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet}';

    protected $description = 'Create a staff account for /admin, or set a new password on one';

    public function handle(): int
    {
        return $this->option('from-env') ? $this->fromEnv() : $this->createOrUpdate();
    }

    private function fromEnv(): int
    {
        $email = trim((string) config('admin.bootstrap.email'));
        $password = (string) config('admin.bootstrap.password');
        if ($email === '' || $password === '') {
            $this->line('ADMIN_EMAIL / ADMIN_PASSWORD not set: no staff account created.');

            return self::SUCCESS;
        }
        if (User::where('email', $email)->exists()) {
            $this->line("Staff account $email already exists: left unchanged.");

            return self::SUCCESS;
        }
        if ($problem = $this->passwordProblem($password)) {
            $this->error("ADMIN_PASSWORD: $problem");

            return self::FAILURE;
        }

        User::create(['name' => (string) config('admin.bootstrap.name') ?: 'Store Manager', 'email' => $email, 'password' => $password]);
        $this->info("Staff account $email created.");

        return self::SUCCESS;
    }

    private function createOrUpdate(): int
    {
        $email = trim((string) ($this->argument('email') ?: $this->ask('Staff email address')));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('That is not an email address.');

            return self::FAILURE;
        }

        $password = (string) ($this->option('password') ?: $this->secret('Password (at least ' . config('admin.min_password_length', 10) . ' characters)'));
        if ($problem = $this->passwordProblem($password)) {
            $this->error($problem);

            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $isNew = ! $user->exists;
        $user->name = $this->option('name') ?: ($user->name ?: 'Store Manager');
        $user->password = $password; // hashed by the model cast
        $user->save();

        $this->info($isNew ? "Staff account $email created." : "New password set for $email.");

        return self::SUCCESS;
    }

    private function passwordProblem(string $password): ?string
    {
        $min = (int) config('admin.min_password_length', 10);
        if (mb_strlen($password) < $min) {
            return "The password must be at least $min characters.";
        }
        if (in_array($password, config('admin.starter_passwords', []), true)) {
            return 'That is the published starter password; choose another.';
        }

        return null;
    }
}
