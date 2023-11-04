import {
  pgTable,
  unique,
  uuid,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const profileVisibilityEnum = pgEnum("profile_visibility", [
  "public",
  "private",
  "signed_in_users",
]);

export const profileColorEnum = pgEnum("profile_color", [
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
  "gray",
]);

export const profilesTable = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"), //fk to auth.users
    username: varchar("username", { length: 256 }).notNull(),
    displayName: varchar("display_name", { length: 256 }).notNull(),
    contactEmail: varchar("contact_email", { length: 256 }).notNull(),
    profileVisibility: profileVisibilityEnum("profile_visibility")
      .notNull()
      .default("public"),
    profileImageUrl: varchar("profile_image_url", { length: 1024 }),
    coverImageUrl: varchar("cover_image_url", { length: 1024 }),
    headline: varchar("headline", { length: 256 }),
    bio: text("bio"),
    profession: varchar("profession", { length: 128 }),
    jobTitle: varchar("job_title", { length: 256 }),
    company: varchar("company", { length: 256 }),
    profileColor: profileColorEnum("profile_color").default("blue"),
  },
  (table) => {
    return {
      profilesContactEmailUnique: unique("profiles_contact_email_unique").on(
        table.contactEmail
      ),
      profileUsernameUnique: unique("profile_username_unique").on(
        table.username
      ),
    };
  }
);

export type IProfile = typeof profilesTable.$inferSelect;

export const selectProfileSchema = createSelectSchema(profilesTable);
export const insertProfileSchema = createInsertSchema(profilesTable);
