ALTER TABLE "profiles" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profile_user_id_unique" UNIQUE("user_id");