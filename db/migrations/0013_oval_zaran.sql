CREATE TABLE IF NOT EXISTS "profile_career_histories" (
	"company" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text DEFAULT '',
	"end_date" date,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_current" text DEFAULT 'false',
	"job_title" text DEFAULT '',
	"profile_id" uuid,
	"start_date" date NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "company";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "job_title";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_career_histories" ADD CONSTRAINT "profile_career_histories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
