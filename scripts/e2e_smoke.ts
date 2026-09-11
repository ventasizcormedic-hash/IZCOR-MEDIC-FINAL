const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const checks = [
  { path: '/', expected: 200 },
  { path: '/productos', expected: 200 },
  { path: '/robots.txt', expected: 200 },
  { path: '/sitemap.xml', expected: 200 },
  { path: '/ruta-que-no-existe', expected: 200 },
];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`);
  if (response.status !== check.expected) {
    throw new Error(`${check.path}: expected ${check.expected}, received ${response.status}`);
  }
  const body = await response.text();
  if (!body.trim()) throw new Error(`${check.path}: empty response body`);
}

const catalogResponse = await fetch(`${baseUrl}/api/products?format=paginated&limit=3`);
if (!catalogResponse.ok) throw new Error(`/api/products: received ${catalogResponse.status}`);
const catalog = await catalogResponse.json() as { items?: Array<{ slug: string; name: string }> };
if (!catalog.items?.length) throw new Error('/api/products: no real products returned');

for (const product of catalog.items) {
  const response = await fetch(`${baseUrl}/api/products/${encodeURIComponent(product.slug)}`);
  if (!response.ok) throw new Error(`product slug ${product.slug}: received ${response.status}`);
  const detail = await response.json() as { slug?: string; name?: string };
  if (detail.slug !== product.slug || detail.name !== product.name) {
    throw new Error(`product slug ${product.slug}: detail mismatch`);
  }
}

console.log(`E2E smoke passed: ${checks.length} routes and ${catalog.items.length} real products`);