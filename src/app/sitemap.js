import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  // 1. URL BASE (Cambia esto por tu dominio real de Vercel)
  const baseUrl = 'https://denshi-blog.vercel.app'; 

  // 2. Obtener todos los posts de Supabase para generar sus links
  const { data: posts } = await supabase.from('posts').select('id, updated_at');

  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) ?? [];

  // 3. Devolver las páginas estáticas + los posts
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...postUrls,
  ];
}