export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // No queremos que Google indexe el admin
    },
    sitemap: 'https://denshi-blog.vercel.app/sitemap.xml', // Cambia a tu dominio
  }
}