DO $$ BEGIN
 CREATE TYPE "profile_color" AS ENUM('red', 'blue', 'green', 'grape', 'yellow', 'orange', 'violet', 'pink', 'indigo', 'cyan', 'lime', 'teal', 'gray');
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
ALTER TABLE "profiles" ADD COLUMN "profile_visibility" "profile_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cover_image_url" varchar(1024);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "headline" varchar(256);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profession" varchar(128);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "job_title" varchar(256);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company" varchar(256);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_color" "profile_color" DEFAULT 'blue';--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "is_public";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profile_username_unique" UNIQUE("username");