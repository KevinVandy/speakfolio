CREATE TABLE IF NOT EXISTS "profile_views" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"viewer_profile_id" uuid NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE "presentations" DROP CONSTRAINT "presentations_profile_id_profiles_id_fk";
-- --> statement-breakpoint
-- ALTER TABLE "profile_bios" DROP CONSTRAINT "profile_bios_profile_id_profiles_id_fk";
-- --> statement-breakpoint
-- ALTER TABLE "profile_links" DROP CONSTRAINT "profile_links_profile_id_profiles_id_fk";
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
ALTER TABLE "profiles" ADD CONSTRAINT "profile_user_id_unique" UNIQUE("user_id");