import playwright from '../frontend/tutorlypk-web/node_modules/@playwright/test/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium, request } = playwright;

const baseUrl = process.env.TUTORLY_APP_URL ?? 'http://mentora.tryasp.net';
const outputDir = path.resolve('logs/sqa-live-audit');
const student = { emailOrPhone: 'zara@example.com', password: 'Password123!' };
const tutor = { emailOrPhone: 'ayesha@example.com', password: 'Password123!' };

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const routeSets = {
  public: ['/', '/tutors', '/tutors/ayesha-malik', '/book/ayesha-malik', '/login', '/role', '/register?role=student', '/register?role=tutor', '/not-a-real-route'],
  student: ['/dashboard', '/saved-tutors', '/my-bookings', '/messages', '/insight/diagnostic'],
  tutor: ['/tutor-dashboard', '/messages'],
};

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const apiResults = await runApiChecks();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const results = [];
  for (const viewport of viewports) {
    results.push(...await auditRouteSet(browser, viewport, 'public'));
    results.push(...await auditRouteSet(browser, viewport, 'student', student));
    results.push(...await auditRouteSet(browser, viewport, 'tutor', tutor));
  }

  const behaviorResults = await runBehaviorChecks(browser);
  await browser.close();

  const summary = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    apiResults,
    behaviorResults,
    pageResults: results,
    issueCandidates: collectIssueCandidates(apiResults, behaviorResults, results),
  };

  await fs.writeFile(path.join(outputDir, 'live-audit.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({
    baseUrl,
    apiChecks: apiResults.length,
    behaviorChecks: behaviorResults.length,
    pagesAudited: results.length,
    issueCandidates: summary.issueCandidates.length,
    outputDir,
  }, null, 2));
}

async function runApiChecks() {
  const api = await request.newContext({ baseURL: baseUrl });
  const checks = [
    { name: 'health', method: 'GET', path: '/health', expect: 200 },
    { name: 'swagger-disabled', method: 'GET', path: '/swagger/index.html', expect: 404 },
    { name: 'lookups', method: 'GET', path: '/api/lookups', expect: 200 },
    { name: 'tutors', method: 'GET', path: '/api/tutors', expect: 200 },
    { name: 'tutor-profile', method: 'GET', path: '/api/tutors/ayesha-malik', expect: 200 },
    { name: 'unknown-api-404', method: 'GET', path: '/api/not-real', expect: 404 },
  ];

  const results = [];
  for (const check of checks) {
    const started = Date.now();
    const response = await api.fetch(check.path, { method: check.method, timeout: 30000 }).catch(error => ({ error }));
    const elapsedMs = Date.now() - started;
    if (response.error) {
      results.push({ ...check, ok: false, elapsedMs, error: response.error.message });
      continue;
    }

    const text = await response.text();
    results.push({
      ...check,
      ok: response.status() === check.expect,
      status: response.status(),
      elapsedMs,
      sample: text.slice(0, 240),
    });
  }

  await api.dispose();
  return results;
}

async function auditRouteSet(browser, viewport, roleName, credentials) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  if (credentials) {
    await login(page, credentials);
  }

  const results = [];
  for (const route of routeSets[roleName]) {
    results.push(await auditPage(page, viewport, roleName, route));
  }

  await context.close();
  return results;
}

async function login(page, credentials) {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('input[name="emailOrPhone"]').fill(credentials.emailOrPhone);
  await page.locator('input[name="password"]').fill(credentials.password);
  await Promise.all([
    page.waitForURL(/dashboard|tutor-dashboard/, { timeout: 30000 }),
    page.locator('button[type="submit"]').click(),
  ]);
}

