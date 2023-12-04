import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  primaryKey,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";
import { groupsTable } from "./groupsTable";

export const groupMembershipsTable = pgTable(
  "group_memberships",
  {
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    groupId: text("group_id")
      .notNull()
      .references(() => groupsTable.id), //clerk org id
    isAdmin: boolean("is_admin").default(false),
    profileId: text("profile_id") //also clerk user id
      .notNull()
      .references(() => profilesTable.id),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.profileId] }),
  })
);

export const profilesToGroupsRelations = relations(
  groupMembershipsTable,
  ({ one }) => ({
    group: one(groupsTable, {
      fields: [groupMembershipsTable.groupId],
      references: [groupsTable.id],
    }),
    user: one(profilesTable, {
      fields: [groupMembershipsTable.profileId],
      references: [profilesTable.id],
    }),
  })
);
