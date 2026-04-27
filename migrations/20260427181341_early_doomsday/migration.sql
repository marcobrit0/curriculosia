CREATE TYPE "user_plan" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_customer_id" text,
	"provider_subscription_id" text UNIQUE,
	"status" text NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan" "user_plan" DEFAULT 'free'::"user_plan" NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan_expires_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "subscription_user_id_index" ON "subscription" ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_status_index" ON "subscription" ("status");--> statement-breakpoint
CREATE INDEX "subscription_user_id_status_index" ON "subscription" ("user_id","status");--> statement-breakpoint
CREATE INDEX "user_plan_index" ON "user" ("plan");--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;