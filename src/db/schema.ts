import { pgTable, serial, text, varchar, timestamp, boolean, integer, primaryKey, json, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: varchar('role', { length: 50 }).default('USER'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  logo: text('logo'),
  website: text('website'),
  description: text('description'),
  sourceUrl: text('source_url'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id'),
  image: text('image'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id),
  manufacturer: varchar('manufacturer', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }),
  catalogNumber: varchar('catalog_number', { length: 255 }),
  categoryId: integer('category_id').references(() => categories.id),
  subcategoryId: integer('subcategory_id').references(() => categories.id),
  description: text('description'),
  technicalSpecs: text('technical_specs'),
  application: text('application'),
  presentation: text('presentation'),
  status: varchar('status', { length: 50 }).default('ACTIVE'), // ACTIVE, INACTIVE
  publicationStatus: varchar('publication_status', { length: 50 }).default('UNPUBLISHED'), // UNPUBLISHED, PUBLISHED
  verificationStatus: varchar('verification_status', { length: 50 }).default('DRAFT'), // DRAFT, REVIEW, VERIFIED, OUTDATED, REJECTED
  validationIssues: json('validation_issues'), // array of issues or conflicts detected
  validationScore: integer('validation_score').default(0), // 0-100 quality score
  verifiedBy: varchar('verified_by', { length: 255 }),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  lastValidatedAt: timestamp('last_validated_at'),
  confidenceLevel: varchar('confidence_level', { length: 50 }).default('LOW'),
  featured: boolean('featured').default(false),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  sourceUrl: text('source_url'),
  importJobId: integer('import_job_id'), // Link to the import job that created/updated it
  auditReport: json('audit_report'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  brandIdIdx: index('idx_products_brand_id').on(table.brandId),
  categoryIdIdx: index('idx_products_category_id').on(table.categoryId),
  subcategoryIdIdx: index('idx_products_subcategory_id').on(table.subcategoryId),
  modelIdx: index('idx_products_model').on(table.model),
  catalogNumberIdx: index('idx_products_catalog_number').on(table.catalogNumber),
  statusIdx: index('idx_products_status').on(table.status),
  publicationStatusIdx: index('idx_products_publication_status').on(table.publicationStatus),
  verificationStatusIdx: index('idx_products_verification_status').on(table.verificationStatus),
  slugIdx: index('idx_products_slug').on(table.slug),
  updatedAtIdx: index('idx_products_updated_at').on(table.updatedAt),
}));

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
  sourceUrl: text('source_url'),
  altText: varchar('alt_text', { length: 255 }),
  filename: varchar('filename', { length: 255 }),
  licenseStatus: varchar('license_status', { length: 100 }),
  sortOrder: integer('sort_order').default(0),
}, (table) => ({
  productIdIdx: index('idx_product_images_product_id').on(table.productId),
}));

