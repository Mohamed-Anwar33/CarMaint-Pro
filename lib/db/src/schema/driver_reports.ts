import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const oilLevelEnum = pgEnum("oil_level", ["normal", "low"]);
export const healthStatusEnum = pgEnum("health_status", ["green", "yellow", "red"]);

export const driverReportsTable = pgTable("driver_reports", {
  id: text("id").primaryKey(),
  carId: text("car_id").notNull(),
  driverId: text("driver_id").notNull(),
  currentMileage: integer("current_mileage").notNull(),
  oilLevel: oilLevelEnum("oil_level").notNull(),
  tiresStatus: healthStatusEnum("tires_status").notNull(),
  brakesStatus: healthStatusEnum("brakes_status").notNull(),
  acStatus: healthStatusEnum("ac_status").notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertDriverReportSchema = createInsertSchema(driverReportsTable).omit({ submittedAt: true });
export type InsertDriverReport = z.infer<typeof insertDriverReportSchema>;
export type DriverReport = typeof driverReportsTable.$inferSelect;
