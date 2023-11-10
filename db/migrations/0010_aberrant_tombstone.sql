-- ALTER TABLE "profiles_bios" DROP CONSTRAINT "profiles_bios_profile_id_profiles_id_fk";--> statement-breakpoint
ALTER TABLE "profiles_bios" RENAME TO "profile_bios";--> statement-breakpoint
ALTER TABLE "profile_links" RENAME COLUMN "link" TO "url";--> statement-breakpoint
ALTER TABLE "profile_bios" RENAME COLUMN "bio_rich_text" TO "rich_text";--> statement-breakpoint
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_bios" ADD CONSTRAINT "profile_bios_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
