import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Statistik from '../test/stk7';
import Durchschnitt from '../test/durch17';

const styles = `
  .layout {
    width: 100%;
    display: grid;
    grid:
      "header header" auto
      "sidebar main" 1fr
      "footer footer" auto
      / 200px 1fr;
    gap: 12px;
    min-height: 100vh;
    background-color: #fafafa;
  }
  .header {
    grid-area: header;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    border-bottom: 1px solid #D1D5DB;
    padding: 6px 24px;
    background: linear-gradient(90deg, #063d37, #063d37);
  }
  .header-logo {
    width: 125px;
    height: 47.5px;
    object-fit: contain;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 120px;
    padding: 12px;
    background-color: #202026;
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
    background-color: #063d37;
  }
  .sidebar a.active {
    background-color: #063d37;
  }
  .sidebar a.active .fa-house {
    color: #fafafa !important;
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
    padding: 12px;
    background-color: #fafafa;
    align-items: flex-start;
  }
  .content, .chart {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
    align-items: flex-start;
  }
  .content > *, .chart > * {
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .content h2, .chart h2 {
    font-size: 1.8em;
    margin: 0 0 8px 0;
    padding: 0;
    color: #063d37;
    font-weight: 700; /* Fett für Überschriften */
  }
  .content * {
    font-size: 1.1em;
  }
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #D1D5DB;
    padding: 12px 48px;
    background: linear-gradient(90deg, #063d37, #063d37);
  }
  .bottom-nav {
    display: none;
  }
  @media (max-width: 767px) {
    .layout {
      grid:
        "header header" auto
        "sidebar main" 1fr
        "footer footer" auto
        / 100px 1fr;
      gap: 8px;
      padding-bottom: 60px;
      background-color: #fafafa;
    }
    .header {
      padding: 4px 12px;
    }
    .header-logo {
      width: 80px;
      height: 30px;
    }
    .sidebar {
      max-width: 100px;
      padding: 8px;
    }
    .sidebar a {
      padding: 6px;
    }
    .sidebar a p {
      font-size: 10px;
    }
    .sidebar a svg {
      font-size: 16px;
    }
    .main {
      flex-direction: column;
      padding: 8px;
      align-items: flex-start;
    }
    .content, .chart {
      max-height: none;
      background-color: #fafafa;
      align-items: flex-start;
    }
    .content h2, .chart h2 {
      font-size: 1.5em;
      margin: 0 0 6px 0;
      color: #063d37;
      font-weight: 700; /* Fett für Überschriften */
    }
    .content > *, .chart > * {
      margin: 0;
      padding: 0;
    }
    .content * {
      font-size: 1em;
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
    }
    .bottom-nav a {
      padding: 6px;
      flex: 1;
      text-align: center;
    }
    .bottom-nav a p {
      font-size: 10px;
    }
    .bottom-nav a svg {
      font-size: 16px;
    }
    .footer {
      padding: 12px;
    }
  }
`;

const Energiemanager = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="layout relative" style={{ backgroundColor: '#fafafa', fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header">
          <div className="flex items-start">
            <img src="/bilder/ilumylogo2.png" alt="Logo" className="header-logo" />
          </div>
        </header>

        <div className="sidebar w-full p-3 bg-[#202026] border-r border-gray-300">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmnxnxpn4igDe4BfK3Jk0-s2CVTa4kG5bBXQK5Q3sz97EVpfvDRNoYRZ6IEY1cwzMbdDYAvnZyx1ElWq2chI_K9WMbnvRtLpaXMuFW17eHrHQGE9L767-I personallyWAxet4V8qjLi4FQMa0xDybtXWlP--5VrYcGVklH6MAfwyPJx0hXFxRrf2ayne-MgYYH6E9dYyqmRLSJvKFlhhylpFvpSyM-aHM2XdirG1dzKHzCiz6QAbBjL1skTZVWmnyTGnWwgYTfOZymx-fv0Dms")` }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <a href="/test/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#202026] hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/test/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white active">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/test/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#fafafa', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/test/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/test/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col gap-6" style={{ backgroundColor: '#fafafa' }}>
          <div className="content flex-1" style={{ backgroundColor: '#fafafa' }}>
            <h2 className="section-title">BÖRSENPREIS ENERGIE</h2>
            <Statistik />
          </div>
          <div className="chart flex-1" style={{ backgroundColor: '#fafafa' }}>
            <h2 className="section-title">Kalkulation Ihrer Einsparmöglichkeiten</h2>
            <Durchschnitt />
          </div>
        </div>

        <nav className="bottom-nav">
          <a href="/test/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/test/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white active">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/test/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/test/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/test/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>

        <footer className="footer">
          <p className="text-white text-sm">© 2025 Energiemanager</p>
        </footer>
      </div>
    </>
  );
};

export default Energiemanager;