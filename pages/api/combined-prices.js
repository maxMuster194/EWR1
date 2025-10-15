import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongoose';

// Schema für stündliche Preise (Price-Collection)
const PriceSchema = new mongoose.Schema({
  '# 29/09/2025 10:45:02 AM: Prices - EPEX Spot Market Auction - germany_luxembourg - Currency: EUR': String,
  __parsed_extra: [mongoose.Mixed],
}, { collection: 'prices', strict: false });
const Price = mongoose.models.Price || mongoose.model('Price', PriceSchema);

// Schema für 15-Minuten-Preise (min15Prices-Collection)
const Min15PricesSchema = new mongoose.Schema({
  'Delivery day': String,
}, { collection: 'min15Prices', strict: false });
const GermanyMin15Prices = mongoose.models.GermanyMin15Prices || mongoose.model('GermanyMin15Prices', Min15PricesSchema);

// Verbindung zur MongoDB herstellen
async function connectDB() {
  try {
    await connectToDatabase();
    console.log('MongoDB erfolgreich verbunden');
  } catch (error) {
    console.error('Fehler bei der MongoDB-Verbindung:', error);
    throw new Error(`MongoDB-Verbindung fehlgeschlagen: ${error.message}`);
  }
}

// Datumsformate parsen und normalisieren
function parseDeliveryDay(dateStr, inputFormat) {
  if (!dateStr || typeof dateStr !== 'string') {
    console.log(`Ungültiges Datum: ${dateStr}`);
    return null;
  }
  let day, month, year;
  try {
    if (inputFormat === 'YYYY-MM-DD') {
      [year, month, day] = dateStr.split('-');
    } else if (inputFormat === 'DD-MM-YYYY') {
      [day, month, year] = dateStr.split('-');
    } else if (inputFormat === 'DD.MM.YYYY') {
      [day, month, year] = dateStr.split('.');
    } else if (inputFormat === 'DD/MM/YYYY') {
      [day, month, year] = dateStr.split('/');
    } else if (inputFormat === 'YYYY/MM/DD') {
      [year, month, day] = dateStr.split('/');
    } else {
      return null;
    }
    // Prüfen, ob year, month, day definiert sind
    if (!year || !month || !day) {
      console.log(`Ungültiges Split-Ergebnis für ${dateStr} mit Format ${inputFormat}: ${[year, month, day]}`);
      return null;
    }
    const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
  } catch (error) {
    console.log(`Fehler beim Parsen von Datum ${dateStr} mit Format ${inputFormat}: ${error.message}`);
    return null;
  }
}

