import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["manager", "driver", "both", "admin"]);
export const userPlanEnum = pgEnum("user_plan", ["free", "pro", "family_small", "family_large"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("manager"),
  plan: userPlanEnum("plan").notNull().default("free"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  accountType: text("account_type").default("individual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
