import { pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

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
    bio: text("bio").default(""),
    company: text("company").default(""),
    contactEmail: text("contact_email").default(""),
    coverImageUrl: text("cover_image_url"),
    displayName: text("display_name").notNull(),
    headline: text("headline").default(""),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    jobTitle: text("job_title").default(""),
    profession: text("profession").default(""),
    profileColor: profileColorEnum("profile_color").default("blue"),
    profileImageUrl: text("profile_image_url"),
    profileVisibility: profileVisibilityEnum("profile_visibility")
      .notNull()
      .default("public"),
    userId: uuid("user_id"), //fk to auth.users
    username: text("username").notNull(),
  },
  (table) => {
    return {
      profileUsernameUnique: unique("profile_username_unique").on(
        table.username
      ),
    };
  }
);

export type IProfile = typeof profilesTable.$inferSelect;
