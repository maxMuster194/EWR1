import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'logs/update.log');

export const log = (message) => {
  const time = new Date().toLocaleString();
  fs.appendFileSync(logFile, `[${time}] ${message}\n`);
  console.log(`[${time}] ${message}`);
};
