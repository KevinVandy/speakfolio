import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profileViewsTable = pgTable("profile_views", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: serial("id").primaryKey().notNull(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profilesTable.id),
  viewerProfileId: text("viewer_profile_id").references(() => profilesTable.id),
});

export const profileViewsTableRelations = relations(
  profileViewsTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profileViewsTable.profileId],
      references: [profilesTable.id],
    }),
    viewerProfile: one(profilesTable, {
      fields: [profileViewsTable.viewerProfileId],
      references: [profilesTable.id],
    }),
  })
);
