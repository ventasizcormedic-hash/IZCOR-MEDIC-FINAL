CREATE TABLE "autonomous_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" varchar(100),
	"product_id" integer,
	"source_id" integer,
	"action" varchar(100) NOT NULL,
	"decision" varchar(100) NOT NULL,
	"risk_score" varchar(50) DEFAULT 'LOW',
	"rule_version" varchar(50) DEFAULT 'v1.0.0',
	"evidence_summary" text,
	"executed_rules" json,
	"previous_snapshot" json,
	"new_snapshot" json,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "autonomous_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"autonomous_mode_enabled" boolean DEFAULT true,
	"operating_mode" varchar(50) DEFAULT 'AUTO',
	"auto_publish_enabled" boolean DEFAULT true,
	"auto_publish_min_score" integer DEFAULT 85,
	"risk_threshold" varchar(50) DEFAULT 'LOW',
	"max_concurrency" integer DEFAULT 4,
	"crawl_interval_hours" integer DEFAULT 12,
	"adaptive_crawl" boolean DEFAULT true,
	"canary_percentage" integer DEFAULT 10,
	"emergency_stop" boolean DEFAULT false,
	"anomaly_threshold_percent" integer DEFAULT 40,
	"current_rule_version" varchar(50) DEFAULT 'v1.0.0',
	"last_execution_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"progress" integer DEFAULT 0,
	"total_items" integer DEFAULT 0,
	"processed_items" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"payload" json,
	"result_summary" json,
	"error_log" json,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "draft_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" varchar(100),
	"source_id" integer,
	"source_url" text,
	"product_url" text,
	"name" varchar(500) NOT NULL,
	"brand" varchar(255),
	"manufacturer" varchar(255),
	"model" varchar(255),
	"reference" varchar(255),
	"description" text,
	"specifications" json,
	"applications" text,
	"presentation" varchar(255),
	"variants" json,
	"accessories" json,
	"configurations" json,
	"images" json,
	"documents" json,
	"conflicts" json,
	"missing_fields" json,
	"sources_list" json,
	"completeness_breakdown" json,
	"audit_report" json,
	"completeness_score" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'DRAFT',
	"duplicate_status" varchar(50) DEFAULT 'UNIQUE',
	"original_data" json,
	"normalized_data" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "duplicate_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_a_id" integer NOT NULL,
	"product_b_id" integer NOT NULL,
	"product_a_type" varchar(50) DEFAULT 'CATALOG',
	"product_b_type" varchar(50) DEFAULT 'CATALOG',
	"duplicate_score" integer DEFAULT 0,
	"classification" varchar(50) DEFAULT 'MEDIUM_PROBABILITY',
	"matching_signals" json,
	"conflicting_signals" json,
	"status" varchar(50) DEFAULT 'PENDING_REVIEW',
	"recommendation" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"raw_data" json NOT NULL,
	"mapped_data" json,
	"status" varchar(50) DEFAULT 'PENDING',
	"error_message" text,
	"product_id" integer,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_merge_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_product_id" integer NOT NULL,
	"secondary_product_id" integer NOT NULL,
	"merged_data_snapshot" json,
	"reason" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"job_id" varchar(100),
	"rule_version" varchar(50),
	"change_type" varchar(50) NOT NULL,
	"snapshot" json NOT NULL,
	"changes_diff" json,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(255) DEFAULT 'AUTONOMOUS_ENGINE'
);
--> statement-breakpoint
CREATE TABLE "scraper_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"url" text NOT NULL,
	"manufacturer" varchar(255),
	"brand_name" varchar(255),
	"country" varchar(100),
	"source_type" varchar(100) DEFAULT 'PRODUCT_LIST',
	"priority" integer DEFAULT 2,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"last_extraction_at" timestamp,
	"detected_products" integer DEFAULT 0,
	"errors_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scraping_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" varchar(100) NOT NULL,
	"source_id" integer,
	"url_id" integer,
	"status" varchar(50) DEFAULT 'PENDING',
	"progress_percent" integer DEFAULT 0,
	"total_found" integer DEFAULT 0,
	"processed_count" integer DEFAULT 0,
	"valid_count" integer DEFAULT 0,
	"duplicates_count" integer DEFAULT 0,
	"errors_count" integer DEFAULT 0,
	"incomplete_count" integer DEFAULT 0,
	"images_found" integer DEFAULT 0,
	"documents_found" integer DEFAULT 0,
	"execution_time_ms" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"error_log" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "scraping_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "source_candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"discovered_via" text,
	"trust_level" varchar(50) DEFAULT 'NEW',
	"status" varchar(50) DEFAULT 'PENDING_VALIDATION',
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"manufacturer" varchar(255),
	"brand_id" integer,
	"brand_name" varchar(255),
	"domain" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"products_url" text,
	"sitemap_url" text,
	"country" varchar(100),
	"priority" integer DEFAULT 2,
	"status" varchar(50) DEFAULT 'ACTIVE',
	"last_extraction_at" timestamp,
	"last_checked_at" timestamp,
	"detected_product_count" integer DEFAULT 0,
	"source_type" varchar(100) DEFAULT 'OFFICIAL_MANUFACTURER',
	"verification_status" varchar(100) DEFAULT 'UNVERIFIED',
	"verification_source" text,
	"verification_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "verification_status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "publication_status" varchar(50) DEFAULT 'UNPUBLISHED';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "validation_issues" json;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "validation_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "verified_by" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "last_validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "import_job_id" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "audit_report" json;--> statement-breakpoint
ALTER TABLE "draft_products" ADD CONSTRAINT "draft_products_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_job_id_background_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."background_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraper_urls" ADD CONSTRAINT "scraper_urls_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scraping_jobs" ADD CONSTRAINT "scraping_jobs_url_id_scraper_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."scraper_urls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_documents_product_id" ON "product_documents" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_images_product_id" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_products_brand_id" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_subcategory_id" ON "products" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "idx_products_model" ON "products" USING btree ("model");--> statement-breakpoint
CREATE INDEX "idx_products_catalog_number" ON "products" USING btree ("catalog_number");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_products_publication_status" ON "products" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "idx_products_verification_status" ON "products" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_products_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_products_updated_at" ON "products" USING btree ("updated_at");