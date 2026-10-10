CREATE TABLE "refreshtokens" (
	"id" serial PRIMARY KEY,
	"expiresIn" timestamp with time zone NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refreshtokens" ADD CONSTRAINT "refreshtokens_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;