'use strict';

const path = require('node:path');
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

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535.');
}

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
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

app.get('/', (req, res, next) => sendPage('index.html', res, next));
app.get([...pages].map((pageName) => `/${pageName}`), (req, res, next) => {
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
