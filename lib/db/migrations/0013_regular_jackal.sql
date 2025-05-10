CREATE TABLE IF NOT EXISTS "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"doctor_id" integer NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"instructions" text,
	"issued_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"refillable" boolean DEFAULT false,
	"refills_remaining" integer DEFAULT 0,
	"file_url" text,
	"status" text DEFAULT 'active'
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
