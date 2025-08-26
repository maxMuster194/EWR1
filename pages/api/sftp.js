import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cron from 'node-cron';

// MongoDB connection
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

// Connect to MongoDB only if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error('MongoDB connection error:', err));
}

// Flexible schema for dynamic CSV data
const germanySchema = new mongoose.Schema({}, { strict: false });
const austriaSchema = new mongoose.Schema({}, { strict: false });

// Define Mongoose models only once
const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', germanySchema);
const AustriaPrice = mongoose.models.AustriaPrice || mongoose.model('AustriaPrice', austriaSchema);

// SFTP configuration
const sftpConfig = {
  host: "ftp.epexspot.com",
  port: 22,
  username: "ew-reutte.marketdata",
  password: "j3zbZNcXo$p52Pkpo"
};

// Fetch CSV data via SFTP
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    console.log(`🔄 Verbinde zu SFTP und hole Datei: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    if (!fileData) {
      console.warn(`⚠️ Keine Daten empfangen für ${remotePath}`);
      return [];
    }

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        dynamicTyping: true,
        complete: (result) => {
          console.log(`✅ CSV geladen (${remotePath}) → ${result.data.length} Zeilen`);
          resolve(result.data);
        },
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error(`❌ Fehler beim Laden von ${remotePath}:`, err.message);
    return [];
  }
};

// Save CSV locally
const saveCSVFile = (data, filename) => {
  if (!filename) {
    throw new Error("❌ Filename missing in saveCSVFile!");
  }
  if (!data || data.length === 0) {
    console.warn(`⚠️ Keine Daten für ${filename}, Datei wird nicht gespeichert.`);
    return null;
  }

  const csv = Papa.unparse(data);
  if (!csv) {
    console.warn(`⚠️ Papa.unparse() hat nichts zurückgegeben für ${filename}`);
    return null;
  }

  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);

  console.log(`💾 Datei gespeichert: ${filePath}`);
  return filePath;
};

// Update MongoDB: delete existing data and insert new data
const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) {
    console.warn(`⚠️ Keine Daten für MongoDB Update (${model.modelName}), übersprungen.`);
    return;
  }
  try {
    await model.deleteMany({});
    await model.insertMany(data, { ordered: false });
    console.log(`✅ MongoDB aktualisiert: ${model.modelName} (${data.length} Datensätze)`);
  } catch (err) {
    console.error(`❌ Fehler beim MongoDB-Update (${model.modelName}):`, err.message);
  }
};

// Function to fetch and update data
const updateData = async () => {
  console.log('🚀 Datenupdate gestartet:', new Date().toLocaleString());

  const filePathGermany = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const filePathAustria = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_austria_2025.csv';

  try {
    const [germanyPrices, austriaPrices] = await Promise.all([
      fetchCSVData(filePathGermany),
      fetchCSVData(filePathAustria),
    ]);

    // Save locally as CSV
    saveCSVFile(germanyPrices, 'germany_prices.csv');
    saveCSVFile(austriaPrices, 'austria_prices.csv');

    // Update MongoDB
    await Promise.all([
      updateMongoDB(germanyPrices, GermanyPrice),
      updateMongoDB(austriaPrices, AustriaPrice),
    ]);

    console.log('✅ Datenupdate erfolgreich abgeschlossen.');
  } catch (error) {
    console.error('❌ Fehler während Datenupdate:', error.message);
  }
};

// Function to schedule data update at a specified time
const scheduleDataUpdate = (hour, minute) => {
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || 
      hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.error('❌ Ungültige Zeit für Cronjob.');
    return;
  }

  const cronExpression = `${minute} ${hour} * * *`;
  cron.schedule(cronExpression, async () => {
    console.log(`⏰ Geplanter Datenupdate um ${hour}:${minute.toString().padStart(2, '0')} gestartet.`);
    await updateData();
  }, {
    timezone: 'Europe/Berlin'
  });
  console.log(`📅 Cronjob eingerichtet für ${hour}:${minute.toString().padStart(2, '0')} (Europe/Berlin).`);
};

// API handler for manual trigger
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  try {
    await updateData();
    res.status(200).json({ message: "Data successfully updated." });
  } catch (error) {
    console.error('API error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Example: Schedule data update at a specific time (14:10)
scheduleDataUpdate(14, 10);

// Initial execution on script start
updateData();
