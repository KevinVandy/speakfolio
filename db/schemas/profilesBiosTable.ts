import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profilesBiosTable = pgTable("profiles_bios", {
  bio: text("bio").default(""),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  profileId: uuid("profile_id")
    .references(() => profilesTable.id)
    .notNull(),
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
