import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  // 1. URL BASE
  const baseUrl = 'https://denshi-blog.vercel.app'; 

  // 2. Obtener los posts dinámicos de la DB
  // (Esto ayuda a que tus artículos nuevos aparezcan rápido en Google)
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at');

  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) ?? [];

  // 3. Rutas Estáticas
  const staticRoutes = [
    {
      url: baseUrl, // Home
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`, // Sobre Mí
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`, // Lista de Blogs
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/social`, // Redes Sociales
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/minigames`, // Menú Arcade
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/minigames/clicker`, // Cookie Clicker
      changeFrequency: 'weekly', // Cambia semanalmente si actualizas el ranking/mejoras
      priority: 0.6,
    },
    // --- NUEVO JUEGO AGREGADO ---
    {
      url: `${baseUrl}/minigames/place`, // d/place (Pixel Art)
      changeFrequency: 'hourly', // ¡Cambia muy seguido!
      priority: 0.8,
    },
    // ----------------------------
    {
      url: `${baseUrl}/credits`, // Créditos
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`, // Login
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // 4. Unimos todo
  return [
    ...staticRoutes.map(route => ({
      ...route,
      lastModified: new Date(),
    })),
    ...postUrls,
  ];
}