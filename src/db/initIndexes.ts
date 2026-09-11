import { db } from './index';
import { sql } from 'drizzle-orm';

export async function initializeDatabaseIndexes(): Promise<void> {
  try {
    const statements = [
      `CREATE TABLE IF NOT EXISTS pharmacovigilance_reports (
        id SERIAL PRIMARY KEY,
        report_code VARCHAR(50) NOT NULL,
        patient_name VARCHAR(255),
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        product_name VARCHAR(255) NOT NULL,
        lot_number VARCHAR(100),
        symptom_description TEXT NOT NULL,
        is_professional BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);`,
      `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);`,
      `CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);`,
      `CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);`,
      `CREATE INDEX IF NOT EXISTS idx_products_catalog_number ON products(catalog_number);`,
      `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`,
      `CREATE INDEX IF NOT EXISTS idx_products_publication_status ON products(publication_status);`,
      `CREATE INDEX IF NOT EXISTS idx_products_verification_status ON products(verification_status);`,
      `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);`,
      `CREATE INDEX IF NOT EXISTS idx_product_documents_product_id ON product_documents(product_id);`,
      `CREATE INDEX IF NOT EXISTS idx_duplicate_cases_status ON duplicate_cases(status);`,
      `CREATE INDEX IF NOT EXISTS idx_pv_reports_created_at ON pharmacovigilance_reports(created_at DESC);`,
    ];

    for (const stmt of statements) {
      await db.execute(sql.raw(stmt));
    }
    console.log('⚡ [Performance Engine] High-scale database indexes verified and active.');
  } catch (e: any) {
    console.warn('⚠️ [Performance Engine] Index initialization note:', e?.message || e);
  }
}
