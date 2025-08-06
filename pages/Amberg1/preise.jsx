import React from 'react';
import { Line } from 'react-chartjs-2';
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
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Dypreis0 from '@/pages/dynamisch/dypreis0';

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#4B5563' } },
    y: { grid: { color: '#E5E7EB' }, ticks: { color: '#4B5563' }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: '#4B5563' } },
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
  .header {
    grid-area: header;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    border-bottom: 1px solid #D1D5DB;
    padding: 12px 48px;
    background: linear-gradient(90deg, rgb(67,114,183), rgb(144,95,164));
  }
  .header-logo {
    width: 250px;
    height: 95px;
    object-fit: contain;
  }
  .top-box { grid-area: top-box; }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #1E3A8A;
    border-right: 1px solid #D1D5DB;
  }
  .sidebar .flex {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sidebar a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px;
    border-radius: 12px;
    color: #FFFFFF;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  .sidebar a:hover {
    background-color: #1E40AF;
  }
  .sidebar a p {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    margin: 0;
  }
  .main {
    grid-area: main;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background-color: #F3F4F6;
    border-radius: 12px;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    padding: 24px;
    background-color: #F3F4F6;
    border-radius: 12px;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 24px;
    background-color: #F3F4F6;
    border-radius: 12px;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 16px;
    background-color: #F3F4F6;
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
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #D1D5DB;
    padding: 12px 48px;
    background: linear-gradient(90deg, rgb(67,114,183), rgb(144,95,164));
  }
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
    .header {
      padding: 12px;
    }
    .header-logo {
      width: 150px;
      height: 57px;
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
      margin-bottom: 8px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .sidebar a p {
      text-align: center;
      font-size: 12px;
      font-weight: 500;
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
      <div className="layout relative bg-gray-100" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header">
          <div className="flex items-start">
            <img src="/bilder/AmStrom.jpg" alt="AmStrom Logo" className="header-logo" />
          </div>
        </header>

        <div className="top-box p-6 rounded-xl bg-white border border-gray-300">
          <div className="flex flex-col gap-3 rounded-xl p-6 bg-gray-50 shadow-sm text-center">
            <div className="flex items-center justify-center gap-4">
              <p className="text-blue-600 text-2xl font-bold leading-normal">Preisrechner dynamische Tarife</p>
              <a
                href="/Amberg1/rechner"
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-blue-400 hover:bg-blue-300 text-white text-sm font-medium leading-normal"
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#3B82F6', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </div>
            <p className="text-gray-600 text-base font-normal leading-normal">
              Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.
            </p>
          </div>
        </div>

        <div className="sidebar w-full p-3 bg-blue-900 border-r border-gray-300">
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
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-blue-950 hover:bg-blue-800 text-white"
                >
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#3B82F6', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/consumption" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-blue-800 text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#3B82F6', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/Amberg1/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-blue-800 text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#3B82F6', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/Amberg1/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-blue-800 text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#3B82F6', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/help" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-blue-800 text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#3B82F6', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col">
            <p className="text-blue-600 tracking-tight text-3xl font-bold leading-tight text-center"></p>
            <p className="text-gray-600 text-lg font-normal leading-relaxed text-center mt-2"></p>
            <div className="flex flex-col gap-6 mt-6 flex-1">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-gray-300 bg-gray-50 shadow-sm">
                <p className="text-blue-600 text-2xl font-bold leading-normal">Was ist ein dynamischer Stromtarif?</p>
                <p className="text-gray-600 text-base font-normal leading-normal">
                  Dynamische Stromtarife sind flexible Strompreise, 
                  die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                  Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – 
                  zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
                </p>
              </div>
            </div>
          </div>
          <div className="chart flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col">
            <div className="flex flex-col gap-6 mt-6 flex-1">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-gray-300 p-6 bg-gray-50 shadow-sm">
                <div className="flex min-h-[200px] flex-1 flex-col gap-6 py-4">
                  <Dypreis0 />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-boxes">
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-50 shadow-sm border border-green-500">
            <p className="text-blue-600 text-xl font-bold leading-normal">Vorteile</p>
            <ul className="text-black text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-black">Kostenersparnis:</span> <span className="text-black">Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</span></li>
              <li><span className="font-medium text-black">Transparenz:</span> <span className="text-black">Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</span></li>
              <li><span className="font-medium text-black">Umweltfreundlich:</span> <span className="text-black">Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</span></li>
              <li><span className="font-medium text-black">Anreiz zur Automatisierung:</span> <span className="text-black">Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</span></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-50 shadow-sm border border-red-500 mt-4">
            <p className="text-blue-600 text-xl font-bold leading-normal">Nachteile</p>
            <ul className="text-black text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-black">Preisschwankungen:</span> <span className="text-black">Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</span></li>
              <li><span className="font-medium text-black">Technischer Aufwand:</span> <span className="text-black">Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</span></li>
              <li><span className="font-medium text-black">Komplexität:</span> <span className="text-black">Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</span></li>
              <li><span className="font-medium text-black">Unvorhersehbarkeit:</span> <span className="text-black">Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</span></li>
            </ul>
          </div>
        </div>

        <div className="extra-box-2">
          <div className="inner-box flex flex-col gap-3 rounded-xl p-4 bg-gray-50 shadow-sm border border-gray-300 text-center">
            <p className="text-blue-600 text-lg font-medium leading-normal">Jetzt berechnen, ob der dynamischer Stromtarif für Sie in Frage kommt.</p>
            <p className="text-gray-600 text-base font-normal leading-normal">
              <a
                href="/Amberg1/rechner"
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-blue-400 hover:bg-blue-300 text-white text-sm font-medium leading-normal"
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#3B82F6', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </p>
          </div>
        </div>

        <footer className="footer">
          <p className="text-blue-600 text-base font-medium leading-normal">© 2025 Energiemanager</p>
        </footer>
      </div>
    </>
  );
};

export default Energiemanager;