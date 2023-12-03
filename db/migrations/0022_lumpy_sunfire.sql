DO $$ BEGIN
 CREATE TYPE "group_color" AS ENUM('red', 'blue', 'green', 'grape', 'yellow', 'orange', 'violet', 'pink', 'indigo', 'cyan', 'lime', 'teal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "group_visibility" AS ENUM('public', 'private', 'signed_in_users', 'members_only');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_groups" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"group_id" uuid NOT NULL,
	"is_admin" boolean DEFAULT false,
	"profile_id" uuid NOT NULL,
	"organization_id" text,
	"user_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT profile_groups_group_id_profile_id_pk PRIMARY KEY("group_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text DEFAULT '',
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"group_color" "group_color" DEFAULT 'blue',
	"user_id" text,
	"slug" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_organization_id_unique" UNIQUE("user_id"),
	CONSTRAINT "group_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "contact_email";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_groups" ADD CONSTRAINT "profile_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_groups" ADD CONSTRAINT "profile_groups_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
