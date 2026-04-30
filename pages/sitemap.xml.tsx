import type { GetServerSideProps } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify.com';

const STATIC_PAGES = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/gold-price', changefreq: 'hourly', priority: 0.95 },
  { url: '/share-market', changefreq: 'hourly', priority: 0.9 },
  { url: '/news', changefreq: 'hourly', priority: 0.9 },
  { url: '/blogs', changefreq: 'daily', priority: 0.8 },
  { url: '/financial-ai', changefreq: 'weekly', priority: 0.7 },
  { url: '/ask-news', changefreq: 'weekly', priority: 0.7 },
  { url: '/products', changefreq: 'daily', priority: 0.7 },
];

const GOLD_CITIES = [
  'delhi', 'mumbai', 'chennai', 'bangalore', 'hyderabad', 'kolkata',
  'ahmedabad', 'pune', 'jaipur', 'lucknow', 'surat', 'kanpur',
  'nagpur', 'indore', 'bhopal', 'patna', 'chandigarh', 'coimbatore',
];

function generateSitemap() {
  const today = new Date().toISOString();

  const staticUrls = STATIC_PAGES.map((page) => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const cityUrls = GOLD_CITIES.map((city) => `
  <url>
    <loc>${SITE_URL}/gold-price/${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.85</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${cityUrls}
</urlset>`;
}

const Sitemap: React.FC = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSitemap();

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
