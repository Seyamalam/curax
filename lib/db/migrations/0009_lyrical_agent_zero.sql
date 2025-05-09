CREATE TABLE IF NOT EXISTS "ambulance_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pickup_location" text NOT NULL,
	"destination" text NOT NULL,
	"time" timestamp NOT NULL,
	"status" text DEFAULT 'booked'
);
