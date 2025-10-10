import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Line } from 'react-chartjs-2';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// MongoDB connection
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

export default function Details({ data = [], uniqueDates = [], todayBerlin, error }) {
  const initialDate = uniqueDates.includes(todayBerlin) ? todayBerlin : uniqueDates[0] || '';
  const [selectedDate, setSelectedDate] = useState(initialDate);

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
    ? data.filter(record => parseDeliveryDay(record['Delivery day']) === selectedDate)
    : [];
  console.log('Filtered data:', filteredData); // Debug log

  // Prepare chart data for the selected date
  const chartData = {
    labels: priceFields.map((field, index) => {
      const [hour, quarter] = field.split(' ');
      const hourNum = hour.includes('3A') ? 3 : parseInt(hour.split('Hour ')[1]) - 1;
      const quarterNum = parseInt(quarter.split('Q')[1]) - 1;
      return `${hourNum.toString().padStart(2, '0')}:${(quarterNum * 15).toString().padStart(2, '0')}`;
    }),
    datasets: filteredData.length > 0 ? [{
      label: `Preise am ${selectedDate}`,
      data: priceFields.map(field => {
        const record = filteredData[0];
        const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0; // Fallback für einfache Zahlen
        console.log(`Field: ${field}, Raw: ${JSON.stringify(record[field])}, Extracted Value: ${value}`); // Debug-Log
        return parseFloat(value);
      }),
      borderColor: '#063d37',
      backgroundColor: 'rgba(6, 61, 55, 0.2)',
      fill: false,
      tension: 0.4,
    }] : [],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `15-Minuten Strompreise am ${selectedDate}` },
    },
    scales: {
      y: {
        title: { display: true, text: 'Preis (ct/kWh)' }, // Geändert zu ct/kWh
        beginAtZero: false, // Entfernt beginAtZero, um negative Werte zu zeigen
      },
      x: {
        title: { display: true, text: 'Uhrzeit' },
      },
    },
  };

  // Table headers
  const headers = ['Delivery day', ...priceFields].filter(key => filteredData[0]?.[key] !== undefined);

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-900">15-Minuten Strompreise (Deutschland/Luxemburg)</h1>

        {/* Date selection dropdown */}
        <div className="mb-6">
          <label htmlFor="date-select" className="block text-sm font-medium text-red-700">
            Datum auswählen:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full max-w-xs p-2 border border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm text-red-900"
            disabled={uniqueDates.length === 0}
          >
            <option value="">-- Datum auswählen --</option>
            {uniqueDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
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
          <p className="text-center text-red-600">Keine Preisdaten für das ausgewählte Datum verfügbar oder alle Werte sind 0.</p>
        )}

        {/* Table */}
        {filteredData.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-green-50 border border-red-200">
              <thead className="bg-green-200">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 text-left text-sm font-medium text-red-700 uppercase tracking-wider border-b border-red-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200">
                {filteredData.map((record, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-green-50' : 'bg-green-100'}>
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-2 text-sm text-red-900 whitespace-nowrap"
                      >
                        {record[header] != null
                          ? (record[header].$numberDouble || record[header].$numberInt || record[header]).toString()
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}