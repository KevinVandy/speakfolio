import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { profilesToGroupsTable } from "./profileGroupsTable";

export const groupVisibilities = [
  "public",
  "private",
  "signed_in_users",
  "members_only",
] as const;

export const groupVisibilityEnum = pgEnum(
  "group_visibility",
  groupVisibilities
);

export const groupColors = [
  "red",
  "blue",
  "green",
  "grape",
  "yellow",
  "orange",
  "violet",
  "pink",
  "indigo",
  "cyan",
  "lime",
  "teal",
] as const;

export const groupColorEnum = pgEnum("group_color", groupColors);

export const groupsTable = pgTable(
  "groups",
  {
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    description: text("description").default(""),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    groupColor: groupColorEnum("group_color").default("blue"),
    organizationId: text("user_id"), //clerk org id
    slug: text("slug").notNull(),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    groupOrganizationIdUnique: unique("group_organization_id_unique").on(
      table.organizationId
    ),
    groupSlugUnique: unique("group_slug_unique").on(table.slug),
  })
);

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  profilesToGroups: many(profilesToGroupsTable),
}));
