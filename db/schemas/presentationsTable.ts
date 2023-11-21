import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const presentationStatusEnum = pgEnum("presentation_status", [
  "archived",
  "draft",
  "presented",
  "ready",
]);

export const presentationsTable = pgTable("presentations", {
  abstract: text("abstract").default(""),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  headline: text("headline").default(""),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  lastPresentedAt: text("last_presented_at").default(""),
  profileId: uuid("profile_id").references(() => profilesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  slidesUrl: text("slides_url").default(""),
  status: presentationStatusEnum("status").default("draft"),
  timesPresented: integer("times_presented").default(0),
  title: text("title").notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  videoUrl: text("video_url").default(""),
});

export const presentationsTableRelations = relations(
  presentationsTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [presentationsTable.profileId],
      references: [profilesTable.id],
    }),
  })
);

export type IPresentation = typeof presentationsTable.$inferSelect;
