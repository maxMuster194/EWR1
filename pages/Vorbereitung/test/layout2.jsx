import React from 'react';
import { Chart as ChartJS, Line } from 'react-chartjs-2';
import {
  Chart as ChartJSInstance,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faSolarPanel, faBatteryThreeQuarters, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

// Chart data
const consumptionChartData = {
  labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  datasets: [
    {
      label: 'Verbrauch (kWh)',
      data: [150, 180, 170, 200, 190, 210, 180],
      borderColor: '#4372B7',
      backgroundColor: 'rgba(67, 114, 183, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#4372B7',
      pointRadius: 4,
    },
  ],
};

const productionChartData = {
  labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  datasets: [
    {
      label: 'Erzeugung (kWh)',
      data: [200, 220, 210, 230, 215, 225, 210],
      borderColor: '#905FA4',
      backgroundColor: 'rgba(144, 95, 164, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#905FA4',
      pointRadius: 4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#333' } },
    y: { grid: { color: '#e0e0e0' }, ticks: { color: '#333' }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: '#333' } },
  },
};

const Energiemanager = () => {
  return (
    <div className="flex flex-col min-h-screen font-roboto bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] text-gray-800">
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#4372B7] to-[#905FA4] flex items-center h-[130px] px-5 shadow-md z-[1000]">
        <img
          src="/styles/bilder/mein-bild.png"
          alt="Energiemanager Logo"
          className="w-[250px] h-[95px] object-contain cursor-pointer transition-transform hover:scale-110"
          onClick={() => window.location.href = '/overview'}
        />
      </header>

      <div className="fixed top-[130px] left-0 w-[80px] h-[calc(100vh-130px)] bg-white text-[#0c1134] flex flex-col items-center p-4 shadow-md z-[998]">
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/overview'} title="Übersicht">
          <FontAwesomeIcon icon={faHouse} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Übersicht</span>
        </div>
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/consumption'} title="Verbrauch">
          <FontAwesomeIcon icon={faChartLine} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Verbrauch</span>
        </div>
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/production'} title="Erzeugung">
          <FontAwesomeIcon icon={faSolarPanel} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Erzeugung</span>
        </div>
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/storage'} title="Speicher">
          <FontAwesomeIcon icon={faBatteryThreeQuarters} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Speicher</span>
        </div>
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/settings'} title="Einstellungen">
          <FontAwesomeIcon icon={faCog} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Einstellungen</span>
        </div>
        <div className="flex flex-col items-center my-4 cursor-pointer transition-all hover:text-[#4372B7] hover:scale-110" onClick={() => window.location.href = '/help'} title="Hilfe">
          <FontAwesomeIcon icon={faQuestionCircle} className="text-2xl mb-1" />
          <span className="text-xs text-[#4372B7]">Hilfe</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center mt-[130px] ml-[80px] p-10 min-h-[calc(100vh-170px)] max-w-7xl mx-auto gap-10">
        <div className="body flex-1 max-w-[700px]">
          <h2 className="text-4xl font-bold text-[#4372B7] mb-4 text-center">Energieübersicht</h2>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dynamischer Stromtarif</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Ein dynamischer Stromtarif passt die Preise in Echtzeit an die Marktsituation an. Nutze günstige Zeiten mit hoher erneuerbarer Energie, um Kosten zu sparen.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Gesamtverbrauch</h3>
            <p className="text-3xl font-bold text-gray-800">1200 kWh</p>
            <p className="text-base font-semibold text-green-600">+5%</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Gesamterzeugung</h3>
            <p className="text-3xl font-bold text-gray-800">1500 kWh</p>
            <p className="text-base font-semibold text-red-600">-2%</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Gesamtspeicherung</h3>
            <p className="text-3xl font-bold text-gray-800">800 kWh</p>
            <p className="text-base font-semibold text-green-600">+10%</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Energieeinsparung</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Tipps zur Reduzierung deines Energieverbrauchs: Nutze energiesparende Geräte, schalte Geräte komplett aus und optimiere deine Heizzeiten.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Strompreisentwicklung</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Die Strompreise schwanken je nach Tageszeit und Nachfrage. Plane deinen Verbrauch in Zeiten niedriger Preise, um Kosten zu senken.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Wetterabhängige Erzeugung</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Die Stromerzeugung durch Solar- und Windkraft hängt stark vom Wetter ab. Überwache die Wettervorhersage, um deine Erzeugung zu optimieren.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Speicherwartung</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Regelmäßige Wartung deines Energiespeichers erhöht die Lebensdauer und Effizienz. Überprüfe den Ladezustand und die Kapazität monatlich.
            </p>
          </div>
        </div>

        <div className="body2 max-w-[500px]">
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Stromverbrauch im Zeitverlauf</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">1200 kWh</p>
            <div className="flex gap-2">
              <p className="text-base text-gray-600">Letzte 7 Tage</p>
              <p className="text-base font-semibold text-green-600">+5%</p>
            </div>
            <div className="min-h-[200px] pt-5">
              <Line data={consumptionChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md mb-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Stromerzeugung im Zeitverlauf</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">1500 kWh</p>
            <div className="flex gap-2">
              <p className="text-base text-gray-600">Letzte 7 Tage</p>
              <p className="text-base font-semibold text-red-600">-2%</p>
            </div>
            <div className="min-h-[200px] pt-5">
              <Line data={productionChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#4372B7] to-[#905FA4] text-center p-5 text-lg z-[999] shadow-[0_-2px_5px_rgba(0,0,0,0.2)]">
        <span className="text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-semibold">© 2025 Energiemanager</span>
      </footer>
    </div>
  );
};

export default Energiemanager;