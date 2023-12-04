import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { presentationsTable } from "./presentationsTable";
import { profileBiosTable } from "./profileBiosTable";
import { profileCareerHistoriesTable } from "./profileCareerHistoriesTable";
import { profileContentFeedsTable } from "./profileContentFeedsTable";
import { profileLinksTable } from "./profileLinksTable";
import { groupMembershipsTable } from "./groupMembershipsTable";

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
    areasOfExpertise: json("areas_of_expertise").$type<string[]>().default([]),
    blogRssFeedUrl: text("blog_rss_feed_url").default(""),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    headline: text("headline").default(""),
    id: text("id").primaryKey().notNull(), //also clerk user id - must be inserted from clerk at creation
    isOrganizer: boolean("is_organizer").default(false),
    isSpeaker: boolean("is_speaker").default(false),
    latitude: real("latitude"),
    location: text("location").default(""),
    longitude: real("longitude"),
    profession: text("profession").default(""),
    profileColor: profileColorEnum("profile_color").default("blue"),
    profileImageUrl: text("profile_image_url"),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    username: text("username").notNull(),
    views: integer("views").default(0),
    visibility: profileVisibilityEnum("visibility").default("public").notNull(),
  },
  (table) => ({
    profileUsernameUnique: unique("profile_username_unique").on(table.username),
  })
);

export const profilesTableRelations = relations(
  profilesTable,
  ({ many, one }) => ({
    bio: one(profileBiosTable),
    careerHistories: many(profileCareerHistoriesTable),
    contentFeeds: many(profileContentFeedsTable),
    groupMemberships: many(groupMembershipsTable),
    links: many(profileLinksTable),
    presentations: many(presentationsTable),
  })
);

export type IProfile = typeof profilesTable.$inferSelect;

export type IProfileFull = IProfile & {
  bio?: Partial<typeof profileBiosTable.$inferSelect>;
  careerHistories?: Array<
    Partial<typeof profileCareerHistoriesTable.$inferSelect>
  >;
  contentFeeds?: Array<typeof profileContentFeedsTable.$inferSelect>;
  groupMemberships?: Array<typeof groupMembershipsTable.$inferSelect>;
  isOwnProfile: boolean;
  links?: Array<Partial<typeof profileLinksTable.$inferSelect>>;
  presentations?: Array<typeof presentationsTable.$inferSelect>;
};
