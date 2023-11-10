import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profilesBiosTable = pgTable("profiles_bios", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  plainText: text("plain_text").default(""),
  profileId: uuid("profile_id")
    .references(() => profilesTable.id)
    .notNull(),
  richText: text("bio_rich_text").default(""),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profilesBiosTableRelations = relations(
  profilesBiosTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profilesBiosTable.profileId],
      references: [profilesTable.id],
    }),
  })
);
