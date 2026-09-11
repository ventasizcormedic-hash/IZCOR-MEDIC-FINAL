import fs from 'fs';
import path from 'path';

// ========================================================
// STEP 1: PARSE EXCEL XML FILES
// ========================================================

const sharedStringsPath = path.join(process.cwd(), '.data', 'excel_extracted', 'xl', 'sharedStrings.xml');
const sheet1Path = path.join(process.cwd(), '.data', 'excel_extracted', 'xl', 'worksheets', 'sheet1.xml');

console.log('📖 Reading shared strings...');
const ssRaw = fs.readFileSync(sharedStringsPath, 'utf-8');
const strings: string[] = [];

// Parse all <si> elements
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let siMatch;
while ((siMatch = siRegex.exec(ssRaw)) !== null) {
  const siContent = siMatch[1];
  const tMatches = siContent.match(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g);
  if (tMatches) {
    const text = tMatches
      .map((t: string) => t.replace(/<t(?:\s[^>]*)?>([^<]*)<\/t>/, '$1'))
      .join('');
    strings.push(text);
  } else {
    strings.push('');
  }
}
console.log(`✅ Loaded ${strings.length} shared strings.`);

console.log('📖 Reading sheet1.xml...');
const sheetRaw = fs.readFileSync(sheet1Path, 'utf-8');

interface ExcelRow {
  code: string;
  brand: string;
  name: string;
  procedencia: string;
  unit: string;
}

const rawRows: ExcelRow[] = [];
const rowRegex = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
let rowMatch;

while ((rowMatch = rowRegex.exec(sheetRaw)) !== null) {
  const rowNumber = parseInt(rowMatch[1], 10);
  if (rowNumber === 1) continue; // skip header

  const rowContent = rowMatch[2];
  const cellRegex = /<c\s+r="([A-Z]+)\d+"(?:[^>]*?t="([^"]*)")?[^>]*>(?:<v>([^<]*)<\/v>)?<\/c>/g;
  let cellMatch;
  const cols: Record<string, string> = {};

  while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
    const colLetter = cellMatch[1];
    const isSharedString = cellMatch[2] === 's';
    const val = cellMatch[3];
    if (val !== undefined) {
      const raw = isSharedString ? (strings[parseInt(val, 10)] || '') : val;
      cols[colLetter] = raw.trim().replace(/\u00A0/g, ' ').trim();
    }
  }

  const code = (cols['A'] || '').replace(/\u00A0/g, ' ').trim();
  const brand = (cols['B'] || '').replace(/\u00A0/g, ' ').trim();
  const name = (cols['C'] || '').replace(/\u00A0/g, ' ').trim();
  const procedencia = (cols['D'] || '').replace(/\u00A0/g, ' ').trim();
  const unit = (cols['E'] || '').replace(/\u00A0/g, ' ').trim();

  // Skip completely empty rows (can happen with formatting rows)
  if (!code && !brand && !name) continue;

  rawRows.push({ code, brand, name, procedencia, unit });
}

console.log(`✅ Found ${rawRows.length} product rows in Excel.`);

// ========================================================
// STEP 2: CATEGORIZATION LOGIC
// ========================================================
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CategoryResult {
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
}

