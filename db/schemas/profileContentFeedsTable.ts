import { relations } from "drizzle-orm";
import {
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const contentFeedTypes = [
  "blog-api",
  "blog-rss",
  "custom-api",
  "custom-rss",
  "youtube",
] as const;

export const contentFeedTypeEnum = pgEnum(
  "content_feed_type",
  contentFeedTypes
);

export const profileContentFeedsTable = pgTable("profile_content_feeds", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  profileId: text("profile_id").references(() => profilesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  schema: json("schema").default({}),
  name: text("name").default(""),
  type: contentFeedTypeEnum("type").notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  url: text("url").notNull(),
});

export const profileContentFeedsTableRelations = relations(
  profileContentFeedsTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profileContentFeedsTable.profileId],
      references: [profilesTable.id],
    }),
  })
);

export type IProfileContentFeed = typeof profileContentFeedsTable.$inferSelect;
