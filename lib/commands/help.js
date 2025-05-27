export const run = async (sock, msg) => {
  const from = msg.key.remoteJid;
  await sock.sendMessage(from, {
    text: '📖 *The Boogie Man Commands:*\n\n!ytmp3 <url>\n!ytmp4 <url>\n!help'
  }, { quoted: msg });
};
