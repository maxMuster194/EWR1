import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

// Parse DD/MM/YYYY to YYYY-MM-DD
function parseDeliveryDay(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  const parsedDate = new Date(`${year}-${month}-${day}`);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
}

export default function DynamischerPreis() {
  const [data, setData] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/old_prices'); // Updated to new API route
        const result = await response.json();
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        const fetchedData = result.data || [];
        setData(fetchedData);

        // Extract unique dates
        const dates = [...new Set(fetchedData.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null))];
        setUniqueDates(dates);

        // Set initial selected date
        const todayBerlin = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
        const initialDate = dates.includes(todayBerlin) ? todayBerlin : dates[0] || '';
        if (initialDate) {
          setSelectedDate(new Date(initialDate));
        }
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-gray-600">Lade Daten...</p>
      </div>
    );
  }

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

  // Prepare chart data for the selected date
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
      label: `Preise am ${selectedDate?.toISOString().split('T')[0] || ''}`,
      data: priceFields.map(field => {
        const record = filteredData[0];
        const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
        return parseFloat(value);
      }),
      borderColor: '#063d37',
      backgroundColor: 'rgba(6, 61, 55, 0.2)',
      fill: true,
      tension: 0.4,
      spanGaps: true,
      borderWidth: 1,
      pointRadius: 2,
      pointBackgroundColor: '#063d37',
      pointBorderColor: '#063d37',
      pointBorderWidth: 1,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#04564f',
    }] : [],
  };

  // Chart options with customized x-axis ticks to show only full hours
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
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
            if (index % 4 === 0) {
              const hourNum = Math.floor(index / 4);
              return `${hourNum.toString().padStart(2, '0')}:00`;
            }
            return null;
          },
          maxTicksLimit: 24,
        },
      },
    },
  };

  // Convert uniqueDates to Date objects for the date picker
  const validDates = uniqueDates.map(date => new Date(date));

  return (
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

        {/* Line chart */}
        {chartData.datasets.length > 0 && chartData.datasets[0].data.some(d => d !== 0) ? (
          <div className="mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-center text-red-600">Keine Preisdaten für das ausgewählte Datum verfügbar oder alle Werte sind 0.</p>
        )}
      </div>
    </div>
  );
}