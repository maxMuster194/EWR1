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
    padding: '1.5rem',
    maxWidth: '1440px',
    margin: '0 auto',
    fontFamily: "'Inter', 'Roboto', sans-serif",
    backgroundColor: '#e6e6bf', // Beige
    borderRadius: '12px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#062316', // Dunkelgrün
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: '2.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  chartTitle: {
    fontSize: '1.875rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#062316', // Dunkelgrün
    textAlign: 'center',
  },
  loading: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#062316', // Dunkelgrün
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
  },
  noData: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#062316', // Dunkelgrün
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
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

  if (loading) {
    return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  }

  if (!data.length) {
    return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;
  }

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
        return isNaN(num) ? null : num * 0.1; // Convert to ct/kWh
      })
      .filter((v) => v !== null);

    if (validPrices.length > 0) {
      const avgPrice = validPrices.reduce((sum, val) => sum + val, 0) / validPrices.length;
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { prices: [], date: dateStr };
      }
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
        <h1 style={styles.title}>BÖRSENPREIS ENERGIE</h1>
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Wöchentliche Durchschnittspreise 2025</h2>
          <Line
  data={{
    labels: chartLabels,
    datasets: [
      {
        label: 'Durchschnittspreis (ct/kWh)',
        data: chartData,
        borderColor: '#75ff2b', // Helles Grün
        backgroundColor: 'rgba(64, 153, 102, 0.2)', // Mittelgrün mit Transparenz
        pointBackgroundColor: '#062316', // Dunkelgrün
        pointRadius: 3, // Smaller point size
        pointHoverRadius: 5, // Slightly larger on hover
        fill: true,
        tension: 0.4,
      },
    ],
  }}
  options={{
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: '500',
          },
          color: '#062316', // Dunkelgrün
        },
      },
      tooltip: {
        backgroundColor: '#409966', // Mittelgrün
        titleColor: '#e6e6bf', // Beige
        bodyColor: '#e6e6bf', // Beige
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return value !== null ? `${value} Cent/kWh` : 'Keine Daten';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#062316', // Dunkelgrün
          font: {
            size: 12,
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 20, // Limit number of ticks for readability
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(64, 153, 102, 0.1)', // Mittelgrün mit Transparenz
        },
        ticks: {
          color: '#062316', // Dunkelgrün
          font: {
            size: 12,
          },
          callback: (value) => `${value.toFixed(2)} ct`,
        },
      },
    },
  }}
/>
        </div>
      </div>
    </>
  );
}

export default Statistik;