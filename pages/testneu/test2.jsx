import React from 'react';
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
  Filler,
} from 'chart.js';

// Registriere Chart.js-Komponenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Placeholder für Icons (kann durch react-icons ersetzt werden)
const Icon = ({ name }) => {
  const icons = {
    House: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
        ></path>
      </svg>
    ),
    ChartLine: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"
        ></path>
      </svg>
    ),
    Sun: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8(O,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0წ0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"
        ></path>
      </svg>
    ),
    BatteryCharging: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Zm48-80v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,0,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z"
        ></path>
      </svg>
    ),
    Gear: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"
        ></path>
      </svg>
    ),
    Question: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
        ></path>
      </svg>
    ),
  };
  return icons[name] || null;
};

const Energiemanager = () => {
  // Diagramm-Daten
  const consumptionData = {
    labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    datasets: [
      {
        label: 'Verbrauch (kWh)',
        data: [150, 180, 170, 200, 190, 210, 180],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3B82F6',
        pointRadius: 4,
      },
    ],
  };

  const productionData = {
    labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    datasets: [
      {
        label: 'Erzeugung (kWh)',
        data: [200, 220, 210, 230, 215, 225, 210],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#8B5CF6',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#bfdbfe' } },
      y: { grid: { color: '#6b7280' }, ticks: { color: '#bfdbfe' }, beginAtZero: true },
    },
    plugins: {
      legend: { labels: { color: '#bfdbfe' } },
    },
  };

  return (
    <>
      <style>
        {`
          .layout {
            width: 100%;
            display: grid;
            grid-template-areas:
              "header header header"
              "sidebar body body2"
              "footer footer footer";
            grid-template-rows: auto 1fr auto;
            grid-template-columns: 200px 1fr 400px;
            gap: 12px;
            min-height: 100vh;
            background-color: #1F2937;
            font-family: Manrope, 'Noto Sans', sans-serif;
          }
          .header { grid-area: header; }
          .sidebar { grid-area: sidebar; }
          .body {
            grid-area: body;
            max-height: 100vh;
            overflow-y: auto;
            padding-bottom: 20px;
            scrollbar-width: thin;
            scrollbar-color: #6B7280 #374151;
          }
          .body2 {
            grid-area: body2;
            position: sticky;
            top: 0;
            align-self: start;
            max-height: 100vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #6B7280 #374151;
          }
          .footer { grid-area: footer; }

          /* Scrollbar für Webkit-Browser */
          .body::-webkit-scrollbar,
          .body2::-webkit-scrollbar {
            width: 8px;
          }
          .body::-webkit-scrollbar-track,
          .body2::-webkit-scrollbar-track {
            background: #374151;
          }
          .body::-webkit-scrollbar-thumb,
          .body2::-webkit-scrollbar-thumb {
            background: #6B7280;
            border-radius: 4px;
          }

          /* Responsive Design */
          @media (max-width: 767px) {
            .layout {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .header, .footer, .sidebar, .body, .body2 {
              width: 100%;
              padding: 12px;
            }
            .body, .body2 {
              position: static;
              max-height: none;
            }
            .sidebar .flex {
              flex-direction: column;
            }
            .sidebar a {
              width: 100%;
              margin-bottom: 10px;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .body .flex-col, .body2 .flex-col {
              flex-direction: column;
              align-items: center;
            }
            .body .flex-col > div, .body2 .flex-col > div {
              width: 100%;
              margin-bottom: 10px;
            }
          }

          /* Zusätzliche Stile für Tailwind-Kompatibilität */
          .bg-gray-800 { background-color: #1F2937; }
          .bg-gray-600 { background-color: #4B5563; }
          .bg-gray-700 { background-color: #374151; }
          .bg-blue-500 { background-color: #3B82F6; }
          .bg-purple-600 { background-color: #8B5CF6; }
          .bg-purple-500 { background-color: #A78BFA; }
          .border-purple-700 { border-color: #6D28D9; }
          .text-white { color: #FFFFFF; }
          .text-blue-200 { color: #BFDBFE; }
          .text-blue-400 { color: #93C5FD; }
          .text-purple-400 { color: #C4B5FD; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          .rounded-xl { border-radius: 0.75rem; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .px-12 { padding-left: 3rem; padding-right: 3rem; }
          .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
          .p-3 { padding: 0.75rem; }
          .p-6 { padding: 1.5rem; }
          .mt-6 { margin-top: 1.5rem; }
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          .gap-5 { gap: 1.25rem; }
          .gap-6 { gap: 1.5rem; }
          .text-xs { font-size: 0.75rem; }
          .text-base { font-size: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-3xl { font-size: 1.875rem; }
          .font-medium { font-weight: 500; }
          .font-bold { font-weight: 700; }
          .leading-normal { line-height: 1.5; }
          .leading-tight { line-height: 1.25; }
          .tracking-tight { letter-spacing: -0.015em; }
          .whitespace-nowrap { white-space: nowrap; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .min-w-[200px] { min-width: 200px; }
          .min-h-[200px] { min-height: 200px; }
          .flex-1 { flex: 1 1 0%; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .size-5 { width: 1.25rem; height: 1.25rem; }
          .size-8 { width: 2rem; height: 2rem; }
          .border { border-width: 1px; }
          .border-b { border-bottom-width: 1px; }
          .border-r { border-right-width: 1px; }
          .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        `}
      </style>
      <div className="layout">
        <header className="header flex items-center justify-between whitespace-nowrap border-b border-purple-700 px-12 py-4 bg-blue-500">
          <div className="flex items-center gap-5 text-white">
            <div className="size-5">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Energiemanager
            </h2>
          </div>
        </header>

        <div className="sidebar w-full p-3 bg-gray-600 border-r border-purple-700">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <img
                  className="rounded-xl size-8"
                  src="https://via.placeholder.com/32"
                  alt="User avatar"
                />
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href="/overview"
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <Icon name="House" />
                  <p className="text-white text-xs font-medium leading-normal">Übersicht</p>
                </a>
                <a
                  href="/consumption"
                  className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white"
                >
                  <Icon name="ChartLine" />
                  <p className="text-white text-xs font-medium leading-normal">Verbrauch</p>
                </a>
                <a
                  href="/production"
                  className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white"
                >
                  <Icon name="Sun" />
                  <p className="text-white text-xs font-medium leading-normal">Erzeugung</p>
                </a>
                <a
                  href="/storage"
                  className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white"
                >
                  <Icon name="BatteryCharging" />
                  <p className="text-white text-xs font-medium leading-normal">Speicher</p>
                </a>
                <a
                  href="/settings"
                  className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white"
                >
                  <Icon name="Gear" />
                  <p className="text-white text-xs font-medium leading-normal">Einstellungen</p>
                </a>
                <a
                  href="/help"
                  className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white"
                >
                  <Icon name="Question" />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="body p-6 rounded-xl bg-gray-600">
          <p className="text-white tracking-tight text-3xl font-bold leading-tight min-w-[200px]">
            Energieübersicht
          </p>
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <h3 className="text-white text-lg font-bold leading-normal">Dynamischer Stromtarif</h3>
              <p className="text-blue-200 text-base font-normal leading-relaxed">
                Ein dynamischer Stromtarif passt die Preise in Echtzeit an die Marktsituation an. Nutze
                günstige Zeiten mit hoher erneuerbarer Energie, um Kosten zu sparen.
              </p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <p className="text-white text-lg font-medium leading-normal">Gesamtverbrauch</p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">1200 kWh</p>
              <p className="text-blue-400 text-base font-medium leading-normal">+5%</p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <p className="text-white text-lg font-medium leading-normal">Gesamterzeugung</p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">1500 kWh</p>
              <p className="text-purple-400 text-base font-medium leading-normal">-2%</p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <p className="text-white text-lg font-medium leading-normal">Gesamtspeicherung</p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">800 kWh</p>
              <p className="text-blue-400 text-base font-medium leading-normal">+10%</p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <h3 className="text-white text-lg font-bold leading-normal">Energieeinsparung</h3>
              <p className="text-blue-200 text-base font-normal leading-relaxed">
                Tipps zur Reduzierung deines Energieverbrauchs: Nutze energiesparende Geräte, schalte
                Geräte komplett aus und optimiere deine Heizzeiten.
              </p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <h3 className="text-white text-lg font-bold leading-normal">Strompreisentwicklung</h3>
              <p className="text-blue-200 text-base font-normal leading-relaxed">
                Die Strompreise schwanken je nach Tageszeit und Nachfrage. Plane deinen Verbrauch in
                Zeiten niedriger Preise, um Kosten zu senken.
              </p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <h3 className="text-white text-lg font-bold leading-normal">Wetterabhängige Erzeugung</h3>
              <p className="text-blue-200 text-base font-normal leading-relaxed">
                Die Stromerzeugung durch Solar- und Windkraft hängt stark vom Wetter ab. Überwache die
                Wettervorhersage, um deine Erzeugung zu optimieren.
              </p>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
              <h3 className="text-white text-lg font-bold leading-normal">Speicherwartung</h3>
              <p className="text-blue-200 text-base font-normal leading-relaxed">
                Regelmäßige Wartung deines Energiespeichers erhöht die Lebensdauer und Effizienz.
                Überprüfe den Ladezustand und die Kapazität monatlich.
              </p>
            </div>
          </div>
        </div>

        <div className="body2 p-6 rounded-xl bg-gray-600">
          <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-purple-700 p-6 bg-gray-700 shadow-lg">
              <p className="text-white text-lg font-medium leading-normal">
                Stromverbrauch im Zeitverlauf
              </p>
              <p className="text-white tracking-tight text-2xl font-bold leading-tight truncate">
                1200 kWh
              </p>
              <div className="flex gap-2">
                <p className="text-blue-200 text-base font-normal leading-normal">Letzte 7 Tage</p>
                <p className="text-blue-400 text-base font-medium leading-normal">+5%</p>
              </div>
              <div className="flex min-h-[200px] flex-1 flex-col gap-6 py-4">
                <Line data={consumptionData} options={chartOptions} />
              </div>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-purple-700 p-6 bg-gray-700 shadow-lg">
              <p className="text-white text-lg font-medium leading-normal">
                Stromerzeugung im Zeitverlauf
              </p>
              <p className="text-white tracking-tight text-2xl font-bold leading-tight truncate">
                1500 kWh
              </p>
              <div className="flex gap-2">
                <p className="text-blue-200 text-base font-normal leading-normal">Letzte 7 Tage</p>
                <p className="text-purple-400 text-base font-medium leading-normal">-2%</p>
              </div>
              <div className="flex min-h-[200px] flex-1 flex-col gap-6 py-4">
                <Line data={productionData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <footer className="footer flex items-center justify-center whitespace-nowrap border-t border-purple-700 px-12 py-4 bg-blue-500">
          <p className="text-white text-base font-medium leading-normal">© 2025 Energiemanager</p>
        </footer>
      </div>
    </>
  );
};

export default Energiemanager;