// apps/web/server/telegram.ts
type TelegramOpts = {
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disable_web_page_preview?: boolean;
};

export async function sendTelegram(text: string, opts: TelegramOpts = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing; skipping send.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    ...opts,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // Don’t cache in edge/CDN
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Telegram send failed:', res.status, errText);
  }
}