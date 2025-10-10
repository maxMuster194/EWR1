import mongooseAlias from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';
import dynamic from 'next/dynamic';
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

// Dynamisch den Line-Chart importieren, um SSR zu vermeiden
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Chart.js-Komponenten registrieren
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// MongoDB-Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

async function connectDB() {
  if (mongooseAlias.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    await mongooseAlias.connect(mongoURI);
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

// Funktion zum Sortieren der Wochen chronologisch
function sortWeeks(weeks) {
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.week - b.week;
  });
}

// Server-Side Props
export async function getServerSideProps() {
  try {
    await connectDB();
    const data = await GermanyMin15Prices.find({}).lean();
    console.log('Available fields in data:', Object.keys(data[0] || {}));

    const parsedDates = data.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null);
    const uniqueWeeks = [...new Set(parsedDates.map(date => {
      const weekObj = getISOWeek(new Date(date));
      return JSON.stringify(weekObj);
    }))].map(str => JSON.parse(str));
    const sortedUniqueWeeks = sortWeeks(uniqueWeeks);

    // Berechne Durchschnittspreise pro Woche
    const weeklyAverages = sortedUniqueWeeks.map(weekObj => {
      const filteredData = data.filter(record => {
        const date = parseDeliveryDay(record['Delivery day']);
        if (!date) return false;
        const recordWeek = getISOWeek(new Date(date));
        return recordWeek.year === weekObj.year && recordWeek.week === weekObj.week;
      });

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

      let totalSum = 0;
      let totalCount = 0;

      filteredData.forEach(record => {
        priceFields.forEach(field => {
          const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
          const parsedValue = parseFloat(value);
          if (!isNaN(parsedValue)) {
            totalSum += parsedValue;
            totalCount++;
          }
        });
      });

      return totalCount > 0 ? totalSum / totalCount : 0;
    });

    return {
      props: {
        sortedUniqueWeeks: sortedUniqueWeeks || [],
        weeklyAverages,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error in getServerSideProps:', { message: err.message, stack: err.stack });
    return {
      props: {
        sortedUniqueWeeks: [],
        weeklyAverages: [],
        error: `Failed to fetch data: ${err.message}`,
      },
    };
  }
}

// Haupt-Komponente
export default function DynamischerPreis({ sortedUniqueWeeks = [], weeklyAverages = [], error }) {
  // Fehlerbehandlung
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  // Prüfung auf leere Daten
  if (sortedUniqueWeeks.length === 0 || weeklyAverages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-900">
          Keine gültigen Kalenderwochen oder Durchschnittswerte gefunden.
        </p>
      </div>
    );
  }

  // Chart-Daten vorbereiten
  const chartData = {
    labels: sortedUniqueWeeks.map(weekObj => formatWeek(weekObj)),
    datasets: [{
      label: 'Durchschnittlicher Wochenpreis (ct/kWh)',
      data: weeklyAverages,
      borderColor: '#063d37',
      backgroundColor: 'rgba(6, 61, 55, 0.2)',
      fill: false,
      tension: 0.1,
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  };

  // Chart-Optionen
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Durchschnittliche Strompreise pro Kalenderwoche' },
    },
    scales: {
      y: {
        title: { display: true, text: 'Durchschnittspreis (ct/kWh)' },
        beginAtZero: false,
      },
      x: {
        title: { display: true, text: 'Kalenderwoche' },
      },
    },
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold" style={{ color: '#063d37' }}>
            Durchschnittlicher Strompreis pro Kalenderwoche (Dynamischer Tarif)
          </h2>
        </div>
        {weeklyAverages.some(d => d !== 0) ? (
          <div className="mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-center text-red-600">Keine gültigen Preisdaten verfügbar oder alle Werte sind 0.</p>
        )}
      </div>
    </div>
  );
}