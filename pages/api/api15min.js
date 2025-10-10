import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import GermanyMin15Prices from '/models/min15Prices';

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
    console.error('MongoDB connection error:', err.message);
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}

// SFTP config
const sftpConfig = {
  host: 'ftp.epexspot.com',
  port: 22,
  username: 'ew-reutte.marketdata',
  password: 'j3zbZNcXo$p52Pkpo'
};

// Cache to prevent multiple updates within a short period
let lastUpdate = 0;
const UPDATE_INTERVAL = 60 * 1000; // 1 minute

// SFTP Directory Listing
const listSFTPDirectory = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`📁 Liste SFTP-Verzeichnis: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const files = await sftp.list(remotePath);
    console.log(`📁 Verzeichnisinhalt von ${remotePath}:`, files.map(f => `${f.type} ${f.name} (${f.size} bytes, modified: ${new Date(f.modifyTime).toISOString()})`).join('\n'));
    await sftp.end();
    return files;
  } catch (err) {
    console.error(`❌ Fehler beim Auflisten von ${remotePath}:`, err.message);
    await sftp.end();
    return [];
  }
};

// CSV Fetch
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`🔄 Verbinde zu SFTP: ${remotePath}`);
    await sftp.connect(sftpConfig);
    console.log(`🔍 Lese Datei: ${remotePath}`);
    const fileData = await sftp.get(remotePath);
    if (!fileData) {
      console.warn(`[WARN] Keine Daten unter ${remotePath} gefunden`);
      await sftp.end();
      return [];
    }

    const fileContent = fileData.toString();
    console.log(`📄 Dateiinhalt (erste 200 Zeichen): ${fileContent.slice(0, 200)}...`);

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: header => header.trim(),
        transform: (value, field) => {
          if (value === '') return null;
          return value;
        },
        // Skip the comment line starting with '#'
        beforeFirstChunk: (chunk) => {
          const lines = chunk.split('\n');
          const firstDataLine = lines.findIndex(line => !line.startsWith('#'));
          return lines.slice(firstDataLine).join('\n');
        },
        complete: (result) => {
          // Entferne __parsed_extra
          const cleanedData = result.data.map(record => {
            const cleanedRecord = { ...record };
            delete cleanedRecord.__parsed_extra;
            return cleanedRecord;
          });
          console.log(`✅ CSV geparst: ${cleanedData.length} Datensätze`);
          if (cleanedData.length > 0) {
            console.log('Beispiel-Datensatz:', cleanedData[0]);
          }
          resolve(cleanedData);
        },
        error: (err) => {
          console.error(`❌ Fehler beim Parsen der CSV-Datei ${remotePath}:`, err.message);
          reject(err);
        }
      });
    });
  } catch (err) {
    console.error(`❌ Fehler beim Abrufen von ${remotePath}:`, err.message);
    await sftp.end();
    return [];
  }
};

// CSV speichern
const saveCSVFile = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('[WARN] Keine Daten zum Speichern als CSV');
    return null;
  }
  const csv = Papa.unparse(data);
  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
  console.log(`💾 Datei gespeichert: ${filePath}`);
  return filePath;
};

// MongoDB Update
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
    throw new Error(`MongoDB update failed: ${err.message}`);
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
  const now = Date.now();
  if (now - lastUpdate < UPDATE_INTERVAL) {
    console.log(`[INFO] Update übersprungen: Zu kurz seit letztem Update (${Math.round((now - lastUpdate) / 1000)}s < ${UPDATE_INTERVAL / 1000}s)`);
    return await fetchMongoDBData(GermanyMin15Prices); // Return cached data
  }

  console.log(`[INFO] [${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}] Datenupdate gestartet`);

  const possiblePaths = [
    '/germany/Day-Ahead Auction/Quarter-hourly/Current/Prices_Volumes/auction_spot_15_prices_germany_luxembourg_2025.csv'
  ];

  console.log('[INFO] Untersuche SFTP-Verzeichnisstruktur...');
  await listSFTPDirectory('/germany');
  await listSFTPDirectory('/germany/Day-Ahead Auction');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly/Current');
  await listSFTPDirectory('/germany/Day-Ahead Auction/Quarter-hourly/Current/Prices_Volumes');

  let germanyMin15Data = null;
  let successfulPath = null;

  for (const filePath of possiblePaths) {
    console.log(`🔍 Versuche Pfad: ${filePath}`);
    germanyMin15Data = await fetchCSVData(filePath);
    if (germanyMin15Data && germanyMin15Data.length > 0) {
      successfulPath = filePath;
      console.log(`✅ Erfolgreich: ${filePath}`);
      break;
    }
  }

  if (!germanyMin15Data || germanyMin15Data.length === 0) {
    console.warn(`[WARN] [${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}] Keine 15-Minuten-Daten gefunden in den angegebenen Pfaden.`);
    return null;
  }

  // CSV speichern
  saveCSVFile(germanyMin15Data, `germany_min15_prices_${new Date().toISOString().split('T')[0]}.csv`);

  // MongoDB-Update
  await updateMongoDB(germanyMin15Data, GermanyMin15Prices);

  lastUpdate = now;
  console.log(`[INFO] [${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}] ✅ Datenupdate abgeschlossen von: ${successfulPath}`);
  return germanyMin15Data;
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  try {
    await connectDB();
    const germanyMin15Data = await updateData();
    const mongoData = await fetchMongoDBData(GermanyMin15Prices);

    if (!germanyMin15Data || germanyMin15Data.length === 0) {
      return res.status(500).json({
        error: 'Failed to fetch 15-minute data from SFTP. Check logs for directory structure or verify SFTP credentials and file path.',
        mongoData
      });
    }

    res.status(200).json({
      message: '15-minute data fetched from SFTP and saved to MongoDB.',
      recordsFetched: germanyMin15Data.length,
      recordsInMongo: mongoData.length,
      data: mongoData
    });
  } catch (err) {
    const mongoData = await fetchMongoDBData(GermanyMin15Prices);
    res.status(500).json({
      error: `Failed to fetch or save data: ${err.message}`,
      mongoData
    });
  }
};