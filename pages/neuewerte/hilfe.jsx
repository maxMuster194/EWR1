import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const styles = `
  .layout {
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    padding-top: 5rem;
    padding-bottom: 3rem;
    display: flex;
    flex-direction: column;
    background-color: #F3F4F6;
    box-sizing: border-box;
  }
  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: minmax(100px, 120px) 1fr;
    grid-template-areas: "sidebar main";
    gap: 1rem;
    padding: 2rem 1rem 1rem 0;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: none;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #062316, #409966);
    box-sizing: border-box;
    margin: 0;
    border-radius: 0;
  }
  .header-logo {
    max-width: 200px;
    max-height: 80px;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 120px;
    padding: 0.5rem;
    background-color: #202026;
    border: 1px solid #D1D5DB;
    border-radius: 12px 0 0 12px;
    box-sizing: border-box;
  }
  .sidebar .flex {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .sidebar a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem;
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
  .sidebar a p {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
  }
  .sidebar a svg {
    font-size: 16px;
    color: #e5dbc1 !important;
  }
  .main {
    grid-area: main;
    width: 1200px;
    max-width: 90vw;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .main h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #202026;
    text-align: center;
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #062316, #409966);
    box-sizing: border-box;
    margin: 0;
    border-radius: 0;
  }
  .footer p {
    color: #e6e6bf;
    text-align: center;
    font-size: 1rem;
    font-weight: 500;
  }
  @media (max-width: 1024px) {
    .layout {
      padding-top: 4rem;
      padding-bottom: 2.5rem;
    }
    .content-wrapper {
      grid-template-columns: minmax(80px, 100px) 1fr;
      gap: 0.75rem;
      padding: 1.5rem 0.75rem 0.75rem 0;
    }
    .main {
      width: 100%;
      max-width: 95vw;
      padding: 1rem;
    }
    .header-logo {
      max-width: 160px;
      max-height: 64px;
    }
    .header {
      padding: 0.75rem 1.5rem;
    }
    .footer {
      padding: 0.75rem 1.5rem;
    }
    .sidebar {
      padding: 0.5rem;
      border-radius: 8px 0 0 8px;
    }
    .sidebar a svg {
      font-size: 14px;
    }
  }
  @media (max-width: 767px) {
    .layout {
      padding-top: 3rem;
      padding-bottom: 2rem;
    }
    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem 0.5rem 0.5rem 0;
    }
    .header, .footer, .sidebar, .main {
      width: 100%;
      max-width: 100%;
      padding: 0.5rem;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
    }
    .main {
      max-width: 100%;
      margin: 0;
      padding: 0.75rem;
    }
    .header {
      padding: 0.5rem;
      border: none;
      margin: 0;
    }
    .footer {
      padding: 0.5rem;
      border: none;
      margin: 0;
    }
    .header-logo {
      max-width: 120px;
      max-height: 48px;
    }
    .sidebar {
      border-radius: 8px 8px 0 0;
    }
    .sidebar a svg {
      font-size: 14px;
    }
  }
`;

const Energiemanager = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="layout relative bg-gray-100" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header">
          <div className="flex items-center">
            <img src="/bilder/ilumylogo2.png" alt="Ilumy Logo" className="header-logo" />
          </div>
        </header>

        <div className="content-wrapper">
          <div className="sidebar w-full p-3 bg-[#202026]">
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                   
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <a
                    href="/neuewerte/startseite"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#e6e6bf] text-white"
                  >
                    <FontAwesomeIcon icon={faHouse} style={{ color: '#05A696' }} />
                    <p className="text-white text-xs font-medium leading-normal">Home</p>
                  </a>
                  <a
                    href="/neuewerte/preise"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#e6e6bf] text-white"
                  >
                    <FontAwesomeIcon icon={faChartLine} style={{ color: '#05A696' }} />
                    <p className="text-white text-xs font-medium leading-normal">Preis</p>
                  </a>
                  <a
                    href="/neuewerte/rechner"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#e6e6bf] text-white"
                  >
                    <FontAwesomeIcon icon={faCalculator} style={{ color: '#05A696' }} />
                    <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                  </a>
                  <a
                    href="/neuewerte/details"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#e6e6bf] text-white"
                  >
                    <FontAwesomeIcon icon={faFileLines} style={{ color: '#05A696' }} />
                    <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                  </a>
                  <a
                    href="/neuewerte/hilfe"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white active"
                    style={{ backgroundColor: '#062316' }}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#05A696' }} />
                    <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="main flex flex-col gap-6">
            <h1>Hilfe</h1>
            
          </div>
        </div>

        <footer className="footer">
          <p className="text-[#e6e6bf] text-base font-medium leading-normal">© 2025 Energiemanager</p>
        </footer>
      </div>
    </>
  );
};

export default Energiemanager;