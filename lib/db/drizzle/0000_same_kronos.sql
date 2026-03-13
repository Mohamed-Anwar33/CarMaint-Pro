CREATE TYPE "public"."user_plan" AS ENUM('free', 'pro', 'family_small', 'family_large');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('manager', 'driver', 'both', 'admin');--> statement-breakpoint
CREATE TYPE "public"."engine_oil_type" AS ENUM('5000km', '10000km', 'custom');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('automatic', 'manual');--> statement-breakpoint
CREATE TYPE "public"."announcement_type" AS ENUM('offer', 'update');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."oil_level" AS ENUM('normal', 'low');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'manager' NOT NULL,
	"plan" "user_plan" DEFAULT 'free' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"driver_id" text,
	"name" text NOT NULL,
	"model_year" integer NOT NULL,
	"transmission_type" "transmission_type" NOT NULL,
	"engine_oil_type" "engine_oil_type" NOT NULL,
	"coolant_fill_date" text,
	"coolant_next_alert_date" text,
	"registration_expiry" text,
	"license_expiry" text,
	"insurance_expiry" text,
	"inspection_expiry" text,
	"battery_install_date" text,
	"battery_warranty_months" integer,
	"tire_install_date" text,
	"tire_warranty_months" integer,
	"tire_size" text,
	"last_mileage" integer,
	"next_oil_change_mileage" integer,
	"plate_number" text,
	"notes" text,
	"engine_oil_custom_days" integer,
	"engine_oil_custom_km" integer,
	"battery_brand" text,
	"driver_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "announcement_type" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"car_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"current_mileage" integer NOT NULL,
	"oil_level" "oil_level" NOT NULL,
	"tires_status" "health_status" NOT NULL,
	"brakes_status" "health_status" NOT NULL,
	"ac_status" "health_status" NOT NULL,
	"notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
