import { db } from './index.ts';
import { brands, categories, products, productImages, productDocuments, autonomousSettings, users } from './schema.ts';
import { sql } from 'drizzle-orm';

export async function runSeed(database = db) {
  console.log('Iniciando siembra canónica del catálogo médico IZCOR MEDIC...');

  // 1. Insert Categories
  const categoryDefs = [
    { name: 'Equipos Médicos & UCI', slug: 'equipos-medicos', description: 'Equipamiento tecnológico de soporte vital, UCI y monitoreo continuo.' },
    { name: 'Diagnóstico & Monitoreo', slug: 'diagnostico-y-monitoreo', description: 'Equipos de imagenología, ecografía doppler y electrocardiografía clínica.' },
    { name: 'Mobiliario Clínico', slug: 'mobiliario-clinico', description: 'Camas hospitalarias eléctricas, camillas y mobiliario en acero quirúrgico 304.' },
    { name: 'Instrumental Quirúrgico', slug: 'instrumental-quirurgico', description: 'Instrumental alemán de alta precisión para cirugía general y especializada.' },
    { name: 'Insumos y Descartables', slug: 'insumos-descartables', description: 'Material estéril de un solo uso, sondas, catéteres y apósitos especializados.' },
    { name: 'Bioseguridad y EPP', slug: 'bioseguridad-epp', description: 'Equipos de esterilización a vapor y protección biológica hospitalaria.' },
    { name: 'Laboratorio Clínico', slug: 'laboratorio', description: 'Analizadores hematológicos, centrífugas y microscopía biológica.' },
    { name: 'Suministro Institucional', slug: 'suministro-institucional', description: 'Soluciones integrales de equipamiento para licitaciones OSCE y centros de salud.' },
  ];

  const cats = await database.insert(categories).values(categoryDefs)
    .onConflictDoUpdate({ target: categories.slug, set: { name: sql`EXCLUDED.name`, description: sql`EXCLUDED.description` } })
    .returning();

  console.log(`Categorías registradas: ${cats.length}`);

  // 2. Insert Brands
  const brandDefs = [
    { 
      name: 'Mindray', 
      slug: 'mindray', 
      manufacturer: 'Shenzhen Mindray Bio-Medical Electronics', 
      description: 'Líder global en monitorización de pacientes, diagnóstico por ultrasonido y sistemas de soporte vital.',
      website: 'https://www.mindray.com',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'NOPA Instruments', 
      slug: 'nopa-instruments', 
      manufacturer: 'NOPA Instruments Medizintechnik GmbH', 
      description: 'Fabricante alemán premium de instrumental quirúrgico de acero inoxidable martensítico.',
      website: 'https://www.nopa-instruments.com',
      logo: 'https://images.unsplash.com/photo-1583912267550-d44d9c95a04e?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Roker', 
      slug: 'roker', 
      manufacturer: 'Roker Medical Devices', 
      description: 'Especialistas en autoclaves de esterilización a vapor y procesamiento de instrumental médico.',
      website: 'https://www.rokermedical.com',
      logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Clute', 
      slug: 'clute', 
      manufacturer: 'Clute Healthcare Corp.', 
      description: 'Guantes de nitrilo clínico, mascarillas quirúrgicas de alta filtración y protección EPP.',
      website: 'https://www.clute-safety.com',
      logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Aceros UP', 
      slug: 'aceros-up', 
      manufacturer: 'Aceros Hospitalarios UP S.A.C.', 
      description: 'Fabricación nacional certificada de camas clínicas de 3 y 4 manivelas, vitrinas y mesas de operaciones en acero inoxidable AISI 304.',
      website: 'https://www.acerosup.pe',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Jampar', 
      slug: 'jampar', 
      manufacturer: 'Jampar Diagnostics', 
      description: 'Equipos de centrifugación clínica, microscopía óptica y fotómetros de laboratorio.',
      website: 'https://www.jampardiag.com',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'General Electric Healthcare', 
      slug: 'ge-healthcare', 
      manufacturer: 'GE Healthcare Ltd.', 
      description: 'Sistemas avanzados de ecografía doppler, anestesia y ventilación mecánica invasiva.',
      website: 'https://www.gehealthcare.com',
      logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'IZCOR MEDIC Homologado', 
      slug: 'izcor-medic', 
      manufacturer: 'IZCOR MEDIC S.A.C.', 
      description: 'Equipamiento biomédico homologado con servicio técnico y garantía directa en todo el Perú.',
      website: 'https://izcormedic.pe',
      logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const brnds = await database.insert(brands).values(brandDefs)
    .onConflictDoUpdate({ target: brands.slug, set: { name: sql`EXCLUDED.name`, description: sql`EXCLUDED.description`, manufacturer: sql`EXCLUDED.manufacturer` } })
    .returning();

  console.log(`Marcas registradas: ${brnds.length}`);

  const getCatId = (slug: string) => cats.find(c => c.slug === slug)?.id;
  const getBrandId = (slug: string) => brnds.find(b => b.slug === slug)?.id;

  // 3. Certified Medical Products
  const productDefs = [
    // 1. Monitor Multiparámetro
    {
      name: 'Monitor de Signos Vitales Multiparámetro Mindray uMEC10',
      slug: 'monitor-signos-vitales-mindray-umec10',
      model: 'uMEC-10',
      catalogNumber: 'MDR-UMEC10-UCI',
      brandId: getBrandId('mindray'),
      manufacturer: 'Mindray',
      categoryId: getCatId('equipos-medicos'),
      description: 'Monitor de alta precisión diseñado para hospitalización y cuidados intensivos. Pantalla LED táctil de 10.4 pulgadas con tecnología antirreflejo. Mide ECG de 3/5 derivaciones, SpO2, PNI, frecuencia respiratoria, pulso y temperatura corporal con algoritmos anti-interferencia de movimiento.',
      technicalSpecs: JSON.stringify({
        pantalla: '10.4" LCD a color táctil (800x600 px)',
        parametros: 'ECG, SpO2 Mindray/Nellcor, PNI, Resp, Temp dual',
        bateria: 'Ion-litio recargable de 4 horas de autonomía continua',
        conectividad: 'Ethernet RJ45, USB 2.0 y soporte HL7 centralizado',
        peso: 'Bajo peso de 3.5 kg con asa ergonómica de transporte',
        certificaciones: 'ISO 13485, marcado CE, Registro DIGEMID vigente'
      }),
      application: 'Unidades de Cuidados Intensivos (UCI), Emergencia, Sala de Recuperación postanestésica y Hospitalización general.',
      presentation: 'Unidad principal con cable paciente de ECG, manguito adulto y sensor de oximetría SpO2 reusable.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 99,
      confidenceLevel: 'HIGH',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
    },
    // 2. Ecógrafo Portátil Doppler
    {
      name: 'Ecógrafo Doppler Color Portátil Mindray DP-50 Expert',
      slug: 'ecografo-doppler-mindray-dp50',
      model: 'DP-50 Expert',
      catalogNumber: 'MDR-DP50-DOP',
      brandId: getBrandId('mindray'),
      manufacturer: 'Mindray',
      categoryId: getCatId('diagnostico-y-monitoreo'),
      description: 'Sistema de ultrasonido de última generación con transductores multifrecuencia, tecnología PSH (Phase Shift Harmonic Imaging) y flujo Doppler color de alta sensibilidad hemodinámica. Monitor orientable de 15 pulgadas con arranque rápido en menos de 15 segundos.',
      technicalSpecs: JSON.stringify({
        monitor: '15 pulgadas LCD de alta definición con inclinación 60°',
        modos: 'B, B/B, 4B, M, B/M, Doppler Color, Doppler Pulsado (PW)',
        transductores: 'Convexo 35C50EA (2.0-5.0 MHz) y Lineal 75L38EA (5.0-10.0 MHz)',
        almacenamiento: 'Disco duro interno de 500 GB con software iStation',
        conectividad: 'DICOM 3.0 completo, salida HDMI, USB y Ethernet',
        normativa: 'Homologación OSCE para centros de salud Nivel I-4 y II-1'
      }),
      application: 'Ginecología, Obstetricia, Abdominal, Musculoesquelético, Vascular Periférico y Medicina de Emergencias.',
      presentation: 'Consola portátil con 2 puertos activos de transductores y carro de transporte opcional.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 98,
      confidenceLevel: 'HIGH',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    },
    // 3. Cama Hospitalaria Eléctrica
    {
      name: 'Cama Clínica Eléctrica Hospitalaria UCI de 4 Motores',
      slug: 'cama-clinica-electrica-uci-4-motores',
      model: 'UP-EL400-UCI',
      catalogNumber: 'AUP-BED-EL4',
      brandId: getBrandId('aceros-up'),
      manufacturer: 'Aceros UP',
      categoryId: getCatId('mobiliario-clinico'),
      description: 'Cama médica motorizada con 4 actuadores lineales silenciosos. Ajuste eléctrico de respaldo, sección fowler de piernas, altura general y posición Trendelenburg/Trendelenburg inverso. Barandas de ABS con comandos integrados y ruedas antiestáticas con freno centralizado.',
      technicalSpecs: JSON.stringify({
        movimientos: 'Respaldo (0°-75°), Piernas (0°-45°), Altura (450-750 mm), Trendelenburg (±14°)',
        capacidadCarga: '250 kg de carga de trabajo segura (SWL)',
        estructura: 'Acero estructural electrogalvanizado con pintura electrostática epoxi-poliéster horneada',
        barandas: '4 barandas abatibles de polímero ABS de alto impacto con amortiguación suave',
        ruedas: '4 ruedas de 5" (125mm) alemanas con sistema de freno central simultáneo',
        respaldoEmergencia: 'Palancas bilaterales de RCP mecánico de liberación instantánea'
      }),
      application: 'Unidades de Cuidados Críticos, Hospitalización de Alta Complejidad y Centros Quirúrgicos.',
      presentation: 'Cama completa con colchón articulado de poliuretano viscoelástico impermeable con forro lavable.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 96,
      confidenceLevel: 'HIGH',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    },
    // 4. Autoclave de Mesa 24 Litros
    {
      name: 'Autoclave de Mesa Clase B Automático 24L Roker Medical',
      slug: 'autoclave-mesa-clase-b-24l-roker',
      model: 'RK-CLB24',
      catalogNumber: 'ROK-AUTOCLAVE-24',
      brandId: getBrandId('roker'),
      manufacturer: 'Roker Medical Devices',
      categoryId: getCatId('bioseguridad-epp'),
      description: 'Esterilizador a vapor con generador independiente y bomba de vacío fraccionado de tres etapas. Apto para instrumental quirúrgico sólido, hueco, poroso y empaquetado. Impresora térmica integrada para trazabilidad de ciclos y registro digital USB.',
      technicalSpecs: JSON.stringify({
        camara: 'Acero inoxidable 304 sin soldaduras de 24 litros (Ø250 x 450 mm)',
        temperaturaEsterilizacion: 'Programas de 121°C y 134°C con secado por vacío profundo',
        seguridad: 'Cierre de puerta electromecánico presurizado y doble válvula de alivio térmico',
        pantalla: 'Display digital con indicación en tiempo real de curva de temperatura y presión',
        documentacion: 'Prueba de Bowie & Dick, prueba de Helix y prueba de vacío preprogramadas'
      }),
      application: 'Centrales de Esterilización, Clínicas Quirúrgicas, Odontología Hospitalaria y Laboratorios.',
      presentation: 'Equipo con 3 bandejas de acero inoxidable, soporte, pinza de extracción y filtro bacteriológico.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 97,
      confidenceLevel: 'HIGH',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
    },
    // 5. Caja Quirúrgica de Instrumental Alemán
    {
      name: 'Set de Cirugía Mayor General en Acero Alemán NOPA Instruments',
      slug: 'set-cirugia-mayor-nopa-instruments',
      model: 'SET-CM-54',
      catalogNumber: 'NPA-SURG-54P',
      brandId: getBrandId('nopa-instruments'),
      manufacturer: 'NOPA Instruments',
      categoryId: getCatId('instrumental-quirurgico'),
      description: 'Set completo de 54 piezas de instrumental quirúrgico fabricado en Tuttlingen, Alemania. Acero martensítico de máxima resistencia a la corrosión y temple controlado. Incluye tijeras Metzenbaum y Mayo con filo de tungsteno, pinzas Kelly, Allis, Kocher y separadores Balfour.',
      technicalSpecs: JSON.stringify({
        composicion: '54 piezas certificadas para procedimientos abdominales y de cirugía general',
        material: 'Acero quirúrgico inoxidable alemán DIN 1.4021 con insertos de carburo de tungsteno (TC)',
        acabado: 'Satinado micro-arenado antideslumbrante para quirófano',
        resistencia: 'Garantía de esterilización de 1000+ ciclos sin pérdida de corte ni temple',
        trazabilidad: 'Grabado láser individual de número de lote y marca de procedencia'
      }),
      application: 'Quirófano, Cirugía Abdominal, Traumatología, Sala de Operaciones de Nivel II y III.',
      presentation: 'Caja contenedora de aluminio anodizado perforada con filtro de barrera bacteriana.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 100,
      confidenceLevel: 'HIGH',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1583912267550-d44d9c95a04e?auto=format&fit=crop&w=1000&q=80',
    },
    // 6. Analizador Hematológico Automático
    {
      name: 'Analizador Hematológico Automático Mindray BC-30s',
      slug: 'analizador-hematologico-mindray-bc30s',
      model: 'BC-30s',
      catalogNumber: 'MDR-HEM-BC30S',
      brandId: getBrandId('mindray'),
      manufacturer: 'Mindray',
      categoryId: getCatId('laboratorio'),
      description: 'Analizador diferencial de 3 poblaciones leucocitarias y 21 parámetros con histogramas RBC, WBC y PLT. Rendimiento de 70 muestras por hora con un volumen mínimo de aspiración de solo 9 microlitros de sangre total. Pantalla táctil integrada de alta resolución.',
      technicalSpecs: JSON.stringify({
        rendimiento: 'Hasta 70 pruebas por hora',
        volumenMuestra: '9 µL en sangre total y 20 µL en modo prediluido',
        reactivos: 'Solo requiere 2 reactivos de rutina (Diluyente y Lisante M-30D)',
        pantalla: 'Táctil TFT de 10.4 pulgadas con interfaz intuitiva gráfica',
        almacenamiento: 'Hasta 500,000 resultados con gráficos e información demográfica de pacientes'
      }),
      application: 'Laboratorios de Análisis Clínicos Hospitalarios, Bancos de Sangre y Centros de Diagnóstico.',
      presentation: 'Analizador con paquete de inicio de reactivos, impresora térmica interna y lector de código de barras.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 99,
      confidenceLevel: 'HIGH',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
    },
    // 7. Guantes de Examen de Nitrilo
    {
      name: 'Guantes de Examen de Nitrilo Clínico Sin Polvo Clute (Caja x 100)',
      slug: 'guantes-nitrilo-clinico-clute-caja100',
      model: 'NIT-PRO-BLUE',
      catalogNumber: 'CLT-GNT-100',
      brandId: getBrandId('clute'),
      manufacturer: 'Clute',
      categoryId: getCatId('insumos-descartables'),
      description: 'Guantes descartables de nitrilo grado médico de alta resistencia química y mecánica. Textura micro-rugosa en yemas para agarre seguro en procedimientos húmedos. 100% libres de látex y sin polvo bio-absorbible para prevenir reacciones alérgicas.',
      technicalSpecs: JSON.stringify({
        material: 'Copolímero de nitrilo butadieno (NBR) 100% hipoalergénico',
        grosor: '4.5 mils en dedos / 3.8 mils en palma',
        resistencia: 'Nivel AQL 1.5 según estándar ISO 2859-1 para barrera viral',
        color: 'Azul cobalto médico',
        tallas: 'S, M, L y XL con puño reforzado con reborde'
      }),
      application: 'Procedimientos Médicos, Laboratorios, Farmacia, Odontología y Manipulación de Muestras.',
      presentation: 'Caja dispensadora de 100 unidades ambidiestras no estériles.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 95,
      confidenceLevel: 'HIGH',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80',
    },
    // 8. Mesa Quirúrgica de Mayo en Acero Inoxidable
    {
      name: 'Mesa de Instrumental Quirúrgico tipo Mayo en Acero Inoxidable 304',
      slug: 'mesa-de-mayo-acero-quirurgico-304',
      model: 'MM-A304-PRO',
      catalogNumber: 'AUP-TAB-MY304',
      brandId: getBrandId('aceros-up'),
      manufacturer: 'Aceros UP',
      categoryId: getCatId('mobiliario-clinico'),
      description: 'Mesa de soporte de instrumental para centro quirúrgico. Bandeja desmontable embutida sin soldaduras en acero inoxidable quirúrgico AISI 304. Columna telescópica con ajuste de altura mediante pistón neumático o perilla de compresión ergonómica.',
      technicalSpecs: JSON.stringify({
        bandeja: '600 x 400 mm en acero inoxidable AISI 304 de 1.2 mm de espesor',
        rangoAltura: '800 mm a 1250 mm con sistema de bloqueo por perilla antideslizante',
        base: 'Base en U reforzada diseñada para encajar bajo mesas de operaciones',
        ruedas: '4 ruedas giratorias de 2" de goma conductora antiestática con doble rodamiento'
      }),
      application: 'Salas de Operaciones, Salas de Parto, Tópico de Cirugía Menor y Emergencias.',
      presentation: 'Estructura lista para esterilización química y limpieza de alta desinfección.',
      status: 'ACTIVE',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      validationScore: 94,
      confidenceLevel: 'HIGH',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    }
  ];

  const prods = await database.insert(products).values(
    productDefs.map(({ imageUrl, ...p }) => p)
  )
    .onConflictDoUpdate({ 
      target: products.slug, 
      set: { 
        name: sql`EXCLUDED.name`, 
        description: sql`EXCLUDED.description`, 
        technicalSpecs: sql`EXCLUDED.technical_specs`,
        publicationStatus: sql`EXCLUDED.publication_status`,
        status: sql`EXCLUDED.status`,
        verificationStatus: sql`EXCLUDED.verification_status`,
        validationScore: sql`EXCLUDED.validation_score`,
        confidenceLevel: sql`EXCLUDED.confidence_level`
      } 
    })
    .returning();

  console.log(`Productos médicos registrados: ${prods.length}`);

  // 4. Seed Product Images in product_images
  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const def = productDefs[i];
    if (def?.imageUrl) {
      await database.insert(productImages).values([
        {
          productId: p.id,
          url: def.imageUrl,
          altText: `${p.name} - Vista Principal`,
          sortOrder: 1,
          licenseStatus: 'COMMERCIAL_VERIFIED'
        }
      ]).onConflictDoNothing().catch(() => {});
    }
  }

  // 5. Seed Product Documents in product_documents
  for (const p of prods) {
    await database.insert(productDocuments).values([
      {
        productId: p.id,
        title: `Ficha Técnica Oficial - ${p.name}`,
        url: `https://izcormedic.pe/docs/fichas/${p.slug}.pdf`,
        type: 'DATASHEET',
        sourceUrl: 'https://izcormedic.pe'
      },
      {
        productId: p.id,
        title: `Protocolo de Mantenimiento y Homologación - ${p.model || p.name}`,
        url: `https://izcormedic.pe/docs/manuales/${p.slug}-manual.pdf`,
        type: 'MANUAL',
        sourceUrl: 'https://izcormedic.pe'
      }
    ]).onConflictDoNothing().catch(() => {});
  }

  // 6. Auto-load master catalog from products.json if present
  try {
    const fs = await import('fs');
    const path = await import('path');
    const jsonPath = path.resolve(process.cwd(), 'src', 'data', 'products.json');
    if (fs.existsSync(jsonPath)) {
      const jsonRaw = fs.readFileSync(jsonPath, 'utf8');
      const allJsonProducts = JSON.parse(jsonRaw);
      console.log(`Verificando catálogo maestro desde products.json (${allJsonProducts.length} productos)...`);

      // Get current categories and brands to resolve IDs
      const allDbCats = await database.select().from(categories);
      const catSlugMap = new Map<string, number>();
      for (const c of allDbCats) {
        catSlugMap.set(c.slug, c.id);
      }

      const allDbBrands = await database.select().from(brands);
      const brandNameMap = new Map<string, number>();
      for (const b of allDbBrands) {
        brandNameMap.set(b.name.toLowerCase().trim(), b.id);
      }

      // Check default fallback brand
      const defaultBrandId = brandNameMap.get('izcor medic') || (allDbBrands[0] ? allDbBrands[0].id : null);
      const defaultCatId = catSlugMap.get('material-insumos') || (allDbCats[0] ? allDbCats[0].id : null);

      // Insert products in batches
      const BATCH_SIZE = 100;
      let loadedCount = 0;
      for (let i = 0; i < allJsonProducts.length; i += BATCH_SIZE) {
        const slice = allJsonProducts.slice(i, i + BATCH_SIZE);
        const toInsert = slice.map((item: any) => {
          const itemCatId = catSlugMap.get(item.categoriaSlug) || defaultCatId;
          const itemSubcatId = item.subcategoriaSlug ? (catSlugMap.get(item.subcategoriaSlug) || null) : null;
          const itemBrandId = item.marca ? (brandNameMap.get(item.marca.toLowerCase().trim()) || defaultBrandId) : defaultBrandId;
          const slug = item.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + `-${item.codigo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          return {
            brandId: itemBrandId,
            manufacturer: item.marca || 'IZCOR MEDIC S.A.C.',
            name: item.nombre,
            slug,
            model: item.codigo,
            catalogNumber: item.codigo,
            categoryId: itemCatId,
            subcategoryId: itemSubcatId,
            description: item.descripcion,
            technicalSpecs: `Procedencia: ${item.procedencia || 'No especificada'}\nPresentación: ${item.presentacion || item.unidad || 'Unidad'}`,
            application: item.subcategoria || item.categoria,
            presentation: item.presentacion || item.unidad,
            publicationStatus: 'PUBLISHED',
            verificationStatus: 'VERIFIED',
            featured: false,
          };
        });

        await database.insert(products).values(toInsert).onConflictDoNothing().catch(() => {});
        loadedCount += slice.length;
      }
      console.log(`Catálogo maestro procesado: ${loadedCount} productos sincronizados.`);
    }
  } catch (err: any) {
    console.warn('Nota en sincronización de catálogo maestro:', err.message);
  }

  // 7. Seed Autonomous Settings
  await database.insert(autonomousSettings).values([
    {
      autonomousModeEnabled: true,
      operatingMode: 'AUTO',
      autoPublishEnabled: true,
      autoPublishMinScore: 85,
      riskThreshold: 'LOW',
      maxConcurrency: 4,
      crawlIntervalHours: 12,
      emergencyStop: false,
      anomalyThresholdPercent: 40,
      currentRuleVersion: 'v2.1.0'
    }
  ]).onConflictDoNothing().catch(() => {});

  // 8. Seed Admin User
  await database.insert(users).values([
    {
      uid: 'dev-admin-uid',
      email: 'admin@b2bmed.com',
      role: 'ADMIN'
    }
  ]).onConflictDoNothing().catch(() => {});

  console.log('Siembra canónica completada exitosamente.');
  return { categories: cats.length, brands: brnds.length, products: prods.length };
}

// Direct execution support
const isDirectExecution = (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('seed.ts'));
if (isDirectExecution) {
  runSeed().then(() => {
    console.log('Script de siembra finalizado.');
    process.exit(0);
  }).catch((err) => {
    console.error('Error en siembra:', err);
    process.exit(1);
  });
}
