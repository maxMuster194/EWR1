import { getCode, clearCode } from '@/lib/codeStore.js';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code, werbung } = req.body;
  const storedCode = getCode(email);

  if (!storedCode) {
    return res.status(400).json({ error: 'Kein Code gefunden oder Code abgelaufen', verified: false });
  }

  if (storedCode !== code) {
    return res.status(400).json({ error: 'Falscher Code', verified: false });
  }

  // Code löschen
  clearCode(email);

  // E-Mail + Werbung speichern
  const filePath = path.join(process.cwd(), 'emails.json');
  let emailList = [];

  if (fs.existsSync(filePath)) {
    try {
      emailList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      emailList = [];
    }
  }

  if (!emailList.some(entry => entry.email === email)) {
    emailList.push({
      email,
      werbung: werbung ? 'ja' : 'nein',
    });
    fs.writeFileSync(filePath, JSON.stringify(emailList, null, 2), 'utf8');
  }

  res.status(200).json({ verified: true });
}
