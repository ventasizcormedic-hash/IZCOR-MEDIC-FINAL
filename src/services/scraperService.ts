import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  brand: string;
  name: string;
  model: string | null;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  application: string[];
  presentation: string | null;
  imageUrl: string | null;
  datasheetUrl: string | null;
  sourceUrl: string;
  sourceDate: string;
  verificationStatus: 'DRAFT';
}

export interface SourceStatus {
  url: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'BLOCKED' | 'TIMEOUT' | 'HTTP_ERROR' | 'UNSUPPORTED' | 'PARTIAL';
  error?: string;
  brandDetected?: string;
}

export interface ScraperResult {
  products: ScrapedProduct[];
  stats: {
    found: number;
    new: number;
    duplicates: number;
    incomplete: number;
    sourcesProcessed: number;
    sourcesFailed: number;
  };
  sourceStatuses: SourceStatus[];
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class MedicalScraperService {
  private visitedUrls = new Set<string>();
  private scrapedProducts: Map<string, ScrapedProduct> = new Map();
  private sourceStatuses: SourceStatus[] = [];
  
  // Bound max pages per source to prevent infinite loops / memory exhaustion during the demo phase,
  // but architecturally supports deep crawling.
  private MAX_PAGES_PER_SOURCE = 20; 

  async startScraping(urls: string[]): Promise<ScraperResult> {
    this.visitedUrls.clear();
    this.scrapedProducts.clear();
    this.sourceStatuses = urls.map(url => ({ url, status: 'PENDING' }));

    for (const source of this.sourceStatuses) {
      console.log(`[Scraper] Iniciando extracción en fuente: ${source.url}`);
      source.status = 'PROCESSING';
      source.brandDetected = this.determineBrand(source.url);

      if (source.brandDetected === 'Fuente no soportada') {
        source.status = 'UNSUPPORTED';
        source.error = 'Dominio no reconocido por el sistema.';
        continue;
      }

      try {
        await this.crawl(source.url, source.brandDetected, 0);
        
        // If it was processing and didn't throw, it's completed
        if (source.status === 'PROCESSING') {
           source.status = 'COMPLETED';
        }
      } catch (error: any) {
        console.error(`[Scraper] Error fatal en fuente ${source.url}:`, error.message);
        source.status = this.mapErrorToStatus(error);
        source.error = error.message;
      }
    }

    const productsArray = Array.from(this.scrapedProducts.values());
    const incompleteCount = productsArray.filter(p => p.description.length < 100 || !p.model).length;

    return {
      products: productsArray,
      stats: {
        found: this.scrapedProducts.size,
        new: this.scrapedProducts.size, // In a real DB sync, we'd check DB existance
        duplicates: this.visitedUrls.size - this.scrapedProducts.size, // Approximation of ignored/merged
        incomplete: incompleteCount,
        sourcesProcessed: this.sourceStatuses.filter(s => s.status === 'COMPLETED' || s.status === 'PARTIAL').length,
        sourcesFailed: this.sourceStatuses.filter(s => ['BLOCKED', 'TIMEOUT', 'HTTP_ERROR', 'UNSUPPORTED'].includes(s.status)).length
      },
      sourceStatuses: this.sourceStatuses
    };
  }

  private mapErrorToStatus(error: any): SourceStatus['status'] {
    if (error.code === 'ECONNABORTED') return 'TIMEOUT';
    if (error.response?.status === 403 || error.response?.status === 401) return 'BLOCKED';
    if (error.response?.status >= 500 || error.response?.status === 404) return 'HTTP_ERROR';
    return 'HTTP_ERROR';
  }

  private determineBrand(url: string): string {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('mindray.com')) return 'Mindray';
    if (lowerUrl.includes('nipro-group.com') || lowerUrl.includes('nipro.com')) return 'Nipro';
    if (lowerUrl.includes('alkofarma.com')) return 'Alkofarma';
    if (lowerUrl.includes('atlmedical.com')) return 'ATL Medical';
    return 'Fuente no soportada';
  }

