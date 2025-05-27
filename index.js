import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys';

import fs from 'fs';
import chalk from 'chalk';
import { handleIncomingMessage } from './handlers/messageHandler.js';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key?.remoteJid === 'status@broadcast') return;
    await handleIncomingMessage(sock, msg);
  });

  // Anti-delete handler
  sock.ev.on('messages.delete', async ({ keys }) => {
    for (let key of keys) {
      console.log(chalk.red(`Anti-Delete >> Message deleted: ${key.id}`));
      // Optionally re-send or log
    }
  });

  // Anti-view-once handler (mock)
  sock.ev.on('message-receipt.update', ({ key }) => {
    if (key?.viewOnce) {
      console.log(chalk.yellow('Anti-View-Once >> View Once message detected.'));
    }
  });

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        startBot(); // Reconnect
      } else {
        console.log(chalk.red('❌ Disconnected: Logged out.'));
      }
    } else if (connection === 'open') {
      console.log(chalk.green('✅ The Boogie Man is online!'));
    }
  });
}

startBot();
