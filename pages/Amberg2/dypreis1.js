import mongoose from 'mongoose';
import GermanyMin15Prices from '/models/min15Prices';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Dynamisch den Line-Chart importieren, um SSR zu vermeiden (klein gehalten: nur Line-Komponente)
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
  loading: () => <p>Lade Chart...</p>, // Kleiner Lade-Indikator, um Bundle klein zu halten
});

// Nur notwendige Chart.js-Komponenten registrieren (reduziert Bundle-Size)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// MongoDB-Verbindung (unverändert)
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian5@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

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

// Parse DD/MM/YYYY to YYYY-MM-DD (unverändert)
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
    console.log('Available fields in data:', Object.keys(data[0] || {}));
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

// CSS angepasst: Alles transparent, damit es sich perfekt an den Eltern-Hintergrund anpasst (z.B. in deiner Energiemanager-Seite). 
// Der Rand um das Input-Feld ist nun ein subtiler weißer/gradient Border, der auf dunklem Hintergrund sichtbar ist (anpassbar, falls Eltern-Hintergrund hell ist).
// Chart-Grid-Linien und Ticks angepasst für bessere Sichtbarkeit auf transparentem/überlagerndem BG.
const styles = `
  .container {
    min-height: 100vh;
    padding: 16px;
    background-color: transparent !important; /* Force transparent, passt sich Eltern an */
    font-family: 'Manrope', 'Noto Sans', sans-serif;
    color: #FFFFFF;
  }
  .content {
    max-width: 1280px;
    margin: 0 auto;
    background-color: transparent !important;
  }
  .gradient-heading {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
  .react-datepicker-wrapper {
    display: block;
    width: 100%;
    max-width: 300px;
    background-color: transparent !important;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 8px;
    background-color: transparent !important; /* Passt sich an */
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.3); /* Subtiler, anpassungsfähiger Rand (weiß-transparent, sichtbar auf dunkel) */
    border-radius: 6px;
    font-size: 14px;
    font-family: 'Manrope', 'Noto Sans', sans-serif;
    transition: all 0.2s;
  }
  .react-datepicker__input-container input:focus {
    outline: none;
    border: 1px solid #905fa4; /* Gradient-Farbe im Fokus */
    background: rgba(144, 95, 164, 0.1) !important; /* Leichter Overlay für Interaktion */
  }
  .react-datepicker {
    background-color: rgba(0, 0, 0, 0.8); /* Popup etwas abgedunkelt für Lesbarkeit, aber transparenter Rand */
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-family: 'Manrope', 'Noto Sans', sans-serif;
  }
  .react-datepicker__header {
    background-color: rgba(0, 0, 0, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: #FFFFFF;
  }
  .react-datepicker__day:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    color: #FFFFFF;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    color: #FFFFFF;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #FFFFFF;
  }
  canvas {
    background-color: transparent !important; /* Chart passt sich perfekt an Eltern-BG an */
  }
  /* Chart-Anpassungen für transparente Überlagerung: Heller Grid für Sichtbarkeit */
  .chartjs-render-monitor {
    background-color: transparent !important;
  }
`;

export default function DynamischerPreis({ data = [], uniqueDates = [], todayBerlin, error }) {
  const initialDate = uniqueDates.includes(todayBerlin) ? todayBerlin : uniqueDates[0] || '';
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);

  if (error) {
    return (
      <div className="container flex items-center justify-center">
        <p className="text-lg font-semibold text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  if (data.length === 0 || uniqueDates.length === 0) {
    return (
      <div className="container flex items-center justify-center">
        <p className="text-lg font-semibold text-red-600">
          {data.length === 0
            ? 'Keine Daten in der Datenbank gefunden.'
            : 'Keine gültigen Datumswerte im Feld "Delivery day" gefunden.'}
        </p>
      </div>
    );
  }

  // Define price fields (minimiert: nur notwendig)
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

  // Prepare chart data (minimiert: Keine unnötigen Features)
  const chartData = {
    labels: priceFields.map((field, index) => {
      let hourNum;
      if (field.includes('Hour 3A')) {
        hourNum = 3;
      } else {
        hourNum = Math.floor(index / 4) + 1;
      }
      const quarterNum = (index % 4) * 15;
      return `${(hourNum - 1).toString().padStart(2, '0')}:${quarterNum.toString().padStart(2, '0')}`;
    }),
    datasets: filteredData.length > 0 ? [{
      label: `Preise am ${selectedDate ? selectedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}`,
      data: priceFields.map(field => {
        const record = filteredData[0];
        const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
        return parseFloat(value) / 10; // Korrektur: Werte durch 10 teilen, um das Komma eine Stelle nach rechts zu verschieben (z.B. 90 -> 9.0 Cent)
      }),
      borderColor: '#905fa4',
      backgroundColor: 'rgba(144, 95, 164, 0.2)',
      fill: true,
      tension: 0.4,
      spanGaps: true,
      borderWidth: 1,
      pointRadius: 2,
      pointBackgroundColor: '#905fa4',
    }] : [],
  };

  // Chart options (erweitert für bessere Sichtbarkeit auf transparentem BG)
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF' },
    },
    scales: {
      y: {
        title: { display: true, text: 'Preis (ct/kWh)', color: '#FFFFFF' },
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.2)' }, // Etwas heller für Sichtbarkeit
        ticks: { color: '#FFFFFF' },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', color: '#FFFFFF' },
        ticks: {
          callback: function (value, index) {
            if (index % 4 === 0) {
              const hourNum = Math.floor(index / 4);
              return `${hourNum.toString().padStart(2, '0')}:00`;
            }
            return null;
          },
          maxTicksLimit: 24,
          color: '#FFFFFF',
        },
        grid: { color: 'rgba(255, 255, 255, 0.2)' }, // Etwas heller
      },
    },
    maintainAspectRatio: false,
  };

  // Convert uniqueDates to Date objects
  const validDates = uniqueDates.map(date => new Date(date));

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="content">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold gradient-heading">
              Aktueller Strompreis Dynamischer Tarif
            </h1>
          </div>
          {/* Date selection */}
          <div className="mb-6">
            <label htmlFor="date-picker" className="block text-sm font-medium text-white mb-1">
              Datum auswählen:
            </label>
            <DatePicker
              id="date-picker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              includeDates={validDates}
              dateFormat="dd.MM.yyyy"
              className="mt-1 block w-full max-w-xs p-2 rounded-md text-white"
              placeholderText="Datum auswählen"
              disabled={uniqueDates.length === 0}
            />
          </div>
          {/* Line chart */}
          {chartData.datasets.length > 0 && chartData.datasets[0].data.some(d => d !== 0) ? (
            <div className="mb-8" style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-center text-red-600">Keine Preisdaten für das ausgewählte Datum verfügbar oder alle Werte sind 0.</p>
          )}
        </div>
      </div>
    </>
  );
}