import mongoose from 'mongoose';

// MongoDB-Verbindungsfunktion
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    // Ab v4+ von Mongoose sind useNewUrlParser & useUnifiedTopology standardmäßig aktiv
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Schema für germanyprices
const GermanyPriceSchema = new mongoose.Schema({
  deliveryday: String,             // Feld für das Datum
  __parsed_extra: [mongoose.Mixed] // Für die Preisdaten
}, { collection: 'germanyprices', strict: false });

const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', GermanyPriceSchema, 'germanyprices');

// API-Route-Handler
export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { date } = req.query; // Datum aus Query-Parametern holen
      let query = {};
      if (date) {
        query = { deliveryday: date }; // Filter nach deliveryday
      }

      const data = await GermanyPrice.find(query).lean();
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No data found in germanyprices collection' });
      }
      return res.status(200).json({ germany: data });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
