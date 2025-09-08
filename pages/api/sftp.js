import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { log } from '../utils/logger.js'; // Logger importieren

// MongoDB connection
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => log(`❌ MongoDB connection error: ${err.message}`));
}

// Flexible Schemas
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

// CSV abrufen
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    log(`🔄 Verbinde zu SFTP: ${remotePath}`);
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    if (!fileData) {
      log(`⚠️ Keine Daten empfangen für ${remotePath}`);
      return [];
    }

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          log(`✅ CSV geladen (${remotePath}) → ${result.data.length} Zeilen`);
          resolve(result.data);
        },
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    log(`❌ Fehler beim Laden von ${remotePath}: ${err.message}`);
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
  log(`💾 Datei gespeichert: ${filePath}`);
  return filePath;
};

// MongoDB Update
const updateMongoDB = async (data, model) => {
  if (!data || data.length === 0) return;
  try {
    await model.deleteMany({});
    await model.insertMany(data, { ordered: false });
    log(`✅ MongoDB aktualisiert: ${model.modelName} (${data.length} Datensätze)`);
  } catch (err) {
    log(`❌ Fehler MongoDB Update (${model.modelName}): ${err.message}`);
  }
};

// Daten aktualisieren
export const updateData = async () => {
  log('🚀 Datenupdate gestartet');
  const germanyPath = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const austriaPath = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_austria_2025.csv';

  try {
    const [germanyPrices, austriaPrices] = await Promise.all([
      fetchCSVData(germanyPath),
      fetchCSVData(austriaPath),
    ]);

    saveCSVFile(germanyPrices, 'germany_prices.csv');
    saveCSVFile(austriaPrices, 'austria_prices.csv');

    await Promise.all([
      updateMongoDB(germanyPrices, GermanyPrice),
      updateMongoDB(austriaPrices, AustriaPrice),
    ]);

    log('✅ Datenupdate erfolgreich abgeschlossen');
  } catch (error) {
    log(`❌ Fehler während Datenupdate: ${error.message}`);
  }
};

// Alle 30 Sekunden ausführen
setInterval(updateData, 30 * 1000);

// Initial sofort ausführen
updateData();
