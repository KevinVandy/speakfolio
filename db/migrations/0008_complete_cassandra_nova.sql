ALTER TABLE "profiles_bios" ADD COLUMN "plain_text" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles_bios" ADD COLUMN "bio_rich_text" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles_bios" DROP COLUMN IF EXISTS "bio";