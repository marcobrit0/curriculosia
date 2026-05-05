CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"period" text NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_usage_user_id_period_unique" UNIQUE("user_id","period")
);
--> statement-breakpoint
CREATE INDEX "ai_usage_user_id_index" ON "ai_usage" ("user_id");--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;