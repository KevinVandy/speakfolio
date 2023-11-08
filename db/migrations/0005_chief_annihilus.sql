DO $$ BEGIN
 CREATE TYPE "presentation_status" AS ENUM('archived', 'draft', 'presented', 'ready');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentations" (
	"abstract" text DEFAULT '',
	"cover_image_url" text,
	"headline" text DEFAULT '',
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"last_presented_at" text DEFAULT '',
	"profile_id" uuid,
	"slides_url" text DEFAULT '',
	"status" "presentation_status" DEFAULT 'draft',
	"times_presented" text DEFAULT '',
	"presentation_name" text NOT NULL,
	"video_url" text DEFAULT ''
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "areas_of_expertise" text DEFAULT '';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentations" ADD CONSTRAINT "presentations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
