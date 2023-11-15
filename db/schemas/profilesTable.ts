import { relations } from "drizzle-orm";
import {
  integer,
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
import { profileLinksTable } from "./profileLinksTable";

export const profileVisibilities = [
  "public",
  "private",
  "signed_in_users",
] as const;

export const profileVisibilityEnum = pgEnum(
  "profile_visibility",
  profileVisibilities
);

export const profileColors = [
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

export const profileColorEnum = pgEnum("profile_color", profileColors);

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
    userId: uuid("user_id"), //fk to auth.users.id
    username: text("username").notNull(),
    views: integer("views").default(0),
    visibility: profileVisibilityEnum("visibility").default("public").notNull(),
  },
  (table) => {
    return {
      profileUserIdUnique: unique("profile_user_id_unique").on(table.userId),
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
    links: many(profileLinksTable),
    presentations: many(presentationsTable),
  })
);

export type IProfile = typeof profilesTable.$inferSelect;

export type IProfileFull = IProfile & {
  bio?: Partial<typeof profileBiosTable.$inferSelect>;
  isOwnProfile: boolean;
  links?: Array<Partial<typeof profileLinksTable.$inferSelect>>;
  presentations?: Array<typeof presentationsTable.$inferSelect>;
};
