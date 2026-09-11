import { test, expect } from './fixtures';

test.describe('sitio público y navegación', () => {
  test('home carga, tiene SEO y no desborda en el viewport', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/');
    await expect(page.locator('#homepage-main')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Tecnología médica');
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /IZCOR|médic/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  });

  test('navega por catálogo, categoría, contacto, footer y ruta inexistente', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/productos');
    await expect(page.locator('#catalog-page')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await page.goto('/contacto');
    await expect(page).toHaveURL(/\/contacto$/);
    await expect(page.locator('h1')).toHaveText('Contáctanos');
    await expect(page.locator('footer')).toBeVisible();
    await page.goto('/ruta-inexistente-e2e');
    await expect(page.locator('h2')).toContainText('No encontramos productos');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('menú móvil abre y mantiene el contenido dentro del viewport', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: /menú|menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('navigation').last()).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  });
});

test.describe('productos y SEO dinámico', () => {
  test('abre varios productos reales y valida contenido, imágenes y metadata', async ({ page, productSamples, watchPage }) => {
    watchPage(page);
    const titles: string[] = [];
    for (const product of productSamples) {
      await page.goto(`/productos/${product.slug}`);
      await expect(page.locator('#product-detail-view')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('h1')).toContainText(product.name.slice(0, Math.min(product.name.length, 30)));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/producto/${product.slug}$`));
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(jsonLd.length).toBeGreaterThan(0);
      expect(jsonLd.every(value => JSON.parse(value))).toBeTruthy();
      titles.push(await page.title());
      const images = page.locator('#product-detail-view img');
      for (let index = 0; index < await images.count(); index += 1) {
        await expect(images.nth(index)).toHaveAttribute('src', /\S+/);
        await expect(images.nth(index)).toHaveAttribute('alt', /\S+/);
      }
      await expect(page.getByRole('link', { name: /cotiz|WhatsApp|contact/i }).first()).toBeVisible();
    }
    expect(new Set(titles).size).toBe(productSamples.length);
  });
});

test.describe('buscador y formularios', () => {
  test('busca términos válidos, acentuados, vacíos e inexistentes', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/productos');
    const search = page.getByPlaceholder(/Buscar por equipo/i);
    await search.fill('mindray');
    await search.press('Enter');
    await expect(page).toHaveURL(/search=mindray/);
    await expect(page.locator('#catalog-page')).toBeVisible();
    await search.fill('zzzz-no-existe-e2e');
    await search.press('Enter');
    await expect(page).toHaveURL(/search=zzzz-no-existe-e2e/);
    await expect(page.getByText(/No encontramos|no se encontraron/i).first()).toBeVisible();
    await search.fill('');
    await search.press('Enter');
    await expect(page).toHaveURL('/productos');
    await search.fill('máquina');
    await search.press('Enter');
    await expect(page).toHaveURL(/search=m%C3%A1quina/);
  });

  test('valida formulario de contacto y muestra éxito ante respuesta controlada', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/contacto');
    const form = page.locator('form').first();
    const name = form.locator('input[type="text"]').first();
    const email = form.locator('input[type="email"]');
    const phone = form.locator('input[type="tel"]');
    const message = form.locator('textarea[required]');
    await expect(form.getByRole('button', { name: /Enviar Solicitud/ })).toBeVisible();
    await form.getByRole('button', { name: /Enviar Solicitud/ }).click();
    expect(await name.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBeTruthy();
    await name.fill('Prueba E2E');
    await email.fill('correo-invalido');
    await form.getByRole('button', { name: /Enviar Solicitud/ }).click();
    expect(await email.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBeTruthy();
    await email.fill('e2e@example.test');
    await phone.fill('+51 900 000 000');
    await message.fill('Solicitud de prueba automatizada.');
    await page.route('**/api/contact', route => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
    await form.getByRole('button', { name: /Enviar Solicitud/ }).click();
    await expect(page.getByText('¡Mensaje Enviado con Éxito!')).toBeVisible();
  });
});

test.describe('controles interactivos públicos', () => {
  test('los botones visibles tienen nombre accesible y están habilitados', async ({ page, watchPage }) => {
    watchPage(page);
    const routes = ['/', '/productos', '/nosotros', '/fabricantes', '/marcas', '/noticias', '/contacto', '/cotizar', '/tdr', '/farmacovigilancia'];

    for (const route of routes) {
      await page.goto(route);
      const buttons = page.locator('button:visible');
      for (let index = 0; index < await buttons.count(); index += 1) {
        const button = buttons.nth(index);
        await expect(button).toBeEnabled();
        const accessibleName = await button.getAttribute('aria-label');
        const text = (await button.innerText()).trim();
        expect(accessibleName?.trim() || text, `${route} tiene un botón sin nombre accesible`).toMatch(/\S+/);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    }
  });

  test('responde a menú, filtros, favoritos y visor de producto', async ({ page, productSamples, watchPage }) => {
    watchPage(page);
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: /menú|menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('navigation').last()).toBeVisible();
      await page.getByRole('button', { name: /cerrar|close/i }).first().click();
    }

    await page.goto('/productos');
    const filterButton = page.getByRole('button', { name: /filtros/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: /cerrar filtros/i }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    await page.goto(`/productos/${productSamples[0].slug}`);
    const favoriteButton = page.getByRole('button', { name: /Guardar Favorito|Guardar en favoritos/i }).first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await expect(page.getByRole('button', { name: /Quitar de favoritos|Guardado en Favoritos/i }).first()).toBeVisible();
    }
    const zoomButton = page.getByRole('button', { name: /Ampliar fotografía técnica/i }).first();
    if (await zoomButton.isVisible()) {
      await zoomButton.click();
      await expect(page.getByRole('button', { name: /Cerrar/i }).last()).toBeVisible();
    }
  });
});

test.describe('rutas protegidas y responsive', () => {
  test('admin muestra acceso para usuario no autenticado sin exponer el panel', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Acceso Administrativo' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continuar con Google/i })).toBeVisible();
    await expect(page.getByText('Panel Principal')).toHaveCount(0);
  });

  test('contacto mantiene formulario y controles sin overflow', async ({ page, watchPage }) => {
    watchPage(page);
    await page.goto('/contacto');
    await expect(page.locator('form')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await expect(page.getByRole('button', { name: 'Enviar Solicitud' })).toBeVisible();
  });
});

test.describe('snapshots visuales críticos', () => {
  test('captura home, catálogo, producto y contacto', async ({ page, productSamples }, testInfo) => {
    const screenshotOptions = { fullPage: false, mask: [page.locator('canvas')] };
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${testInfo.project.name}.png`, screenshotOptions);
    await page.goto('/productos');
    await expect(page).toHaveScreenshot(`catalogo-${testInfo.project.name}.png`, screenshotOptions);
    await page.goto(`/productos/${productSamples[0].slug}`);
    await expect(page).toHaveScreenshot(`producto-${testInfo.project.name}.png`, screenshotOptions);
    await page.goto('/contacto');
    await expect(page).toHaveScreenshot(`contacto-${testInfo.project.name}.png`, screenshotOptions);
  });
});