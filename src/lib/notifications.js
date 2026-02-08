// src/lib/notifications.js

export async function sendDiscordAlert(title, author, content) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("❌ Faltan credenciales de Discord");
    return false;
  }

  try {
    const discordPayload = {
      content: "🔔 **¡Nuevo Comentario Detectado!**",
      embeds: [
        {
          title: `En el post: "${title || 'Sin título'}"`,
          color: 5814783, // Azulito
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

    return true;
  } catch (error) {
    console.error("Error enviando a Discord:", error);
    return false;
  }
}