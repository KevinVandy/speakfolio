DO $$ BEGIN
 CREATE TYPE "link_site" AS ENUM('Behance', 'BlueSky', 'Blog', 'Dev.to', 'Facebook', 'GitHub', 'Instagram', 'LinkedIn', 'Medium', 'Other', 'Threads', 'TikTok', 'Tumblr', 'Twitch', 'Twitter', 'Website', 'YouTube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_links" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link" text NOT NULL,
	"profile_id" uuid,
	"site" "link_site" DEFAULT 'Other',
	"title" text DEFAULT '',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
