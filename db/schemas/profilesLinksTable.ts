import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const linkSiteEnum = pgEnum("link_site", [
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
]);

export const profilesLinksTable = pgTable("profile_links", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  link: text("link").notNull(),
  profileId: uuid("profile_id").references(() => profilesTable.id),
  site: linkSiteEnum("site").default("Other"),
  title: text("title").default(""),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profilesLinksTableRelations = relations(
  profilesLinksTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profilesLinksTable.profileId],
      references: [profilesTable.id],
    }),
  })
);

export type IProfileLink = typeof profilesLinksTable.$inferSelect;
