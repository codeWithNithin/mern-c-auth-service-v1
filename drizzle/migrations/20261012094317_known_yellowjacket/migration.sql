CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenantId" integer;