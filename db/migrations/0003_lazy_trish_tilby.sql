ALTER TABLE "profiles" ALTER COLUMN "username" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "display_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "contact_email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "contact_email" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "contact_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "profile_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "cover_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "headline" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "headline" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bio" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "profession" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "profession" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "job_title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "job_title" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "company" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "company" SET DEFAULT '';