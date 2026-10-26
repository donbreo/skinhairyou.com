'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const origin = 'https://www.skinhairyou.com';
const brand = 'Skin Hair & You';
const organisationId = `${origin}/#organisation`;
const websiteId = `${origin}/#website`;
const image = `${origin}/assets/images/6.jpg`;
const pages = [
  { file: 'index.html', name: 'Skin & Hair Clinic in Mumbai & Pune', description: 'Skin Hair & You offers dermatology, skin and hair care in Borivali East, Mumbai and Koregaon Park, Pune. Explore treatments and book a consultation.' },
  { file: 'about.html', name: 'About Our Skin & Hair Clinics', type: 'AboutPage', description: 'Meet Skin Hair & You, established in 2012. Learn about our approach to skin, hair and cosmetic care in Borivali East, Mumbai and Koregaon Park, Pune.' },
  { file: 'services.html', name: 'Skin & Hair Treatments in Mumbai & Pune', type: 'CollectionPage', description: 'Explore skin, hair and nail care, FUE hair transplants, facial cleansing and STD / HIV care at Skin Hair & You in Mumbai and Pune.' },
  { file: 'skin_disorders.html', name: 'Skin Disorder Care in Mumbai & Pune', service: 'Skin Disorders', description: 'Explore personalised skin disorder care at Skin Hair & You in Mumbai and Pune. Arrange a consultation to discuss your skin concerns and treatment options.' },
  { file: 'hair_disorder.html', name: 'Hair Loss & Scalp Care in Mumbai & Pune', service: 'Hair Disorders', description: 'Understand hair loss and scalp concerns with Skin Hair & You in Mumbai and Pune. Explore assessment and personalised hair restoration options.' },
  { file: 'hair_transplant.html', name: 'FUE Hair Transplant in Mumbai & Pune', service: 'Hair Transplant (FUE)', description: 'Learn about FUE hair transplants at Skin Hair & You in Mumbai and Pune, including donor assessment, hairline planning, suitability and aftercare.' },
  { file: 'nail_disorder.html', name: 'Nail Disorder Care in Mumbai & Pune', service: 'Nail Disorders', description: 'Explore nail disorder assessment and care at Skin Hair & You in Mumbai and Pune. Contact the clinic to discuss changes in your nails and treatment options.' },
  { file: 'face_cleansing.html', name: 'Facial Cleansing in Mumbai & Pune', service: 'Facial Cleansing', description: 'Explore facial cleansing and hydration at Skin Hair & You in Mumbai and Pune. Discuss a skincare routine and treatment suited to your individual skin.' },
  { file: 'std.html', name: 'STD / HIV Skin Care in Mumbai & Pune', service: 'STD / HIV Care', description: 'Sensitive, respectful STD / HIV care for associated skin concerns at Skin Hair & You in Mumbai and Pune. Contact the clinic to discuss screening and support.' },
  { file: 'blog.html', name: 'Skin Care & Hair Loss Journal', type: 'CollectionPage', description: 'Read the Skin Hair & You clinic journal on facial serums, skin health and types of hair loss. General information to support a personalised consultation.' },
  { file: 'results.html', name: 'Hair Transplant & Rejuvenation Results', type: 'CollectionPage', description: 'View the Skin Hair & You gallery of hair transplant and natural hair rejuvenation results. Individual outcomes vary; no result is guaranteed.' },
  { file: 'contact.html', name: 'Contact Our Mumbai & Pune Clinics', type: 'ContactPage', description: 'Contact Skin Hair & You in Borivali East, Mumbai and Koregaon Park, Pune. Call +91 98197 97935 or +91 98201 38350 to arrange a consultation.' },
];

