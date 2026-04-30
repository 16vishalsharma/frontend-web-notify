/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://notify.com',
  generateRobotsTxt: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/upload', '/blogger/login', '/_*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/upload', '/blogger/login'] },
    ],
  },
  transform: async (config, path) => {
    // Higher priority for high-value SEO pages
    const highPriority = ['/gold-price', '/share-market', '/news'];
    const priority = path === '/' ? 1.0 : highPriority.some((p) => path.startsWith(p)) ? 0.9 : 0.7;
    return {
      loc: path,
      changefreq: path.startsWith('/news') || path.startsWith('/gold-price') ? 'hourly' : 'daily',
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
