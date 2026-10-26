'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const express = require('express');
const helmet = require('helmet');

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 12207);
const siteRoot = __dirname;
const assetsRoot = path.join(siteRoot, 'assets');
const pages = new Set([
  'about.html',
  'blog.html',
  'contact.html',
  'face_cleansing.html',
  'hair_disorder.html',
  'hair_transplant.html',
  'index.html',
  'nail_disorder.html',
  'results.html',
  'services.html',
  'skin_disorders.html',
  'std.html',
]);
const canonicalOrigin = 'https://www.skinhairyou.com';
const discoveryFiles = new Map([
  ['/robots.txt', 'robots.txt'],
  ['/sitemap.xml', 'sitemap.xml'],
  ['/llms.txt', 'llms.txt'],
]);
const structuredDataHashes = [...pages].map((pageName) => {
  const html = fs.readFileSync(path.join(siteRoot, pageName), 'utf8');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Missing structured data in ${pageName}. Run npm run seo:generate.`);
  return `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`;
});

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535.');
}

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", ...structuredDataHashes],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
  hsts: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use((req, res, next) => {
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  res.setHeader('Allow', 'GET, HEAD');
  return res.sendStatus(405);
});

function sendPage(pageName, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(siteRoot, pageName), (error) => {
    if (error) next(error);
  });
}

app.use((req, res, next) => {
  const hostname = req.hostname.toLowerCase();
  if (hostname === 'skinhairyou.com' || (hostname === 'www.skinhairyou.com' && !req.secure)) {
    return res.redirect(308, `${canonicalOrigin}${req.originalUrl}`);
  }
  if (hostname !== 'www.skinhairyou.com') {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

app.get([...discoveryFiles.keys()], (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  if (req.path === '/robots.txt' && req.hostname.toLowerCase() !== 'www.skinhairyou.com') {
    return res.type('text/plain').send('User-agent: *\nDisallow: /\n');
  }
  res.sendFile(path.join(siteRoot, discoveryFiles.get(req.path)), (error) => {
    if (error) next(error);
  });
});

app.get('/index.html', (req, res) => {
  const queryIndex = req.originalUrl.indexOf('?');
  res.redirect(308, `/${queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex)}`);
});
app.get('/', (req, res, next) => sendPage('index.html', res, next));
app.get([...pages].filter((pageName) => pageName !== 'index.html').map((pageName) => `/${pageName}`), (req, res, next) => {
  sendPage(req.path.slice(1), res, next);
});

app.use('/assets', express.static(assetsRoot, {
  dotfiles: 'deny',
  fallthrough: false,
  index: false,
  maxAge: '1h',
}));

app.use((req, res) => res.sendStatus(404));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status === 404 || error.status === 403 || error.status === 400) {
    return res.sendStatus(error.status === 400 ? 400 : 404);
  }
  console.error('Request failed:', error.message);
  return res.sendStatus(500);
});

const server = app.listen(port, host, () => {
  const address = server.address();
  console.log(`Serving Skin Hair & You on http://${host}:${address.port}`);
});

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 100;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close((error) => {
      if (error) {
        console.error('Server shutdown failed:', error.message);
        process.exitCode = 1;
      }
    });
  });
}
