import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transmissionEnum = pgEnum("transmission_type", ["automatic", "manual"]);
export const engineOilEnum = pgEnum("engine_oil_type", ["5000km", "10000km", "custom"]);

export const carsTable = pgTable("cars", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  driverId: text("driver_id"),
  name: text("name").notNull(),
  modelYear: integer("model_year").notNull(),
  transmissionType: transmissionEnum("transmission_type").notNull(),
  engineOilType: engineOilEnum("engine_oil_type").notNull(),
  coolantFillDate: text("coolant_fill_date"),
  coolantNextAlertDate: text("coolant_next_alert_date"),
  registrationExpiry: text("registration_expiry"),
  licenseExpiry: text("license_expiry"),
  insuranceExpiry: text("insurance_expiry"),
  inspectionExpiry: text("inspection_expiry"),
  batteryInstallDate: text("battery_install_date"),
  batteryWarrantyMonths: integer("battery_warranty_months"),
  tireInstallDate: text("tire_install_date"),
  tireWarrantyMonths: integer("tire_warranty_months"),
  tireSize: text("tire_size"),
  lastMileage: integer("last_mileage"),
  nextOilChangeMileage: integer("next_oil_change_mileage"),
  plateNumber: text("plate_number"),
  notes: text("notes"),
  engineOilCustomDays: integer("engine_oil_custom_days"),
  engineOilCustomKm: integer("engine_oil_custom_km"),
  batteryBrand: text("battery_brand"),
  lastReportDate: timestamp("last_report_date"),
  driverName: text("driver_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  invoices: text("invoices").array().default([]),
  batteryInvoice: text("battery_invoice"),
  tireInvoice: text("tire_invoice"),
});

export const insertCarSchema = createInsertSchema(carsTable).omit({ createdAt: true });
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof carsTable.$inferSelect;
