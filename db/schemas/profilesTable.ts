import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { presentationsTable } from "./presentationsTable";
import { profileBiosTable } from "./profileBiosTable";
import { profilesLinksTable } from "./profileLinksTable";

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
    areasOfExpertise: text("areas_of_expertise").default(""),
    company: text("company").default(""),
    contactEmail: text("contact_email").default(""),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    headline: text("headline").default(""),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    jobTitle: text("job_title").default(""),
    latitude: real("latitude"),
    location: text("location").default(""),
    longitude: real("longitude"),
    name: text("name").notNull(),
    profession: text("profession").default(""),
    profileColor: profileColorEnum("profile_color").default("blue"),
    profileImageUrl: text("profile_image_url"),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id"), //fk to auth.users
    username: text("username").notNull(),
    visibility: profileVisibilityEnum("visibility").default("public").notNull(),
  },
  (table) => {
    return {
      profileUsernameUnique: unique("profile_username_unique").on(
        table.username
      ),
    };
  }
);

export const profilesTableRelations = relations(
  profilesTable,
  ({ many, one }) => ({
    bio: one(profileBiosTable),
    links: many(profilesLinksTable),
    presentations: many(presentationsTable),
  })
);

export type IProfile = typeof profilesTable.$inferSelect;

export type IProfileFull = IProfile & {
  bio?: Partial<typeof profileBiosTable.$inferSelect>;
  isOwnProfile: boolean;
  presentations?: (typeof presentationsTable.$inferSelect)[];
};
