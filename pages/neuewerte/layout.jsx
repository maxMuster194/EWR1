import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

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
    background: linear-gradient(90deg, #062316, #409966);
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
  .content, .chart {
    flex: 1;
    overflow: auto;
    max-height: 100vh;
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
  }
  .header-logo {
    width: 150px;
    height: 57px;
  }
  .sidebar {
    display: none;
  }
  .main {
    flex-direction: column;
  }
  .content, .chart {
    max-height: none;
  }
  .extra-box-2 .inner-box {
    max-width: 100%;
  }
  .footer {
    padding: 12px;
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
            <img src="/bilder/ilumylogo2.png" alt="Logo" className="header-logo" />
          </div>
        </header>

        <div className="top-box p-6 rounded-xl bg-white border border-gray-300"></div>

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
                <a href="/neuewerte/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#202026] hover:bg-[#D9043D] text-white active">
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/neuewerte/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/neuewerte/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/neuewerte/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/neuewerte/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col"></div>
          <div className="chart flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col"></div>
        </div>

        <div className="bottom-boxes"></div>

        <div className="extra-box-1"></div>

        <div className="extra-box-2"></div>

        <footer className="footer"></footer>

        <nav className="bottom-nav">
          <a href="/neuewerte/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#D9043D] text-white active">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/neuewerte/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/neuewerte/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/neuewerte/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/neuewerte/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;