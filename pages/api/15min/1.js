import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// MongoDB connection
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schema & Model for 15-minute intervals
const germany15MinSchema = new mongoose.Schema({
  'Delivery day': String,
  'Hour 1 Q1': Number, 'Hour 1 Q2': Number, 'Hour 1 Q3': Number, 'Hour 1 Q4': Number,
  'Hour 2 Q1': Number, 'Hour 2 Q2': Number, 'Hour 2 Q3': Number, 'Hour 2 Q4': Number,
  'Hour 3A Q1': Number, 'Hour 3A Q2': Number, 'Hour 3A Q3': Number, 'Hour 3A Q4': Number,
  'Hour 3B Q1': Number, 'Hour 3B Q2': Number, 'Hour 3B Q3': Number, 'Hour 3B Q4': Number,
  'Hour 4 Q1': Number, 'Hour 4 Q2': Number, 'Hour 4 Q3': Number, 'Hour 4 Q4': Number,
  'Hour 5 Q1': Number, 'Hour 5 Q2': Number, 'Hour 5 Q3': Number, 'Hour 5 Q4': Number,
  'Hour 6 Q1': Number, 'Hour 6 Q2': Number, 'Hour 6 Q3': Number, 'Hour 6 Q4': Number,
  'Hour 7 Q1': Number, 'Hour 7 Q2': Number, 'Hour 7 Q3': Number, 'Hour 7 Q4': Number,
  'Hour 8 Q1': Number, 'Hour 8 Q2': Number, 'Hour 8 Q3': Number, 'Hour 8 Q4': Number,
  'Hour 9 Q1': Number, 'Hour 9 Q2': Number, 'Hour 9 Q3': Number, 'Hour 9 Q4': Number,
  'Hour 10 Q1': Number, 'Hour 10 Q2': Number, 'Hour 10 Q3': Number, 'Hour 10 Q4': Number,
  'Hour 11 Q1': Number, 'Hour 11 Q2': Number, 'Hour 11 Q3': Number, 'Hour 11 Q4': Number,
  'Hour 12 Q1': Number, 'Hour 12 Q2': Number, 'Hour 12 Q3': Number, 'Hour 12 Q4': Number,
  'Hour 13 Q1': Number, 'Hour 13 Q2': Number, 'Hour 13 Q3': Number, 'Hour 13 Q4': Number,
  'Hour 14 Q1': Number, 'Hour 14 Q2': Number, 'Hour 14 Q3': Number, 'Hour 14 Q4': Number,
  'Hour 15 Q1': Number, 'Hour 15 Q2': Number, 'Hour 15 Q3': Number, 'Hour 15 Q4': Number,
  'Hour 16 Q1': Number, 'Hour 16 Q2': Number, 'Hour 16 Q3': Number, 'Hour 16 Q4': Number,
  'Hour 17 Q1': Number, 'Hour 17 Q2': Number, 'Hour 17 Q3': Number, 'Hour 17 Q4': Number,
  'Hour 18 Q1': Number, 'Hour 18 Q2': Number, 'Hour 18 Q3': Number, 'Hour 18 Q4': Number,
  'Hour 19 Q1': Number, 'Hour 19 Q2': Number, 'Hour 19 Q3': Number, 'Hour 19 Q4': Number,
  'Hour 20 Q1': Number, 'Hour 20 Q2': Number, 'Hour 20 Q3': Number, 'Hour 20 Q4': Number,
  'Hour 21 Q1': Number, 'Hour 21 Q2': Number, 'Hour 21 Q3': Number, 'Hour 21 Q4': Number,
  'Hour 22 Q1': Number, 'Hour 22 Q2': Number, 'Hour 22 Q3': Number, 'Hour 22 Q4': Number,
  'Hour 23 Q1': Number, 'Hour 23 Q2': Number, 'Hour 23 Q3': Number, 'Hour 23 Q4': Number,
  'Hour 24 Q1': Number, 'Hour 24 Q2': Number, 'Hour 24 Q3': Number, 'Hour 24 Q4': Number,
  Minimum: Number,
  Maximum: Number,
  Baseload: Number,
  Peakload: Number,
  'Off-peak': Number,
  'Off-peak 2': Number,
  'Off-peak 1': Number,
  Night: Number,
  'Late morning': Number,
  'Early afternoon': Number,
  Evening: Number,
  'Early morning': Number,
  Business: Number,
  Afternoon: Number,
  'Middle night': Number,
  Morning: Number,
  'High noon': Number,
  'Rush hour': Number,
  'Sun peak': Number
}, { strict: true });

const Germany15MinPrice = mongoose.models.germany15minprices || mongoose.model('germany15minprices', germany15MinSchema);

// SFTP config
const sftpConfig = {
  host: "ftp.epexspot.com",
  port: 22,
  username: "ew-reutte.marketdata",
  password: "j3zbZNcXo$p52Pkpo"
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

// MongoDB Update (deaktiviert, da Speichern noch nicht erfolgen soll)
const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) return;
  try {
    console.log(`✅ MongoDB-Update deaktiviert: ${model.modelName} (${data.length} Datensätze)`);
  } catch (err) {
    console.error(`❌ Fehler beim MongoDB-Update (${model.modelName}):`, err.message);
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

  // Mögliche Pfade für 15-Minuten-Daten (angepasst an tatsächliche Datei)
  const possiblePaths = [
    '/germany/Day-Ahead Auction/Quarter-hourly/Current/Prices_Volumes/auction_spot_15_prices_germany_luxembourg_2025.csv'
  ];

  // Verzeichnis au непосредйств auflisten
  console.log('[INFO] Untersuche SFTP-Verzeichnisstruktur...');
  await listSFTPDirectory('/germany');
  await listSFTPDirectory('/germany/Day-Ahead Auction');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly/Current');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly/Current/Prices_Volumes');

  let germany15MinData = null;
  let successfulPath = null;

  // Versuche jeden Pfad
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

  // CSV speichern mit Datum im Dateinamen
  saveCSVFile(germany15MinData, `germany_15min_prices_${new Date().toISOString().split('T')[0]}.csv`);
  // await updateMongoDB(germany15MinData, Germany15MinPrice); // Deaktiviert

  console.log(`[INFO] [${new Date().toLocaleString()}] ✅ Datenupdate abgeschlossen von: ${successfulPath}`);
  return germany15MinData;
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  try {
    // Daten von SFTP holen
    const germany15MinData = await updateData();

    // Vorhandene MongoDB-Daten abrufen
    const mongoData = await fetchMongoDBData(Germany15MinPrice);

    if (!germany15MinData || germany15MinData.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to fetch 15-minute data from SFTP. Check logs for directory structure or verify SFTP credentials and file path.',
        mongoData
      });
    }

    res.status(200).json({ 
      message: '15-minute data fetched from SFTP (not saved to MongoDB).',
      recordsFetched: germany15MinData.length,
      data: germany15MinData
    });
  } catch (err) {
    const mongoData = await fetchMongoDBData(Germany15MinPrice);
    res.status(500).json({ 
      error: `Failed to fetch data: ${err.message}`,
      mongoData
    });
  }
};