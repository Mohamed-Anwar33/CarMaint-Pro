import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const announcementTypeEnum = pgEnum("announcement_type", ["offer", "update", "tip"]);

export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: announcementTypeEnum("type").notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ createdAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;
