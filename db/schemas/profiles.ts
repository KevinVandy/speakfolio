import {
  integer,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  boolean,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 256 }).notNull(),
  display_name: varchar("display_name", { length: 256 }).notNull(),
  contact_email: varchar("contact_email", { length: 256 }).notNull().unique(),
  is_public: boolean("is_public").notNull().default(false),
  profile_image_url: varchar("profile_image_url", { length: 1024 }),
});
