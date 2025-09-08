import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cron from 'node-cron';

// MongoDB connection
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas & Models
const germanySchema = new mongoose.Schema({}, { strict: false });
const austriaSchema = new mongoose.Schema({}, { strict: false });
const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', germanySchema);
const AustriaPrice = mongoose.models.AustriaPrice || mongoose.model('AustriaPrice', austriaSchema);

// SFTP config
const sftpConfig = {
  host: "ftp.epexspot.com",
  port: 22,
  username: "ew-reutte.marketdata",
  password: "j3zbZNcXo$p52Pkpo"
};

// CSV Fetch
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`🔄 Verbinde zu SFTP: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    if (!fileData) return [];

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

// MongoDB Update
const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) return;
  try {
    await model.deleteMany({});
    await model.insertMany(data, { ordered: false });
    console.log(`✅ MongoDB aktualisiert: ${model.modelName} (${data.length} Datensätze)`);
  } catch (err) {
    console.error(`❌ Fehler beim MongoDB-Update (${model.modelName}):`, err.message);
  }
};

// Datenupdate
const updateData = async () => {
  console.log(`[INFO] [${new Date().toLocaleString()}] Datenupdate gestartet`);
  const fileGermany = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const fileAustria = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_austria_2025.csv';

  const [germanyData, austriaData] = await Promise.all([
    fetchCSVData(fileGermany),
    fetchCSVData(fileAustria)
  ]);

  saveCSVFile(germanyData, 'germany_prices.csv');
  saveCSVFile(austriaData, 'austria_prices.csv');

  await Promise.all([
    updateMongoDB(germanyData, GermanyPrice),
    updateMongoDB(austriaData, AustriaPrice)
  ]);

  console.log(`[INFO] [${new Date().toLocaleString()}] ✅ Datenupdate abgeschlossen`);
};

// Cronjob: täglich um 14:15
cron.schedule('15 14 * * *', async () => {
  await updateData();
}, { timezone: 'Europe/Berlin' });

// Optional: API Trigger für manuelles Update
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  try {
    await updateData();
    res.status(200).json({ message: 'Data successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
