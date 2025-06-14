CREATE TABLE "auth_code" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"code" text,
	"email" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"google_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"team" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"image" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_dependency" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"description" text,
	"parent_id" text,
	"tree_path" text,
	"tree_depth" integer DEFAULT 0 NOT NULL,
	"sort_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_manual" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_problem" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_problem_image" (
	"id" text PRIMARY KEY NOT NULL,
	"product_problem_id" text NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_solution" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_problem_id" text NOT NULL,
	"description" text NOT NULL,
	"reply_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_solution_checked" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_solution_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_solution_image" (
	"id" text PRIMARY KEY NOT NULL,
	"product_solution_id" text NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"route" text NOT NULL,
	"email" text NOT NULL,
	"ip" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_file" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"related_to" text,
	"related_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notify_updates" boolean DEFAULT false NOT NULL,
	"send_newsletters" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"genre" text NOT NULL,
	"phone" text NOT NULL,
	"role" text NOT NULL,
	"team" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_code" ADD CONSTRAINT "auth_code_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_provider" ADD CONSTRAINT "auth_provider_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_contact" ADD CONSTRAINT "product_contact_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_dependency" ADD CONSTRAINT "product_dependency_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_manual" ADD CONSTRAINT "product_manual_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem" ADD CONSTRAINT "product_problem_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem" ADD CONSTRAINT "product_problem_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem_image" ADD CONSTRAINT "product_problem_image_product_problem_id_product_problem_id_fk" FOREIGN KEY ("product_problem_id") REFERENCES "public"."product_problem"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution" ADD CONSTRAINT "product_solution_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution" ADD CONSTRAINT "product_solution_product_problem_id_product_problem_id_fk" FOREIGN KEY ("product_problem_id") REFERENCES "public"."product_problem"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_checked" ADD CONSTRAINT "product_solution_checked_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_checked" ADD CONSTRAINT "product_solution_checked_product_solution_id_product_solution_id_fk" FOREIGN KEY ("product_solution_id") REFERENCES "public"."product_solution"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_image" ADD CONSTRAINT "product_solution_image_product_solution_id_product_solution_id_fk" FOREIGN KEY ("product_solution_id") REFERENCES "public"."product_solution"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_file" ADD CONSTRAINT "system_file_uploaded_by_auth_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;