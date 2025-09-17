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
	"image" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"receiver_group_id" text,
	"receiver_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_user_presence" (
	"user_id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"team" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contact_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'icon-[lucide--users]' NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"max_users" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "help" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"turns" jsonb DEFAULT '["0","6","12","18"]'::jsonb NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "product_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"turn" integer NOT NULL,
	"status" text NOT NULL,
	"problem_category_id" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_activity_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_activity_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"problem_category_id" text
);
--> statement-breakpoint
CREATE TABLE "product_problem_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_problem_category_name_unique" UNIQUE("name")
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
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"estimated_days" integer,
	"start_date" date,
	"end_date" date,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"project_activity_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"estimated_days" integer,
	"start_date" date,
	"end_date" date,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_task_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"from_sort" integer,
	"to_sort" integer,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_task_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'assignee' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_task_user" UNIQUE("task_id","user_id")
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
CREATE TABLE "user_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"group_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_group" UNIQUE("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chat_enabled" boolean DEFAULT true NOT NULL
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
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sender_user_id_auth_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_receiver_group_id_group_id_fk" FOREIGN KEY ("receiver_group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_receiver_user_id_auth_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_user_presence" ADD CONSTRAINT "chat_user_presence_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_activity" ADD CONSTRAINT "product_activity_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_activity" ADD CONSTRAINT "product_activity_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_activity" ADD CONSTRAINT "product_activity_problem_category_id_product_problem_category_id_fk" FOREIGN KEY ("problem_category_id") REFERENCES "public"."product_problem_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_activity_history" ADD CONSTRAINT "product_activity_history_product_activity_id_product_activity_id_fk" FOREIGN KEY ("product_activity_id") REFERENCES "public"."product_activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_activity_history" ADD CONSTRAINT "product_activity_history_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_contact" ADD CONSTRAINT "product_contact_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_contact" ADD CONSTRAINT "product_contact_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_dependency" ADD CONSTRAINT "product_dependency_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_manual" ADD CONSTRAINT "product_manual_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem" ADD CONSTRAINT "product_problem_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem" ADD CONSTRAINT "product_problem_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem" ADD CONSTRAINT "product_problem_problem_category_id_product_problem_category_id_fk" FOREIGN KEY ("problem_category_id") REFERENCES "public"."product_problem_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_problem_image" ADD CONSTRAINT "product_problem_image_product_problem_id_product_problem_id_fk" FOREIGN KEY ("product_problem_id") REFERENCES "public"."product_problem"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution" ADD CONSTRAINT "product_solution_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution" ADD CONSTRAINT "product_solution_product_problem_id_product_problem_id_fk" FOREIGN KEY ("product_problem_id") REFERENCES "public"."product_problem"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_checked" ADD CONSTRAINT "product_solution_checked_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_checked" ADD CONSTRAINT "product_solution_checked_product_solution_id_product_solution_id_fk" FOREIGN KEY ("product_solution_id") REFERENCES "public"."product_solution"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_solution_image" ADD CONSTRAINT "product_solution_image_product_solution_id_product_solution_id_fk" FOREIGN KEY ("product_solution_id") REFERENCES "public"."product_solution"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_project_activity_id_project_activity_id_fk" FOREIGN KEY ("project_activity_id") REFERENCES "public"."project_activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_history" ADD CONSTRAINT "project_task_history_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_history" ADD CONSTRAINT "project_task_history_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_user" ADD CONSTRAINT "project_task_user_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_user" ADD CONSTRAINT "project_task_user_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_file" ADD CONSTRAINT "system_file_uploaded_by_auth_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_message_group" ON "chat_message" USING btree ("receiver_group_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_message_user" ON "chat_message" USING btree ("receiver_user_id","sender_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_message_unread_user" ON "chat_message" USING btree ("receiver_user_id","read_at");--> statement-breakpoint
CREATE INDEX "idx_product_activity_product_date" ON "product_activity" USING btree ("product_id","date");--> statement-breakpoint
CREATE INDEX "idx_product_activity_history_product_activity_id" ON "product_activity_history" USING btree ("product_activity_id");--> statement-breakpoint
CREATE INDEX "idx_product_activity_history_user_id" ON "product_activity_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_product_activity_history_created_at" ON "product_activity_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_project_task_history_task_id" ON "project_task_history" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_history_user_id" ON "project_task_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_history_created_at" ON "project_task_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_project_task_user_task_id" ON "project_task_user" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_user_user_id" ON "project_task_user" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_group_user_id" ON "user_group" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_group_group_id" ON "user_group" USING btree ("group_id");