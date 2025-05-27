import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
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

  sock.ev.on('messages.delete', async ({ keys }) => {
    for (let key of keys) {
      console.log(chalk.red(`Anti-Delete >> Message deleted: ${key.id}`));
      // Re-fetch/resend logic here (advanced)
    }
  });

  sock.ev.on('message-receipt.update', ({ key }) => {
    if (key && key.viewOnce) {
      console.log(chalk.yellow('Anti-View-Once >> View Once message received.'));
    }
  });

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log(chalk.red('Disconnected. You are logged out.'));
      }
    } else if (connection === 'open') {
      console.log(chalk.green('🟢 The Boogie Man is online!'));
    }
  });
}

startBot();
