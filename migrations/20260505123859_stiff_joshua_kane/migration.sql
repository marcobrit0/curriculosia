ALTER TABLE "user" ADD COLUMN "accepted_terms_at" timestamp with time zone;--> statement-breakpoint
-- Backfill existing accounts: implicit acceptance dated at signup.
UPDATE "user" SET "accepted_terms_at" = "created_at" WHERE "accepted_terms_at" IS NULL;
