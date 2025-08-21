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
ALTER TABLE "project_task_user" ADD CONSTRAINT "project_task_user_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_user" ADD CONSTRAINT "project_task_user_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_task_user_task_id" ON "project_task_user" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_user_user_id" ON "project_task_user" USING btree ("user_id");