import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { carsTable } from "./cars";

export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "declined"]);

export const invitationsTable = pgTable("invitations", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => usersTable.id),
  driverEmail: text("driver_email").notNull(),
  carId: text("car_id").notNull().references(() => carsTable.id),
  status: invitationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitationsTable).omit({ createdAt: true });
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitationsTable.$inferSelect;
