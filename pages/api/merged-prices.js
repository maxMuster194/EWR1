import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices'; // Dein Modell für neue

const GermanyPriceSchema = new mongoose.Schema({}, { collection: 'germanyprices', strict: false });
const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', GermanyPriceSchema);

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(mongoURI);
}

const thresholdDate = new Date('2025-10-01');

export default async function handler(req, res) {
  try {
    await connectDB();
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
    }
    const queryDate = new Date(date);
    const prices15Min = Array(96).fill(null); // 24h x 4q

    const parseValue = (val) => {
      if (val === null || val === undefined) return null;
      const numStr = val?.$numberDouble || val?.$numberInt || val.toString() || '0';
      const num = parseFloat(numStr);
      return isNaN(num) ? null : num * 0.1; // ct/kWh
    };

    if (queryDate >= thresholdDate) {
      // Neue Daten (15-Min): Unverändert
      const [year, month, day] = date.split('-');
      const ddmmyyyy = `${day.padStart(2, '0')}/${month}/${year}`;
      const record = await GermanyMin15Prices.findOne({ 'Delivery day': ddmmyyyy }).lean();
      if (record) {
        console.log('Neues Record gefunden:', record['Delivery day']);
        let index = 0;
        for (let h = 1; h <= 24; h++) {
          if (h === 3) {
            ['A Q1', 'A Q2', 'A Q3', 'A Q4', 'B Q1', 'B Q2', 'B Q3', 'B Q4'].forEach(q => {
              const field = `Hour 3${q}`;
              prices15Min[index++] = parseValue(record[field]);
            });
          } else {
            [' Q1', ' Q2', ' Q3', ' Q4'].forEach(q => {
              const field = `Hour ${h}${q}`;
              prices15Min[index++] = parseValue(record[field]);
            });
          }
        }
      } else {
        console.log('Kein neues Record für:', ddmmyyyy);
      }
    } else {
      // Alte Daten (stündlich): Erweiterter Parse
      const [year, month, day] = date.split('-');
      const ddmmyyyy = `${day.padStart(2, '0')}/${month}/${year}`;
      const regexPattern = `${ddmmyyyy}.*Prices`; // Match Header

      const pipeline = [
        { $addFields: { keys: { $objectToArray: "$$ROOT" } } },
        { $match: { "keys.k": { $regex: regexPattern, $options: 'i' } } },
        { $project: { keys: 1, __parsed_extra: 1 } }
      ];
      const records = await GermanyPrice.aggregate(pipeline).limit(1);

      if (records.length > 0) {
        const record = records[0];
        console.log('Altes Record gefunden für:', ddmmyyyy);
        console.log('Labels (__parsed_extra):', record.__parsed_extra); // Debug Labels
        console.log('Alle Keys (erste 10):', record.keys.slice(0, 10).map(kv => kv.k)); // Debug Keys

        // Angenommen: __parsed_extra = Labels (ca. 48 Einträge), dann Preise als Values in keys ab Index ~3 (nach _id, __v etc.)
        const keyValues = record.keys.filter(kv => kv.k !== '_id' && kv.k !== '__v' && kv.k !== '__parsed_extra' && !kv.k.includes(ddmmyyyy)); // Filter Header und System
        const numLabels = record.__parsed_extra ? record.__parsed_extra.length : 0;
        const priceStartIndex = numLabels + 2; // Überspringen Header, _id etc. – passe basierend auf Logs an!

        let index = 0;
        for (let h = 0; h < 24; h++) {
          const hourlyVal = parseValue(keyValues[h + priceStartIndex]?.v); // Preise ab Start-Index
          console.log(`Hour ${h+1} geparster Wert:`, hourlyVal); // Debug pro Stunde
          for (let q = 0; q < 4; q++) {
            prices15Min[index++] = hourlyVal;
          }
        }
      } else {
        console.log('Kein altes Record für:', ddmmyyyy, '(Regex:', regexPattern, ')');
      }
    }

    res.status(200).json({ date, prices: prices15Min });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
}