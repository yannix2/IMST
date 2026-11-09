import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`page_visuals_slots\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_visuals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_visuals_slots_order_idx\` ON \`page_visuals_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals_slots_parent_id_idx\` ON \`page_visuals_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals_slots_image_idx\` ON \`page_visuals_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`page_visuals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`page\` text,
  	\`header_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`header_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`page_visuals_page_idx\` ON \`page_visuals\` (\`page\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals_header_idx\` ON \`page_visuals\` (\`header_id\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals_updated_at_idx\` ON \`page_visuals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals_created_at_idx\` ON \`page_visuals\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`page_visuals__status_idx\` ON \`page_visuals\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_page_visuals_v_version_slots\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_visuals_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_slots_order_idx\` ON \`_page_visuals_v_version_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_slots_parent_id_idx\` ON \`_page_visuals_v_version_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_slots_image_idx\` ON \`_page_visuals_v_version_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_visuals_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_page\` text,
  	\`version_header_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`page_visuals\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_header_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_parent_idx\` ON \`_page_visuals_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_version_page_idx\` ON \`_page_visuals_v\` (\`version_page\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_version_header_idx\` ON \`_page_visuals_v\` (\`version_header_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_version_updated_at_idx\` ON \`_page_visuals_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_version_created_at_idx\` ON \`_page_visuals_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_version_version__status_idx\` ON \`_page_visuals_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_created_at_idx\` ON \`_page_visuals_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_updated_at_idx\` ON \`_page_visuals_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_snapshot_idx\` ON \`_page_visuals_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_published_locale_idx\` ON \`_page_visuals_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_page_visuals_v_latest_idx\` ON \`_page_visuals_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`news_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_stages_order_idx\` ON \`news_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`news_stages_parent_idx\` ON \`news_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`news_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_photos_order_idx\` ON \`news_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_photos_parent_id_idx\` ON \`news_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_photos_image_idx\` ON \`news_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`news_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`news_photos_locales_locale_parent_id_unique\` ON \`news_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_photos_locales_parent_id_idx\` ON \`news_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_news_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_version_stages_order_idx\` ON \`_news_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_stages_parent_idx\` ON \`_news_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_version_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_version_photos_order_idx\` ON \`_news_v_version_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_photos_parent_id_idx\` ON \`_news_v_version_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_photos_image_idx\` ON \`_news_v_version_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_version_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_v_version_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_news_v_version_photos_locales_locale_parent_id_unique\` ON \`_news_v_version_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_photos_locales_parent_id_idx\` ON \`_news_v_version_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`albums_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_stages_order_idx\` ON \`albums_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`albums_stages_parent_idx\` ON \`albums_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`albums_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_photos_order_idx\` ON \`albums_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`albums_photos_parent_id_idx\` ON \`albums_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_photos_image_idx\` ON \`albums_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`albums_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_photos_locales_locale_parent_id_unique\` ON \`albums_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_photos_locales_parent_id_idx\` ON \`albums_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`date\` text,
  	\`cover_id\` integer,
  	\`video_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_slug_idx\` ON \`albums\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`albums_cover_idx\` ON \`albums\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_video_idx\` ON \`albums\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_updated_at_idx\` ON \`albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`albums_created_at_idx\` ON \`albums\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`albums__status_idx\` ON \`albums\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`albums_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`translation_status\` text DEFAULT 'draft',
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_locales_locale_parent_id_unique\` ON \`albums_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_locales_parent_id_idx\` ON \`albums_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_albums_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_albums_v_version_stages_order_idx\` ON \`_albums_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_stages_parent_idx\` ON \`_albums_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v_version_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_albums_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_albums_v_version_photos_order_idx\` ON \`_albums_v_version_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_photos_parent_id_idx\` ON \`_albums_v_version_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_photos_image_idx\` ON \`_albums_v_version_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v_version_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_albums_v_version_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_albums_v_version_photos_locales_locale_parent_id_unique\` ON \`_albums_v_version_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_photos_locales_parent_id_idx\` ON \`_albums_v_version_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_date\` text,
  	\`version_cover_id\` integer,
  	\`version_video_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_albums_v_parent_idx\` ON \`_albums_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version_slug_idx\` ON \`_albums_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version_cover_idx\` ON \`_albums_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version_video_idx\` ON \`_albums_v\` (\`version_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version_updated_at_idx\` ON \`_albums_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version_created_at_idx\` ON \`_albums_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_version_version__status_idx\` ON \`_albums_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_created_at_idx\` ON \`_albums_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_updated_at_idx\` ON \`_albums_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_snapshot_idx\` ON \`_albums_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_published_locale_idx\` ON \`_albums_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_latest_idx\` ON \`_albums_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_albums_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_albums_v_locales_locale_parent_id_unique\` ON \`_albums_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_locales_parent_id_idx\` ON \`_albums_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`clubs_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`clubs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`clubs_stages_order_idx\` ON \`clubs_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`clubs_stages_parent_idx\` ON \`clubs_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`clubs_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`clubs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`clubs_photos_order_idx\` ON \`clubs_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`clubs_photos_parent_id_idx\` ON \`clubs_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`clubs_photos_image_idx\` ON \`clubs_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`clubs_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`clubs_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`clubs_photos_locales_locale_parent_id_unique\` ON \`clubs_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`clubs_photos_locales_parent_id_idx\` ON \`clubs_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`clubs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`campus\` text,
  	\`partner\` text,
  	\`photo_id\` integer,
  	\`order\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`clubs_slug_idx\` ON \`clubs\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`clubs_photo_idx\` ON \`clubs\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`clubs_updated_at_idx\` ON \`clubs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`clubs_created_at_idx\` ON \`clubs\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`clubs__status_idx\` ON \`clubs\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`clubs_locales\` (
  	\`name\` text,
  	\`summary\` text,
  	\`description\` text,
  	\`schedule\` text,
  	\`translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`clubs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`clubs_locales_locale_parent_id_unique\` ON \`clubs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`clubs_locales_parent_id_idx\` ON \`clubs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_clubs_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_clubs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_stages_order_idx\` ON \`_clubs_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_stages_parent_idx\` ON \`_clubs_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_clubs_v_version_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_clubs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_photos_order_idx\` ON \`_clubs_v_version_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_photos_parent_id_idx\` ON \`_clubs_v_version_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_photos_image_idx\` ON \`_clubs_v_version_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_clubs_v_version_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_clubs_v_version_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_clubs_v_version_photos_locales_locale_parent_id_unique\` ON \`_clubs_v_version_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_photos_locales_parent_id_idx\` ON \`_clubs_v_version_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_clubs_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_campus\` text,
  	\`version_partner\` text,
  	\`version_photo_id\` integer,
  	\`version_order\` numeric DEFAULT 100,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`clubs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_clubs_v_parent_idx\` ON \`_clubs_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_version_slug_idx\` ON \`_clubs_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_version_photo_idx\` ON \`_clubs_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_version_updated_at_idx\` ON \`_clubs_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_version_created_at_idx\` ON \`_clubs_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_version_version__status_idx\` ON \`_clubs_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_created_at_idx\` ON \`_clubs_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_updated_at_idx\` ON \`_clubs_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_snapshot_idx\` ON \`_clubs_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_published_locale_idx\` ON \`_clubs_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_latest_idx\` ON \`_clubs_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_clubs_v_locales\` (
  	\`version_name\` text,
  	\`version_summary\` text,
  	\`version_description\` text,
  	\`version_schedule\` text,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_clubs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_clubs_v_locales_locale_parent_id_unique\` ON \`_clubs_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clubs_v_locales_parent_id_idx\` ON \`_clubs_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`trips_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`trips\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`trips_stages_order_idx\` ON \`trips_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`trips_stages_parent_idx\` ON \`trips_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`trips_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`trips\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`trips_photos_order_idx\` ON \`trips_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`trips_photos_parent_id_idx\` ON \`trips_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`trips_photos_image_idx\` ON \`trips_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`trips_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`trips_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`trips_photos_locales_locale_parent_id_unique\` ON \`trips_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`trips_photos_locales_parent_id_idx\` ON \`trips_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`trips\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`last_visit\` text,
  	\`photo_id\` integer,
  	\`order\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`trips_slug_idx\` ON \`trips\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`trips_photo_idx\` ON \`trips\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`trips_updated_at_idx\` ON \`trips\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`trips_created_at_idx\` ON \`trips\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`trips__status_idx\` ON \`trips\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`trips_locales\` (
  	\`destination\` text,
  	\`place\` text,
  	\`summary\` text,
  	\`translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`trips\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`trips_locales_locale_parent_id_unique\` ON \`trips_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`trips_locales_parent_id_idx\` ON \`trips_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_trips_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_trips_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_trips_v_version_stages_order_idx\` ON \`_trips_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_stages_parent_idx\` ON \`_trips_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_trips_v_version_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_trips_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_trips_v_version_photos_order_idx\` ON \`_trips_v_version_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_photos_parent_id_idx\` ON \`_trips_v_version_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_photos_image_idx\` ON \`_trips_v_version_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_trips_v_version_photos_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_trips_v_version_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_trips_v_version_photos_locales_locale_parent_id_unique\` ON \`_trips_v_version_photos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_photos_locales_parent_id_idx\` ON \`_trips_v_version_photos_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_trips_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_last_visit\` text,
  	\`version_photo_id\` integer,
  	\`version_order\` numeric DEFAULT 100,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`trips\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_trips_v_parent_idx\` ON \`_trips_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_version_slug_idx\` ON \`_trips_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_version_photo_idx\` ON \`_trips_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_version_updated_at_idx\` ON \`_trips_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_version_created_at_idx\` ON \`_trips_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_version_version__status_idx\` ON \`_trips_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_created_at_idx\` ON \`_trips_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_updated_at_idx\` ON \`_trips_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_snapshot_idx\` ON \`_trips_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_published_locale_idx\` ON \`_trips_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_latest_idx\` ON \`_trips_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_trips_v_locales\` (
  	\`version_destination\` text,
  	\`version_place\` text,
  	\`version_summary\` text,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_trips_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_trips_v_locales_locale_parent_id_unique\` ON \`_trips_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_trips_v_locales_parent_id_idx\` ON \`_trips_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`documents_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`documents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`documents_stages_order_idx\` ON \`documents_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`documents_stages_parent_idx\` ON \`documents_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text,
  	\`school_year\` text,
  	\`valid_from\` text,
  	\`valid_until\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`documents_updated_at_idx\` ON \`documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`documents_created_at_idx\` ON \`documents\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`documents__status_idx\` ON \`documents\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`documents_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`file_id\` integer,
  	\`translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`documents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`documents_file_idx\` ON \`documents_locales\` (\`file_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`documents_locales_locale_parent_id_unique\` ON \`documents_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`documents_locales_parent_id_idx\` ON \`documents_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_documents_v_version_stages\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_documents_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_documents_v_version_stages_order_idx\` ON \`_documents_v_version_stages\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_version_stages_parent_idx\` ON \`_documents_v_version_stages\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_documents_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_kind\` text,
  	\`version_school_year\` text,
  	\`version_valid_from\` text,
  	\`version_valid_until\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`documents\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_documents_v_parent_idx\` ON \`_documents_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_version_version_updated_at_idx\` ON \`_documents_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_version_version_created_at_idx\` ON \`_documents_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_version_version__status_idx\` ON \`_documents_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_created_at_idx\` ON \`_documents_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_updated_at_idx\` ON \`_documents_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_snapshot_idx\` ON \`_documents_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_published_locale_idx\` ON \`_documents_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_latest_idx\` ON \`_documents_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_documents_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_file_id\` integer,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_documents_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_documents_v_version_version_file_idx\` ON \`_documents_v_locales\` (\`version_file_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_documents_v_locales_locale_parent_id_unique\` ON \`_documents_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_documents_v_locales_parent_id_idx\` ON \`_documents_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`campus\` text,
  	\`contract\` text,
  	\`starts_on\` text,
  	\`closes_on\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`jobs_slug_idx\` ON \`jobs\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`jobs_updated_at_idx\` ON \`jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`jobs_created_at_idx\` ON \`jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`jobs__status_idx\` ON \`jobs\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`jobs_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`description\` text,
  	\`translation_status\` text DEFAULT 'draft',
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`jobs_locales_locale_parent_id_unique\` ON \`jobs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`jobs_locales_parent_id_idx\` ON \`jobs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_jobs_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_campus\` text,
  	\`version_contract\` text,
  	\`version_starts_on\` text,
  	\`version_closes_on\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_jobs_v_parent_idx\` ON \`_jobs_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_version_version_slug_idx\` ON \`_jobs_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_version_version_updated_at_idx\` ON \`_jobs_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_version_version_created_at_idx\` ON \`_jobs_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_version_version__status_idx\` ON \`_jobs_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_created_at_idx\` ON \`_jobs_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_updated_at_idx\` ON \`_jobs_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_snapshot_idx\` ON \`_jobs_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_published_locale_idx\` ON \`_jobs_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_latest_idx\` ON \`_jobs_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_jobs_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_description\` text,
  	\`version_translation_status\` text DEFAULT 'draft',
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_jobs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_jobs_v_locales_locale_parent_id_unique\` ON \`_jobs_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_jobs_v_locales_parent_id_idx\` ON \`_jobs_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`applications\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`job_id\` integer,
  	\`position\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`phone\` text,
  	\`message\` text,
  	\`cv_id\` integer NOT NULL,
  	\`locale\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`privacy_notice_accepted_at\` text NOT NULL,
  	\`staff_notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cv_id\`) REFERENCES \`private_files\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`applications_job_idx\` ON \`applications\` (\`job_id\`);`)
  await db.run(sql`CREATE INDEX \`applications_cv_idx\` ON \`applications\` (\`cv_id\`);`)
  await db.run(sql`CREATE INDEX \`applications_status_idx\` ON \`applications\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`applications_updated_at_idx\` ON \`applications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`applications_created_at_idx\` ON \`applications\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`private_files\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`prefix\` text DEFAULT 'private',
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`private_files_updated_at_idx\` ON \`private_files\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`private_files_created_at_idx\` ON \`private_files\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`private_files_filename_idx\` ON \`private_files\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text NOT NULL,
  	\`permanent\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`audit_log\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer,
  	\`actor\` text,
  	\`action\` text NOT NULL,
  	\`target\` text NOT NULL,
  	\`target_id\` text,
  	\`summary\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`audit_log_user_idx\` ON \`audit_log\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_action_idx\` ON \`audit_log\` (\`action\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_target_idx\` ON \`audit_log\` (\`target\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_updated_at_idx\` ON \`audit_log\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_created_at_idx\` ON \`audit_log\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home_hero\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`published\` integer DEFAULT false,
  	\`film_landscape_id\` integer,
  	\`film_portrait_id\` integer,
  	\`poster_landscape_id\` integer,
  	\`poster_portrait_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`film_landscape_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`film_portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_landscape_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_film_landscape_idx\` ON \`home_hero\` (\`film_landscape_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_film_portrait_idx\` ON \`home_hero\` (\`film_portrait_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_poster_landscape_idx\` ON \`home_hero\` (\`poster_landscape_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_poster_portrait_idx\` ON \`home_hero\` (\`poster_portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`timetables_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`stage\` text NOT NULL,
  	\`campus\` text,
  	\`start\` text NOT NULL,
  	\`end\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`timetables\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`timetables_rows_order_idx\` ON \`timetables_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`timetables_rows_parent_id_idx\` ON \`timetables_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`timetables_rows_locales\` (
  	\`days\` text NOT NULL,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`timetables_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`timetables_rows_locales_locale_parent_id_unique\` ON \`timetables_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`timetables_rows_locales_parent_id_idx\` ON \`timetables_rows_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`timetables\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`published\` integer DEFAULT false,
  	\`school_year\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_admissions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_admissions_order_idx\` ON \`site_settings_notifications_admissions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_admissions_parent_id_idx\` ON \`site_settings_notifications_admissions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_general\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_general_order_idx\` ON \`site_settings_notifications_general\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_general_parent_id_idx\` ON \`site_settings_notifications_general\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_parents\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_parents_order_idx\` ON \`site_settings_notifications_parents\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_parents_parent_id_idx\` ON \`site_settings_notifications_parents\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_careers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_careers_order_idx\` ON \`site_settings_notifications_careers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_careers_parent_id_idx\` ON \`site_settings_notifications_careers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`ga_measurement_id\` text,
  	\`retention_inquiries_months\` numeric DEFAULT 24,
  	\`retention_applications_months\` numeric DEFAULT 6,
  	\`retention_audit_log_months\` numeric DEFAULT 12,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`office_hours\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_locales_parent_id_idx\` ON \`site_settings_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`focus_x\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`focus_y\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`source\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`slug\` text;`)
  // News written before wave 3 had no web address: give each a stable one (editors can rename it).
  await db.run(sql`UPDATE \`news\` SET \`slug\` = 'news-' || \`id\` WHERE \`slug\` IS NULL;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`event_starts_at\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`event_ends_at\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_slug_idx\` ON \`news\` (\`slug\`);`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`event_place\` text;`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`event_registration\` text;`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`translation_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`seo_title\` text;`)
  await db.run(sql`ALTER TABLE \`news_locales\` ADD \`seo_description\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_slug\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_event_starts_at\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_event_ends_at\` text;`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_slug_idx\` ON \`_news_v\` (\`version_slug\`);`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_body\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_event_place\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_event_registration\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_translation_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_seo_title\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` ADD \`version_seo_description\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`page_visuals_id\` integer REFERENCES page_visuals(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`albums_id\` integer REFERENCES albums(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`clubs_id\` integer REFERENCES clubs(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`trips_id\` integer REFERENCES trips(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`documents_id\` integer REFERENCES documents(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`jobs_id\` integer REFERENCES jobs(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`applications_id\` integer REFERENCES applications(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`private_files_id\` integer REFERENCES private_files(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`redirects_id\` integer REFERENCES redirects(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`audit_log_id\` integer REFERENCES audit_log(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_page_visuals_id_idx\` ON \`payload_locked_documents_rels\` (\`page_visuals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clubs_id_idx\` ON \`payload_locked_documents_rels\` (\`clubs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_trips_id_idx\` ON \`payload_locked_documents_rels\` (\`trips_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_documents_id_idx\` ON \`payload_locked_documents_rels\` (\`documents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`jobs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_private_files_id_idx\` ON \`payload_locked_documents_rels\` (\`private_files_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_log_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_log_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`page_visuals_slots\`;`)
  await db.run(sql`DROP TABLE \`page_visuals\`;`)
  await db.run(sql`DROP TABLE \`_page_visuals_v_version_slots\`;`)
  await db.run(sql`DROP TABLE \`_page_visuals_v\`;`)
  await db.run(sql`DROP TABLE \`news_stages\`;`)
  await db.run(sql`DROP TABLE \`news_photos\`;`)
  await db.run(sql`DROP TABLE \`news_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`_news_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_news_v_version_photos\`;`)
  await db.run(sql`DROP TABLE \`_news_v_version_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`albums_stages\`;`)
  await db.run(sql`DROP TABLE \`albums_photos\`;`)
  await db.run(sql`DROP TABLE \`albums_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`albums\`;`)
  await db.run(sql`DROP TABLE \`albums_locales\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_version_photos\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_version_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`_albums_v\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_locales\`;`)
  await db.run(sql`DROP TABLE \`clubs_stages\`;`)
  await db.run(sql`DROP TABLE \`clubs_photos\`;`)
  await db.run(sql`DROP TABLE \`clubs_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`clubs\`;`)
  await db.run(sql`DROP TABLE \`clubs_locales\`;`)
  await db.run(sql`DROP TABLE \`_clubs_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_clubs_v_version_photos\`;`)
  await db.run(sql`DROP TABLE \`_clubs_v_version_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`_clubs_v\`;`)
  await db.run(sql`DROP TABLE \`_clubs_v_locales\`;`)
  await db.run(sql`DROP TABLE \`trips_stages\`;`)
  await db.run(sql`DROP TABLE \`trips_photos\`;`)
  await db.run(sql`DROP TABLE \`trips_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`trips\`;`)
  await db.run(sql`DROP TABLE \`trips_locales\`;`)
  await db.run(sql`DROP TABLE \`_trips_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_trips_v_version_photos\`;`)
  await db.run(sql`DROP TABLE \`_trips_v_version_photos_locales\`;`)
  await db.run(sql`DROP TABLE \`_trips_v\`;`)
  await db.run(sql`DROP TABLE \`_trips_v_locales\`;`)
  await db.run(sql`DROP TABLE \`documents_stages\`;`)
  await db.run(sql`DROP TABLE \`documents\`;`)
  await db.run(sql`DROP TABLE \`documents_locales\`;`)
  await db.run(sql`DROP TABLE \`_documents_v_version_stages\`;`)
  await db.run(sql`DROP TABLE \`_documents_v\`;`)
  await db.run(sql`DROP TABLE \`_documents_v_locales\`;`)
  await db.run(sql`DROP TABLE \`jobs\`;`)
  await db.run(sql`DROP TABLE \`jobs_locales\`;`)
  await db.run(sql`DROP TABLE \`_jobs_v\`;`)
  await db.run(sql`DROP TABLE \`_jobs_v_locales\`;`)
  await db.run(sql`DROP TABLE \`applications\`;`)
  await db.run(sql`DROP TABLE \`private_files\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`audit_log\`;`)
  await db.run(sql`DROP TABLE \`home_hero\`;`)
  await db.run(sql`DROP TABLE \`timetables_rows\`;`)
  await db.run(sql`DROP TABLE \`timetables_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`timetables\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_admissions\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_general\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_parents\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_careers\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`api_clients_id\` integer,
  	\`pages_id\` integer,
  	\`media_id\` integer,
  	\`inquiries_id\` integer,
  	\`weekly_menus_id\` integer,
  	\`news_id\` integer,
  	\`faqs_id\` integer,
  	\`testimonials_id\` integer,
  	\`people_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`api_clients_id\`) REFERENCES \`api_clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`weekly_menus_id\`) REFERENCES \`weekly_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`people_id\`) REFERENCES \`people\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "faqs_id", "testimonials_id", "people_id") SELECT "id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "faqs_id", "testimonials_id", "people_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_api_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`api_clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_weekly_menus_id_idx\` ON \`payload_locked_documents_rels\` (\`weekly_menus_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_people_id_idx\` ON \`payload_locked_documents_rels\` (\`people_id\`);`)
  await db.run(sql`DROP INDEX \`news_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`news\` DROP COLUMN \`slug\`;`)
  await db.run(sql`ALTER TABLE \`news\` DROP COLUMN \`event_starts_at\`;`)
  await db.run(sql`ALTER TABLE \`news\` DROP COLUMN \`event_ends_at\`;`)
  await db.run(sql`DROP INDEX \`_news_v_version_version_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`_news_v\` DROP COLUMN \`version_slug\`;`)
  await db.run(sql`ALTER TABLE \`_news_v\` DROP COLUMN \`version_event_starts_at\`;`)
  await db.run(sql`ALTER TABLE \`_news_v\` DROP COLUMN \`version_event_ends_at\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`focus_x\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`focus_y\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`source\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`event_place\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`event_registration\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`translation_status\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`seo_title\`;`)
  await db.run(sql`ALTER TABLE \`news_locales\` DROP COLUMN \`seo_description\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_body\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_event_place\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_event_registration\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_translation_status\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_seo_title\`;`)
  await db.run(sql`ALTER TABLE \`_news_v_locales\` DROP COLUMN \`version_seo_description\`;`)
}
