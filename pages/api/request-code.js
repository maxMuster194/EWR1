// pages/api/request-code.js
import { connectToDatabase } from '@/lib/mongoose';
import Email from '@/models/Email';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, werbung } = req.body;
  if (!email) return res.status(400).json({ error: 'E-Mail ist erforderlich' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await connectToDatabase();

    await Email.findOneAndUpdate(
      { email },
      { email, werbung: werbung ? 'ja' : 'nein', code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS startet automatisch
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App-Passwort ohne Leerzeichen!
      },
      tls: { rejectUnauthorized: false },
      family: 4, // zwingt IPv4, verhindert Timeout
    });
    

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Dein Verifizierungscode',
      text: `Dein Code lautet: ${code}`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler beim Request-Code:', err.stack || err);
    res.status(500).json({ error: 'Serverfehler' });
  }
}
