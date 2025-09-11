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
ALTER TABLE "project_task_history" ADD CONSTRAINT "project_task_history_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_history" ADD CONSTRAINT "project_task_history_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_task_history_task_id" ON "project_task_history" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_history_user_id" ON "project_task_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_project_task_history_created_at" ON "project_task_history" USING btree ("created_at");