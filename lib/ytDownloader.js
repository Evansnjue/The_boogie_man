import { YtDlpWrap } from 'yt-dlp-wrap';
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ytDlpWrap = new YtDlpWrap();

async function download(url, format) {
  const tmp = join(tmpdir(), `${randomUUID()}.${format}`);
  await ytDlpWrap.execPromise([url, '-f', format === 'mp3' ? 'bestaudio' : 'bestvideo', '-o', tmp]);
  const buffer = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return buffer;
}

export const downloadMP3 = async url => download(url, 'mp3');
export const downloadMP4 = async url => download(url, 'mp4');
