import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config"

async function runMigration() {
	const migrationClient = postgres(process.env.DB_URL!, { max: 1 });

	await migrate(drizzle(migrationClient), { migrationsFolder: "./migrations" });

	await migrationClient.end();
}

runMigration();