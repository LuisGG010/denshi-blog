import { createClient } from '@supabase/supabase-js'

// Inicializamos el cliente "Dios" (Service Role) una sola vez aquí
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function deletePost(id) {
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function createPost(data) {
  const { title, content, image_url, color } = data
  const { error } = await supabaseAdmin.from('posts').insert({
    title, content, image_url, color
  })
  if (error) throw error
  return true
}

export async function updatePost(id, data) {
  const { title, content, image_url, color } = data
  const { error } = await supabaseAdmin.from('posts').update({
    title, content, image_url, color,
    updated_at: new Date().toISOString()
  }).eq('id', id)
  if (error) throw error
  return true
}

export async function deleteComment(id) {
  const { error } = await supabaseAdmin.from('comments').delete().eq('id', id)
  if (error) throw error
  return true
}