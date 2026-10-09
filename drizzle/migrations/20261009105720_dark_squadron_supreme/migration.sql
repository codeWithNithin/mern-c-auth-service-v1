CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"firstName" varchar(255) NOT NULL,
	"lasttName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(60) NOT NULL
);
