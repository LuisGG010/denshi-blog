'use server'

import { createClient } from "@/lib/supabase-server"; // Asegúrate que esta ruta es correcta
import { revalidatePath } from "next/cache";

export async function deletePost(postId) {
  console.log("--> Intentando borrar post:", postId); // <--- DEBUG 1

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("--> ERROR: No hay usuario logueado"); // <--- DEBUG 2
    return { success: false, error: "No autorizado" };
  }
  
  // Opcional: Verificar email admin
  // if (user.email !== process.env.ADMIN_EMAIL) {
  //    console.log("--> ERROR: Email no es admin:", user.email);
  //    return { success: false, error: "No eres admin" };
  // }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error("--> ERROR Supabase:", error.message); // <--- DEBUG 3
    return { success: false, error: error.message };
  }

  console.log("--> ÉXITO: Post borrado"); // <--- DEBUG 4
  
  revalidatePath('/panel-posts');
  revalidatePath('/');
  return { success: true };
}