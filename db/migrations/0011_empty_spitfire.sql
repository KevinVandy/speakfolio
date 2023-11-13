ALTER TABLE "profiles" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profile_bios" DROP COLUMN IF EXISTS "plain_text";--> statement-breakpoint
ALTER TABLE "profile_links" DROP COLUMN IF EXISTS "updated_at";