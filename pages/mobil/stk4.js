import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import Chart.js components with SSR disabled
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });
const Radar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), { ssr: false });

// Import Chart.js components
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale, // Added for radar chart
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, RadialLinearScale, Tooltip, Legend);

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

// Statistik component
function Statistik() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen size
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        const germanyData = json.germany || [];
        setData(germanyData);
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

  // Filtere Daten für den 26. August 2025 und erstelle stündliche Werte
  const hourlyData = data
    .map((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
      if (!dateKey) return null;
      const [day, month, year] = entry[dateKey].split('/').map(Number);
      if (year === 2025 && month === 8 && day === 26) {
        const prices = entry.__parsed_extra?.slice(0, 24) || [];
        return prices.map((v, index) => {
          const num = typeof v === 'number' ? v : parseFloat(v);
          return isNaN(num) ? null : { hour: index, price: num * 0.1 }; // ct/kWh
        }).filter(v => v !== null);
      }
      return null;
    })
    .filter(d => d !== null)
    .flat();

  const chartLabels = hourlyData.map(d => `${d.hour}:00`);
  const chartDataValues = hourlyData.map(d => d.price);

  return (
    <>
      <Head>
        <title>Preise 26. August 2025 - {isMobile ? 'Mobile Ansicht' : 'Desktop Ansicht'}</title>
      </Head>
      <div style={styles.container}>
        <h1 style={styles.title}>BÖRSENPREIS ENERGIE</h1>
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>
            {isMobile ? 'Stündliche Preise 26.08.2025 (Radial)' : 'Stündliche Preise 26.08.2025 (Line)'}
          </h2>
          {isMobile && chartLabels.length && chartDataValues.length ? (
            <Radar
              data={{
                labels: chartLabels,
                datasets: [{
                  label: 'Preis (ct/kWh)',
                  data: chartDataValues,
                  backgroundColor: 'rgba(64, 153, 102, 0.4)', // Stärker gefüllt für radialen Effekt
                  borderColor: '#75ff2b',
                  borderWidth: 2,
                  barThickness: 10, // Versuch, Säulenartigkeit zu simulieren
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { font: { size: isMobile ? 10 : 14, weight: '500' }, color: '#062316' } },
                  tooltip: {
                    backgroundColor: '#409966',
                    titleColor: '#e6e6bf',
                    bodyColor: '#e6e6bf',
                    callbacks: { label: (context) => `${context.raw} Cent/kWh` },
                  },
                },
                scales: {
                  r: {
                    ticks: { font: { size: isMobile ? 10 : 12 }, callback: value => `${value} ct`, beginAtZero: true },
                    angleLines: { display: true },
                    grid: { circular: true },
                  },
                },
              }}
            />
          ) : !isMobile && chartLabels.length && chartDataValues.length ? (
            <Line
              data={{
                labels: chartLabels,
                datasets: [{
                  label: 'Preis (ct/kWh)',
                  data: chartDataValues,
                  borderColor: '#75ff2b',
                  backgroundColor: 'rgba(64, 153, 102, 0.2)',
                  pointBackgroundColor: '#062316',
                  pointBorderColor: '#409966',
                  pointBorderWidth: 2,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  fill: true,
                  tension: 0.4,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { font: { size: 14, weight: '500' }, color: '#062316' } },
                  tooltip: {
                    backgroundColor: '#409966',
                    titleColor: '#e6e6bf',
                    bodyColor: '#e6e6bf',
                    callbacks: { label: (context) => `${context.raw} Cent/kWh` },
                  },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#062316', font: { size: 12 }, maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
                  y: { beginAtZero: true, grid: { color: 'rgba(64, 153, 102, 0.1)' }, ticks: { color: '#062316', font: { size: 12 }, callback: value => `${value.toFixed(2)} ct` } },
                },
              }}
            />
          ) : (
            <div style={styles.noData}>⚠️ Keine Daten für 26.08.2025 verfügbar.</div>
          )}
        </div>
      </div>
    </>
  );
}

export default Statistik;