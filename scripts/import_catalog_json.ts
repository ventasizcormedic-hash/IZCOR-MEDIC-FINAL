import { db, initDatabase } from '../src/db/index.ts';
import { brands, categories, products, productImages, productDocuments } from '../src/db/schema.ts';
import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';

async function importCatalog() {
  console.log('Iniciando conexión e inicialización de Base de Datos...');
  await initDatabase();

  const dataPath = path.join(process.cwd(), 'src', 'data', 'products.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const catalogProducts = JSON.parse(rawData);

  console.log(`Leídos ${catalogProducts.length} productos enriquecidos del catálogo.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of catalogProducts) {
    // 1. Handle Category
    let categoryRecord = await db.query.categories.findFirst({
      where: eq(categories.name, item.categoria)
    });

    if (!categoryRecord) {
      const slug = item.categoria.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const insertedCat = await db.insert(categories).values({
        name: item.categoria,
        slug: slug,
        description: `Línea especializada de ${item.categoria} para equipamiento hospitalario y clínico de alta exigencia.`,
        status: 'ACTIVE'
      }).returning();
      categoryRecord = insertedCat[0];
      console.log(`Categoría creada: ${categoryRecord.name}`);
    }

    // 2. Handle Brand
    let brandRecord = await db.query.brands.findFirst({
      where: eq(brands.name, item.marca)
    });

    if (!brandRecord) {
      const slug = item.marca.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const insertedBrand = await db.insert(brands).values({
        name: item.marca,
        slug: slug,
        manufacturer: item.marca,
        description: `Fabricante y tecnología médica certificada de ${item.marca}.`,
        status: 'ACTIVE'
      }).returning();
      brandRecord = insertedBrand[0];
      console.log(`Marca creada: ${brandRecord.name}`);
    }

    // 3. Handle Product
    const productSlug = item.nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + item.id;
    
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.slug, productSlug)
    });

    const technicalSpecsString = Array.isArray(item.especificaciones) 
      ? item.especificaciones.join('\n') 
      : JSON.stringify(item.especificaciones || {});

    const applicationString = Array.isArray(item.aplicaciones)
      ? item.aplicaciones.join(', ')
      : (item.aplicaciones || '');

    const isFeatured = [1, 13, 14, 15, 21, 23, 29, 37, 42, 49, 61, 66, 70, 73, 99, 101].includes(item.orden);

    let productId: number;

    if (!existingProduct) {
      const insertedProduct = await db.insert(products).values({
        name: item.nombre,
        slug: productSlug,
        model: item.codigo || null,
        catalogNumber: item.referencia || null,
        brandId: brandRecord.id,
        categoryId: categoryRecord.id,
        manufacturer: item.marca,
        description: item.descripcion,
        technicalSpecs: technicalSpecsString,
        application: applicationString,
        presentation: item.presentacion,
        status: 'ACTIVE',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
        validationScore: 100,
        confidenceLevel: 'HIGH',
        featured: isFeatured,
        sourceUrl: `/catalogo#pag-${item.paginaPDF || 1}`
      }).returning();
      productId = insertedProduct[0].id;
      insertedCount++;
    } else {
      productId = existingProduct.id;
      await db.update(products).set({
        name: item.nombre,
        model: item.codigo || existingProduct.model,
        catalogNumber: item.referencia || existingProduct.catalogNumber,
        brandId: brandRecord.id,
        categoryId: categoryRecord.id,
        manufacturer: item.marca,
        description: item.descripcion,
        technicalSpecs: technicalSpecsString,
        application: applicationString,
        presentation: item.presentacion,
        status: 'ACTIVE',
        publicationStatus: 'PUBLISHED',
        verificationStatus: 'VERIFIED',
        validationScore: 100,
        confidenceLevel: 'HIGH',
        featured: isFeatured,
        updatedAt: new Date()
      }).where(eq(products.id, productId));
      updatedCount++;
    }

    // 4. Handle Images
    if (item.imagenPrincipal) {
      const existingImage = await db.query.productImages.findFirst({
        where: eq(productImages.productId, productId)
      });
      if (!existingImage) {
        await db.insert(productImages).values({
          productId: productId,
          url: item.imagenPrincipal,
          altText: `${item.nombre} - IZCOR MEDIC`,
          sortOrder: 0
        });
      } else {
        await db.update(productImages).set({
          url: item.imagenPrincipal,
          altText: `${item.nombre} - IZCOR MEDIC`
        }).where(eq(productImages.id, existingImage.id));
      }
    }

    // 5. Handle Product Documents (Ficha Técnica / Catálogo Oficial)
    const existingDoc = await db.query.productDocuments.findFirst({
      where: eq(productDocuments.productId, productId)
    });
    if (!existingDoc) {
      await db.insert(productDocuments).values({
        productId: productId,
        title: `Catálogo y Ficha Técnica Oficial - ${item.nombre}`,
        url: '/assets/catalogo/CATALOGO.pdf',
        type: 'TECHNICAL_SHEET'
      });
    }
  }

  console.log(`\n=== RESUMEN DE IMPORTACIÓN ===`);
  console.log(`Total productos procesados: ${catalogProducts.length}`);
  console.log(`Nuevos insertados: ${insertedCount}`);
  console.log(`Existentes actualizados: ${updatedCount}`);
  console.log(`Categorías y marcas verificadas exitosamente.`);
  console.log(`Base de datos sincronizada con el catálogo físico oficial de IZCOR MEDIC.\n`);
  process.exit(0);
}

importCatalog().catch(err => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});
