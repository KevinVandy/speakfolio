import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  text,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";
import { groupsTable } from "./groupsTable";

export const profilesToGroupsTable = pgTable(
  "profile_groups",
  {
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groupsTable.id),
    isAdmin: boolean("is_admin").default(false),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profilesTable.id),
    organizationId: text("organization_id"), //clerk org id
    userId: text("user_id"), //clerk user id
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.profileId] }),
  })
);

export const profilesToGroupsRelations = relations(
  profilesToGroupsTable,
  ({ one }) => ({
    group: one(groupsTable, {
      fields: [profilesToGroupsTable.groupId],
      references: [groupsTable.id],
    }),
    user: one(profilesTable, {
      fields: [profilesToGroupsTable.profileId],
      references: [profilesTable.id],
    }),
  })
);
