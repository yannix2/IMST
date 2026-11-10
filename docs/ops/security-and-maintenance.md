# Admin protection, nightly maintenance, email and the Home film (waves 3 to 5)

For the IT manager. There is no staging copy (owner decision 2026-11-09): the demo domain is the test site until the school's own domain.

## 1. Protecting the admin login

maarifcms already refuses passwords under 12 characters, locks an account after 5 failed tries
for 15 minutes (Payload `maxLoginAttempts` / `lockTime`), and logs every change in the Audit log.
Add one Cloudflare rule on top, in the dashboard of the domain:

1. **Security > WAF > Rate limiting rules > Create rule** (done by the owner, 2026-11-10).
   - Name: `maarifcms login`.
   - If incoming requests match: URI Path equals `/cms-api/users/login` (only maarifcms serves
     `/cms-api`, so no hostname is needed; adding Request Method `POST` is optional).
   - Rate: 5 requests per 10 seconds, counted by IP (with data centre, Cloudflare's default).
   - Then: Block for 10 seconds. The free plan allows one rate-limiting rule and only these
     10-second periods; the longer lockout comes from maarifcms itself (5 failed tries = 15
     minutes locked, above).
2. **Security > WAF > Custom rules > Create rule** (enabled by the owner, 2026-11-10; for staff who only log in from Tunisia):
   - Hostname equals `cms.yassinekhiari.download` **and** Country is not `Tunisia`.
   - Action: Managed Challenge (not Block, so a staff member travelling can still get in).
3. **Security > Bots:** turn on Bot Fight Mode.
4. When the school's own domain is live, repeat 1 and 2 with its admin hostname.

The public forms are already limited inside maarif-api (5 per minute per form and IP) and
protected by Turnstile; the deploy refuses the test Turnstile key once `LAUNCHED` is `true`.
Switching to a real Turnstile widget: first deploy the real **site key** (public, in
`apps/web/.env.production`) while maarif-api still has the always-pass test secret, then set the
real secret with `npx.cmd wrangler secret put TURNSTILE_SECRET --name maarif-api`. The other order
breaks the forms in between (a real secret refuses the test widget's tokens).

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
`backups/` folder. Since wave 4 it also deletes newsletter sign-ups never confirmed within 30 days.

## 3. Email (wave 4, ADR 011)

Every email leaves through **Cloudflare Email Service** (the `EMAIL` binding of maarif-api and
maarifcms). It needs the account on **Workers Paid** ($5 a month): 3,000 emails a month are
included, then $0.35 per 1,000. Email Sending is still in beta; Cloudflare publishes no hard
limits, so the newsletter sender stops on a rate or daily limit and resumes five minutes later.

| Email | Sent by | From | Replies go to |
|---|---|---|---|
| Confirmation after a form (visit, pre-registration, contact, feedback, application) | maarif-api | `noreply@` | `contact@` |
| "New entry" to staff (no personal details, a link to maarifcms) | maarif-api | `noreply@` | `contact@` |
| "Your visit is confirmed" (admissions tick the box on the visit request) | maarifcms | `noreply@` | `contact@` |
| maarifcms invitation (72 hours) and password reset (1 hour) | maarifcms | `noreply@` | `support@` |
| Newsletter sign-up confirmation and the newsletter itself | maarifcms | `info@` | `info@` |
| "Newsletter sent" report to staff | maarifcms | `noreply@` | `contact@` |

The domain is the Worker variable `MAIL_DOMAIN` (both `apps/api/wrangler.jsonc` and
`apps/cms/wrangler.jsonc`), today `yassinekhiari.download`. Moving to the school's domain =
change it in both files, onboard the new domain (step 2 below), set up its routing (step 3),
deploy.

Staff recipients come from **maarifcms > Settings > Site settings > Notifications** (admissions,
general, parents, careers). The newsletter report goes to the "general" list.

### One-time setup in the Cloudflare dashboard

1. **Billing:** upgrade the account to **Workers Paid**.
2. **Compute > Email Service > Email Sending > Onboard domain:** `yassinekhiari.download`.
   Cloudflare adds the SPF, DKIM and DMARC records to the zone itself. Wait until the domain
   shows as verified.
3. **Email > Email Routing:** enable it on the zone, add the owner's real inbox as a
   destination address (Cloudflare sends one verification email: click it), then create three
   routes: `info@`, `contact@`, `support@` → that inbox. `noreply@` gets no route: nobody
   answers it, and replies already go elsewhere.
4. Send yourself a test: create a staff account for your own address in maarifcms (you get the
   invitation), sign up for the newsletter in the site's footer (you get the confirmation), and
   send a visit request with your email (you get the confirmation; staff in Site settings get
   the notification).

### Newsletter, for staff

1. **maarifcms > Newsletter > Newsletters > Create:** write the English subject and text first
   (required), then the other languages. Subscribers get their language, or English when it is
   missing.
2. Save, then **Send a test to me** in the sidebar: each language version arrives in your inbox.
3. Set the status to **Ready to send** and save. A reviewer presses **Send to subscribers**.
4. Batches of 200 leave every five minutes; the sidebar counts fill in. When it is done the
   status becomes **Sent** and the "general" staff list gets a short report. Addresses that
   bounce are unsubscribed automatically.

Only people who signed up on the website and clicked the confirmation link are subscribers;
nobody can be added by hand. Administrators can export the list (Newsletter subscribers >
Export to spreadsheet).

### What to watch

- **Workers > maarif-api / maarif-cms > Logs:** `email not sent` warnings carry the error code
  (`sender_domain` = the domain is not onboarded yet; `daily_limit` / `rate_limit` = wait;
  `suppressed` = that address bounced before).
- **Compute > Email Service:** sending volume and bounces. Stay well under 3,000 a month to
  avoid paying extra; a newsletter to 1,000 subscribers is 1,000 emails.

## 4. The Home film (wave 5)

Home opens on the school's film: a silent 20-second loop behind the headline, and "Watch the film
· 3 min" for the full film with sound. Both live in **maarifcms > Content > Home film**; until a
reviewer ticks **Show on the website**, the site keeps its built-in photo loop and shows no film
button. The files are never put in the code (the repository is public and the film shows
children).

**Make the files** (on the IT manager's computer, originals in `E:\IMST\IMSTMEDIA`):

1. `cd WebsiteApp\tools\media`, then `node admissions-film.mjs --sheet` to see the loop's shots
   (`%TEMP%\maarif-admissions-film\trailer-shots.jpg`). To change them, edit
   `admissions-film.json` (start time, length, horizontal centre for phones).
2. `node admissions-film.mjs` writes the loop (wide ≤ 4 MB, tall ≤ 2.5 MB), its still images,
   the full film (720p ≤ 28 MB, 480p ≤ 15 MB) and its still image. It stops if a file is too big.
3. Upload: `$env:CMS_URL="https://cms.yassinekhiari.download"; $env:CMS_EMAIL="..."; $env:CMS_PASSWORD="..."; node upload-to-cms.mjs --film`
   (a reviewer account; add `--publish` to show it at once). Or upload the files by hand in
   maarifcms and pick them in Home film.

**Transcripts:** the film has English subtitles burned in. In Home film, switch the language at
the top of the page and paste "What is said in the film" for each language (one paragraph per
line). French, Arabic and Turkish visitors see it open under the player.

**A new film later:** put it in IMSTMEDIA, change `source` (and the shots) in
`admissions-film.json`, run steps 1 to 3, and update the transcripts. maarifcms accepts videos
up to 30 MB and other files up to 10 MB.
