# Admin protection and nightly maintenance (wave 3, B7)

For the IT manager. There is no staging copy (owner decision 2026-11-09): the demo domain is the test site until the school's own domain.

## 1. Protecting the admin login

maarifcms already refuses passwords under 12 characters, locks an account after 5 failed tries
for 15 minutes (Payload `maxLoginAttempts` / `lockTime`), and logs every change in the Audit log.
Add one Cloudflare rule on top, in the dashboard of the domain:

1. **Security > WAF > Rate limiting rules > Create rule.**
   - Name: `maarifcms login`.
   - If incoming requests match: Hostname equals `cms.yassinekhiari.download` **and** URI Path
     equals `/cms-api/users/login` **and** Request Method equals `POST`.
   - Rate: 5 requests per 1 minute, counted by IP.
   - Then: Block for 10 minutes (the free plan allows one rate-limiting rule; this is the one).
2. **Security > WAF > Custom rules > Create rule** (optional, if staff only log in from Tunisia):
   - Hostname equals `cms.yassinekhiari.download` **and** Country is not `Tunisia`.
   - Action: Managed Challenge (not Block, so a staff member travelling can still get in).
3. **Security > Bots:** turn on Bot Fight Mode.
4. When the school's own domain is live, repeat 1 and 2 with its admin hostname.

The public forms are already limited inside maarif-api (5 per minute per form and IP) and
protected by Turnstile; the deploy refuses the test Turnstile key once `LAUNCHED` is `true`.

## 2. Nightly maintenance (03:00 Tunis time)

maarif-api's cron calls maarifcms `POST /cms-api/maintenance/nightly` with `MAINTENANCE_SECRET`.
maarifcms then:

- deletes visit and contact requests older than the retention period set in
  **Settings > Site settings > Retention** (default 24 months), job applications and their CVs
  (default 6 months) and audit log entries (default 12 months);
- removes CV files that never became an application (older than one day);
- writes a full copy of all content, every language, to the private bucket at
  `backups/YYYY-MM-DD.json` and keeps the last 30 days. Photos and PDFs stay in the bucket
  itself and are not copied.

D1 Time Travel (30 days, automatic) stays as the second safety net:
`wrangler d1 time-travel restore maarif-db --timestamp=<ISO time>`.

To check the job ran: Workers > maarif-api > Logs, filter on `nightly`; or list the bucket's
`backups/` folder.
