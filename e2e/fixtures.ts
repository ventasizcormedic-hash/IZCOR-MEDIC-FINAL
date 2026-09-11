import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';

export type ProductSample = {
  id: number;
  name: string;
  slug: string;
  categoryName: string | null;
  imageUrl: string | null;
};

type Fixtures = {
  productSamples: ProductSample[];
  watchPage: (page: Page) => void;
};

async function loadProductSamples(request: APIRequestContext): Promise<ProductSample[]> {
  const samples: ProductSample[] = [];
  const categories = new Set<string>();

  for (let page = 1; page <= 10 && samples.length < 3; page += 1) {
    const response = await request.get(`/api/products?format=paginated&page=${page}&limit=100`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json() as { items: ProductSample[] };
    for (const product of data.items) {
      if (!product.categoryName || categories.has(product.categoryName)) continue;
      samples.push(product);
      categories.add(product.categoryName);
      if (samples.length === 3) break;
    }
  }

  expect(samples.length).toBe(3);
  return samples;
}

export const test = base.extend<Fixtures>({
  productSamples: async ({ request }, use) => {
    await use(await loadProductSamples(request));
  },
  watchPage: async ({}, use, testInfo) => {
    const criticalConsoleErrors: string[] = [];
    const failedRequests: string[] = [];
    void testInfo;
    await use((targetPage) => {
      targetPage.on('console', message => {
        if (message.type() === 'error' && !message.text().includes('Firebase')) {
          criticalConsoleErrors.push(message.text());
        }
      });
      targetPage.on('requestfailed', request => {
        const url = request.url();
        const failure = request.failure()?.errorText || '';
        const isExpectedAbort = failure.includes('ERR_ABORTED');
        const isThirdPartyIllustration = url.startsWith('https://images.unsplash.com/');
        if (!isExpectedAbort && !isThirdPartyIllustration && !url.includes('google-analytics') && !url.includes('firebaseio')) {
          failedRequests.push(`${request.method()} ${url}: ${request.failure()?.errorText || 'failed'}`);
        }
      });
      targetPage.on('response', response => {
        if (response.status() >= 500) failedRequests.push(`${response.status()} ${response.url()}`);
      });
      targetPage.once('close', () => {
        expect(criticalConsoleErrors, criticalConsoleErrors.join('\n')).toEqual([]);
        expect(failedRequests, failedRequests.join('\n')).toEqual([]);
      });
    });
  },
});

export { expect };