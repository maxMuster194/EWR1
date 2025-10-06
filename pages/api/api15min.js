import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Germany15MinPrice from 'models/15minPrices'; // Import des Modells

// MongoDB connection
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// SFTP config
const sftpConfig = {
  host: 'ftp.epexspot.com',
  port: 22,
  username: 'ew-reutte.marketdata',
  password: 'j3zbZNcXo$p52Pkpo'
};

// SFTP Directory Listing
const listSFTPDirectory = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`📁 Liste SFTP-Verzeichnis: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const files = await sftp.list(remotePath);
    await sftp.end();
    console.log(`📁 Verzeichnisinhalt von ${remotePath}:`, files.map(f => `${f.type} ${f.name}`).join('\n'));
    return files;
  } catch (err) {
    console.error(`❌ Fehler beim Auflisten von ${remotePath}:`, err.message);
    return [];
  }
};

// CSV Fetch
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`🔄 Verbinde zu SFTP: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    if (!fileData) {
      console.warn(`[WARN] Keine Daten unter ${remotePath} gefunden`);
      return [];
    }

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => resolve(result.data),
        error: (err) => reject(err)
      });
    });
  } catch (err) {
    console.error(`❌ Fehler beim Abrufen von ${remotePath}:`, err.message);
    return [];
  }
};

// CSV speichern
const saveCSVFile = (data, filename) => {
  if (!data || data.length === 0) return null;
  const csv = Papa.unparse(data);
  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
  console.log(`💾 Datei gespeichert: ${filePath}`);
  return filePath;
};

// MongoDB Update (mit bulkWrite für bessere Performance)
const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) {
    console.warn(`[WARN] Keine Daten zum Speichern in MongoDB (${model.modelName})`);
    return;
  }
  try {
    console.log(`✅ Starte MongoDB-Update: ${model.modelName} (${data.length} Datensätze)`);
    if (data.length > 0) {
      console.log('Beispiel-Datensatz:', data[0]);
    }

    const bulkOps = data.map(record => {
      if (!record['Delivery day']) {
        console.warn('Warnung: Datensatz ohne "Delivery day" übersprungen:', record);
        return null;
      }
      return {
        updateOne: {
          filter: { 'Delivery day': record['Delivery day'] },
          update: { $set: record },
          upsert: true
        }
      };
    }).filter(op => op !== null);

    if (bulkOps.length === 0) {
      console.warn('[WARN] Keine gültigen Bulk-Operationen.');
      return;
    }

    const result = await model.bulkWrite(bulkOps, { ordered: false });
    console.log(`✅ MongoDB-Update erfolgreich: ${model.modelName} - Matched ${result.matchedCount}, Upserted ${result.upsertedCount}, Modified ${result.modifiedCount}`);
  } catch (err) {
    console.error(`❌ Fehler beim MongoDB-Update (${model.modelName}):`, err.message);
    throw err;
  }
};

// MongoDB Daten abrufen
const fetchMongoDBData = async (model) => {
  try {
    const data = await model.find({}).lean();
    console.log(`✅ MongoDB-Daten abgerufen: ${model.modelName} (${data.length} Datensätze)`);
    return data;
  } catch (err) {
    console.error(`❌ Fehler beim Abrufen von MongoDB-Daten (${model.modelName}):`, err.message);
    return [];
  }
};

// Datenupdate
const updateData = async () => {
  console.log(`[INFO] [${new Date().toLocaleString()}] Datenupdate gestartet`);

  const possiblePaths = [
    '/germany/Day-Ahead Auction/Quarter-Hourly/Current/Prices_Volumes/auction_spot_prices_germany_quarterhourly_2025.csv',
    '/germany/Day-Ahead Auction/15-Minute/Current/Prices_Volumes/auction_spot_prices_germany_15min_2025.csv',
    '/germany/Day-Ahead Auction/QH/Current/Prices_Volumes/auction_spot_prices_germany_quarterhourly_2025.csv',
    '/germany/Intraday Continuous/15-Minute/Current/Prices_Volumes/auction_spot_prices_germany_15min_2025.csv'
  ];

  console.log('[INFO] Untersuche SFTP-Verzeichnisstruktur...');
  await listSFTPDirectory('/germany');
  await listSFTPDirectory('/germany/Day-Ahead Auction');

  let germany15MinData = null;
  let successfulPath = null;

  for (const filePath of possiblePaths) {
    console.log(`🔍 Versuche Pfad: ${filePath}`);
    germany15MinData = await fetchCSVData(filePath);
    if (germany15MinData && germany15MinData.length > 0) {
      successfulPath = filePath;
      console.log(`✅ Erfolgreich: ${filePath}`);
      break;
    }
  }

  if (!germany15MinData || germany15MinData.length === 0) {
    console.warn(`[WARN] [${new Date().toLocaleString()}] Keine 15-Minuten-Daten gefunden in den angegebenen Pfaden.`);
    return null;
  }

  saveCSVFile(germany15MinData, `germany_15min_prices_${new Date().toISOString().split('T')[0]}.csv`);
  await updateMongoDB(germany15MinData, Germany15MinPrice);

  console.log(`[INFO] [${new Date().toLocaleString()}] ✅ Datenupdate abgeschlossen von: ${successfulPath}`);
  return germany15MinData;
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  try {
    await connectDB();
    const germany15MinData = await updateData();
    const mongoData = await fetchMongoDBData(Germany15MinPrice);

    if (!germany15MinData || germany15MinData.length === 0) {
      return res.status(500).json({
        error: 'Failed to fetch 15-minute data from SFTP. Check logs for directory structure or verify SFTP credentials and file path.',
        mongoData
      });
    }

    res.status(200).json({
      message: '15-minute data fetched from SFTP and saved to MongoDB.',
      recordsFetched: germany15MinData.length,
      recordsInMongo: mongoData.length,
      data: mongoData // Gibt die Daten aus MongoDB zurück
    });
  } catch (err) {
    const mongoData = await fetchMongoDBData(Germany15MinPrice);
    res.status(500).json({
      error: `Failed to fetch or save data: ${err.message}`,
      mongoData
    });
  }
};