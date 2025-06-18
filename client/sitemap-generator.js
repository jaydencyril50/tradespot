// sitemap-generator.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const { Readable } = require('stream');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'weekly', priority: 0.8 },
  { url: '/features', changefreq: 'weekly', priority: 0.8 },
  { url: '/faq', changefreq: 'monthly', priority: 0.5 },
];

const sitemap = new SitemapStream({ hostname: 'https://www.tradespot.online' });

streamToPromise(Readable.from(links).pipe(sitemap))
  .then((data) => {
    createWriteStream('./public/sitemap.xml').end(data);
    console.log('✅ Sitemap successfully generated at public/sitemap.xml');
  })
  .catch((err) => {
    console.error('❌ Sitemap generation failed:', err);
  });
