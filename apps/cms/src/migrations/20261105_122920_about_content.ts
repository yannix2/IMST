import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`people\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`photo_id\` integer,
  	\`photo_consent\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 10,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`people_photo_idx\` ON \`people\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`people_updated_at_idx\` ON \`people\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`people_created_at_idx\` ON \`people\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`people__status_idx\` ON \`people\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`people_locales\` (
  	\`role\` text,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`people\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`people_locales_locale_parent_id_unique\` ON \`people_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`people_locales_parent_id_idx\` ON \`people_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_people_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_photo_id\` integer,
  	\`version_photo_consent\` integer DEFAULT false,
  	\`version_order\` numeric DEFAULT 10,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`people\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_people_v_parent_idx\` ON \`_people_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_version_version_photo_idx\` ON \`_people_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_version_version_updated_at_idx\` ON \`_people_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_version_version_created_at_idx\` ON \`_people_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_version_version__status_idx\` ON \`_people_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_created_at_idx\` ON \`_people_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_updated_at_idx\` ON \`_people_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_snapshot_idx\` ON \`_people_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_published_locale_idx\` ON \`_people_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_latest_idx\` ON \`_people_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_people_v_locales\` (
  	\`version_role\` text,
  	\`version_bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_people_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_people_v_locales_locale_parent_id_unique\` ON \`_people_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_people_v_locales_parent_id_idx\` ON \`_people_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`school_facts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`published\` integer DEFAULT false,
  	\`cambridge_centre_number\` text,
  	\`cambridge_since\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`people_id\` integer REFERENCES people(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_people_id_idx\` ON \`payload_locked_documents_rels\` (\`people_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`people\`;`)
  await db.run(sql`DROP TABLE \`people_locales\`;`)
  await db.run(sql`DROP TABLE \`_people_v\`;`)
  await db.run(sql`DROP TABLE \`_people_v_locales\`;`)
  await db.run(sql`DROP TABLE \`school_facts\`;`)
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`api_clients_id\`) REFERENCES \`api_clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`weekly_menus_id\`) REFERENCES \`weekly_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "faqs_id", "testimonials_id") SELECT "id", "order", "parent_id", "path", "users_id", "api_clients_id", "pages_id", "media_id", "inquiries_id", "weekly_menus_id", "news_id", "faqs_id", "testimonials_id" FROM \`payload_locked_documents_rels\`;`)
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
}