function classifyProduct(name: string, brand: string): CategoryResult {
  const n = name.toLowerCase();
  const b = brand.toLowerCase();

  // Helper brands
  const isKlsMartin = b.includes('kls martin');
  const isHilbro = b.includes('hilbro');
  const isHermann = b.includes('hermann');
  const isTuttnauer = b.includes('tuttnauer');
  const isRenosem = b.includes('renosem');
  const isSteelco = b.includes('steelco');
  const isEdan = b.includes('edan');
  const isMindray = b.includes('mindray');
  const isBoeco = b.includes('boeco');
  const isMemmert = b.includes('memmert');
  const isHeine = b.includes('heine');
  const isRiester = b.includes('riester');
  const isMedifa = b.includes('medifa');
  const isSaikang = b.includes('saikang');
  const isMetro = b.includes('metro');
  const isPerlove = b.includes('perlove');
  const isDrgem = b.includes('drgem');
  const isEsaote = b.includes('esaote');
  const isVinno = b.includes('vinno');
  const isSiui = b.includes('siui');
  const isPglab = b.includes('pg labs') || b.includes('pglab');
  const isMedrena = b.includes('medrena');
  const isDaiwha = b.includes('daiwha');
  const isZoll = b.includes('zoll');
  const isCu = b.includes('cu.medical');
  const isSiare = b.includes('siare');
  const isOlidef = b.includes('olidef');
  const isLedSpa = b.includes('led spa');
  const isBiobase = b.includes('biobase');
  const isZeiss = b.includes('zeiss');
  const isCardioline = b.includes('cardioline');
  const isSibelmed = b.includes('sibelmed');

  // 1. Instrumental Quirúrgico & Médico (pinzas, tijeras, separadores, cucharillas...)
  if (
    n.match(/pinza|tijera|separador|cureta|especulo|osteotomo|cucharilla|dilatador|elevador|clamp|porta.aguja|gubia|perforador|bisturi|sierra cirujano|raspador|gancho quirurgico|trocar|retractor|disector|forceps|sindesmotomo|periostotomo|alicate|cincel|mango de bisturi|legra|tenaza|abreboca|abre.boca|portaagujas|portaaguja|punch|rongeour|curette/) ||
    isKlsMartin || isHilbro || isHermann
  ) {
    // Check if it's a spare part / accessory rather than instrument
    if (n.match(/tarjeta|placa pcb|fuente de poder|bateria recarg|valvula solenoide|empaquetadura|manguera|fusible|motor electrico|modulo electronico|filtro hepa|lampara quirurgica$/)) {
      return { category: 'Repuestos y Componentes Biomédicos', categorySlug: 'repuestos-componentes', subcategory: 'Repuestos de Instrumental', subcategorySlug: 'repuestos-instrumental' };
    }
    return { category: 'Instrumental Quirúrgico', categorySlug: 'instrumental-quirurgico', subcategory: 'Cirugía y Especialidades Médicas', subcategorySlug: 'cirugia-especialidades' };
  }

  // 2. Diagnóstico por Imágenes
  if (
    n.match(/rayos x|ecografo|ultrasonido|sonda convex|sonda lineal|sonda endocavit|mamograf|arco en c|fluoroscop|negatoscopio|colposcop|densitomet|transductor echograph/) ||
    isPerlove || isDrgem || isEsaote || isVinno || isSiui
  ) {
    return { category: 'Equipos de Diagnóstico por Imágenes', categorySlug: 'diagnostico-imagenes', subcategory: 'Ultrasonido y Rayos X', subcategorySlug: 'ultrasonido-rayos-x' };
  }

  // 3. Equipos de Soporte Vital & UCI
  if (
    n.match(/ventilador pulmonar|ventilador volume|maquina de anestesia|vaporizador|bomba de infusion|bomba de jeringa|bomba infusora|desfibrilador|dea automatico|cardioversor|incubadora neonatal|incubadora de transporte|cuna de calor|servocuna|resucitador/) ||
    isZoll || isDaiwha || isMedrena || isSiare || isCu || isOlidef
  ) {
    return { category: 'Equipos de Soporte Vital & UCI', categorySlug: 'soporte-vital-uci', subcategory: 'UCI y Cuidados Críticos', subcategorySlug: 'uci-cuidados-criticos' };
  }

  // 4. Diagnóstico & Monitoreo Clínico
  if (
    n.match(/monitor de paciente|monitor de signos|oximetro de pulso|pulsioximetro|tensiometro|esfigmomanometro|estetoscopio|electrocardio|ecg |holter|laringoscopio|otoscopio|oftalmoscopio|termometro|glucometro|fonendoscopio|cable ecg|sensor spo2|brazalete nibp|doppler fetal|audiometro|espirometro|sensor de temperatura/) ||
    isEdan || isMindray || isHeine || isRiester || isCardioline || isSibelmed
  ) {
    return { category: 'Diagnóstico & Monitoreo', categorySlug: 'diagnostico-monitoreo', subcategory: 'Monitoreo de Paciente y Triaje', subcategorySlug: 'monitoreo-paciente-triaje' };
  }

  // 5. Esterilización y Desinfección
  if (
    n.match(/autoclave|esterilizad|desinfect|lavachatas|termodesinfect|selladora|sellado|plasma esteriliz|peroxido|calor seco|oxido de etileno|contenedor quirurgico|filtro de contenedor|papel crepado|indicador biologico|lavadora de instrumental|test de bowie|test de helicox|test biologico|ciclo de esteril/) ||
    isTuttnauer || isRenosem || isSteelco
  ) {
    return { category: 'Esterilización y Desinfección', categorySlug: 'esterilizacion-desinfeccion', subcategory: 'Central de Esterilización', subcategorySlug: 'central-esterilizacion' };
  }

  // 6. Mobiliario Clínico & Hospitalario
  if (
    n.match(/cama electrica|cama uci|cama clinica|cama manual|cama hospitalaria|camilla de transporte|camilla telescopica|camilla de rescate|mesa quirurgica|mesa de operacion|mesa de parto|mesa de mayo|coche de paro|coche de curacion|vitrina de acero|armario metalico|biombo|velador|porta suero|escalinata|sillon de parto|silla de ruedas|taburete|archivador metalico|negatoscopio/) ||
    isMedifa || isSaikang || isMetro || isOlidef
  ) {
    return { category: 'Mobiliario Clínico', categorySlug: 'mobiliario-clinico', subcategory: 'Hospitalización y Quirófano', subcategorySlug: 'hospitalizacion-quirofano' };
  }

  // 7. Laboratorio Clínico
  if (
    n.match(/centrifuga|microscopio|analizador bioquimico|analizador hematolog|bano maria|estufa de laboratorio|agitador|vortex|micropipeta|espectrofotometro|refractometro|placa petri|matraz|densitometro|autoclave de laboratorio|destilador|deionizador|ph metro|conductivimetro/) ||
    isBoeco || isMemmert || isZeiss || isBiobase
  ) {
    return { category: 'Laboratorio Clínico', categorySlug: 'laboratorio-clinico', subcategory: 'Análisis y Biología Clínica', subcategorySlug: 'analisis-biologia-clinica' };
  }

  // 8. Repuestos y Componentes Técnicos (most common catch-all for accessories)
  if (
    n.match(/tarjeta|placa electronica|fuente de poder|sensor de flujo|bateria recargable|valvula|empaquetadura|conector|adaptador de corriente|manguera|fusible|motor|solenoide|rele|modulo|filtro de|celda de o2|lampara|rotor|diafragma|acople|piston|manometro|engranaje|interruptor|teclado|pantalla lcd|display|ventilador dc|turbina|compresor|caudalimetro|regulador de presion|cable de datos|cable power/)
  ) {
    return { category: 'Repuestos y Componentes Biomédicos', categorySlug: 'repuestos-componentes', subcategory: 'Mantenimiento e Ingeniería Clínica', subcategorySlug: 'mantenimiento-ingenieria' };
  }

  // 9. Material e Insumos Hospitalarios
  if (
    n.match(/sonda foley|sonda nelaton|sonda nasogastrica|canula orofaringea|cateter|tubo endotraqueal|guante quirurgico|guante de latex|guante de nitrilo|jeringa|aguja hipoder|mascarilla|respirador n95|mandil|chaqueta quirurgica|toca|gorro quirurgico|algodon|gasa esteril|aposito|venda|bolsa de orina|bolsa colectora|descartable/)
  ) {
    return { category: 'Material e Insumos Hospitalarios', categorySlug: 'material-insumos', subcategory: 'Descartables y Bioseguridad', subcategorySlug: 'descartables-bioseguridad' };
  }

  // 10. Fallback: Equipamiento y Suministro Clínico General
  return { category: 'Equipamiento y Suministro Clínico', categorySlug: 'equipamiento-suministro', subcategory: 'Tecnología Médica Especializada', subcategorySlug: 'tecnologia-medica' };
}

