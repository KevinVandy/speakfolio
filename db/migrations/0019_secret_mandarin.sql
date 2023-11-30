DO $$ BEGIN
 CREATE TYPE "content_feed_type" AS ENUM('blog-api', 'blog-rss', 'custom-api', 'custom-rss', 'youtube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_content_feeds" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"schema" json DEFAULT '{}'::json,
	"name" text DEFAULT '',
	"type" "content_feed_type" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_organizer" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_speaker" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_content_feeds" ADD CONSTRAINT "profile_content_feeds_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
