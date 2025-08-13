import nodemailer from 'nodemailer';
import { setCode } from '@/lib/codeStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  setCode(email, code); // Code zwischenspeichern

  try {
    let transporter = nodemailer.createTransport({
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
    res.status(500).json({ error: 'Fehler beim Senden der E-Mail' });
  }
}
