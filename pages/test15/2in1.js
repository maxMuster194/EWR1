import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('2025-09-10');
  const [data, setData] = useState([{ time: '', value: null }]);
  const [interval, setInterval] = useState('hourly');
  const [status, setStatus] = useState('Lade Daten...');
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setStatus('Lade Daten...');
      try {
        const response = await fetch('/api/combined-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateStr: selectedDate }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Fetch-Fehler: ${response.status}`);
        }
        const { documents, interval } = await response.json();
        if (documents.length === 0) {
          setStatus('Keine Daten gefunden.');
          setData([]);
          return;
        }
        setData(documents);
        setInterval(interval);
        setStatus(`Daten für ${selectedDate} geladen (${documents.length} Punkte).`);
      } catch (error) {
        setStatus(`Fehler: ${error.message}`);
        setData([]);
      }
    };
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(item => item.time),
            datasets: [{
              label: interval === 'hourly' ? 'Stündliche Preise (ct/kWh)' : '15-Minuten Preise (ct/kWh)',
              data: data.map(item => item.value),
              borderColor: interval === 'hourly' ? '#ff6384' : '#36a2eb',
              fill: false,
              pointRadius: interval === 'hourly' ? 5 : 3,
            }]
          },
          options: {
            scales: {
              y: { 
                beginAtZero: true, 
                title: { display: true, text: 'Preis (ct/kWh)' },
                suggestedMax: 50
              },
              x: { title: { display: true, text: 'Uhrzeit' } }
            }
          }
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, interval]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <label htmlFor="datePicker">Datum auswählen:</label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{ margin: '10px' }}
      />
      <div style={{ color: 'green', margin: '10px', whiteSpace: 'pre-wrap' }}>{status}</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas ref={chartRef} width="600" height="600" />
      </div>
    </div>
  );
}