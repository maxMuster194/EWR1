import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Statistik from '../Amberg2/stk816';
import Durchschnitt from '../Amberg2/durch18';
import LoadingScreen from '../loading/Amberg';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');

  html, body {
    background-color: transparent !important;
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  .layout {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 1100px; /* Maximale Höhe auf 1100px beschränkt */
    overflow-y: auto; /* Scrollbar bei Überschreitung der Höhe */
    background: transparent;
    margin: 0 auto; /* Center the layout */
    font-family: 'Manrope', 'Noto Sans', sans-serif;
  }

  .main {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background: transparent;
    flex: 1; /* Nimmt verfügbaren Platz innerhalb des .layout ein */
    margin: 0 auto;
  }

  .content {
    flex: 1;
    overflow: auto;
    padding: 8px;
    border-radius: 12px;
    background: transparent;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    max-width: 100%; /* Ensure content respects container width */
  }

  .content > * {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  .content * {
    font-size: 1.1em;
  }

  .chart {
    flex: 1;
    overflow: auto;
    padding: 24px;
    border-radius: 12px;
    background: transparent;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    max-width: 100%; /* Ensure chart respects container width */
  }

  .bottom-nav {
    display: none;
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    margin: 0 auto;
  }

  @media (max-width: 1024px) {
    .layout, .main, .bottom-nav {
      width: 100%;
      max-width: 95vw; /* Use 95vw for slightly smaller screens */
    }
  }

  @media (max-width: 767px) {
    .layout {
      gap: 12px;
      padding-bottom: 60px;
      max-height: 1100px; /* Maximale Höhe auch für Mobile */
      overflow-y: auto;
      max-width: 100vw; /* Ensure full width on mobile */
      padding: 12px;
    }
    .main {
      flex-direction: column;
      padding: 12px;
      max-width: 100%;
      margin: 0;
    }
    .content {
      max-height: none;
      padding: 8px;
      background: transparent;
      max-width: 100%;
    }
    .content * {
      font-size: 1em;
    }
    .chart {
      max-height: none;
      padding: 12px;
      background: transparent;
      max-width: 100%;
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
      max-width: 1000px; /* Ensure bottom-nav respects max-width */
      margin: 0 auto;
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
      background-color: #063d37;
    }
    .bottom-nav a.active {
      background-color: #063d37;
    }
    .bottom-nav a.active .fa-house {
      color: #fafafa !important;
    }
    .bottom-nav a p {
      text-align: center;
      font-size: 10px;
      font-weight: 500;
      margin: 0;
    }
    .bottom-nav a svg {
      font-size: 18px;
      color: #fafafa;
    }
  }

  /* Ensure iFrame compatibility */
  @container (max-width: 1000px) {
    .layout, .main, .bottom-nav {
      max-width: 100%;
      width: 100%;
    }
  }
`;

const Energiemanager = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="layout" style={{ background: 'transparent', fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <div className="main flex flex-col lg:flex-row gap-6" style={{ background: 'transparent' }}>
          <div className="content flex-1 rounded-xl flex flex-col" style={{ background: 'transparent' }}>
            <Statistik />
          </div>
          <div className="chart flex-1 p-6 rounded-xl flex flex-col" style={{ background: 'transparent' }}>
            <Durchschnitt />
          </div>
        </div>

        <nav className="bottom-nav">
          <a href="/test15/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/test15/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white active">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/test15/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/test15/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/test15/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;