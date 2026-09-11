import fs from 'node:fs';
import path from 'node:path';

type CatalogProduct = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  categoriaSlug?: string;
  marca?: string;
  imagenPrincipal?: string | null;
  imagenes?: string[];
};

const catalogPath = path.resolve('src/data/products.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as CatalogProduct[];
const missing = (field: keyof CatalogProduct) => products.filter(product => !String(product[field] || '').trim()).map(product => product.id);
const missingImages = products.filter(product => !product.imagenPrincipal || !product.imagenes?.length).map(product => product.id);
const brokenImages = products.flatMap(product => (product.imagenes || []).filter(image => !fs.existsSync(path.resolve('public', `.${image}`))).map(image => ({ id: product.id, image })));
const descriptions = products.map(product => product.descripcion?.length || 0);

const report = {
  total: products.length,
  missingFields: Object.fromEntries(['nombre', 'descripcion', 'categoria', 'categoriaSlug', 'marca'].map(field => [field, missing(field as keyof CatalogProduct).length])),
  productsWithoutImages: missingImages.length,
  brokenImageReferences: brokenImages.length,
  longestDescription: Math.max(...descriptions),
  descriptionsOver500: descriptions.filter(length => length > 500).length,
};

console.log(JSON.stringify(report, null, 2));

if (report.missingFields.nombre || report.missingFields.descripcion || report.brokenImageReferences) {
  process.exitCode = 1;
}