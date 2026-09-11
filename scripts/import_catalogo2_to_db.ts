import fs from 'fs';
import path from 'path';
import { db, initDatabase } from '../src/db/index.ts';
import { products, categories, brands } from '../src/db/schema.ts';
import { eq, count, sql } from 'drizzle-orm';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CatalogoRow {
  row: string;
  codigo: string;
  marca: string;
  nombre: string;
  procedencia: string;
  unidad: string;
}

async function run() {
  console.log('===========================================================');
  console.log('   IZCOR MEDIC - IMPORTACIÓN CATÁLOGO 2 (256 PRODUCTOS)   ');
  console.log('===========================================================\n');

  await initDatabase();

  // 1. Parse Catalogo_Productos.xlsx XML
  const basePath = path.join(process.cwd(), '.data', 'catalogo2_extracted', 'xl');
  const ssXml = fs.readFileSync(path.join(basePath, 'sharedStrings.xml'), 'utf8');
  const strings: string[] = [];
  const siRegex = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRegex.exec(ssXml)) !== null) {
    const tMatches = m[1].match(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g);
    strings.push(tMatches ? tMatches.map((t: string) => t.replace(/<t(?:\s[^>]*)?>([^<]*)<\/t>/, '$1')).join('') : '');
  }

  const sheet1Xml = fs.readFileSync(path.join(basePath, 'worksheets', 'sheet1.xml'), 'utf8');
  const rowRegex = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  const rawRows: CatalogoRow[] = [];

  while ((m = rowRegex.exec(sheet1Xml)) !== null) {
    const rowNum = m[1];
    if (rowNum === '1') continue;
    const rowContent = m[2];
    const cellRegex = /<c\s+([^>]*?)>(?:<v>([^<]*)<\/v>)?<\/c>/g;
    let cm;
    let cod = '', marca = '', prod = '', proc = '', und = '';
    while ((cm = cellRegex.exec(rowContent)) !== null) {
      const attrs = cm[1];
      const rawVal = cm[2] || '';
      const colMatch = attrs.match(/r="([A-Z]+)\d+"/);
      if (!colMatch) continue;
      const col = colMatch[1];
      const typeMatch = attrs.match(/t="([a-z]+)"/);
      const type = typeMatch ? typeMatch[1] : '';
      let val = rawVal;
      if (type === 's') val = strings[parseInt(val, 10)] || '';
      val = val.trim();
      if (col === 'A') cod = val;
      if (col === 'B') marca = val;
      if (col === 'C') prod = val;
      if (col === 'D') proc = val;
      if (col === 'E') und = val;
    }
    if (prod) {
      rawRows.push({ row: rowNum, codigo: cod, marca, nombre: prod, procedencia: proc, unidad: und });
    }
  }

  console.log(`✅ Loaded ${rawRows.length} raw products from Catalogo_Productos.xlsx.`);

  // 2. Ensure Categories and Subcategories exist in DB
  const dbCategories = await db.select().from(categories);
  const catMap = new Map<string, typeof dbCategories[0]>();
  for (const c of dbCategories) {
    catMap.set(c.slug, c);
  }

  // Ensure specific subcategories for our new catalog
  async function getOrCreateCategory(name: string, slug: string, parentId: number | null) {
    if (catMap.has(slug)) {
      return catMap.get(slug)!;
    }
    const [inserted] = await db
      .insert(categories)
      .values({
        name,
        slug,
        parentId,
        status: 'ACTIVE',
      })
      .returning();
    catMap.set(slug, inserted);
    console.log(`  + Created category: "${name}" (slug: ${slug}, parentId: ${parentId})`);
    return inserted;
  }

  const matInsumos = await getOrCreateCategory('Material e Insumos Hospitalarios', 'material-insumos', null);
  const esterilizacion = await getOrCreateCategory('Esterilización y Desinfección', 'esterilizacion-desinfeccion', null);
  const equipSuministro = await getOrCreateCategory('Equipamiento y Suministro Clínico', 'equipamiento-suministro', null);
  const diagImagenes = await getOrCreateCategory('Equipos de Diagnóstico por Imágenes', 'diagnostico-imagenes', null);

  // Subcategories
  const subRopa = await getOrCreateCategory('Ropa Quirúrgica y Descartables', 'ropa-quirurgica-descartables', matInsumos.id);
  const subDrenaje = await getOrCreateCategory('Drenaje, Urología y Ostomía', 'drenaje-urologia-ostomia', matInsumos.id);
  const subCuracion = await getOrCreateCategory('Curación, Gasas y Apósitos', 'curacion-gasas-apositos', matInsumos.id);
  const subTerapia = await getOrCreateCategory('Terapia Intravenosa e Infusión', 'terapia-intravenosa-infusion', matInsumos.id);
  const subMateriaPrima = await getOrCreateCategory('Telas No Tejidas e Insumos Médicos', 'telas-no-tejidas-insumos', matInsumos.id);
  const subAntisepticos = await getOrCreateCategory('Antisépticos y Soluciones Médicas', 'antisepticos-soluciones-medicas', esterilizacion.id);
  const subOxigeno = await getOrCreateCategory('Oxigenoterapia y Terapia Respiratoria', 'oxigenoterapia-terapia-respiratoria', equipSuministro.id);
  const subUltraGel = await getOrCreateCategory('Insumos de Diagnóstico y Ultrasonido', 'insumos-diagnostico-ultrasonido', diagImagenes.id);

  // 3. Ensure Brand exists
  let izcorBrand = await db.select().from(brands).where(eq(brands.id, 8)).limit(1);
  let brandId = 8;
  if (!izcorBrand || izcorBrand.length === 0) {
    const [newB] = await db.insert(brands).values({
      name: 'IZCOR MEDIC',
      slug: 'izcor-medic',
      manufacturer: 'IZCOR MEDIC S.A.C.',
      status: 'ACTIVE',
    }).returning();
    brandId = newB.id;
  }

  // 4. Product classification logic
  function classify(name: string) {
    const n = name.toLowerCase();

    // Antisépticos y Soluciones
    if (
      n.includes('alcohol') ||
      n.includes('agua oxigenada') ||
      n.includes('tintura') ||
      n.includes('yodado') ||
      n.includes('yodo') ||
      n.includes('alkoyodo') ||
      n.includes('genciana') ||
      n.includes('timol') ||
      n.includes('vinagre') ||
      n.includes('agua destilada') ||
      n.includes('ácido bórico') || n.includes('acido borico') ||
      n.includes('bencina') ||
      n.includes('formol') ||
      n.includes('óxido de zinc') || n.includes('oxido de zinc') ||
      n.includes('vaselina') ||
      n.includes('jabón líquido') || n.includes('jabon liquido') ||
      n.includes('cloruro de sodio') ||
      n.includes('agua estéril') || n.includes('agua esteril') ||
      n.includes('aceite') ||
      n.includes('bicarbonato') ||
      n.includes('elixir') ||
      n.includes('glicerina') ||
      n.includes('nitrato de plata') ||
      n.includes('azufre') ||
      n.includes('tilo en flores') ||
      n.includes('agua de kananga') ||
      n.includes('agua de azahar') ||
      n.includes('quita esmalte') ||
      n.includes('paños desinfectantes') || n.includes('panos desinfectantes') ||
      n.includes('dispensador de pared')
    ) {
      return {
        cat: esterilizacion,
        subcat: subAntisepticos,
      };
    }

    // Ultrasonido e Imágenes
    if (n.includes('ultra - gel') || n.includes('ultra-gel') || n.includes('ultragel')) {
      return {
        cat: diagImagenes,
        subcat: subUltraGel,
      };
    }

    // Oxigenoterapia
    if (
      n.includes('canula') || n.includes('cánula') ||
      n.includes('mascara de oxigeno') || n.includes('máscara de oxigeno') ||
      n.includes('mascara nebulizadora') || n.includes('máscara nebulizadora') ||
      n.includes('venturi') ||
      n.includes('espirometria') || n.includes('espirometría') ||
      n.includes('insuflacion') || n.includes('insuflación') ||
      n.includes('filtro hme')
    ) {
      return {
        cat: equipSuministro,
        subcat: subOxigeno,
      };
    }

    // Drenaje, urología, colostomía
    if (n.includes('orina') || n.includes('colostomia') || n.includes('colostomía') || n.includes('urometro')) {
      return {
        cat: matInsumos,
        subcat: subDrenaje,
      };
    }

    // Curación, gasas, vendas
    if (n.includes('gasa') || n.includes('compresa') || n.includes('venda')) {
      return {
        cat: matInsumos,
        subcat: subCuracion,
      };
    }

    // Telas en bobina
    if (n.includes('tela no tejida') || n.includes('bobina')) {
      return {
        cat: matInsumos,
        subcat: subMateriaPrima,
      };
    }

    // Infusión, aspiración
    if (
      n.includes('aspiracion') || n.includes('aspiración') ||
      n.includes('microgotero') ||
      n.includes('triple via') || n.includes('triple vía') ||
      n.includes('secrecion') || n.includes('secreción') ||
      n.includes('tubo en t')
    ) {
      return {
        cat: matInsumos,
        subcat: subTerapia,
      };
    }

    // Default: Ropa y Descartables
    return {
      cat: matInsumos,
      subcat: subRopa,
    };
  }

  // 5. Build products objects and prepare DB insertions
  const newProductsForJson: any[] = [];
  let insertedToDb = 0;

  console.log('\n--- INSERTANDO PRODUCTOS EN BASE DE DATOS ---');
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const indexNumber = i + 1;
    const itemCode = `IZC-CAT2-${String(indexNumber).padStart(3, '0')}`;
    const baseSlug = slugify(row.nombre);
    const uniqueSlug = `${baseSlug}-izc-${String(indexNumber).padStart(3, '0')}`;

    const { cat, subcat } = classify(row.nombre);

    const procClean = row.procedencia.trim() === 'PERÚ' ? 'PERU' : row.procedencia.trim().toUpperCase();
    const undClean = row.unidad.trim() === '-' ? 'Unidad' : row.unidad.trim();

    const desc = `${row.nombre} — Marca: IZCOR MEDIC | Procedencia: ${procClean}. Suministro institucional y hospitalario de alta calidad para abastecimiento clínico y licitaciones del sector salud a través de IZCOR MEDIC S.A.C. Presentación oficial: ${undClean}. Código de catálogo: ${itemCode}.`;
    const specs = `Procedencia: ${procClean}\nPresentación: ${undClean}\nLínea: Insumos Hospitalarios y Descartables Médicos\nDistribución: Oficial IZCOR MEDIC`;

    // Insert into DB
    await db.insert(products).values({
      brandId: brandId,
      manufacturer: 'IZCOR MEDIC S.A.C.',
      name: row.nombre,
      slug: uniqueSlug,
      model: itemCode,
      catalogNumber: itemCode,
      categoryId: cat.id,
      subcategoryId: subcat.id,
      description: desc,
      technicalSpecs: specs,
      application: subcat.name,
      presentation: undClean,
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      featured: false,
    });

    insertedToDb++;

    // Add to JSON format
    newProductsForJson.push({
      id: `prod-${itemCode.toLowerCase()}`,
      orden: 8236 + indexNumber,
      codigo: itemCode,
      marca: 'IZCOR MEDIC',
      nombre: row.nombre,
      procedencia: procClean,
      unidad: undClean,
      categoria: cat.name,
      categoriaSlug: cat.slug,
      subcategoria: subcat.name,
      subcategoriaSlug: subcat.slug,
      descripcion: desc,
      presentacion: undClean,
      imagenPrincipal: null,
      imagenes: [],
      verificado: true,
      publicado: true,
    });

    if (indexNumber % 50 === 0 || indexNumber === rawRows.length) {
      console.log(`  ✓ Insertados ${indexNumber} / ${rawRows.length} productos en BD...`);
    }
  }

  // 6. Update products.json
  const rawExistingJson = fs.readFileSync('./src/data/products.json', 'utf8');
  const existingProducts = JSON.parse(rawExistingJson);
  const updatedCatalog = [...existingProducts, ...newProductsForJson];
  fs.writeFileSync('./src/data/products.json', JSON.stringify(updatedCatalog, null, 2), 'utf8');
  console.log(`\n✅ products.json actualizado: de ${existingProducts.length} a ${updatedCatalog.length} productos (+${newProductsForJson.length}).`);

  // 7. Verification in DB
  const [totalPublished] = await db
    .select({ c: count() })
    .from(products)
    .where(eq(products.publicationStatus, 'PUBLISHED'));

  console.log(`✅ Total productos publicados en Base de Datos: ${totalPublished.c}`);
  console.log('✅ Importación de Catalogo_Productos.xlsx completada al 100% sin errores.');

  process.exit(0);
}

run().catch((err) => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});
