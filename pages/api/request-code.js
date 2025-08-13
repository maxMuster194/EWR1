import nodemailer from 'nodemailer';
import { setCode } from '@/lib/codeStore.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, werbung } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Code speichern
  setCode(email, code);

  // Werbung optional sofort speichern, damit sie bei verify noch da ist
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

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Dein Verifizierungscode',
      text: `Dein Code lautet: ${code}`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('E-Mail-Fehler:', err); // Log auf Server
    res.status(500).json({ error: 'Fehler beim Senden der E-Mail' });
  }
}
