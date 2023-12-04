import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profileBiosTable = pgTable("profile_bios", {
  bio: text("bio").default("<p></p>"),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  profileId: text("profile_id")
    .references(() => profilesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
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

export type IProfileBio = typeof profileBiosTable.$inferSelect;
