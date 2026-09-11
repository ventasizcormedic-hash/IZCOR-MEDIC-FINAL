import fs from 'fs';

const content = fs.readFileSync('server.ts', 'utf-8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('app.get(') || line.includes('app.post(')) {
    if (line.includes('/api/products') || line.includes('/api/catalog') || line.includes('/api/categories') || line.includes('/api/brands')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
