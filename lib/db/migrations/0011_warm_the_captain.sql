CREATE TABLE IF NOT EXISTS "medication_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"medication_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"time_of_day" text NOT NULL,
	"status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"dosage" text NOT NULL,
	"notes" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
