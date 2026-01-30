'use server'

// Importamos desde el NUEVO archivo de servidor que creamos en el Paso 2
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function deletePost(postId) {
  const supabase = await createClient();

  // 1. Verificamos quién es el usuario
  const { data: { user } } = await supabase.auth.getUser();
  
  // Aquí usamos tu email de admin (ponlo en .env.local como ADMIN_EMAIL=tucorreo@...)
  // O simplemente verifica que haya un usuario logueado:
  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  // 2. Borramos el post
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error("Error al eliminar el post:", error);
    return { success: false, error: error.message }; // Corregido el typo "sucess"
  }

  // 3. Actualizamos las páginas
  revalidatePath('/panel-posts'); 
  revalidatePath('/');            

  return { success: true };
}