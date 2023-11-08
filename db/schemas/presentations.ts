import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const presentationStatusEnum = pgEnum("presentation_status", [
  "archived",
  "draft",
  "presented",
  "ready",
]);

export const presentationsTable = pgTable("presentations", {
  abstract: text("abstract").default(""),
  coverImageUrl: text("cover_image_url"),
  headline: text("headline").default(""),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  lastPresentedAt: text("last_presented_at").default(""),
  profileId: uuid("profile_id").references(() => profilesTable.id),
  slidesUrl: text("slides_url").default(""),
  status: presentationStatusEnum("status").default("draft"),
  timesPresented: text("times_presented").default(""),
  title: text("presentation_name").notNull(),
  videoUrl: text("video_url").default(""),
});

export const presentationsTableRelations = relations(
  presentationsTable,
  ({ one }) => ({
    profile: one(profilesTable),
  })
);

export type IPresentation = typeof presentationsTable.$inferSelect;
