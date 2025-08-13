// pages/api/verify-code.js
import { connectToDatabase } from '@/lib/mongoose';
import Email from '@/models/Email';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'E-Mail und Code sind erforderlich' });

  try {
    await connectToDatabase();

    const record = await Email.findOne({ email });

    if (!record) return res.status(400).json({ verified: false, error: 'E-Mail nicht gefunden' });
    if (record.code !== code) return res.status(400).json({ verified: false, error: 'Falscher Code' });

    // Code nach erfolgreicher Prüfung löschen (optional)
    record.code = undefined;
    await record.save();

    res.status(200).json({ verified: true });
  } catch (err) {
    console.error('Fehler bei Verify-Code:', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
}
