import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import Chart.js Line component with SSR disabled
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Import Chart.js components
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Styles object for inline CSS
const styles = {
  container: {
    padding: '2px', // Maximal 2px Abstand zum äußeren Rand
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: "'Inter', 'Roboto', sans-serif",
    backgroundColor: '#f5f5f5', // Neutraler Hintergrund
    borderRadius: '4px', // Schlichterer Radius
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333333',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  chartContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '4px', // Schlichterer Radius
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', // Dezentere Schatten
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: '1.3rem',
    fontWeight: '500',
    marginBottom: '0.8rem',
    color: '#333333',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  loading: {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
  },
  noData: {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
  },
};

// Funktion zur Berechnung der Kalenderwoche
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Statistik component
function Statistik() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);

    async function fetchData() {
      try {
        const res = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
        const json = await res.json();
        const germanyData = json.germany || [];
        if (!germanyData.length) {
          setData([]);
          setLoading(false);
          return;
        }

        const uniqueData = [];
        const seenDates = new Set();
        germanyData.forEach((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          if (!dateKey) return;
          const dateStr = entry[dateKey];
          if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return;
          if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueData.push(entry);
          }
        });

        const sortedData = uniqueData.sort((a, b) => {
          const dateKeyA = Object.keys(a).find((key) => key.includes('Prices - EPEX'));
          const dateKeyB = Object.keys(b).find((key) => key.includes('Prices - EPEX'));
          if (!dateKeyA || !dateKeyB) return 0;
          const [dayA, monthA, yearA] = a[dateKeyA].split('/').map(Number);
          const [dayB, monthB, yearB] = b[dateKeyB].split('/').map(Number);
          return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        setData(sortedData);
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  if (!data.length) return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;

  // Gruppiere Daten nach Kalenderwoche
  const weeklyData = {};
  data.forEach((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    if (!dateKey) return;
    const dateStr = entry[dateKey];
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const weekNumber = getWeekNumber(date);
    const weekKey = `KW${weekNumber}-${year}`;

    const prices = entry.__parsed_extra?.slice(0, 24) || [];
    const validPrices = prices
      .map((v) => {
        const num = typeof v === 'number' ? v : parseFloat(v);
        return isNaN(num) ? null : num * 0.1;
      })
      .filter((v) => v !== null);

    if (validPrices.length > 0) {
      if (!weeklyData[weekKey]) weeklyData[weekKey] = { prices: [], date: dateStr };
      weeklyData[weekKey].prices.push(...validPrices);
    }
  });

  // Berechne wöchentliche Durchschnittspreise
  const chartLabels = [];
  const chartData = [];
  Object.keys(weeklyData)
    .sort((a, b) => {
      const [weekA, yearA] = a.split('-').map((v) => parseInt(v.replace('KW', '')));
      const [weekB, yearB] = b.split('-').map((v) => parseInt(v.replace('KW', '')));
      return yearA === yearB ? weekA - weekB : yearA - yearB;
    })
    .forEach((weekKey) => {
      const prices = weeklyData[weekKey].prices;
      if (prices.length > 0) {
        const avgPrice = (prices.reduce((sum, val) => sum + val, 0) / prices.length).toFixed(2);
        chartLabels.push(weekKey);
        chartData.push(avgPrice);
      }
    });

  return (
    <>
      <Head>
        <title>MongoDB Weekly Prices - Line Chart</title>
      </Head>
      <div style={styles.container}>
        {!isMobile && <h1 style={styles.title}>BÖRSENPREIS ENERGIE</h1>}
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Wöchentliche Durchschnittspreise 2025</h2>
          <div style={{ width: '100%', height: isMobile ? '400px' : '350px' }}>
            <Line
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: 'Durchschnittspreis (ct/kWh)',
                    data: chartData,
                    borderColor: '#75ff2b', // Ursprüngliches helles Grün
                    backgroundColor: 'rgba(64, 153, 102, 0.2)', // Ursprünglicher grünlicher Hintergrund
                    pointBackgroundColor: '#062316', // Ursprüngliches dunkelgrün
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true,
                    tension: 0.3, // Schlichtere Kurve beibehalten
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { font: { size: 12, weight: '500' }, color: '#333333' }, // Neutrale Farbe für Legende
                  },
                  tooltip: {
                    backgroundColor: '#409966', // Ursprüngliche Tooltip-Farbe
                    titleColor: '#e6e6bf',
                    bodyColor: '#e6e6bf',
                    callbacks: {
                      label: (context) => `${context.raw} Cent/kWh`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: '#333333',
                      font: { size: isMobile ? 8 : 10 },
                      callback: function (value, index) {
                        if (isMobile) {
                          const label = this.getLabelForValue(index);
                          return label.replace('-', '\n');
                        }
                        return this.getLabelForValue(index);
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(74, 74, 74, 0.1)' }, // Dezenter Grid-Hintergrund
                    ticks: { color: '#333333', font: { size: isMobile ? 8 : 10 }, callback: (v) => `${v.toFixed(2)} ct` },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Statistik;