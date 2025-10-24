import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

export default function WeeklyPriceChart() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/15min', { cache: 'no-store' });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const { monthlyData } = await res.json();
        setData(monthlyData || {});
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        setData({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateYearlyAverages = () => {
    const allWeeks = [];
    const weekMap = new Map();

    Object.entries(data).forEach(([monthKey, monthData]) => {
      monthData.forEach(({ kw, average }) => {
        if (!weekMap.has(kw)) {
          weekMap.set(kw, []);
        }
        const avg = parseFloat(average);
        if (!isNaN(avg)) {
          weekMap.get(kw).push(avg);
        }
      });
    });

    for (let kw = 1; kw <= 53; kw++) {
      const kwStr = kw.toString().padStart(2, '0');
      const averages = weekMap.get(kwStr) || [];
      const weeklyAverage = averages.length > 0
        ? (averages.reduce((sum, val) => sum + val, 0) / averages.length).toFixed(2)
        : '–';
      allWeeks.push({ kw: kwStr, average: weeklyAverage });
    }

    return allWeeks;
  };

  if (loading) {
    return <div className="text-center p-4 text-lg text-[#4372b7] rounded-2xl">⏳ Laden…</div>;
  }

  if (!Object.keys(data).length) {
    return <div className="text-center p-4 text-lg text-[#4372b7] rounded-2xl">⚠️ Keine Daten</div>;
  }

  const yearlyAverages = calculateYearlyAverages();

  return (
    <div className="max-w-full mx-auto p-4 bg-transparent rounded-2xl">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-center mb-6">
        Wöchentliche Strompreise 2025
      </h1>
      <div className="bg-transparent p-4 rounded-lg">
        <Line
          data={{
            labels: yearlyAverages.map((week) => `KW ${week.kw}`),
            datasets: [
              {
                label: 'Durchschnittspreise Netto (Cent/kWh)',
                data: yearlyAverages
                  .filter((week) => week.average !== '–')
                  .map((week) => parseFloat(week.average)),
                backgroundColor: 'rgba(0, 0, 0, 0)', // Transparente Füllung
                borderColor: '#905fa4',
                borderWidth: 2,
                fill: false, // Keine Füllung unter der Linie
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#4372b7', font: { size: 12, weight: '500' } },
              },
              tooltip: {
                backgroundColor: '#905fa4',
                titleColor: '#fafafa',
                bodyColor: '#fafafa',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: '#fff',
                  callback: (value) => `${value.toFixed(2)} ct`,
                  font: { size: 10 },
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
              },
              x: {
                ticks: { color: '#fff', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
              },
            },
          }}
        />
      </div>
    </div>
  );
}