// ========================================================
// STEP 3: GENERATE FULL products.json
// ========================================================

// Map from orden 1-105 to existing image paths (already built in the project)
const EXISTING_IMAGE_ORDERS = new Set([...Array(105)].map((_, i) => i + 1));

interface ProductRecord {
  id: string;
  orden: number;
  codigo: string;
  marca: string;
  nombre: string;
  procedencia: string;
  unidad: string;
  categoria: string;
  categoriaSlug: string;
  subcategoria: string;
  subcategoriaSlug: string;
  descripcion: string;
  presentacion: string;
  imagenPrincipal: string | null;
  imagenes: string[];
  verificado: boolean;
  publicado: boolean;
}

const UNIT_LABELS: Record<string, string> = {
  'UND': 'Unidad',
  'MTR': 'Metro',
  'PAR': 'Par',
  'C20': 'Caja x 20',
  'ROL': 'Rollo',
  'BOL': 'Bolsa',
  'CAJ': 'Caja',
  'LTR': 'Litro',
  'PQT': 'Paquete',
  'C30': 'Caja x 30',
  'P50': 'Paquete x 50',
  'KGS': 'Kilogramo',
  'P05': 'Paquete x 5',
  'PCI': 'Pieza',
  'CA5': 'Caja x 5',
  'C02': 'Caja x 2',
  'CAC': 'Caja por caja',
};

