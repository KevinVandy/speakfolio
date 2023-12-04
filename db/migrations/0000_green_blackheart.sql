DO $$ BEGIN
 CREATE TYPE "presentation_status" AS ENUM('archived', 'draft', 'presented', 'ready');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "link_site" AS ENUM('Behance', 'BlueSky', 'Blog', 'Dev.to', 'Facebook', 'GitHub', 'Instagram', 'LinkedIn', 'Medium', 'Other', 'Threads', 'TikTok', 'Tumblr', 'Twitch', 'Twitter', 'Website', 'YouTube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "profile_color" AS ENUM('red', 'blue', 'green', 'grape', 'yellow', 'orange', 'violet', 'pink', 'indigo', 'cyan', 'lime', 'teal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "profile_visibility" AS ENUM('public', 'private', 'signed_in_users');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "content_feed_type" AS ENUM('blog-api', 'blog-rss', 'custom-api', 'custom-rss', 'youtube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "group_color" AS ENUM('red', 'blue', 'green', 'grape', 'yellow', 'orange', 'violet', 'pink', 'indigo', 'cyan', 'lime', 'teal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "group_visibility" AS ENUM('public', 'admins_only', 'signed_in_users', 'members_only');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentations" (
	"abstract" text DEFAULT '',
	"cover_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"last_presented_at" text DEFAULT '',
	"profile_id" text,
	"slides_url" text DEFAULT '',
	"status" "presentation_status" DEFAULT 'draft',
	"times_presented" integer DEFAULT 0,
	"title" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"video_url" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_bios" (
	"bio" text DEFAULT '<p></p>',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_links" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text,
	"site" "link_site" DEFAULT 'Other',
	"title" text DEFAULT '',
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_views" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"viewer_profile_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"areas_of_expertise" json DEFAULT '[]'::json,
	"blog_rss_feed_url" text DEFAULT '',
	"cover_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"headline" text DEFAULT '',
	"id" text PRIMARY KEY NOT NULL,
	"is_organizer" boolean DEFAULT false,
	"is_speaker" boolean DEFAULT false,
	"latitude" real,
	"location" text DEFAULT '',
	"longitude" real,
	"profession" text DEFAULT '',
	"profile_color" "profile_color" DEFAULT 'blue',
	"profile_image_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"username" text NOT NULL,
	"views" integer DEFAULT 0,
	"visibility" "profile_visibility" DEFAULT 'public' NOT NULL,
	CONSTRAINT "profile_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_career_histories" (
	"company" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text DEFAULT '',
	"end_date" date,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_title" text DEFAULT '',
	"profile_id" text,
	"start_date" date NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_content_feeds" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text,
	"schema" json DEFAULT '{}'::json,
	"name" text DEFAULT '',
	"type" "content_feed_type" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_memberships" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"group_id" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"profile_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT group_memberships_group_id_profile_id_pk PRIMARY KEY("group_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text DEFAULT '',
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"group_color" "group_color" DEFAULT 'blue',
	"slug" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visibility" "group_visibility" DEFAULT 'public',
	CONSTRAINT "group_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentations" ADD CONSTRAINT "presentations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_bios" ADD CONSTRAINT "profile_bios_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_profile_id_profiles_id_fk" FOREIGN KEY ("viewer_profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_career_histories" ADD CONSTRAINT "profile_career_histories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_content_feeds" ADD CONSTRAINT "profile_content_feeds_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
