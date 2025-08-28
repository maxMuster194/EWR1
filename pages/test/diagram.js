import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ type, dataPoints, title }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const generateSmoothData = (count) => {
      const data = [];
      for (let i = 0; i < count; i++) {
        const value = 2.5 + Math.sin(i * 0.05) + Math.random() * 0.2;
        data.push(value > 4 ? 4 : value < 1 ? 1 : value);
      }
      return data;
    };

    const labels = Array.from({ length: dataPoints }, (_, i) => 
      i % Math.ceil(dataPoints / 10) === 0 ? `Area ${i + 1}` : ''
    );

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: generateSmoothData(dataPoints),
          fill: type === 'area' || type === 'line' || type === 'polarArea',
          backgroundColor: type === 'polarArea' ? 'rgba(64, 129, 234, 0.7)' : type === 'area' ? 'rgba(64, 129, 234, 0.5)' : 'rgba(64, 129, 234, 0.2)',
          borderColor: 'rgb(64, 129, 234)',
          pointRadius: type === 'radar' ? 0 : 2,
          tension: type === 'line' || type === 'area' ? 0.4 : 0,
          borderWidth: 2,
          pointHoverRadius: 5,
        },
        {
          label: 'Dataset 2',
          data: generateSmoothData(dataPoints).map(v => v + 0.3),
          fill: type === 'area' || type === 'line' || type === 'polarArea',
          backgroundColor: type === 'polarArea' ? 'rgba(234, 88, 12, 0.7)' : type === 'area' ? 'rgba(234, 88, 12, 0.5)' : 'rgba(234, 88, 12, 0.2)',
          borderColor: 'rgb(234, 88, 12)',
          pointRadius: type === 'radar' ? 0 : 2,
          tension: type === 'line' || type === 'area' ? 0.4 : 0,
          borderWidth: 2,
          pointHoverRadius: 5,
        },
      ],
    };

    const options = {
      scales: { 
        r: type === 'radar' || type === 'polarArea' ? { 
          beginAtZero: true, 
          max: 5, 
          ticks: { stepSize: 1, color: '#4B5563', font: { size: 14, weight: '500' } } 
        } : {},
        x: type === 'bar' ? { 
          title: { display: true, text: 'Areas', font: { size: 14, weight: '600', color: '#1F2937' } }, 
          reverse: true, 
          ticks: { maxRotation: 0, minRotation: 0, color: '#4B5563', font: { size: 12 } } 
        } : {},
        y: type === 'bar' || type === 'line' || type === 'area' ? { 
          beginAtZero: true, 
          max: 5, 
          ticks: { stepSize: 1, color: '#4B5563', font: { size: 14, weight: '500' } } 
        } : {},
      },
      plugins: { 
        legend: { 
          position: 'bottom', 
          labels: { font: { size: 14, weight: '500' }, padding: 15, boxWidth: 20, color: '#1F2937' },
          fullSize: true,
        },
        tooltip: { 
          bodyFont: { size: 14, weight: '500' }, 
          titleFont: { size: 16, weight: '600' }, 
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        },
      },
      maintainAspectRatio: false,
      layout: { padding: { bottom: 40 } },
      animation: { duration: 1000, easing: 'easeInOutQuad' },
    };

    chartInstance.current = new Chart(ctx, {
      type: type === 'area' ? 'line' : type,
      data: data,
      options: options,
    });

    return () => chartInstance.current?.destroy();
  }, [type, dataPoints, title]);

  return (
    <div className="w-[400px] h-[450px] p-4 bg-gradient-to-br from-white to-gray-100 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
      <canvas ref={chartRef} />
    </div>
  );
};

const RadarChartComponent = () => {
  return (
    <div className="mx-auto p-8 bg-gradient-to-br from-gray-100 to-white rounded-2xl">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chart Comparisons</h1>
      <div className="flex flex-row space-x-8 justify-center">
        <ChartComponent type="radar" dataPoints={96} title="Radar Chart (96 values)" />
        <ChartComponent type="radar" dataPoints={24} title="Radar Chart (24 values)" />
      </div>
      <div className="flex flex-row space-x-8 justify-center mt-8">
        <ChartComponent type="line" dataPoints={96} title="Line Chart (96 values) → Ideal for time series" />
        <ChartComponent type="line" dataPoints={24} title="Line Chart (24 values) → Ideal for time series" />
      </div>
      <div className="flex flex-row space-x-8 justify-center mt-8">
        <ChartComponent type="bar" dataPoints={96} title="Bar Chart (96 values) → Great for comparison" />
        <ChartComponent type="bar" dataPoints={24} title="Bar Chart (24 values) → Great for comparison" />
      </div>
      <div className="flex flex-row space-x-8 justify-center mt-8">
        <ChartComponent type="area" dataPoints={96} title="Area Chart (96 values) → Emphasizes trends" />
        <ChartComponent type="area" dataPoints={24} title="Area Chart (24 values) → Emphasizes trends" />
      </div>
      <div className="flex flex-row space-x-8 justify-center mt-8">
        <ChartComponent type="polarArea" dataPoints={48} title="Radial Bar Chart (48 values) → Custom Dataset" />
        <ChartComponent type="polarArea" dataPoints={12} title="Radial Bar Chart (12 values) → Compact Dataset" />
      </div>
      <div className="text-center mt-8 text-xl text-gray-700">
        <p>Histogram (96 values) → Suitable for grouping into classes/buckets.</p>
        <p>Heatmap (96 values) → Ideal for a matrix arrangement (e.g., 12×8).</p>
      </div>
    </div>
  );
};

export default RadarChartComponent;