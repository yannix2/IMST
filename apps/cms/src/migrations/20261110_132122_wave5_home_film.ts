import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`home_hero_locales\` (
  	\`transcript\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_hero_locales_locale_parent_id_unique\` ON \`home_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_locales_parent_id_idx\` ON \`home_hero_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`home_hero\` ADD \`full_film_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`home_hero\` ADD \`full_film_small_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`home_hero\` ADD \`full_film_poster_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`home_hero_full_film_idx\` ON \`home_hero\` (\`full_film_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_full_film_small_idx\` ON \`home_hero\` (\`full_film_small_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_full_film_poster_idx\` ON \`home_hero\` (\`full_film_poster_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`home_hero_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_hero\` (
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
  await db.run(sql`INSERT INTO \`__new_home_hero\`("id", "published", "film_landscape_id", "film_portrait_id", "poster_landscape_id", "poster_portrait_id", "updated_at", "created_at") SELECT "id", "published", "film_landscape_id", "film_portrait_id", "poster_landscape_id", "poster_portrait_id", "updated_at", "created_at" FROM \`home_hero\`;`)
  await db.run(sql`DROP TABLE \`home_hero\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_hero\` RENAME TO \`home_hero\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_hero_film_landscape_idx\` ON \`home_hero\` (\`film_landscape_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_film_portrait_idx\` ON \`home_hero\` (\`film_portrait_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_poster_landscape_idx\` ON \`home_hero\` (\`poster_landscape_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_poster_portrait_idx\` ON \`home_hero\` (\`poster_portrait_id\`);`)
}
