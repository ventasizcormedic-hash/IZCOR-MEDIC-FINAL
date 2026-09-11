export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  sourceUrl?: string | null;
  altText?: string | null;
  filename?: string | null;
  licenseStatus?: string | null;
  sortOrder?: number | null;
}

export interface ProductDocument {
  id: number;
  productId: number;
  url: string;
  type?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
}

export interface RelatedProductItem {
  id: number;
  name: string;
  slug: string;
  model: string | null;
  catalogNumber: string | null;
  manufacturer: string | null;
  brandName: string | null;
  categoryName: string | null;
  verificationStatus?: string | null;
  imageUrl?: string | null;
}

export interface SiblingModelItem {
  id: number;
  name: string;
  slug: string;
  model: string | null;
  catalogNumber: string | null;
}

export interface NavProductItem {
  id: number;
  name: string;
  slug: string;
  model: string | null;
}

export interface ProductDetailData {
  id: number;
  name: string;
  slug: string;
  model: string | null;
  catalogNumber: string | null;
  manufacturer: string | null;
  description: string | null;
  technicalSpecs: string | null;
  application: string | null;
  presentation: string | null;
  brandId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  brandName: string | null;
  brandLogo: string | null;
  brandSlug?: string | null;
  brandManufacturer?: string | null;
  categoryName: string | null;
  categorySlug?: string | null;
  verificationStatus: string | null;
  status: string | null;
  confidenceLevel: string | null;
  featured: boolean | null;
  sourceUrl: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  subcategory?: { id: number; name: string; slug: string } | null;
  images?: ProductImage[];
  documents?: ProductDocument[];
  siblingModels?: SiblingModelItem[];
  prevProduct?: NavProductItem | null;
  nextProduct?: NavProductItem | null;
  relatedProducts?: RelatedProductItem[];
}

export type ParsedSpecs = 
  | { type: 'table'; rows: { key: string; value: string }[] }
  | { type: 'list'; items: string[] }
  | { type: 'text'; content: string };

/**
 * Robustly parses technicalSpecs from DB without assuming one fixed format.
 * Handles JSON arrays, JSON objects, colon-delimited lines, or plain text.
 */
export function parseTechnicalSpecs(specs: string | null | undefined): ParsedSpecs | null {
  if (!specs || !specs.trim()) return null;

  const trimmed = specs.trim();

  // 1. Try parsing JSON
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        // If array of strings or array of {key, value}
        if (parsed.length === 0) return null;
        if (typeof parsed[0] === 'string') {
          // Check if elements have "Key: Value" format
          const hasColonPairs = parsed.every(item => typeof item === 'string' && item.includes(':'));
          if (hasColonPairs) {
            const rows = parsed.map(item => {
              const idx = item.indexOf(':');
              return {
                key: item.substring(0, idx).trim(),
                value: item.substring(idx + 1).trim(),
              };
            });
            return { type: 'table', rows };
          }
          return { type: 'list', items: parsed.filter(i => Boolean(i?.trim())) };
        } else if (typeof parsed[0] === 'object' && parsed[0] !== null) {
          const rows = parsed.map((item, idx) => ({
            key: item.key || item.param || item.name || `Parámetro ${idx + 1}`,
            value: String(item.value || item.spec || item.val || ''),
          }));
          return { type: 'table', rows };
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        const rows = Object.entries(parsed).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        if (rows.length > 0) {
          return { type: 'table', rows };
        }
      }
    } catch {
      // Not valid JSON, continue with text parsing
    }
  }

  // 2. Line-by-line parsing: check if lines have "Key: Value" or bullet points
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length >= 1) {
    const colonLines = lines.filter(l => l.includes(':') && !l.startsWith('http://') && !l.startsWith('https://'));
    if (colonLines.length > 0 && (lines.length === 1 || colonLines.length >= Math.ceil(lines.length * 0.5))) {
      const rows = lines.map(line => {
        const idx = line.indexOf(':');
        if (idx !== -1) {
          return {
            key: line.substring(0, idx).replace(/^[-*•]\s*/, '').trim(),
            value: line.substring(idx + 1).trim(),
          };
        }
        return {
          key: 'Detalle',
          value: line.replace(/^[-*•]\s*/, '').trim(),
        };
      });
      return { type: 'table', rows };
    }

    // If starts with bullets
    if (lines.length > 1 && lines.every(l => /^[-*•]/.test(l))) {
      return {
        type: 'list',
        items: lines.map(l => l.replace(/^[-*•]\s*/, '').trim()),
      };
    }
  }

  return { type: 'text', content: trimmed };
}

/**
 * Parses application field if available
 */
export function parseApplications(app: string | null | undefined): string[] | null {
  if (!app || !app.trim()) return null;
  const trimmed = app.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      // ignore
    }
  }
  // Comma or semicolon or slash separated
  if (trimmed.includes(',') || trimmed.includes(';') || trimmed.includes('|')) {
    return trimmed
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [trimmed];
}

/**
 * Format a real date into a clean institutional date
 */
export function formatCatalogDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return null;
  }
}
