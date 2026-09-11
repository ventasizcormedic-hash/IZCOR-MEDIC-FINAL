export interface RawProductData {
  name: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  specifications?: Array<{ name: string; value: string; unit?: string; source?: string }>;
  presentation?: string;
  applications?: string;
  productType?: string;
  [key: string]: any;
}

export interface NormalizedProductData {
  original: RawProductData;
  normalized: {
    name: string; // NEVER modified artificially
    brand: string;
    manufacturer: string;
    category: string;
    subcategory: string;
    specifications: Array<{ name: string; value: string; unit: string; normalizedValue: string; source?: string }>;
    presentation: string;
    applications: string[];
    productType: string;
  };
}

export class NormalizationService {
  // Standard medical categories mapping
  private categoryMap: Record<string, string> = {
    'monitor': 'Monitoreo de Signos Vitales',
    'monitoreo': 'Monitoreo de Signos Vitales',
    'ventilador': 'Soporte Vital y Respiratorio',
    'respiratorio': 'Soporte Vital y Respiratorio',
    'ecografo': 'Diagnóstico por Imagen',
    'ultrasonido': 'Diagnóstico por Imagen',
    'imagen': 'Diagnóstico por Imagen',
    'quirurgico': 'Equipamiento Quirúrgico',
    'cirugia': 'Equipamiento Quirúrgico',
    'cama': 'Mobiliario Clínico y Hospitalario',
    'mobiliario': 'Mobiliario Clínico y Hospitalario',
    'descartable': 'Material Descartable e Insumos',
    'insumo': 'Material Descartable e Insumos',
    'jeringa': 'Material Descartable e Insumos',
    'cateter': 'Material Descartable e Insumos'
  };

  // Standard brands mapping
  private brandMap: Record<string, string> = {
    'mindray': 'Mindray',
    'mindray medical': 'Mindray',
    'nipro': 'Nipro',
    'nipro corporation': 'Nipro',
    'alkofarma': 'Alkofarma',
    'atl': 'ATL Medical',
    'atl medical': 'ATL Medical'
  };

  public normalize(raw: RawProductData): NormalizedProductData {
    const original = JSON.parse(JSON.stringify(raw));

    // 1. Brand & Manufacturer Normalization
    let brand = raw.brand ? raw.brand.trim() : 'Genérico';
    const lowerBrand = brand.toLowerCase();
    for (const [key, val] of Object.entries(this.brandMap)) {
      if (lowerBrand.includes(key)) {
        brand = val;
        break;
      }
    }

    let manufacturer = raw.manufacturer ? raw.manufacturer.trim() : brand;
    const lowerMfg = manufacturer.toLowerCase();
    for (const [key, val] of Object.entries(this.brandMap)) {
      if (lowerMfg.includes(key)) {
        manufacturer = val;
        break;
      }
    }

    // 2. Category & Subcategory Normalization
    let category = raw.category ? raw.category.trim() : 'Equipamiento Médico General';
    let subcategory = raw.subcategory ? raw.subcategory.trim() : 'General';
    const lowerCat = category.toLowerCase();
    for (const [key, val] of Object.entries(this.categoryMap)) {
      if (lowerCat.includes(key)) {
        category = val;
        break;
      }
    }

    // 3. Specifications & Units Normalization
    const normalizedSpecs = (raw.specifications || []).map((spec) => {
      const origValue = spec.value || '';
      let normalizedVal = origValue.trim();
      let unit = spec.unit || '';

      // Unit standardizations (e.g. "kg.", "Kgs" -> "kg", "Volts", "V." -> "V")
      if (!unit && /^\d+(\.\d+)?\s*(kg|g|mg|l|ml|v|hz|cm|mm|m|min|s|rpm|bar|psi|hz)$/i.test(normalizedVal)) {
        const match = normalizedVal.match(/^(\d+(\.\d+)?)\s*([a-zA-Z/%]+)$/);
        if (match) {
          normalizedVal = match[1];
          unit = match[3].toLowerCase();
        }
      }

      if (unit.toLowerCase() === 'kgs' || unit.toLowerCase() === 'kgs.') unit = 'kg';
      if (unit.toLowerCase() === 'volts' || unit.toLowerCase() === 'v.') unit = 'V';

      return {
        name: spec.name ? spec.name.trim() : 'Atributo',
        value: origValue,
        unit: unit,
        normalizedValue: normalizedVal,
        source: spec.source || 'Fuente Oficial'
      };
    });

    // 4. Presentation Normalization
    let presentation = raw.presentation ? raw.presentation.trim() : 'Unidad';
    if (/unidad|pieza|single/i.test(presentation)) {
      presentation = 'Unidad';
    } else if (/caja|box|pack/i.test(presentation)) {
      presentation = 'Caja';
    }

    // 5. Applications Normalization
    let applications: string[] = [];
    if (raw.applications) {
      if (typeof raw.applications === 'string') {
        applications = raw.applications.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(raw.applications)) {
        applications = raw.applications;
      }
    }
    // Standardize medical application areas
    applications = applications.map(app => {
      const l = app.toLowerCase();
      if (l.includes('uci') || l.includes('intensivo')) return 'Unidad de Cuidados Intensivos (UCI)';
      if (l.includes('urgencia') || l.includes('emergencia')) return 'Urgencias y Emergencias';
      if (l.includes('quirofano') || l.includes('cirugia')) return 'Quirófano';
      if (l.includes('hospitalizacion')) return 'Hospitalización General';
      return app;
    });

    // 6. Product Type
    let productType = raw.productType ? raw.productType.trim() : 'Equipo Médico';

    return {
      original,
      normalized: {
        name: raw.name, // NEVER modified artificially!
        brand,
        manufacturer,
        category,
        subcategory,
        specifications: normalizedSpecs,
        presentation,
        applications: Array.from(new Set(applications)),
        productType
      }
    };
  }
}

export const normalizationService = new NormalizationService();
