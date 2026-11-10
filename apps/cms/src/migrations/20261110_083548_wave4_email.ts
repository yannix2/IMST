import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`subscribers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	\`locale\` text DEFAULT 'en' NOT NULL,
  	\`status\` text DEFAULT 'pending' NOT NULL,
  	\`consent_at\` text,
  	\`confirmed_at\` text,
  	\`unsubscribed_at\` text,
  	\`unsubscribe_reason\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`subscribers_email_idx\` ON \`subscribers\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`subscribers_status_idx\` ON \`subscribers\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`subscribers_updated_at_idx\` ON \`subscribers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`subscribers_created_at_idx\` ON \`subscribers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`newsletters\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`stats_total\` numeric,
  	\`stats_sent\` numeric,
  	\`stats_failed\` numeric,
  	\`stats_cursor\` numeric,
  	\`stats_send_requested_at\` text,
  	\`stats_sent_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`newsletters_status_idx\` ON \`newsletters\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`newsletters_updated_at_idx\` ON \`newsletters\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`newsletters_created_at_idx\` ON \`newsletters\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`newsletters_locales\` (
  	\`subject\` text,
  	\`preheader\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`newsletters\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`newsletters_locales_locale_parent_id_unique\` ON \`newsletters_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`newsletters_locales_parent_id_idx\` ON \`newsletters_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`language\` text DEFAULT 'en';`)
  await db.run(sql`ALTER TABLE \`inquiries\` ADD \`visit_confirmed_for\` text;`)
  await db.run(sql`ALTER TABLE \`inquiries\` ADD \`visit_campus\` text;`)
  await db.run(sql`ALTER TABLE \`inquiries\` ADD \`visit_send_confirmation\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`inquiries\` ADD \`visit_confirmation_sent_at\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`subscribers_id\` integer REFERENCES subscribers(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`newsletters_id\` integer REFERENCES newsletters(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_newsletters_id_idx\` ON \`payload_locked_documents_rels\` (\`newsletters_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`subscribers\`;`)
  await db.run(sql`DROP TABLE \`newsletters\`;`)
  await db.run(sql`DROP TABLE \`newsletters_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`api_clients_id\` integer,
  	\`pages_id\` integer,
  	\`page_visuals_id\` integer,
  	\`media_id\` integer,
  	\`inquiries_id\` integer,
  	\`weekly_menus_id\` integer,
  	\`news_id\` integer,
  	\`albums_id\` integer,
  	\`clubs_id\` integer,
  	\`trips_id\` integer,
  	\`faqs_id\` integer,
  	\`testimonials_id\` integer,
  	\`people_id\` integer,
  	\`documents_id\` integer,
  	\`jobs_id\` integer,
  	\`applications_id\` integer,
  	\`private_files_id\` integer,
  	\`redirects_id\` integer,
  	\`audit_log_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`api_clients_id\`) REFERENCES \`api_clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`page_visuals_id\`) REFERENCES \`page_visuals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`weekly_menus_id\`) REFERENCES \`weekly_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`albums_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`clubs_id\`) REFERENCES \`clubs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`trips_id\`) REFERENCES \`trips\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`people_id\`) REFERENCES \`people\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`documents_id\`) REFERENCES \`documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`jobs_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`applications_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`private_files_id\`) REFERENCES \`private_files\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`audit_log_id\`) REFERENCES \`audit_log\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "page_visuals_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "albums_id", "clubs_id", "trips_id", "faqs_id", "testimonials_id", "people_id", "documents_id", "jobs_id", "applications_id", "private_files_id", "redirects_id", "audit_log_id") SELECT "id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "page_visuals_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "albums_id", "clubs_id", "trips_id", "faqs_id", "testimonials_id", "people_id", "documents_id", "jobs_id", "applications_id", "private_files_id", "redirects_id", "audit_log_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_api_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`api_clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_page_visuals_id_idx\` ON \`payload_locked_documents_rels\` (\`page_visuals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_weekly_menus_id_idx\` ON \`payload_locked_documents_rels\` (\`weekly_menus_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clubs_id_idx\` ON \`payload_locked_documents_rels\` (\`clubs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_trips_id_idx\` ON \`payload_locked_documents_rels\` (\`trips_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_people_id_idx\` ON \`payload_locked_documents_rels\` (\`people_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_documents_id_idx\` ON \`payload_locked_documents_rels\` (\`documents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`jobs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_private_files_id_idx\` ON \`payload_locked_documents_rels\` (\`private_files_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_log_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_log_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`language\`;`)
  await db.run(sql`ALTER TABLE \`inquiries\` DROP COLUMN \`visit_confirmed_for\`;`)
  await db.run(sql`ALTER TABLE \`inquiries\` DROP COLUMN \`visit_campus\`;`)
  await db.run(sql`ALTER TABLE \`inquiries\` DROP COLUMN \`visit_send_confirmation\`;`)
  await db.run(sql`ALTER TABLE \`inquiries\` DROP COLUMN \`visit_confirmation_sent_at\`;`)
}