export const productDocuments = pgTable('product_documents', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
  type: varchar('type', { length: 50 }),
  sourceUrl: text('source_url'),
  title: varchar('title', { length: 255 }),
}, (table) => ({
  productIdIdx: index('idx_product_documents_product_id').on(table.productId),
}));

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  institution: varchar('institution', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  city: varchar('city', { length: 100 }),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('NEW'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quoteItems = pgTable('quote_items', {
  quoteId: integer('quote_id').references(() => quotes.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  notes: text('notes'),
}, (t) => ({
  pk: primaryKey({ columns: [t.quoteId, t.productId] }),
}));

export const tdrRequests = pgTable('tdr_requests', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  description: text('description'),
  fileUrl: text('file_url'),
  status: varchar('status', { length: 50 }).default('NEW'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pharmacovigilanceReports = pgTable('pharmacovigilance_reports', {
  id: serial('id').primaryKey(),
  reportCode: varchar('report_code', { length: 50 }).notNull(),
  patientName: varchar('patient_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  lotNumber: varchar('lot_number', { length: 100 }),
  symptomDescription: text('symptom_description').notNull(),
  isProfessional: boolean('is_professional').default(false),
  status: varchar('status', { length: 50 }).default('PENDING_REVIEW'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  brandId: integer('brand_id').references(() => brands.id),
  brandName: varchar('brand_name', { length: 255 }),
  domain: varchar('domain', { length: 255 }).notNull(),
  url: text('url').notNull(),
  productsUrl: text('products_url'),
  sitemapUrl: text('sitemap_url'),
  country: varchar('country', { length: 100 }),
  priority: integer('priority').default(2), // 1: High, 2: Medium, 3: Low
  status: varchar('status', { length: 50 }).default('ACTIVE'), // ACTIVE, INACTIVE, PENDING, ERROR, IN_REVIEW
  lastExtractionAt: timestamp('last_extraction_at'),
  lastCheckedAt: timestamp('last_checked_at'),
  detectedProductCount: integer('detected_product_count').default(0),
  sourceType: varchar('source_type', { length: 100 }).default('OFFICIAL_MANUFACTURER'), // OFFICIAL_MANUFACTURER, DISTRIBUTOR, CATALOG, SITEMAP, API
  verificationStatus: varchar('verification_status', { length: 100 }).default('UNVERIFIED'), // UNVERIFIED, DETECTED, VERIFIED, OFFICIAL_REPRESENTATIVE_VERIFIED
  verificationSource: text('verification_source'),
  verificationDate: timestamp('verification_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const scraperUrls = pgTable('scraper_urls', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => sources.id),
  url: text('url').notNull(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  brandName: varchar('brand_name', { length: 255 }),
  country: varchar('country', { length: 100 }),
  sourceType: varchar('source_type', { length: 100 }).default('PRODUCT_LIST'),
  priority: integer('priority').default(2),
  status: varchar('status', { length: 50 }).default('ACTIVE'), // ACTIVE, INACTIVE, VALIDATING, ERROR
  lastExtractionAt: timestamp('last_extraction_at'),
  detectedProducts: integer('detected_products').default(0),
  errorsCount: integer('errors_count').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const scrapingJobs = pgTable('scraping_jobs', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 100 }).notNull().unique(),
  sourceId: integer('source_id').references(() => sources.id),
  urlId: integer('url_id').references(() => scraperUrls.id),
  status: varchar('status', { length: 50 }).default('PENDING'), // PENDING, RUNNING, COMPLETED, COMPLETED_WITH_WARNINGS, ERROR, CANCELLED
  progressPercent: integer('progress_percent').default(0),
  totalFound: integer('total_found').default(0),
  processedCount: integer('processed_count').default(0),
  validCount: integer('valid_count').default(0),
  duplicatesCount: integer('duplicates_count').default(0),
  errorsCount: integer('errors_count').default(0),
  incompleteCount: integer('incomplete_count').default(0),
  imagesFound: integer('images_found').default(0),
  documentsFound: integer('documents_found').default(0),
  executionTimeMs: integer('execution_time_ms').default(0),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  errorLog: text('error_log'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const draftProducts = pgTable('draft_products', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 100 }),
  sourceId: integer('source_id').references(() => sources.id),
  sourceUrl: text('source_url'),
  productUrl: text('product_url'),
  name: varchar('name', { length: 500 }).notNull(),
  brand: varchar('brand', { length: 255 }),
  manufacturer: varchar('manufacturer', { length: 255 }),
  model: varchar('model', { length: 255 }),
  reference: varchar('reference', { length: 255 }),
  description: text('description'),
  specifications: json('specifications'), // key-value pairs with units and source
  applications: text('applications'),
  presentation: varchar('presentation', { length: 255 }),
  variants: json('variants'), // array of variants
  accessories: json('accessories'), // array of accessories (included/optional)
  configurations: json('configurations'), // array of configurations
  images: json('images'), // array of image URLs with type/category
  documents: json('documents'), // array of PDF docs, datasheets, manuals
  conflicts: json('conflicts'), // array of conflicts detected between sources
  missingFields: json('missing_fields'), // array of missing fields
  sourcesList: json('sources_list'), // array of sources consulted
  completenessBreakdown: json('completeness_breakdown'), // breakdown by section
  auditReport: json('audit_report'), // audit checklist
  completenessScore: integer('completeness_score').default(0), // 0-100%
  status: varchar('status', { length: 50 }).default('DRAFT'), // DRAFT, IN_REVIEW, APPROVED, PUBLISHED, REJECTED, DUPLICATE, INCOMPLETE, ERROR
  duplicateStatus: varchar('duplicate_status', { length: 50 }).default('UNIQUE'), // UNIQUE, POSSIBLE_DUPLICATE, CONFIRMED_DUPLICATE
  originalData: json('original_data'),
  normalizedData: json('normalized_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const duplicateCases = pgTable('duplicate_cases', {
  id: serial('id').primaryKey(),
  productAId: integer('product_a_id').notNull(), // can be product id or draft id
  productBId: integer('product_b_id').notNull(),
  productAType: varchar('product_a_type', { length: 50 }).default('CATALOG'), // CATALOG or DRAFT
  productBType: varchar('product_b_type', { length: 50 }).default('CATALOG'),
  duplicateScore: integer('duplicate_score').default(0),
  classification: varchar('classification', { length: 50 }).default('MEDIUM_PROBABILITY'), // HIGH_PROBABILITY, MEDIUM_PROBABILITY, LOW_PROBABILITY, IDENTITY_CONFLICT
  matchingSignals: json('matching_signals'), // array of matched attributes (reference, model, etc.)
  conflictingSignals: json('conflicting_signals'), // array of conflicting attributes (different model, etc.)
  status: varchar('status', { length: 50 }).default('PENDING_REVIEW'), // PENDING_REVIEW, CONFIRMED_DUPLICATE, FALSE_POSITIVE, MERGED, DIFFERENT_MODELS, VARIANTS
  recommendation: text('recommendation'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productMergeHistory = pgTable('product_merge_history', {
  id: serial('id').primaryKey(),
  primaryProductId: integer('primary_product_id').notNull(),
  secondaryProductId: integer('secondary_product_id').notNull(),
  mergedDataSnapshot: json('merged_data_snapshot'),
  reason: text('reason'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const backgroundJobs = pgTable('background_jobs', {
  id: serial('id').primaryKey(),
  jobType: varchar('job_type', { length: 100 }).notNull(), // SCRAPING, BULK_VALIDATION, BULK_DEDUPLICATION, EXPORT, REINDEX
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, QUEUED, RUNNING, COMPLETED, COMPLETED_WITH_WARNINGS, FAILED, CANCELLED
  progress: integer('progress').default(0), // 0 to 100
  totalItems: integer('total_items').default(0),
  processedItems: integer('processed_items').default(0),
  errorCount: integer('error_count').default(0),
  payload: json('payload'),
  resultSummary: json('result_summary'),
  errorLog: json('error_log'),
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
});

export const importRecords = pgTable('import_records', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => backgroundJobs.id).notNull(),
  rawData: json('raw_data').notNull(),
  mappedData: json('mapped_data'),
  status: varchar('status', { length: 50 }).default('PENDING'), // PENDING, IMPORTED, FAILED, DUPLICATE, INVALID
  errorMessage: text('error_message'),
  productId: integer('product_id'), // Product ID if created/updated
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});

export const autonomousSettings = pgTable('autonomous_settings', {
  id: serial('id').primaryKey(),
  autonomousModeEnabled: boolean('autonomous_mode_enabled').default(true),
  operatingMode: varchar('operating_mode', { length: 50 }).default('AUTO'), // AUTO, SAFE_MODE, DRY_RUN, CANARY
  autoPublishEnabled: boolean('auto_publish_enabled').default(true),
  autoPublishMinScore: integer('auto_publish_min_score').default(85), // 0-100
  riskThreshold: varchar('risk_threshold', { length: 50 }).default('LOW'), // LOW, MEDIUM
  maxConcurrency: integer('max_concurrency').default(4),
  crawlIntervalHours: integer('crawl_interval_hours').default(12),
  adaptiveCrawl: boolean('adaptive_crawl').default(true),
  canaryPercentage: integer('canary_percentage').default(10),
  emergencyStop: boolean('emergency_stop').default(false),
  anomalyThresholdPercent: integer('anomaly_threshold_percent').default(40),
  currentRuleVersion: varchar('current_rule_version', { length: 50 }).default('v1.0.0'),
  lastExecutionAt: timestamp('last_execution_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

export const autonomousAuditLogs = pgTable('autonomous_audit_logs', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 100 }),
  productId: integer('product_id'),
  sourceId: integer('source_id'),
  action: varchar('action', { length: 100 }).notNull(), // DISCOVERY, EXTRACTION, NORMALIZATION, DEDUPLICATION, VALIDATION, AUTO_PUBLISH, AUTO_UPDATE, REVIEW_REQUIRED, BLOCKED, ROLLBACK, RECONCILIATION, ANOMALY_STOP
  decision: varchar('decision', { length: 100 }).notNull(), // AUTO_PUBLISH_SAFE, AUTO_PUBLISHED, REVIEW_REQUIRED, BLOCKED, UPDATED, REJECTED, ANOMALY_HALT, RETIRED
  riskScore: varchar('risk_score', { length: 50 }).default('LOW'), // LOW, MEDIUM, HIGH, CRITICAL
  ruleVersion: varchar('rule_version', { length: 50 }).default('v1.0.0'),
  evidenceSummary: text('evidence_summary'),
  executedRules: json('executed_rules'), // array of rules evaluated and their pass/fail
  previousSnapshot: json('previous_snapshot'),
  newSnapshot: json('new_snapshot'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const productVersions = pgTable('product_versions', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  jobId: varchar('job_id', { length: 100 }),
  ruleVersion: varchar('rule_version', { length: 50 }),
  changeType: varchar('change_type', { length: 50 }).notNull(), // INITIAL_PUBLISH, AUTO_UPDATE, MANUAL_EDIT, ROLLBACK
  snapshot: json('snapshot').notNull(),
  changesDiff: json('changes_diff'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: varchar('created_by', { length: 255 }).default('AUTONOMOUS_ENGINE'),
});

export const sourceCandidates = pgTable('source_candidates', {
  id: serial('id').primaryKey(),
  domain: varchar('domain', { length: 255 }).notNull(),
  url: text('url').notNull(),
  discoveredVia: text('discovered_via'),
  trustLevel: varchar('trust_level', { length: 50 }).default('NEW'), // KNOWN, NEW, SUSPECTED, UNVERIFIED, TRUSTED
  status: varchar('status', { length: 50 }).default('PENDING_VALIDATION'), // PENDING_VALIDATION, APPROVED, REJECTED
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});