const fullProducts: ProductRecord[] = [];
let orden = 1;

for (const row of rawRows) {
  const cat = classifyProduct(row.name, row.brand);
  const codeForId = row.code.replace(/\./g, '-');
  const id = `prod-${codeForId}`;
  const unitLabel = UNIT_LABELS[row.unit] || row.unit || 'Unidad';

  // Description: built from real data, no inventions
  let desc = `${row.name}`;
  if (row.brand) desc += ` — Marca: ${row.brand}`;
  if (row.procedencia) desc += ` | Procedencia: ${row.procedencia}`;
  desc += `. Producto médico profesional disponible para licitaciones institucionales y suministro hospitalario a través de IZCOR MEDIC S.A.C. Código de inventario: ${row.code}.`;

  // Image path: only use real images for the first 105 products in order
  let imagenPrincipal: string | null = null;
  let imagenes: string[] = [];

  if (EXISTING_IMAGE_ORDERS.has(orden)) {
    const padded = String(orden).padStart(3, '0');
    const imgId = `producto-${padded}`;
    imagenPrincipal = `/assets/catalogo/productos/${imgId}/${imgId}-01.webp`;
    imagenes = [imagenPrincipal, `/assets/catalogo/productos/${imgId}/${imgId}-01.png`];
  }

  fullProducts.push({
    id,
    orden,
    codigo: row.code,
    marca: row.brand,
    nombre: row.name,
    procedencia: row.procedencia,
    unidad: row.unit,
    categoria: cat.category,
    categoriaSlug: cat.categorySlug,
    subcategoria: cat.subcategory,
    subcategoriaSlug: cat.subcategorySlug,
    descripcion: desc,
    presentacion: unitLabel,
    imagenPrincipal,
    imagenes,
    verificado: true,
    publicado: true,
  });

  orden++;
}

// ========================================================
// STEP 4: WRITE products.json
// ========================================================
const outPath = path.join(process.cwd(), 'src', 'data', 'products.json');
fs.writeFileSync(outPath, JSON.stringify(fullProducts, null, 2), 'utf-8');
console.log(`\n✅ products.json written with ${fullProducts.length} products.`);

// ========================================================
// STEP 5: STATS REPORT
// ========================================================
const catCounts: Record<string, number> = {};
const brandCounts: Record<string, number> = {};
let withImage = 0;
let withoutImage = 0;

for (const p of fullProducts) {
  catCounts[p.categoria] = (catCounts[p.categoria] || 0) + 1;
  brandCounts[p.marca] = (brandCounts[p.marca] || 0) + 1;
  if (p.imagenPrincipal) withImage++;
  else withoutImage++;
}

const categories = Object.keys(catCounts);
const brands = Object.keys(brandCounts);

console.log('\n========== STATISTICS ==========');
console.log(`Total products in Excel:   ${rawRows.length}`);
console.log(`Total products in JSON:    ${fullProducts.length}`);
console.log(`Products with image:       ${withImage}`);
console.log(`Products without image:    ${withoutImage}`);
console.log(`Unique categories:         ${categories.length}`);
console.log(`Unique brands:             ${brands.length}`);
console.log('\nCategory breakdown:');
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

console.log('\nTop 15 Brands:');
Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([brand, count]) => {
  console.log(`  ${brand}: ${count}`);
});

// Validation
if (fullProducts.length !== rawRows.length) {
  console.error(`\n❌ MISMATCH: Excel rows=${rawRows.length}, JSON products=${fullProducts.length}`);
  process.exit(1);
}
console.log('\n✅ VALIDATION PASSED: Excel rows === JSON products');