  private async crawl(url: string, brand: string, depth: number) {
    if (this.visitedUrls.has(url) || depth >= this.MAX_PAGES_PER_SOURCE) return;
    this.visitedUrls.add(url);

    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 15000 
      });

      const $ = cheerio.load(response.data);
      
      // Extract products from current page
      this.extractProductsFromPage($, url, brand);

      // Find links to continue crawling (pagination, subcategories, product links)
      const nextUrls = this.extractNavigationLinks($, url);
      
      // Crawl discovered URLs
      for (const next of nextUrls) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
        await this.crawl(next, brand, depth + 1);
      }
    } catch (error: any) {
       // Log but do not throw to allow partial completion
       console.warn(`[Scraper] Error en subpágina ${url}: ${error.message}`);
       const sourceStatus = this.sourceStatuses.find(s => url.startsWith(s.url));
       if (sourceStatus && sourceStatus.status === 'PROCESSING') {
         sourceStatus.status = 'PARTIAL'; // Mark parent as partial if a child fails
       }
    }
  }

  private extractNavigationLinks($: cheerio.CheerioAPI, currentUrl: string): string[] {
    const links = new Set<string>();
    const baseUrl = new URL(currentUrl).origin;
    
    $('a[href]').each((_, el) => {
      let href = $(el).attr('href');
      if (!href) return;
      
      // Normalize URL
      if (href.startsWith('/')) {
        href = `${baseUrl}${href}`;
      } else if (!href.startsWith('http')) {
         return; // Ignore mailto, tel, anchors
      }

      // Only stay within the same domain, ignore obvious non-HTML assets
      if (href.includes(new URL(currentUrl).hostname)) {
        if (!href.match(/\.(pdf|jpg|jpeg|png|gif|zip|exe|docx|xls)$/i)) {
           // Remove query params and hashes for deduplication in crawler
           const cleanUrl = href.split('#')[0];
           links.add(cleanUrl);
        }
      }
    });

    return Array.from(links).slice(0, 5); // Limit branching for safety in this version
  }

  private extractProductsFromPage($: cheerio.CheerioAPI, url: string, brand: string) {
    // If it's a product list page, it might have multiple minimal products.
    // If it's a product detail page, it has one rich product.
    
    const h1 = $('h1').first().text().trim();
    if (!h1 || h1.length < 3) return;

    // Check if we already have this product (Duplicate Detection)
    // Key based on brand + name to avoid duplicating the same product found on different URLs
    const productKey = `${brand}-${h1}`.toLowerCase();
    
    if (this.scrapedProducts.has(productKey)) {
       return; // Already processed
    }

    const product = this.buildProduct($, url, brand, h1);
    
    if (this.isValidProduct(product)) {
      this.scrapedProducts.set(productKey, product);
    }
  }

  private buildProduct($: cheerio.CheerioAPI, url: string, brand: string, name: string): ScrapedProduct {
    const textContent = $('body').text().replace(/\s+/g, ' ');
    
    // 1. Model Extraction (Strict)
    let model = null;
    const modelRegexps = [
      /(?:Model|Modelo|PN|Part Number|REF|Catalog Number|SKU)[\s:]+([A-Z0-9-]{3,15})\b/i,
      /Model:\s*([A-Za-z0-9-]+)/i
    ];
    for (const regex of modelRegexps) {
      const match = textContent.match(regex);
      if (match && match[1]) {
        model = match[1].trim();
        break;
      }
    }

    // 2. Description (Verify > 100 words rule if possible, else just use what's there)
    let description = '';
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && description.length < 1000) {
        description += (description ? ' ' : '') + text;
      }
    });

    // 3. Features extraction
    const features: string[] = [];
    $('ul li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 15 && text.length < 150) {
         // Basic filter to avoid navigation links being treated as features
         if (!$(el).find('a').length || $(el).text().includes(':')) {
             features.push(text.replace(/\s+/g, ' '));
         }
      }
    });

    // 4. Image Extraction
    let imageUrl = null;
    // Look for a large/main image
    $('img').each((_, el) => {
      if (imageUrl) return;
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.match(/(logo|icon|avatar|button|bg)/i)) {
         imageUrl = src.startsWith('http') ? src : `${new URL(url).origin}${src.startsWith('/') ? '' : '/'}${src}`;
      }
    });

    // 5. PDF Datasheet Extraction
    let datasheetUrl = null;
    $('a[href$=".pdf"]').each((_, el) => {
       if (datasheetUrl) return;
       const href = $(el).attr('href');
       if (href) {
         datasheetUrl = href.startsWith('http') ? href : `${new URL(url).origin}${href.startsWith('/') ? '' : '/'}${href}`;
       }
    });

    // 6. Category extraction (heuristic based on breadcrumbs)
    let category = 'Sin categoría';
    let subcategory = 'Sin subcategoría';
    const breadcrumbs = $('.breadcrumb, [aria-label="breadcrumb"]').text().split(/[\/>|]/).map(s => s.trim()).filter(Boolean);
    if (breadcrumbs.length >= 2) {
       // Usually Home > Category > Subcategory > Product
       if (breadcrumbs.length > 2) {
           category = breadcrumbs[1];
           if (breadcrumbs.length > 3) {
               subcategory = breadcrumbs[2];
           } else {
               subcategory = category;
           }
       }
    }

    return {
      brand,
      name,
      model,
      category,
      subcategory,
      description: description.substring(0, 2000), // Cap length
      features: Array.from(new Set(features)).slice(0, 15), // Unique, max 15
      application: [], // Requires deep NLP, leaving empty unless specific header found
      presentation: null,
      imageUrl,
      datasheetUrl,
      sourceUrl: url,
      sourceDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'DRAFT'
    };
  }

  private isValidProduct(product: ScrapedProduct): boolean {
     // Don't invent products. Must have a real name and some descriptive content or features.
     if (!product.name || product.name.length < 3) return false;
     if (product.description.length < 50 && product.features.length === 0) return false;
     
     // Filter out obvious noise (e.g., page titles that aren't products)
     const excludeWords = ['contact', 'about', 'home', 'privacy', 'terms', 'search'];
     if (excludeWords.some(w => product.name.toLowerCase().includes(w))) return false;

     return true;
  }
}

export const scraperService = new MedicalScraperService();

