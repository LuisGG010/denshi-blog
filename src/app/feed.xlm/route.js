import { createClient } from '@supabase/supabase-js';

// Configura tu URL base (cámbiala por tu dominio real)
const SITE_URL = 'https://denshi-blog.vercel.app'; 

export async function GET() {
  // 1. Inicializar Supabase (Admin o Anon funciona aquí si es lectura pública)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 2. Obtener los últimos posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, created_at, content, image_url')
    .order('created_at', { ascending: false })
    .limit(20); // Limitamos a los últimos 20 para no sobrecargar

  // 3. Construir el XML manualmente (sin librerías extra)
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Denshi Blog</title>
      <link>${SITE_URL}</link>
      <description>Blog personal de Denshi sobre tecnología, vida y código.</description>
      <language>es</language>
      ${posts.map(post => `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${SITE_URL}/blog/${post.id}</link>
          <guid>${SITE_URL}/blog/${post.id}</guid>
          <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
          <description><![CDATA[${post.content.slice(0, 200)}...]]></description>
          ${post.image_url ? `<enclosure url="${post.image_url}" length="0" type="image/jpeg" />` : ''}
        </item>
      `).join('')}
    </channel>
  </rss>`;

  // 4. Devolver la respuesta con el tipo correcto
  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache de 1 hora
    },
  });
}