import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { author, content, postTitle } = body;
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Falta la URL de Discord' }, { status: 500 });
    }

    // El mensaje que se envía a Discord
    const discordPayload = {
      content: "🔔 **¡Nuevo Comentario Detectado!**",
      embeds: [
        {
          title: `En el post: "${postTitle || 'Sin título'}"`,
          color: 5814783, // Un color azulito
          fields: [
            { name: "👤 Autor", value: author || "Anónimo", inline: true },
            { name: "💬 Mensaje", value: content }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Error enviando notificación' }, { status: 500 });
  }
}