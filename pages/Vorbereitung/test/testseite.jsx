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
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle, faBolt } from '@fortawesome/free-solid-svg-icons';

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

// Chart data
const consumptionChartData = {
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

const styles = `
  .layout {
    width: 100%;
    display: grid;
    grid:
      "header header" auto
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      "footer footer" auto
      / 200px 1fr;
    gap: 12px;
    min-height: 100vh;
  }
  .header { grid-area: header; }
  .top-box { grid-area: top-box; }
  .sidebar { grid-area: sidebar; }
  .main {
    grid-area: main;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background-color: #4b5563;
    border-radius: 12px;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    padding: 24px;
    background-color: #4b5563;
    border-radius: 12px;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 24px;
    background-color: #4b5563;
    border-radius: 12px;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 16px;
    background-color: #4b5563;
    border-radius: 12px;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
  }
  .content, .chart {
    flex: 1;
    overflow-y: auto;
    max-height: 100vh;
  }
  .footer { grid-area: footer; }

  @media (max-width: 767px) {
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .header, .footer, .sidebar, .main, .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
      width: 100%;
      padding: 12px;
    }
    .extra-box-2 .inner-box {
      max-width: 100%;
    }
    .main {
      flex-direction: column;
    }
    .content, .chart {
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
    .content .flex-col, .chart .flex-col {
      flex-direction: column;
      align-items: center;
    }
    .content .flex-col > div, .chart .flex-col > div {
      width: 100%;
      margin-bottom: 10px;
    }
  }
`;

const Energiemanager = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="layout relative bg-gray-800" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header flex items-center justify-between whitespace-nowrap border-b border-purple-700 px-12 py-4 bg-blue-500">
          <div className="flex items-center gap-5 text-white">
            <div className="size-5">
              <FontAwesomeIcon icon={faBolt} style={{ color: 'currentColor' }} />
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Energiemanager</h2>
          </div>
        </header>

        <div className="top-box p-6 rounded-xl bg-gray-600 border border-purple-700">
  <div className="flex flex-col gap-3 rounded-xl p-6 bg-gray-700 shadow-lg text-center">
    <div className="flex items-center justify-center gap-4">
      <p className="text-white text-2xl font-bold leading-normal">Preisrechner dynamische Tarife</p>
      <a
        href="/calculator"
        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium leading-normal"
      >
        <FontAwesomeIcon icon={faCalculator} style={{ fontSize: '14px' }} />
        Zum Rechner
      </a>
    </div>
    <p className="text-blue-200 text-base font-normal leading-normal">
      Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.
    </p>
  </div>
</div>

        <div className="sidebar w-full p-3 bg-gray-600 border-r border-purple-700">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmnxnxpn4igDe4BfK3Jk0-s2CVTa4kG5bBXQK5Q3sz97EVpfvDRNoYRZ6IEY1cwzMbdDYAvnZyx1ElWq2chI_K9WMbnvRtLpaXMuFW17eHrHQGE9L767-I personallyWAxet4V8qjLi4FQMa0xDybtXWlP--5VrYcGVklH6MAfwyPJx0hXFxRrf2ayne-MgYYH6E9dYyqmRLSJvKFlhhylpFvpSyM-aHM2XdirG1dzKHzCiz6QAbBjL1skTZVWmnyTGnWwgYTfOZymx-fv0Dms")`,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href="/overview"
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <FontAwesomeIcon icon={faHouse} style={{ fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Übersicht</p>
                </a>
                <a href="/consumption" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/production" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/storage" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/help" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-purple-600 text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="content p-6 rounded-xl bg-gray-600">
            <p className="text-white tracking-tight text-3xl font-bold leading-tight text-center">  </p>
            <p className="text-blue-200 text-lg font-normal leading-relaxed text-center mt-2">
            </p>
            <div className="flex flex-col gap-6 mt-6">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-purple-700 bg-gray-700 shadow-lg">
                <p className="text-white text-2xl font-bold leading-normal">Was ist ein dynamischer Stromtarif?</p>
                <p className="text-blue-200 text-base font-normal leading-normal">
                Dynamische Stromtarife sind flexible Strompreise, 
                die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                 Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – 
                 zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
                </p>
              </div>
            </div>
          </div>
          <div className="chart p-6 rounded-xl bg-gray-600">
            <div className="flex flex-col gap-6 px-6 py-6">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-purple-700 p-6 bg-gray-700 shadow-lg">
                <p className="text-white text-lg font-medium leading-normal">Stromverbrauch im Zeitverlauf</p>
                <p className="text-white tracking-tight text-2xl font-bold leading-tight truncate">1200 kWh</p>
                <div className="flex gap-2">
                  <p className="text-blue-200 text-base font-normal leading-normal">Letzte 7 Tage</p>
                  <p className="text-blue-400 text-base font-medium leading-normal">+5%</p>
                </div>
                <div className="flex min-h-[200px] flex-1 flex-col gap-6 py-4">
                  <Line data={consumptionChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-boxes">
  <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-700 shadow-lg border border-purple-700">
    <p className="text-white text-xl font-bold leading-normal">Vorteile</p>
    <ul className="text-blue-200 text-base font-normal leading-relaxed list-disc list-inside space-y-2">
      <li><span className="font-medium">Kostenersparnis:</span> Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</li>
      <li><span className="font-medium">Transparenz:</span> Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</li>
      <li><span className="font-medium">Umweltfreundlich:</span> Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</li>
      <li><span className="font-medium">Anreiz zur Automatisierung:</span> Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</li>
    </ul>
  </div>
</div>

<div className="bottom-boxes">
  <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-700 shadow-lg border border-purple-700">
    <p className="text-white text-xl font-bold leading-normal">Vorteile</p>
    <ul className="text-blue-200 text-base font-normal leading-relaxed list-disc list-inside space-y-2">
      <li><span className="font-medium">Kostenersparnis:</span> Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</li>
      <li><span className="font-medium">Transparenz:</span> Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</li>
      <li><span className="font-medium">Umweltfreundlich:</span> Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</li>
      <li><span className="font-medium">Anreiz zur Automatisierung:</span> Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</li>
    </ul>
  </div>

  <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-700 shadow-lg border border-purple-700 mt-4">
    <p className="text-white text-xl font-bold leading-normal">Nachteile</p>
    <ul className="text-blue-200 text-base font-normal leading-relaxed list-disc list-inside space-y-2">
      <li><span className="font-medium">Preisschwankungen:</span> Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</li>
      <li><span className="font-medium">Technischer Aufwand:</span> Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</li>
      <li><span className="font-medium">Komplexität:</span> Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</li>
      <li><span className="font-medium">Unvorhersehbarkeit:</span> Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</li>
    </ul>
  </div>
</div>

        <div className="extra-box-2">
          <div className="inner-box flex flex-col gap-3 rounded-xl p-4 bg-gray-700 shadow-lg border border-purple-700 text-center">
            <p className="text-white text-lg font-medium leading-normal">Jetzt berechnen, ob der dynamischer Stromtarif für Sie in Frage kommt.</p>
            <p className="text-blue-200 text-base font-normal leading-normal">
            <a
        href="/calculator"
        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium leading-normal"
      >
        <FontAwesomeIcon icon={faCalculator} style={{ fontSize: '14px' }} />
        Zum Rechner
      </a>
            </p>
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