CREATE TABLE IF NOT EXISTS "lab_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lab_id" integer NOT NULL,
	"lab_test_id" integer NOT NULL,
	"time" timestamp NOT NULL,
	"location_type" text NOT NULL,
	"status" text DEFAULT 'booked'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"price" integer NOT NULL,
	"lab_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"time_slots" json NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_bookings" ADD CONSTRAINT "lab_bookings_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_bookings" ADD CONSTRAINT "lab_bookings_lab_test_id_lab_tests_id_fk" FOREIGN KEY ("lab_test_id") REFERENCES "public"."lab_tests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
