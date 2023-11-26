ALTER TABLE "profiles" ADD COLUMN "blog_rss_feed_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "presentations" DROP COLUMN IF EXISTS "headline";