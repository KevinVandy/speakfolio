import { relations } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profilesTable } from "./profilesTable";

export const profileCareerHistoriesTable = pgTable("profile_career_histories", {
  company: text("company").default(""),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  description: text("description").default(""),
  endDate: date("end_date", { mode: "string" }),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  jobTitle: text("job_title").default(""),
  profileId: text("profile_id").references(() => profilesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  startDate: date("start_date", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profileCareerHistoriesTableRelations = relations(
  profileCareerHistoriesTable,
  ({ one }) => ({
    profile: one(profilesTable, {
      fields: [profileCareerHistoriesTable.profileId],
      references: [profilesTable.id],
    }),
  })
);
