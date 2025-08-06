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
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        dynamicTyping: true,
        complete: (result) => resolve(result.data),
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error("Error fetching file:", err);
    return [];
  }
};

// Save CSV locally
const saveCSVFile = (data, filename) => {
  const csv = Papa.unparse(data);
  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
  return filePath;
};

// Update MongoDB: delete existing data and insert new data
const updateMongoDB = async (data, model) => {
  try {
    await model.deleteMany({});
    await model.insertMany(data, { ordered: false });
    console.log(`Data successfully updated in MongoDB (${model.modelName})`);
  } catch (err) {
    console.error(`Error updating MongoDB (${model.modelName}):`, err);
  }
};

// Function to fetch and update data
const updateData = async () => {
  console.log('Data update started:', new Date().toLocaleString());
  
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

    console.log('Data update successfully completed.');
  } catch (error) {
    console.error('Error during data update:', error);
  }
};

// Function to schedule data update at a specified time
const scheduleDataUpdate = (hour, minute) => {
  // Validate input time
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || 
      hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.error('Invalid time specified. Hour must be 0-23 and minute must be 0-59.');
    return;
  }

  // Schedule cron job
  const cronExpression = `${minute} ${hour} * * *`;
  cron.schedule(cronExpression, async () => {
    console.log(`Scheduled data update at ${hour}:${minute < 10 ? '0' + minute : minute} started.`);
    await updateData();
  }, {
    timezone: 'Europe/Berlin'
  });
  console.log(`Data update scheduled for ${hour}:${minute < 10 ? '0' + minute : minute} daily.`);
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
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Example: Schedule data update at a specific time (e.g., 14:30)
scheduleDataUpdate(14, 10);

// Initial execution on script start
updateData();