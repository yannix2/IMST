# Patches to dependencies

Applied automatically by pnpm (`patchedDependencies` in `pnpm-workspace.yaml`) on every install, locally and in the deploy workflow.

## payload@3.92.1.patch

Payload 3.92 hashes passwords with PBKDF2-SHA256 at 600,000 iterations (hard-coded in `dist/auth/strategies/local/generatePasswordSaltHash.js`). Cloudflare Workers refuse more than 100,000 (`NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported`), so creating or logging in a user failed with a 500 on maarifcms. The patch sets the iterations to 100,000, the highest Workers allow; the same constant is used to create and to check a hash, so logins stay consistent.

- Accounts hashed before the patch (local development only) no longer log in: reset them, or recreate the local database.
- When upgrading Payload, check that file again: if the constant changed or became configurable, update or drop this patch (`pnpm patch payload@<version>`, edit, `pnpm patch-commit <dir>`).
- 100,000 is below the OWASP recommendation of 600,000 for PBKDF2-SHA256; the admin is also protected by login rate limits (`maxLoginAttempts: 5`, 15-minute lock) and strong passwords.