export default async function handler(req, res) {
  // Nur POST-Anfragen erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST-Anfragen erlaubt' });
  }

  try {
    // Datenbankverbindung herstellen
    await connectDB();
    const { dateStr } = req.body;

    // Prüfen, ob ein Datum übergeben wurde
    if (!dateStr || typeof dateStr !== 'string') {
      console.log('Kein gültiges Datum übergeben:', dateStr);
      return res.status(400).json({ error: 'Gültiges Datum ist erforderlich' });
    }

    // Mögliche Datumsformate für die Abfrage
    const dateFormats = [
      dateStr,
      dateStr.split('-').reverse().join('/'), // DD/MM/YYYY
      dateStr.split('-').join('/'), // YYYY/MM/DD
      dateStr.replace(/-/g, '.'), // DD.MM.YYYY
      parseDeliveryDay(dateStr, 'YYYY-MM-DD'),
      parseDeliveryDay(dateStr, 'DD-MM-YYYY'),
      parseDeliveryDay(dateStr, 'DD.MM.YYYY'),
      parseDeliveryDay(dateStr, 'DD/MM/YYYY'),
      parseDeliveryDay(dateStr, 'YYYY/MM/DD')
    ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); // Duplikate entfernen

    console.log(`Verwendete Datumsformate: ${JSON.stringify(dateFormats)}`);

    let data = [];
    let labels = [];
    let values = [];
    // Entscheiden, ob stündliche oder 15-Minuten-Daten abgefragt werden
    const interval = dateStr <= '2025-09-30' ? 'hourly' : '15min';

    if (interval === 'hourly') {
      // Prüfen, ob die Price-Collection leer ist
      const priceCount = await Price.countDocuments();
      if (priceCount === 0) {
        console.log('Price-Collection ist leer');
        return res.status(404).json({ error: 'Price-Collection enthält keine Daten' });
      }

      // Stündliche Daten aus der Price-Collection abrufen
      console.log(`Abfrage der Price-Collection für germany_luxembourg, Datum in Formaten: ${JSON.stringify(dateFormats)}`);
      let records = [];
      for (const format of dateFormats) {
        if (!format) continue; // Ungültige Formate überspringen
        console.log(`Versuche Abfrage mit Datumsformat: ${format}`);
        records = await Price.find({
          '# 29/09/2025 10:45:02 AM: Prices - EPEX Spot Market Auction - germany_luxembourg - Currency: EUR': format
        }).lean();
        console.log(`Gefundene Datensätze für Datum ${format}: ${records.length}`);
        if (records.length > 0) {
          console.log('Gefundene Datensätze:', JSON.stringify(records, null, 2));
          break;
        }
      }

      // Prüfen, ob Datensätze gefunden wurden
      if (records.length === 0) {
        const allDates = await Price.find().distinct('# 29/09/2025 10:45:02 AM: Prices - EPEX Spot Market Auction - germany_luxembourg - Currency: EUR');
        console.log(`Keine Datensätze in Price für ${dateStr}. Verfügbare Daten: ${allDates}`);
        return res.status(404).json({
          error: `Keine stündlichen Daten für ${dateStr} gefunden. Verfügbare Daten: ${allDates.join(', ') || 'keine'}`,
        });
      }

      const record = records[0];
      console.log('Ausgewählter Price-Datensatz:', JSON.stringify(record, null, 2));

      // Labels für 24 Stunden erstellen
      labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      console.log('Erstellte Labels:', JSON.stringify(labels));

      // Werte aus __parsed_extra extrahieren
      values = [];
      if (record.__parsed_extra && Array.isArray(record.__parsed_extra)) {
        console.log('Verwende __parsed_extra für Werte:', JSON.stringify(record.__parsed_extra));
        values = record.__parsed_extra
          .map(val => {
            const parsed = val ? parseFloat(val.$numberDouble || val.$numberInt || val) : null;
            console.log(`Parse Wert aus __parsed_extra: ${JSON.stringify(val)} -> ${parsed}`);
            return parsed;
          })
          .filter(v => v !== null);
        console.log('Geparselte Werte aus __parsed_extra:', JSON.stringify(values));
      } else {
        console.log('Kein __parsed_extra gefunden');
        return res.status(404).json({ error: `Keine stündlichen Daten in __parsed_extra für ${dateStr}` });
      }

      // Prüfen, ob gültige Werte gefunden wurden
      if (values.length === 0) {
        console.log('Keine gültigen Werte im Price-Datensatz gefunden:', JSON.stringify(record));
        return res.status(404).json({ error: `Keine gültigen stündlichen Daten für ${dateStr} im Price-Datensatz` });
      }

      console.log(`Endgültige Werte für ${dateStr}:`, JSON.stringify(values));
    } else {
      // Prüfen, ob die min15Prices-Collection leer ist
      const min15Count = await GermanyMin15Prices.countDocuments();
      if (min15Count === 0) {
        console.log('min15Prices-Collection ist leer');
        return res.status(404).json({ error: 'min15Prices-Collection enthält keine Daten' });
      }

      // 15-Minuten-Daten aus der min15Prices-Collection abrufen
      console.log(`Abfrage der min15Prices-Collection für Delivery day: ${dateFormats[0]}`);
      let records = [];
      for (const format of dateFormats) {
        if (!format) continue; // Ungültige Formate überspringen
        console.log(`Versuche Abfrage mit Datumsformat: ${format}`);
        records = await GermanyMin15Prices.find({ 'Delivery day': format }).lean();
        console.log(`Gefundene Datensätze für Datum ${format}: ${records.length}`);
        if (records.length > 0) break;
      }

      // Prüfen, ob Datensätze gefunden wurden
      if (records.length === 0) {
        const allDeliveryDays = await GermanyMin15Prices.find().distinct('Delivery day');
        console.log(`Keine Datensätze in min15Prices für ${dateStr}. Verfügbare Delivery day Werte: ${allDeliveryDays}`);
        return res.status(404).json({
          error: `Keine 15-Minuten-Daten für ${dateStr} gefunden. Verfügbare Delivery day Werte: ${allDeliveryDays.join(', ') || 'keine'}`,
        });
      }

      const record = records[0];
      console.log('Gefundener min15Prices-Datensatz:', JSON.stringify(record, null, 2));

      // Labels und Werte für 15-Minuten-Intervalle erstellen
      labels = [];
      values = [];
      for (let h = 1; h <= 24; h++) {
        if (h === 3) {
          // Spezielle Behandlung für Stunde 3 mit 8 Viertelstunden
          ['Hour 3A Q1', 'Hour 3A Q2', 'Hour 3A Q3', 'Hour 3A Q4', 'Hour 3B Q1', 'Hour 3B Q2', 'Hour 3B Q3', 'Hour 3B Q4'].forEach((field, i) => {
            const hour = Math.floor(i / 4) + 3;
            const minute = (i % 4) * 15;
            labels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || null;
            values.push(value ? parseFloat(value) * 0.1 : null); // EUR/MWh -> ct/kWh
            console.log(`Feld ${field}: ${JSON.stringify(record[field])}, Geparselter Wert: ${value}`);
          });
        } else {
          // Normale Viertelstunden für andere Stunden
          for (let q = 1; q <= 4; q++) {
            const field = `Hour ${h} Q${q}`;
            labels.push(`${h.toString().padStart(2, '0')}:${((q - 1) * 15).toString().padStart(2, '0')}`);
            const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || null;
            values.push(value ? parseFloat(value) * 0.1 : null); // EUR/MWh -> ct/kWh
            console.log(`Feld ${field}: ${JSON.stringify(record[field])}, Geparselter Wert: ${value}`);
          }
        }
      }
      console.log('Erstellte Labels für 15min:', JSON.stringify(labels));
      console.log('Geparselte Werte für 15min:', JSON.stringify(values));
    }

    // Daten für die Antwort formatieren
    data = labels.map((time, i) => ({ time, value: values[i] || null }));
    console.log(`Rückgabe von ${data.length} Datenpunkten für ${dateStr} (${interval})`, JSON.stringify(data, null, 2));
    res.status(200).json({ documents: data, interval });
  } catch (error) {
    console.error('API-Fehler:', error);
    res.status(500).json({ error: `Datenabfrage fehlgeschlagen: ${error.message}` });
  }
}