import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { groupMembershipsTable } from "./groupMembershipsTable";

export const groupVisibilities = [
  "public",
  "admins_only",
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
    id: text("id").primaryKey().notNull(), //clerk org id
    name: text("name").notNull(),
    groupColor: groupColorEnum("group_color").default("blue"),
    slug: text("slug").notNull(),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    visibility: groupVisibilityEnum("visibility").default("public"),
  },
  (table) => ({
    groupSlugUnique: unique("group_slug_unique").on(table.slug),
  })
);

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  members: many(groupMembershipsTable),
}));
