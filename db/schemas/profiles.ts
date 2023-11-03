import { pgTable, unique, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    username: varchar("username", { length: 256 }).notNull(),
    displayName: varchar("display_name", { length: 256 }).notNull(),
    contactEmail: varchar("contact_email", { length: 256 }).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    profileImageUrl: varchar("profile_image_url", { length: 1024 }),
    userId: uuid("user_id"),
  },
  (table) => {
    return {
      profilesContactEmailUnique: unique("profiles_contact_email_unique").on(
        table.contactEmail
      ),
    };
  }
);

export const selectUserSchema = createSelectSchema(profiles);
export const insertUserSchema = createInsertSchema(profiles);

export type Profile = typeof profiles.$inferSelect