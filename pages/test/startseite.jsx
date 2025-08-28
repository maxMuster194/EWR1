import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import Dypreis0 from '../Presentation/dypreis0';

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
    background-color: #F3F4F6;
  }
  .header {
    grid-area: header;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    border-bottom: 1px solid #D1D5DB;
    padding: 12px 48px;
    background: linear-gradient(90deg, #062316, #409966);
  }
  .header-logo {
    width: 250px;
    height: 95px;
    object-fit: contain;
  }
  .top-box { 
    grid-area: top-box; 
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #202026;
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
    background-color: #062316;
  }
  .sidebar a.active {
    background-color: #062316;
  }
  .sidebar a.active .fa-house {
    color: #FFFFFF !important;
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
  .content {
    flex: 1;
    overflow: auto;
    max-height: 100vh;
  }
  .chart {
    flex: 1;
    overflow: auto;
    max-height: 100vh;
    background-color: #F3F4F6;
  }
  .chart .flex.min-w-[200px] {
    background-color: #F3F4F6;
    border: none;
    box-shadow: none;
  }
  .chart canvas {
    max-width: 100%;
  }
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #D1D5DB;
    padding: 12px 48px;
    background: linear-gradient(90deg, #062316, #409966);
  }
  .bottom-nav {
    display: none;
  }
  @media (max-width: 767px) {
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 60px;
    }
    .header, .top-box, .main, .bottom-boxes, .extra-box-1, .extra-box-2, .footer {
      width: 100%;
      padding: 12px;
    }
    .header {
      padding: 12px;
      order: 1;
    }
    .top-box {
      order: 3;
    }
    .sidebar {
      display: none;
    }
    .main {
      flex-direction: column;
      order: 2;
    }
    .content {
      order: 2;
      max-height: none;
    }
    .chart {
      order: 1;
      max-height: none;
      background-color: #F3F4F6;
      padding: 8px 4px; /* Reduced padding for more chart space */
      width: 100%;
      box-sizing: border-box;
    }
    .chart .flex.min-w-[200px] {
      background-color: #F3F4F6;
      border: none;
      box-shadow: none;
      width: 100%;
      min-width: 0;
    }
    .chart canvas {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
    }
    .bottom-boxes {
      order: 4;
    }
    .extra-box-1 {
      order: 5;
    }
    .extra-box-2 {
      order: 6;
    }
    .footer {
      padding: 12px;
      order: 7;
    }
    .bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #202026;
      border-top: 1px solid #D1D5DB;
      justify-content: space-around;
      align-items: center;
      padding: 8px 0;
      z-index: 1000;
      order: 8;
    }
    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px;
      border-radius: 12px;
      color: #FFFFFF;
      text-decoration: none;
      transition: background-color 0.2s;
      flex: 1;
      text-align: center;
    }
    .bottom-nav a:hover {
      background-color: #062316;
    }
    .bottom-nav a.active {
      background-color: #062316;
    }
    .bottom-nav a.active .fa-house {
      color: #e5dbc1 !important;
    }
    .bottom-nav a p {
      text-align: center;
      font-size: 10px;
      font-weight: 500;
      margin: 0;
    }
    .bottom-nav a svg {
      font-size: 18px;
      color: #e5dbc1;
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
            <img src="/bilder/ilumylogo2.png" alt="Ilumy Logo" className="header-logo" />
          </div>
        </header>

        <div className="top-box p-6 rounded-xl bg-white border border-gray-300">
          <div className="flex flex-col gap-3 rounded-xl p-6 bg-gray-50 shadow-sm text-center">
            <div className="flex items-center justify-center gap-4">
              <p className="text-[#409966] text-2xl font-bold leading-normal">Preisrechner dynamische Tarife</p>
              <a
                href="/Presentation/rechner"
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-[#062316] hover:bg-[#409966] text-white text-sm font-medium leading-normal"
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </div>
            <p className="text-[#202026] text-base font-normal leading-normal">
              Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.
            </p>
          </div>
        </div>

        <div className="sidebar w-full p-3 bg-[#202026] border-r border-gray-300">
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
                  href="/Presentation/startseite"
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#202026] hover:bg-[#D9043D] text-white active"
                >
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/Presentation/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/Presentation/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/Presentation/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/Presentation/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col">
            <p className="text-[#D9043D] tracking-tight text-3xl font-bold leading-tight text-center"></p>
            <p className="text-[#202026] text-lg font-normal leading-relaxed text-center mt-2"></p>
            <div className="flex flex-col gap-6 mt-6 flex-1">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 border border-gray-300 bg-gray-50 shadow-sm">
                <p className="text-[#409966] text-2xl font-bold leading-normal">Was ist ein dynamischer Stromtarif?</p>
                <p className="text-[#202026] text-base font-normal leading-normal">
                  Dynamische Stromtarife sind flexible Strompreise, 
                  die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                  Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – 
                  zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
                </p>
                <a
                  href="/Presentation/kontakt"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 mt-4 rounded-xl bg-[#062316] hover:bg-[#409966] text-white text-lg font-medium leading-normal w-fit mx-auto"
                >
                  <FontAwesomeIcon icon={faUser} style={{ color: '#e5dbc1', fontSize: '19px' }} />
                  Kontakt
                </a>
              </div>
            </div>
          </div>
          <div className="chart flex-1 p-2 rounded-xl flex flex-col"> 
  <div className="flex flex-col gap-2 mt-2 flex-1">
    <div className="flex min-w-[220px] flex-1 flex-col gap-2 rounded-xl p-2">
      <div className="flex min-h-[220px] flex-1 flex-col gap-2 py-2">
        <Dypreis0 />
      </div>
    </div>
  </div>
</div>

        </div>

        <div className="bottom-boxes">
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-50 shadow-sm border border-[#05A696]">
            <p className="text-[#409966] text-xl font-bold leading-normal">Vorteile</p>
            <ul className="text-[#202026] text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-[#202026]">Kostenersparnis:</span> <span className="text-[#202026]">Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</span></li>
              <li><span className="font-medium text-[#202026]">Transparenz:</span> <span className="text-[#202026]">Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</span></li>
              <li><span className="font-medium text-[#202026]">Umweltfreundlich:</span> <span className="text-[#202026]">Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</span></li>
              <li><span className="font-medium text-[#202026]">Anreiz zur Automatisierung:</span> <span className="text-[#202026]">Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</span></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-gray-50 shadow-sm border border-[#D9043D] mt-4">
            <p className="text-[#b81414] text-xl font-bold leading-normal">Nachteile</p>
            <ul className="text-[#202026] text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-[#202026]">Preisschwankungen:</span> <span className="text-[#202026]">Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</span></li>
              <li><span className="font-medium text-[#202026]">Technischer Aufwand:</span> <span className="text-[#202026]">Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</span></li>
              <li><span className="font-medium text-[#202026]">Komplexität:</span> <span className="text-[#202026]">Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</span></li>
              <li><span className="font-medium text-[#202026]">Unvorhersehbarkeit:</span> <span className="text-[#202026]">Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</span></li>
            </ul>
          </div>
        </div>

        <div className="extra-box-2">
          <div className="inner-box flex flex-col gap-3 rounded-xl p-4 bg-gray-50 shadow-sm border border-gray-300 text-center">
            <p className="text-[#409966] text-lg font-medium leading-normal">Jetzt berechnen, ob der dynamischer Stromtarif für Sie in Frage kommt.</p>
            <p className="text-[#202026] text-base font-normal leading-normal">
              <a
                href="/Amberg1/rechner"
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-xl bg-[#062316] hover:bg-[#409966] text-white text-sm font-medium leading-normal"
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </p>
          </div>
        </div>

        <footer className="footer"></footer>

        <nav className="bottom-nav">
          <a href="/layout1/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#D9043D] text-white active">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/layout1/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/layout1/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/layout1/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/layout1/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;