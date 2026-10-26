'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createInterface } = require('node:readline');
const http = require('node:http');
const { test, before, after } = require('node:test');
const { origin, pages, pageUrl, outputs } = require('../scripts/seo');

const root = path.join(__dirname, '..');
let server;
let baseUrl;
const productionHeaders = { Host: 'www.skinhairyou.com', 'X-Forwarded-Proto': 'https' };

function request(url, { headers = {}, method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { headers, method }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: { get: name => response.headers[name.toLowerCase()] ?? null },
        text: async () => Buffer.concat(chunks).toString('utf8'),
      }));
    });
    req.setTimeout(10000, () => req.destroy(new Error('HTTP test request timed out')));
    req.on('error', reject);
    req.end();
  });
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function structuredData(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  return { content: scripts[0][1], data: JSON.parse(scripts[0][1]) };
}

test('generated discovery files and metadata are current and repeatable', () => {
  for (const [file, content] of outputs()) assert.equal(read(file), content, file);
});

test('all twelve pages have unique static metadata and valid entity references', () => {
  assert.equal(pages.length, 12);
  const titles = new Set();
  const descriptions = new Set();
  for (const page of pages) {
    const html = read(page.file);
    const url = pageUrl(page.file);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, page.file);
    assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    assert.ok(html.includes('name="robots" content="index, follow, max-image-preview:large"'));
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]*)">/)[1];
    assert.ok(!titles.has(title), `Duplicate title: ${page.file}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${page.file}`);
    titles.add(title);
    descriptions.add(description);
    const { data } = structuredData(html);
    assert.equal(data['@context'], 'https://schema.org');
    const ids = new Set(data['@graph'].map(entity => entity['@id']));
    assert.equal(ids.size, data['@graph'].length, `Duplicate entity IDs: ${page.file}`);
    function checkReferences(value) {
      if (!value || typeof value !== 'object') return;
      if (value['@id']) assert.ok(ids.has(value['@id']), `Unresolved entity: ${value['@id']}`);
      for (const child of Object.values(value)) checkReferences(child);
    }
    checkReferences(data);
    for (const link of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = link[1].split(/[?#]/)[0];
      if (href && !/^[a-z][a-z\d+.-]*:/i.test(href)) {
        assert.ok(fs.existsSync(path.join(root, href)), `${page.file}: broken local link ${href}`);
      }
    }
  }
});

test('clinic and service data is factual and backed by visible content', () => {
  for (const file of ['about.html', 'contact.html']) {
    const html = read(file);
    const { data } = structuredData(html);
    const clinics = data['@graph'].filter(entity => entity['@type'] === 'MedicalClinic');
    assert.equal(clinics.length, 2);
    assert.deepEqual(clinics.map(clinic => clinic.address.postalCode), ['400066', '411001']);
    for (const clinic of clinics) {
      assert.ok(html.includes(clinic.address.addressLocality));
      assert.ok(html.includes(clinic.address.streetAddress));
      assert.equal(clinic.address.addressCountry, 'IN');
      assert.ok(!('openingHours' in clinic));
      assert.ok(!('aggregateRating' in clinic));
    }
  }
  for (const page of pages.filter(entry => entry.service)) {
    const html = read(page.file);
    const service = structuredData(html).data['@graph'].find(entity => entity['@type'] === 'Service');
    assert.equal(service.name, page.service);
    assert.ok(html.includes('<a href="services.html">Our services</a>'));
  }
  const blog = read('blog.html');
  for (const article of structuredData(blog).data['@graph'].filter(entity => entity['@type'] === 'Article')) {
    assert.ok(blog.includes(`id="${article.url.split('#')[1]}"`));
    assert.ok(blog.includes(article.headline));
    assert.ok(!('datePublished' in article));
    assert.ok(!('reviewedBy' in article));
  }
  const home = read('index.html');
  for (const heading of ['Where are your clinics?', 'What care do you offer?', 'How do I book a consultation?']) {
    assert.ok(home.includes(heading));
  }
});

