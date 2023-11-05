import { pgTable, unique, uuid, text, pgEnum } from "drizzle-orm/pg-core";

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
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    contactEmail: text("contact_email").default(""),
    profileVisibility: profileVisibilityEnum("profile_visibility")
      .notNull()
      .default("public"),
    profileImageUrl: text("profile_image_url"),
    coverImageUrl: text("cover_image_url"),
    headline: text("headline").default(""),
    bio: text("bio").default(""),
    profession: text("profession").default(""),
    jobTitle: text("job_title").default(""),
    company: text("company").default(""),
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
