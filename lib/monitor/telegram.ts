/**
 * Aviso por Telegram.
 *
 * Se llama directo a la API de Telegram y no se pasa por n8n a propósito: si el
 * aviso dependiera de n8n, el día que se caiga n8n —que es uno de los servicios
 * que este monitor vigila— no llegaría el mensaje que avisa que se cayó.
 *
 * Un canal de alertas no puede depender de lo que vigila.
 *
 * ⚠️ LOS AVISOS ESTÁN APAGADOS A PROPÓSITO DESDE EL 2026-09-12.
 *
 * No se apagaron tocando código: se quitó el secret `TELEGRAM_CHAT_ID` del
 * Worker `zecamo-dashboard`. Por eso esta nota existe — un secret borrado a mano
 * no deja rastro en git, y sin esto el próximo que mire va a buscar el bug en
 * esta función y no lo va a encontrar.
 *
 * El monitor SIGUE corriendo y guardando estado: la pantalla `/health` está al
 * día cuando alguien la abre. Lo único que no pasa es que salga el mensaje.
 *
 * Para volver a prenderlos:
 *   wrangler secret put TELEGRAM_CHAT_ID   (el chat del bot "avisos zecamo")
 */

/** Telegram corta los mensajes en 4096 caracteres. */
const LARGO_MAX = 4000;

/**
 * Manda un mensaje al chat configurado.
 *
 * Si faltan las variables no rompe: registra y sigue. El monitor tiene que
 * seguir guardando estado aunque el aviso no esté configurado — quedarse sin
 * datos además de sin aviso sería perder dos cosas por el precio de una.
 *
 * @returns si el mensaje efectivamente salió
 */
export async function avisar(texto: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    console.warn("[monitor] Telegram sin configurar (falta TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID)");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: texto.slice(0, LARGO_MAX),
        parse_mode: "Markdown",
        // El aviso ya trae la URL del sitio: no hace falta que Telegram le
        // pegue una tarjeta de vista previa gigante debajo de cada mensaje.
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error(`[monitor] Telegram respondió HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[monitor] no se pudo avisar por Telegram:", err);
    return false;
  }
}
