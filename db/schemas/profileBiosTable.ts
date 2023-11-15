import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profileBiosTable = pgTable("profile_bios", {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  profileId: uuid("profile_id")
    .references(() => profilesTable.id,{
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  richText: text("rich_text").default(""),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profileBiosTableRelations = relations(
  profileBiosTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profileBiosTable.profileId],
      references: [profilesTable.id],
    }),
  })
);