async function auditPage(page, viewport, roleName, route) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  const onConsole = message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  };
  const onPageError = error => pageErrors.push(error.message);
  const onRequestFailed = request => {
    const failure = request.failure()?.errorText;
    if (failure === 'net::ERR_ABORTED') {
      return;
    }

    failedRequests.push({ url: request.url(), failure });
  };
  const onResponse = response => {
    if (response.status() >= 400 && !response.url().includes('/api/not-real')) {
      badResponses.push({ url: response.url(), status: response.status() });
    }
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  const started = Date.now();
  let mainStatus = null;
  let navigationError = null;
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    mainStatus = response?.status() ?? null;
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  } catch (error) {
    navigationError = error.message;
  }

  const metrics = await page.evaluate(() => {
    const visible = element => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const labelFor = element => {
      const text = (element.innerText || element.value || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '').trim();
      return text.slice(0, 80);
    };

    const brokenImages = Array.from(document.images)
      .filter(img => visible(img) && (!img.complete || img.naturalWidth === 0))
      .slice(0, 20)
      .map(img => ({ src: img.currentSrc || img.src, alt: img.alt || '' }));

    const overflowingText = Array.from(document.querySelectorAll('a, button, input, select, textarea, label, .premium-btn, .role-option, h1, h2, h3, p'))
      .filter(element => visible(element) && element.scrollWidth > element.clientWidth + 2)
      .slice(0, 25)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          label: labelFor(element),
          width: Math.round(rect.width),
          scrollWidth: element.scrollWidth,
        };
      });

    const emptyInteractive = Array.from(document.querySelectorAll('a, button'))
      .filter(element => visible(element))
      .filter(element => !labelFor(element) && !element.querySelector('svg,img'))
      .slice(0, 20)
      .map(element => ({ tag: element.tagName.toLowerCase(), href: element.getAttribute('href') || '' }));

    const smallTapTargets = Array.from(document.querySelectorAll('a, button, input, select, textarea'))
      .filter(element => visible(element))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName.toLowerCase(), label: labelFor(element), width: rect.width, height: rect.height };
      })
      .filter(item => item.width < 44 || item.height < 44)
      .slice(0, 30)
      .map(item => ({ ...item, width: Math.round(item.width), height: Math.round(item.height) }));

    const h1Count = document.querySelectorAll('h1').length;
    const inputsWithoutLabels = Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(element => visible(element))
      .filter(element => {
        const id = element.getAttribute('id');
        const hasExplicit = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const hasAria = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
        const hasWrappingLabel = element.closest('label');
        return !hasExplicit && !hasAria && !hasWrappingLabel;
      })
      .slice(0, 25)
      .map(element => ({ tag: element.tagName.toLowerCase(), name: element.getAttribute('name') || '', placeholder: element.getAttribute('placeholder') || '' }));

    return {
      title: document.title,
      finalPath: location.pathname + location.search,
      h1Count,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyTextLength: document.body.innerText.length,
      brokenImages,
      overflowingText,
      emptyInteractive,
      smallTapTargets,
      inputsWithoutLabels,
    };
  });

  const safeRoute = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
  const screenshotPath = path.join(outputDir, `${viewport.name}-${roleName}-${safeRoute}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  page.off('requestfailed', onRequestFailed);
  page.off('response', onResponse);

  return {
    viewport: viewport.name,
    role: roleName,
    route,
    mainStatus,
    elapsedMs: Date.now() - started,
    navigationError,
    consoleErrors: [...new Set(consoleErrors)],
    pageErrors: [...new Set(pageErrors)],
    failedRequests,
    badResponses,
    screenshotPath,
    metrics,
  };
}

async function runBehaviorChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const checks = [];

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  checks.push({
    name: 'logged-out protected route redirects to login',
    ok: page.url().includes('/login') && page.url().includes('returnUrl=%2Fdashboard'),
    url: page.url(),
  });

  await login(page, student);
  await page.goto(`${baseUrl}/tutor-dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {});
  checks.push({
    name: 'student cannot access tutor dashboard',
    ok: new URL(page.url()).pathname === '/dashboard',
    url: page.url(),
  });

  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('button[type="submit"]').click();
  const validationText = await page.locator('body').innerText();
  checks.push({
    name: 'login validation visible for empty submit',
    ok: /email|password|required|sign/i.test(validationText),
    sample: validationText.slice(0, 300),
  });

  await context.close();
  return checks;
}

function collectIssueCandidates(apiResults, behaviorResults, pageResults) {
  const issues = [];
  for (const result of apiResults) {
    if (!result.ok) {
      issues.push({ area: 'API', severity: 'High', summary: `${result.name} expected ${result.expect}, got ${result.status ?? result.error}` });
    }
  }
  for (const result of behaviorResults) {
    if (!result.ok) {
      issues.push({ area: 'Behavior', severity: 'High', summary: result.name });
    }
  }
  for (const page of pageResults) {
    const label = `${page.viewport}/${page.role}${page.route}`;
    if (page.navigationError || (page.mainStatus && page.mainStatus >= 500)) {
      issues.push({ area: 'Navigation', severity: 'Critical', summary: `${label}: ${page.navigationError ?? page.mainStatus}` });
    }
    if (page.badResponses.length || page.failedRequests.length) {
      issues.push({ area: 'Network', severity: 'High', summary: `${label}: failed/bad responses`, details: { badResponses: page.badResponses, failedRequests: page.failedRequests } });
    }
    if (page.consoleErrors.length || page.pageErrors.length) {
      issues.push({ area: 'Console', severity: 'High', summary: `${label}: browser errors`, details: { consoleErrors: page.consoleErrors, pageErrors: page.pageErrors } });
    }
    if (page.metrics.horizontalOverflow) {
      issues.push({ area: 'Responsive UI', severity: 'Medium', summary: `${label}: horizontal overflow ${page.metrics.scrollWidth}px > ${page.metrics.innerWidth}px` });
    }
    if (page.metrics.brokenImages.length) {
      issues.push({ area: 'Media', severity: 'Medium', summary: `${label}: broken images`, details: page.metrics.brokenImages });
    }
    if (page.viewport === 'mobile' && page.metrics.smallTapTargets.length > 10) {
      issues.push({ area: 'Mobile UX', severity: 'Medium', summary: `${label}: many tap targets below 44px`, details: page.metrics.smallTapTargets.slice(0, 10) });
    }
    if (page.metrics.inputsWithoutLabels.length) {
      issues.push({ area: 'Accessibility', severity: 'Medium', summary: `${label}: form controls missing programmatic labels`, details: page.metrics.inputsWithoutLabels.slice(0, 10) });
    }
    if (page.metrics.h1Count === 0) {
      issues.push({ area: 'Accessibility/SEO', severity: 'Low', summary: `${label}: no h1 detected` });
    }
  }
  return issues;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
