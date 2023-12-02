ALTER TABLE "profiles" DROP CONSTRAINT "profile_user_id_unique";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "user_id";