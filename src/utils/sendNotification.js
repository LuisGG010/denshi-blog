export async function sendPushNotification(postTitle) {
  const ONE_SIGNAL_APP_ID = "99aa14a7-72cd-479c-90f3-6ec6e1319bd1";
  const REST_API_KEY = "os_v2_app_tgvbjj3szvdzzehtn3docmm32fjfyqeqckre5sfkh7gu2jwkarbau2qxznma67cam2b7igyr23kx7z4mypk4uiszdqc477y6eyywecy"; // Está en Settings > Keys & IDs en OneSignal

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONE_SIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'], // Enviar a TODOS
      headings: { en: "¡Nuevo Post en Denshi Blog! 📝" },
      contents: { en: `Acabamos de publicar: "${postTitle}". ¡Léelo ahora!` },
      url: "https://denshi-blog.vercel.app/blog" // A donde van al hacer click
    })
  };

  try {
    await fetch('https://onesignal.com/api/v1/notifications', options);
    console.log("🔔 Notificación enviada a Google/Chrome");
  } catch (err) {
    console.error("Error enviando push:", err);
  }
}