import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// ---------------------------
// MongoDB-Verbindung
// ---------------------------
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error(`[${new Date().toLocaleString()}] ❌ MongoDB connection error:`, err));
}

// ---------------------------
// Schema und Models
// ---------------------------
const germanySchema = new mongoose.Schema({}, { strict: false });
const austriaSchema = new mongoose.Schema({}, { strict: false });

const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', germanySchema);
const AustriaPrice = mongoose.models.AustriaPrice || mongoose.model('AustriaPrice', austriaSchema);

// ---------------------------
// SFTP-Konfiguration
// ---------------------------
const sftpConfig = {
  host: "ftp.epexspot.com",
  port: 22,
  username: "ew-reutte.marketdata",
  password: "j3zbZNcXo$p52Pkpo"
};

// ---------------------------
// Funktionen
// ---------------------------
const logInfo = (message) => console.log(`[INFO] [${new Date().toLocaleString()}] ${message}`);
const logError = (message) => console.error(`[ERROR] [${new Date().toLocaleString()}] ${message}`);

const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    logInfo(`Verbinde zu SFTP: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    if (!fileData) return [];

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          logInfo(`CSV geladen (${remotePath}) → ${result.data.length} Zeilen`);
          resolve(result.data);
        },
        error: (err) => reject(err),
      });
    });
  } catch (err) {
    logError(`Fehler beim Abrufen von ${remotePath}: ${err.message}`);
    return [];
  }
};

const saveCSVFile = (data, filename) => {
  if (!data || data.length === 0) return null;
  const csv = Papa.unparse(data);
  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
  logInfo(`Datei gespeichert: ${filePath}`);
  return filePath;
};

const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) return;
  try {
    await model.deleteMany({});
    await model.insertMany(data, { ordered: false });
    logInfo(`MongoDB aktualisiert: ${model.modelName} (${data.length} Datensätze)`);
  } catch (err) {
    logError(`Fehler beim MongoDB-Update (${model.modelName}): ${err.message}`);
  }
};

const updateData = async () => {
  logInfo('Datenupdate gestartet');

  const germanyPath = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const austriaPath = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_austria_2025.csv';

  try {
    const [germany, austria] = await Promise.all([
      fetchCSVData(germanyPath),
      fetchCSVData(austriaPath),
    ]);

    saveCSVFile(germany, 'germany_prices.csv');
    saveCSVFile(austria, 'austria_prices.csv');

    await Promise.all([
      updateMongoDB(germany, GermanyPrice),
      updateMongoDB(austria, AustriaPrice),
    ]);

    logInfo('✅ Datenupdate erfolgreich abgeschlossen');
  } catch (err) {
    logError(`Fehler während Datenupdate: ${err.message}`);
  }
};

// ---------------------------
// Automatische Ausführung alle 30 Sekunden
// ---------------------------
setInterval(updateData, 30 * 1000); // alle 30 Sekunden

// ---------------------------
// API-Handler für manuellen Trigger
// ---------------------------
export default async function handler(req, res) {
  if (req.method === 'GET') {
    await updateData();
    return res.status(200).json({ message: "Data successfully updated." });
  }
  return res.status(405).json({ error: 'Only GET requests allowed' });
}
