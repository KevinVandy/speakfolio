ALTER TABLE "presentations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "presentations" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "presentations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "presentations" DROP COLUMN IF EXISTS "presentation_name";