test('sitemap includes only canonical page URLs and OpenAI crawlers are allowed', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, pages.map(page => pageUrl(page.file)));
  assert.equal(new Set(urls).size, 12);
  const robots = read('robots.txt');
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  for (const bot of ['*', 'OAI-SearchBot', 'GPTBot']) {
    assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /`));
  }
  for (const match of read('llms.txt').matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
    const url = new URL(match[1]);
    assert.equal(url.origin, origin);
    if (url.pathname !== '/') assert.ok(fs.existsSync(path.join(root, url.pathname)));
  }
});

before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: '0', TRUST_PROXY: 'loopback' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const lines = createInterface({ input: server.stdout });
  try {
    baseUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Test server startup timed out')), 10000);
      server.once('error', error => { clearTimeout(timer); reject(error); });
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Test server exited with ${code}`)); });
      server.stderr.on('data', data => { clearTimeout(timer); reject(new Error(data.toString())); });
      lines.once('line', line => {
        clearTimeout(timer);
        const match = line.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (!match) return reject(new Error(`Unexpected server startup output: ${line}`));
        resolve(match[0]);
      });
    });
  } finally {
    lines.close();
  }
});

after(async () => {
  if (server && server.exitCode === null && server.signalCode === null) {
    const exit = once(server, 'exit');
    server.kill('SIGTERM');
    await exit;
  }
});

test('production serves every page with crawlable HTML and exact CSP hashes', async () => {
  for (const page of pages) {
    const pathname = new URL(pageUrl(page.file)).pathname;
    const response = await request(`${baseUrl}${pathname}`, { headers: productionHeaders });
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers.get('x-robots-tag'), null);
    const html = await response.text();
    assert.equal(html, read(page.file));
    const { content } = structuredData(html);
    const hash = createHash('sha256').update(content).digest('base64');
    const csp = response.headers.get('content-security-policy');
    assert.ok(csp.includes(`'sha256-${hash}'`));
    assert.ok(!csp.includes("'unsafe-inline'"));
  }
});

test('crawler endpoints support GET and HEAD with appropriate content types', async () => {
  for (const [file, type] of [['robots.txt', 'text/plain'], ['sitemap.xml', 'application/xml'], ['llms.txt', 'text/plain']]) {
    const response = await request(`${baseUrl}/${file}`, { headers: productionHeaders });
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(type), file);
    assert.equal(await response.text(), read(file));
    const head = await request(`${baseUrl}/${file}`, { method: 'HEAD', headers: productionHeaders });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  }
});

test('duplicate home URLs, apex domain and plain HTTP redirect to canonical destinations', async () => {
  for (const [pathname, headers, destination] of [
    ['/index.html?source=test', productionHeaders, '/?source=test'],
    ['/index.html/?source=test', productionHeaders, '/?source=test'],
    ['/index.html', productionHeaders, '/'],
    ['/services.html?source=test', { Host: 'skinhairyou.com', 'X-Forwarded-Proto': 'https' }, `${origin}/services.html?source=test`],
    ['/contact.html', { Host: 'www.skinhairyou.com' }, `${origin}/contact.html`],
  ]) {
    const response = await request(`${baseUrl}${pathname}`, { headers });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), destination);
  }
});

test('demo hosts stay noindex and private files remain inaccessible', async () => {
  const headers = { Host: 'demo.skinhairyou.com', 'X-Forwarded-Proto': 'https' };
  const page = await request(baseUrl, { headers });
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('x-robots-tag'), 'noindex, nofollow');
  const robots = await request(`${baseUrl}/robots.txt`, { headers });
  assert.equal(await robots.text(), 'User-agent: *\nDisallow: /\n');
  for (const pathname of ['/.env', '/server.js', '/scripts/seo.js', '/missing.html']) {
    const response = await request(`${baseUrl}${pathname}`, { headers: productionHeaders });
    assert.equal(response.status, 404);
  }
  const response = await request(`${baseUrl}/robots.txt`, { headers: productionHeaders, method: 'POST' });
  assert.equal(response.status, 405);
});

test('trusted proxy hostname and HTTPS forwarding identify the production site', async () => {
  const headers = { 'X-Forwarded-Host': 'www.skinhairyou.com', 'X-Forwarded-Proto': 'https' };
  const response = await request(baseUrl, { headers });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-robots-tag'), null);
  const robots = await request(`${baseUrl}/robots.txt`, { headers });
  assert.equal(await robots.text(), read('robots.txt'));
});
