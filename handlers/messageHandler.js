import * as yt from '../lib/ytDownloader.js';

export async function handleIncomingMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const sender = isGroup ? msg.key.participant : from;
  const messageType = Object.keys(msg.message)[0];
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  if (!body.startsWith('!')) return;

  const [command, ...args] = body.trim().split(' ');

  if (command === '!help') {
    await sock.sendMessage(from, { text: '*Commands:*\n!ytmp3 <url>\n!ytmp4 <url>' }, { quoted: msg });
  }

  if (command === '!ytmp3' && args[0]) {
    try {
      const buffer = await yt.downloadMP3(args[0]);
      await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4' }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ Failed to download MP3.' }, { quoted: msg });
    }
  }

  if (command === '!ytmp4' && args[0]) {
    try {
      const buffer = await yt.downloadMP4(args[0]);
      await sock.sendMessage(from, { video: buffer }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ Failed to download MP4.' }, { quoted: msg });
    }
  }
}
