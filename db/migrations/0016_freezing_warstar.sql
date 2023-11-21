ALTER TABLE "presentations" ADD COLUMN "times_presented" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "areas_of_expertise" json DEFAULT '[]';