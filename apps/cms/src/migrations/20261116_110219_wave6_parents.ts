import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`key_dates_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`key_dates\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`key_dates_stages_order_idx\` ON \`key_dates_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`key_dates_stages_parent_idx\` ON \`key_dates_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`key_dates\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'other',
  	\`starts_on\` text,
  	\`ends_on\` text,
  	\`campus\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`key_dates_starts_on_idx\` ON \`key_dates\` (\`starts_on\`);`)
  await db.run(sql`CREATE INDEX \`key_dates_updated_at_idx\` ON \`key_dates\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`key_dates_created_at_idx\` ON \`key_dates\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`key_dates__status_idx\` ON \`key_dates\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`key_dates_locales\` (
  	\`title\` text,
  	\`note\` text,
  	\`translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`key_dates\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`key_dates_locales_locale_parent_id_unique\` ON \`key_dates_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`key_dates_locales_parent_id_idx\` ON \`key_dates_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_key_dates_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_key_dates_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_stages_order_idx\` ON \`_key_dates_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_stages_parent_idx\` ON \`_key_dates_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_key_dates_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_kind\` text DEFAULT 'other',
  	\`version_starts_on\` text,
  	\`version_ends_on\` text,
  	\`version_campus\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`key_dates\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_key_dates_v_parent_idx\` ON \`_key_dates_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_version_starts_on_idx\` ON \`_key_dates_v\` (\`version_starts_on\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_version_updated_at_idx\` ON \`_key_dates_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_version_created_at_idx\` ON \`_key_dates_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_version_version__status_idx\` ON \`_key_dates_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_created_at_idx\` ON \`_key_dates_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_updated_at_idx\` ON \`_key_dates_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_snapshot_idx\` ON \`_key_dates_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_published_locale_idx\` ON \`_key_dates_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_latest_idx\` ON \`_key_dates_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_key_dates_v_locales\` (
  	\`version_title\` text,
  	\`version_note\` text,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_key_dates_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_key_dates_v_locales_locale_parent_id_unique\` ON \`_key_dates_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_key_dates_v_locales_parent_id_idx\` ON \`_key_dates_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`notice\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`active\` integer DEFAULT false,
  	\`until\` text,
  	\`link\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`notice_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`notice\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`notice_locales_locale_parent_id_unique\` ON \`notice_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`notice_locales_parent_id_idx\` ON \`notice_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`key_dates_id\` integer REFERENCES key_dates(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_key_dates_id_idx\` ON \`payload_locked_documents_rels\` (\`key_dates_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`key_dates_stages\`;`)
  await db.run(sql`DROP TABLE \`key_dates\`;`)
  await db.run(sql`DROP TABLE \`key_dates_locales\`;`)
  await db.run(sql`DROP TABLE \`_key_dates_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_key_dates_v\`;`)
  await db.run(sql`DROP TABLE \`_key_dates_v_locales\`;`)
  await db.run(sql`DROP TABLE \`notice\`;`)
  await db.run(sql`DROP TABLE \`notice_locales\`;`)
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
  	\`subscribers_id\` integer,
  	\`newsletters_id\` integer,
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
  	FOREIGN KEY (\`subscribers_id\`) REFERENCES \`subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`newsletters_id\`) REFERENCES \`newsletters\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`audit_log_id\`) REFERENCES \`audit_log\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "page_visuals_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "albums_id", "clubs_id", "trips_id", "faqs_id", "testimonials_id", "people_id", "documents_id", "jobs_id", "applications_id", "private_files_id", "redirects_id", "subscribers_id", "newsletters_id", "audit_log_id") SELECT "id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "page_visuals_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "albums_id", "clubs_id", "trips_id", "faqs_id", "testimonials_id", "people_id", "documents_id", "jobs_id", "applications_id", "private_files_id", "redirects_id", "subscribers_id", "newsletters_id", "audit_log_id" FROM \`payload_locked_documents_rels\`;`)
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_newsletters_id_idx\` ON \`payload_locked_documents_rels\` (\`newsletters_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_log_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_log_id\`);`)
}
