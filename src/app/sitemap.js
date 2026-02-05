import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  // 1. URL BASE (Tu dominio real)
  const baseUrl = 'https://denshi-blog.vercel.app'; 

  // 2. Obtener los posts dinámicos de la DB
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at');

  // Mapeamos los posts dinámicos
  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) ?? [];

  // 3. Rutas Estáticas (Basadas en tu estructura de carpetas)
  const staticRoutes = [
    {
      url: baseUrl, // Home
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`, // Sobre Mí [cite: 120]
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`, // Lista de Blogs [cite: 130]
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/social`, // Redes Sociales [cite: 143]
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/minigames`, // Menú Arcade (Ojo: carpeta 'minigames' )
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/minigames/clicker`, // El juego específico [cite: 140]
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/credits`, // Créditos [cite: 135]
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`, // Login (Público para que sepan que existe, o puedes quitarlo) [cite: 137]
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 4. Unimos todo y agregamos la fecha actual
  return [
    ...staticRoutes.map(route => ({
      ...route,
      lastModified: new Date(),
    })),
    ...postUrls,
  ];
}