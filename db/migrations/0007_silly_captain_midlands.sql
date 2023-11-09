CREATE TABLE IF NOT EXISTS "profiles_bios" (
	"bio" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "display_name" TO "name";--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "profile_visibility" TO "visibility";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "latitude" real;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "longitude" real;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "bio";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles_bios" ADD CONSTRAINT "profiles_bios_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
