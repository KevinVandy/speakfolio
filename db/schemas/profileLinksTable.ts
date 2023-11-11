import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const linkSites = [
  "Behance",
  "BlueSky",
  "Blog",
  "Dev.to",
  "Facebook",
  "GitHub",
  "Instagram",
  "LinkedIn",
  "Medium",
  "Other",
  "Threads",
  "TikTok",
  "Tumblr",
  "Twitch",
  "Twitter",
  "Website",
  "YouTube",
] as const;

export const linkSiteEnum = pgEnum("link_site", linkSites);

export const profileLinksTable = pgTable("profile_links", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  profileId: uuid("profile_id").references(() => profilesTable.id),
  site: linkSiteEnum("site").default("Other"),
  title: text("title").default(""),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  url: text("url").notNull(),
});

export const profileLinksTableRelations = relations(
  profileLinksTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profileLinksTable.profileId],
      references: [profilesTable.id],
    }),
  })
);

export type IProfileLink = typeof profileLinksTable.$inferSelect;