function pageUrl(file) {
  return file === 'index.html' ? `${origin}/` : `${origin}/${file}`;
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function clinic(city, neighbourhood, street, postalCode) {
  return {
    '@type': 'MedicalClinic',
    '@id': `${origin}/contact.html#clinic-${city.toLowerCase()}`,
    name: `${brand} - ${neighbourhood}, ${city}`,
    url: `${origin}/contact.html`,
    parentOrganization: { '@id': organisationId },
    image,
    telephone: '+91-98197-97935',
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+91-98197-97935', contactType: 'appointments' },
      { '@type': 'ContactPoint', telephone: '+91-98201-38350', contactType: 'appointments' },
    ],
    medicalSpecialty: 'https://schema.org/Dermatology',
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: city,
      addressRegion: 'Maharashtra',
      postalCode,
      addressCountry: 'IN',
    },
  };
}

function graphFor(page) {
  const url = pageUrl(page.file);
  const graph = [
    {
      '@type': 'MedicalOrganization',
      '@id': organisationId,
      name: brand,
      url: `${origin}/`,
      logo: `${origin}/assets/images/brand-mark.svg`,
      telephone: '+91-98197-97935',
      medicalSpecialty: 'https://schema.org/Dermatology',
      areaServed: ['Mumbai', 'Pune'],
      sameAs: ['https://www.facebook.com/SkinHairYou/'],
    },
    { '@type': 'WebSite', '@id': websiteId, url: `${origin}/`, name: brand, inLanguage: 'en-IN', publisher: { '@id': organisationId } },
    {
      '@type': page.type || 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `${page.name} | ${brand}`,
      description: page.description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': websiteId },
      about: { '@id': organisationId },
      ...(page.file !== 'index.html' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      ...(page.service ? { mainEntity: { '@id': `${url}#service` } } : {}),
    },
  ];
  if (page.file !== 'index.html') {
    const crumbs = [{ name: 'Home', item: `${origin}/` }];
    if (page.service) crumbs.push({ name: 'Our services', item: `${origin}/services.html` });
    crumbs.push({ name: page.service || page.name, item: url });
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
    });
  }
  if (page.service) {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.service,
      serviceType: page.service,
      description: page.description,
      url,
      provider: { '@id': organisationId },
      areaServed: ['Mumbai', 'Pune'],
    });
  }
  if (page.file === 'services.html') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#services`,
      name: 'Our services',
      itemListElement: pages.filter(entry => entry.service).map((entry, i) => ({
        '@type': 'ListItem', position: i + 1, name: entry.service, url: pageUrl(entry.file),
      })),
    });
    graph[2].mainEntity = { '@id': `${url}#services` };
  }
  if (page.file === 'about.html' || page.file === 'contact.html') {
    const clinics = [
      clinic('Mumbai', 'Borivali East', 'Shop No. 1, Radha Krishna Bldg., Opp. Dheeraj Savera Tower, Siddharth Nagar, Behind Carnival Cinema, Borivali (E)', '400066'),
      clinic('Pune', 'Koregaon Park', '1st Floor, Above German Bakery, Opp. O Hotel, Vaswani Nagar, North Main Road, Koregaon Park', '411001'),
    ];
    graph[0].foundingDate = '2012';
    graph[0].subOrganization = clinics.map(entry => ({ '@id': entry['@id'] }));
    graph.push(...clinics);
  }
  if (page.file === 'blog.html') {
    const articles = [
      ['facial-serums', 'The truth about facial serums', 'facial-clean2.png'],
      ['understanding-your-skin', 'Understanding your skin', 'beauty.jpg'],
      ['types-of-hair-loss', 'Understanding the types of hair loss', 'ht1.jpg'],
    ];
    graph[2].hasPart = articles.map(([id]) => ({ '@id': `${url}#${id}` }));
    graph.push(...articles.map(([id, headline, file]) => ({
      '@type': 'Article',
      '@id': `${url}#${id}`,
      url: `${url}#${id}`,
      headline,
      image: `${origin}/assets/images/${file}`,
      author: { '@id': organisationId },
      publisher: { '@id': organisationId },
      isPartOf: { '@id': `${url}#webpage` },
      inLanguage: 'en-IN',
    })));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

function seoBlock(page) {
  const url = pageUrl(page.file);
  const title = `${page.name} | ${brand}`;
  const json = JSON.stringify(graphFor(page), null, 2).replaceAll('<', '\\u003c');
  return [
    '  <!-- SEO:START -->',
    `  <link rel="canonical" href="${url}">`,
    '  <meta name="robots" content="index, follow, max-image-preview:large">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:locale" content="en_IN">',
    `  <meta property="og:site_name" content="${escapeHtml(brand)}">`,
    `  <meta property="og:title" content="${escapeHtml(title)}">`,
    `  <meta property="og:description" content="${escapeHtml(page.description)}">`,
    `  <meta property="og:url" content="${url}">`,
    `  <meta property="og:image" content="${image}">`,
    '  <meta property="og:image:width" content="1600">',
    '  <meta property="og:image:height" content="1067">',
    '  <meta property="og:image:alt" content="Woman with long, healthy-looking hair smiling naturally">',
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${escapeHtml(title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(page.description)}">`,
    `  <meta name="twitter:image" content="${image}">`,
    '  <meta name="twitter:image:alt" content="Woman with long, healthy-looking hair smiling naturally">',
    `  <script type="application/ld+json">\n${json}\n  </script>`,
    '  <!-- SEO:END -->',
  ].join('\n');
}

function outputs() {
  const files = new Map();
  for (const page of pages) {
    const original = fs.readFileSync(path.join(root, page.file), 'utf8');
    if (!/<meta name="description" content="[^"]*">/.test(original) || !/<title>[^<]*<\/title>/.test(original)) {
      throw new Error(`Missing title or description in ${page.file}`);
    }
    let html = original
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(page.description)}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(`${page.name} | ${brand}`)}</title>`);
    if (page.service) {
      html = html.replace(
        '<span>Our services</span></div>',
        `<a href="services.html">Our services</a><span aria-hidden="true">/</span><span>${escapeHtml(page.service)}</span></div>`,
      );
    }
    const block = seoBlock(page);
    if (html.includes('<!-- SEO:START -->')) {
      html = html.replace(/  <!-- SEO:START -->[\s\S]*?  <!-- SEO:END -->/, block);
    } else {
      html = html.replace('</head>', `${block}\n</head>`);
    }
    files.set(page.file, html);
  }
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url><loc>${pageUrl(page.file)}</loc></url>`).join('\n')}\n</urlset>\n`);
  files.set('robots.txt', `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  files.set('llms.txt', `# ${brand}\n\n> Skin Hair & You is a skin, hair and cosmetic care clinic established in 2012, with locations in Borivali East, Mumbai and Koregaon Park, Pune, India.\n\nThis file is a supplementary guide to the public website, not a medical advice service. Treatment suitability and results vary; a consultation is needed for personalised advice. Clinic hours, prices and clinician credentials are not published here; contact the clinic for current details.\n\n## Clinic information\n\n- [About the clinic](${origin}/about.html): Background, care approach and locations.\n- [Contact and directions](${origin}/contact.html): Published addresses and consultation enquiries. Call +91 98197 97935 or +91 98201 38350. The website form opens a WhatsApp message for the visitor to review and send; it does not send or store enquiries.\n- [Home](${origin}/): Clinic overview and common questions.\n\n## Services\n\n${pages.filter(page => page.service).map(page => `- [${page.service}](${pageUrl(page.file)}): ${page.description}`).join('\n')}\n\n## Patient education and results\n\n- [Clinic journal](${origin}/blog.html): General information on facial serums, skin health and types of hair loss, adapted from the original clinic journal.\n- [Patient results](${origin}/results.html): Original hair transplant and natural hair rejuvenation gallery. Individual results vary; no outcome is guaranteed.\n\n## Discovery\n\n- [All services](${origin}/services.html)\n- [Sitemap](${origin}/sitemap.xml)\n`);
  return files;
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  let stale = false;
  for (const [file, content] of outputs()) {
    const target = path.join(root, file);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
        console.error(`SEO output is stale: ${file}. Run npm run seo:generate.`);
        stale = true;
      }
    } else {
      fs.writeFileSync(target, content);
    }
  }
  if (stale) process.exitCode = 1;
}

module.exports = { origin, pages, pageUrl, graphFor, outputs };
