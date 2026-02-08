// src/app/api/notify/route.js
import { NextResponse } from 'next/server';
import { sendDiscordAlert } from '@/lib/notifications'; // 👈 Importamos la lógica

export async function POST(request) {
  try {
    const body = await request.json();
    const { author, content, postTitle } = body;

    // Delegamos el trabajo sucio a la librería
    await sendDiscordAlert(postTitle, author, content);

    // Respondemos éxito siempre para no bloquear al usuario si Discord falla
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}