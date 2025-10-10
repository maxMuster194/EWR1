import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';
import { useState, createContext } from 'react';
import DatePicker from 'react-datepicker'; // Import react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS for datepicker

// MongoDB-Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', { message: err.message, stack: err.stack });
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}

// Parse DD/MM/YYYY to YYYY-MM-DD
function parseDeliveryDay(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  const parsedDate = new Date(`${year}-${month}-${day}`);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
}

export async function getServerSideProps() {
  try {
    await connectDB();
    const data = await GermanyMin15Prices.find({}).lean();
    console.log('Available fields in data:', Object.keys(data[0] || {})); // Debug: Verfügbare Felder
    const uniqueDates = [...new Set(data.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null))];
    const todayBerlin = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

    return {
      props: {
        data: JSON.parse(JSON.stringify(data)),
        uniqueDates: uniqueDates || [],
        todayBerlin,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error in getServerSideProps:', { message: err.message, stack: err.stack });
    return {
      props: {
        data: [],
        uniqueDates: [],
        todayBerlin: new Date().toISOString().split('T')[0],
        error: `Failed to fetch data: ${err.message}`,
      },
    };
  }
}

export const PriceContext = createContext(null);

export default function DynamischerPreis({ data = [], uniqueDates = [], todayBerlin, error }) {
  const initialDate = uniqueDates.includes(todayBerlin) ? todayBerlin : uniqueDates[0] || '';
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  if (data.length === 0 || uniqueDates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-900">
          {data.length === 0
            ? 'Keine Daten in der Datenbank gefunden.'
            : 'Keine gültigen Datumswerte im Feld "Delivery day" gefunden.'}
        </p>
      </div>
    );
  }

  // Define price fields (Hour 1 Q1 to Hour 24 Q4, handling Hour 3A and skipping 3B if null)
  const priceFields = Array.from({ length: 24 }, (_, h) => {
    const hour = h + 1;
    if (hour === 3) {
      return ['Hour 3A Q1', 'Hour 3A Q2', 'Hour 3A Q3', 'Hour 3A Q4'];
    }
    return [
      `Hour ${hour} Q1`,
      `Hour ${hour} Q2`,
      `Hour ${hour} Q3`,
      `Hour ${hour} Q4`,
    ];
  }).flat();

  // Filter data for the selected date
  const filteredData = selectedDate
    ? data.filter(record => parseDeliveryDay(record['Delivery day']) === selectedDate.toISOString().split('T')[0])
    : [];
  console.log('Filtered data:', filteredData); // Debug log

  // Prepare labels
  const labels = priceFields.map((field, index) => {
    // Korrigierte Labels-Generierung: Direkt aus index berechnen
    let hourNum;
    if (field.includes('Hour 3A')) {
      hourNum = 3;
    } else {
      hourNum = Math.floor(index / 4) + 1; // 0-3 → Hour 1, 4-7 → Hour 2, etc.
    }
    const quarterNum = (index % 4) * 15; // 0 → 0, 1 → 15, 2 → 30, 3 → 45
    return `${(hourNum - 1).toString().padStart(2, '0')}:${quarterNum.toString().padStart(2, '0')}`;
  });

  // Prepare data
  const priceData = filteredData.length > 0 ? priceFields.map(field => {
    const record = filteredData[0];
    const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
    console.log(`Field: ${field}, Raw: ${JSON.stringify(record[field])}, Extracted Value: ${value}`); // Debug-Log
    return Math.round(parseFloat(value));
  }) : [];

  // Extract price list for table display and context
  const priceList = labels.map((label, index) => ({
    time: label,
    price: priceData[index] || 0,
  }));

  // Convert uniqueDates to Date objects for the date picker
  const validDates = uniqueDates.map(date => new Date(date));

  // Function to save the current price list to localStorage
  const savePrices = () => {
    const dateKey = selectedDate?.toISOString().split('T')[0] || 'default';
    localStorage.setItem(`prices_${dateKey}`, JSON.stringify(priceList));
    alert('Preise wurden in localStorage gespeichert. Du kannst sie in anderen Teilen deines Projekts abrufen, z.B. mit localStorage.getItem(`prices_${dateKey}`)');
  };

  return (
    <PriceContext.Provider value={{ priceList, selectedDate, setSelectedDate, uniqueDates, validDates }}>
      <div className="min-h-screen p-4" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-xl font-semibold" style={{ color: '#063d37' }}>
              Aktueller Strompreis Dynamischer Tarif
            </h2>
          </div>
          {/* Date selection with calendar picker */}
          <div className="mb-6">
            <label htmlFor="date-picker" className="block text-sm font-medium text-black">
              Datum auswählen:
            </label>
            <DatePicker
              id="date-picker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              includeDates={validDates} // Restrict to valid dates
              dateFormat="yyyy-MM-dd"
              className="mt-1 block w-full max-w-xs p-2 border border-black rounded-md shadow-sm focus:ring-red-500 focus:border-black sm:text-sm text-black"
              placeholderText="Datum auswählen"
              disabled={uniqueDates.length === 0}
            />
          </div>

          {/* Price list as table */}
          {priceList.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Preisliste für das ausgewählte Datum</h3>
              <table className="min-w-full bg-[#00008b] border border-gray-300 text-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Uhrzeit</th>
                    <th className="py-2 px-4 border-b text-left">Preis (ct/kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{item.time}</td>
                      <td className="py-2 px-4 border-b">{item.price.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-red-600">Keine Preisdaten für das ausgewählte Datum verfügbar oder alle Werte sind 0.</p>
          )}

          {/* Save button */}
          {priceList.length > 0 && (
            <div className="text-center">
              <button
                onClick={savePrices}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Preise speichern
              </button>
            </div>
          )}
        </div>
      </div>
    </PriceContext.Provider>
  );
}