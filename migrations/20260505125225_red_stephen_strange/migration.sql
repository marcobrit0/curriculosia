CREATE TABLE "billing_event_log" (
	"stripe_event_id" text PRIMARY KEY,
	"event_type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_export_entitlement" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid NOT NULL,
	"stripe_payment_intent_id" text NOT NULL UNIQUE,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resume_export_entitlement_user_id_resume_id_unique" UNIQUE("user_id","resume_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_stripe_customer_id_key" UNIQUE("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "billing_event_log_event_type_index" ON "billing_event_log" ("event_type");--> statement-breakpoint
CREATE INDEX "resume_export_entitlement_resume_id_index" ON "resume_export_entitlement" ("resume_id");--> statement-breakpoint
ALTER TABLE "resume_export_entitlement" ADD CONSTRAINT "resume_export_entitlement_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_export_entitlement" ADD CONSTRAINT "resume_export_entitlement_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE CASCADE;