ALTER TABLE "doctors" ADD COLUMN "hospital" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "experience" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "availability" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "fees" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "bio" text;