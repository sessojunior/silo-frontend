ALTER TABLE "chat_user_presence" ALTER COLUMN "status" SET DEFAULT 'invisible';--> statement-breakpoint
CREATE INDEX "idx_chat_message_sender" ON "chat_message" USING btree ("sender_user_id");--> statement-breakpoint
CREATE INDEX "idx_product_activity_product_turn" ON "product_activity" USING btree ("product_id","turn");--> statement-breakpoint
CREATE INDEX "idx_product_activity_user_id" ON "product_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_product_problem_product" ON "product_problem" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_problem_user" ON "product_problem" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_product_problem_category" ON "product_problem" USING btree ("problem_category_id");--> statement-breakpoint
CREATE INDEX "idx_product_problem_created_at" ON "product_problem" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "product_activity" ADD CONSTRAINT "unique_product_activity_product_date_turn" UNIQUE("product_id","date","turn");--> statement-breakpoint
ALTER TABLE "rate_limit" ADD CONSTRAINT "unique_rate_limit_email_ip_route" UNIQUE("email","ip","route");