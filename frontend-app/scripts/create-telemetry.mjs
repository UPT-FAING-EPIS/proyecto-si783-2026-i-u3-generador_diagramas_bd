import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  console.log("Creating telemetry_events table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "telemetry_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
      "platform" text NOT NULL,
      "event" text NOT NULL,
      "metadata" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;
  console.log("Table telemetry_events verified/created successfully.");
  process.exit(0);
}

main().catch(err => {
  console.error("Error creating table:", err);
  process.exit(1);
});
