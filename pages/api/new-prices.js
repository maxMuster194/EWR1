import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(mongoURI);
}

export default async function handler(req, res) {
  try {
    await connectDB();
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
    }

    const [year, month, day] = date.split('-');
    const ddmmyyyy = `${day.padStart(2, '0')}/${month}/${year}`;
    const record = await GermanyMin15Prices.findOne({ 'Delivery day': ddmmyyyy }).lean();

    const prices15Min = Array(96).fill(null);
    if (record) {
      console.log('Neues Record gefunden:', ddmmyyyy);
      let index = 0;
      for (let h = 1; h <= 24; h++) {
        if (h === 3) {
          ['A Q1', 'A Q2', 'A Q3', 'A Q4', 'B Q1', 'B Q2', 'B Q3', 'B Q4'].forEach(q => {
            const field = `Hour 3${q}`;
            prices15Min[index++] = parseFloat(record[field]?.$numberDouble || record[field] || 0) * 0.1;
          });
        } else {
          [' Q1', ' Q2', ' Q3', ' Q4'].forEach(q => {
            const field = `Hour ${h}${q}`;
            prices15Min[index++] = parseFloat(record[field]?.$numberDouble || record[field] || 0) * 0.1;
          });
        }
      }
    }

    res.status(200).json({ date, prices: prices15Min });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
}