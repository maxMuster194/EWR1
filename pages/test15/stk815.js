import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker'; // Import react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS for datepicker

// Dynamisch den Line-Chart importieren, um SSR zu vermeiden
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Chart.js-Komponenten registrieren
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

// Funktion zur Berechnung der ISO-Kalenderwoche (KW)
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
}

// Formatierung der KW als String, z.B. "KW 42 2025"
function formatWeek(weekObj) {
  return `KW ${weekObj.week} ${weekObj.year}`;
}

export async function getServerSideProps() {
  try {
    await connectDB();
    const data = await GermanyMin15Prices.find({}).lean();
    console.log('Available fields in data:', Object.keys(data[0] || {})); // Debug: Verfügbare Felder
    const parsedDates = data.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null);
    const uniqueWeeks = [...new Set(parsedDates.map(date => {
      const weekObj = getISOWeek(new Date(date));
      return JSON.stringify(weekObj);
    }))].map(str => JSON.parse(str));
    const todayBerlin = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
    const currentWeek = getISOWeek(new Date(todayBerlin));

    return {
      props: {
        data: JSON.parse(JSON.stringify(data)),
        uniqueWeeks: uniqueWeeks || [],
        currentWeek,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error in getServerSideProps:', { message: err.message, stack: err.stack });
    return {
      props: {
        data: [],
        uniqueWeeks: [],
        currentWeek: { year: new Date().getFullYear(), week: 1 },
        error: `Failed to fetch data: ${err.message}`,
      },
    };
  }
}

export default function DynamischerPreis({ data = [], uniqueWeeks = [], currentWeek, error }) {
  const initialWeek = uniqueWeeks.find(w => w.year === currentWeek.year && w.week === currentWeek.week) || uniqueWeeks[0] || null;
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  if (data.length === 0 || uniqueWeeks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-900">
          {data.length === 0
            ? 'Keine Daten in der Datenbank gefunden.'
            : 'Keine gültigen Kalenderwochen gefunden.'}
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

  // Filter data for the selected week
  const filteredData = selectedWeek
    ? data.filter(record => {
        const date = parseDeliveryDay(record['Delivery day']);
        if (!date) return false;
        const weekObj = getISOWeek(new Date(date));
        return weekObj.year === selectedWeek.year && weekObj.week === selectedWeek.week;
      })
    : [];
  console.log('Filtered data for week:', filteredData); // Debug log

  // Berechne Durchschnittspreise pro 15-Min-Slot über alle Tage der Woche
  const averagePrices = priceFields.map((field, index) => {
    const values = filteredData.map(record => {
      const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
      return parseFloat(value);
    }).filter(v => !isNaN(v));
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    console.log(`Field: ${field}, Average: ${avg}`); // Debug-Log
    return avg;
  });

  // Prepare chart data for the selected week (using averages)
  const chartData = {
    labels: priceFields.map((field, index) => {
      // Korrigierte Labels-Generierung: Direkt aus index berechnen
      let hourNum;
      if (field.includes('Hour 3A')) {
        hourNum = 3;
      } else {
        hourNum = Math.floor(index / 4) + 1; // 0-3 → Hour 1, 4-7 → Hour 2, etc.
      }
      const quarterNum = (index % 4) * 15; // 0 → 0, 1 → 15, 2 → 30, 3 → 45
      return `${(hourNum - 1).toString().padStart(2, '0')}:${quarterNum.toString().padStart(2, '0')}`;
    }),
    datasets: filteredData.length > 0 ? [{
      label: `Durchschnittspreise in ${formatWeek(selectedWeek)}`,
      data: averagePrices,
      borderColor: '#063d37',
      backgroundColor: 'rgba(6, 61, 55, 0.2)',
      fill: true,
      tension: 0.4,
      spanGaps: true,
    }] : [],
  };
  
  // Chart options with customized x-axis ticks to show only full hours
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Durchschnittliche 15-Minuten Strompreise in ${formatWeek(selectedWeek)}` },
    },
    scales: {
      y: {
        title: { display: true, text: 'Preis (ct/kWh)' },
        beginAtZero: false,
      },
      x: {
        title: { display: true, text: 'Uhrzeit' },
        ticks: {
          callback: function (value, index, values) {
            // Nur Labels für volle Stunden anzeigen (index % 4 === 0 entspricht 00, 15, 30, 45; wir wollen nur :00)
            if (index % 4 === 0) {
              const hourNum = Math.floor(index / 4);
              return `${hourNum.toString().padStart(2, '0')}:00`;
            }
            return null; // Keine Beschriftung für 15, 30, 45
          },
          maxTicksLimit: 24, // Maximal 24 Ticks (eine pro Stunde)
        },
      },
    },
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-xl font-semibold" style={{ color: '#063d37' }}>
            Aktueller Strompreis Dynamischer Tarif (Wöchentliche Zusammenfassung)
          </h2>
        </div>
        {/* Week selection with dropdown (since DatePicker doesn't support weeks directly) */}
        <div className="mb-6">
          <label htmlFor="week-select" className="block text-sm font-medium text-black">
            Kalenderwoche auswählen:
          </label>
          <select
            id="week-select"
            value={selectedWeek ? JSON.stringify(selectedWeek) : ''}
            onChange={(e) => setSelectedWeek(JSON.parse(e.target.value))}
            className="mt-1 block w-full max-w-xs p-2 border border-black rounded-md shadow-sm focus:ring-red-500 focus:border-black sm:text-sm text-black"
            disabled={uniqueWeeks.length === 0}
          >
            {uniqueWeeks.map((weekObj) => (
              <option key={JSON.stringify(weekObj)} value={JSON.stringify(weekObj)}>
                {formatWeek(weekObj)}
              </option>
            ))}
          </select>
        </div>

        {/* Line chart */}
        {chartData.datasets.length > 0 && chartData.datasets[0].data.some(d => d !== 0) ? (
          <div className="mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-center text-red-600">Keine Preisdaten für die ausgewählte Kalenderwoche verfügbar oder alle Werte sind 0.</p>
        )}
      </div>
    </div>
  );
}