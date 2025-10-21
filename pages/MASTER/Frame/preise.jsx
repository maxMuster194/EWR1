import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Statistik from '@/pages/MASTER/Frame/stk816';
import Durchschnitt from '@/pages/MASTER/Frame/durch18';
import LoadingScreen from '@/pages/loading/Loadingscreen';

const styles = `
  * {
    box-sizing: border-box;
  }
  .layout {
    width: 100%;
    max-width: 100%;
    height: 800px; /* Feste Höhe von 800px */
    display: flex;
    flex-direction: column;
    font-family: Manrope, "Noto Sans", sans-serif;
    background: transparent;
  }
  .main {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: transparent;
    flex: 1;
    overflow: hidden; /* Kein Scrollen im main */
    height: calc(100% - 16px); /* Abzug für padding */
  }
  .content {
    flex: 1;
    padding: 4px;
    border-radius: 8px;
    background: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: calc(50% - 8px); /* Genau 50% minus gap */
  }
  .content > * {
    width: 100%;
    height: 100%;
  }
  .content iframe {
    width: 100%;
    height: 100%;
    max-height: 388px; /* Genau 800px / 2 - Paddings */
    border: none;
    overflow: hidden; /* Kein Scrollen im iframe */
  }
  .chart {
    flex: 1;
    padding: 4px;
    border-radius: 8px;
    background: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: calc(50% - 8px); /* Genau 50% minus gap */
  }
  .chart > * {
    width: 100%;
    height: 100%;
  }
  .chart iframe {
    width: 100%;
    height: 100%;
    max-height: 388px; /* Genau 800px / 2 - Paddings */
    border: none;
    overflow: hidden; /* Kein Scrollen im iframe */
  }
  .bottom-nav {
    display: none;
  }
  @media (min-width: 768px) {
    .main {
      flex-direction: row;
      gap: 8px;
      height: calc(100% - 16px);
    }
    .content, .chart {
      flex: 1;
      height: calc(800px - 32px); /* 800px minus alle Paddings */
      max-height: 768px;
    }
    .content iframe, .chart iframe {
      height: 100%;
      max-height: 760px; /* 768px minus inner padding */
    }
  }
  @media (max-width: 767px) {
    .layout {
      height: 800px; /* Feste Höhe auch für mobile Geräte */
      padding-bottom: 60px; /* Platz für bottom-nav */
    }
    .main {
      padding: 4px;
      height: calc(800px - 60px - 8px); /* 800px minus bottom-nav und padding */
    }
    .content, .chart {
      padding: 2px;
      height: calc(50% - 4px); /* Genau 50% minus gap */
    }
    .content iframe, .chart iframe {
      max-height: 388px; /* (800-60-16)/2 = 388px */
    }
    .content > *, .chart > * {
      font-size: 0.85em;
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
      padding: 4px 0;
      z-index: 1000;
      height: 60px;
    }
    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border-radius: 8px;
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
      font-size: 8px;
      font-weight: 500;
      margin: 0;
    }
    .bottom-nav a svg {
      font-size: 14px;
      color: #fafafa;
    }
  }
  @media (max-width: 500px) {
    .main {
      padding: 2px;
      height: calc(800px - 60px - 4px);
    }
    .content, .chart {
      padding: 2px;
      height: calc(50% - 2px);
    }
    .content iframe, .chart iframe {
      max-height: 394px; /* Angepasst für kleinere Paddings */
    }
    .bottom-nav a {
      padding: 2px;
    }
    .bottom-nav a svg {
      font-size: 12px;
    }
    .bottom-nav a p {
      font-size: 6px;
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
      <div className="layout">
        <div className="main">
          <div className="content">
            <Statistik style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="chart">
            <Durchschnitt style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        <nav className="bottom-nav">
          <a href="/test15/startseite" className="active">
            <FontAwesomeIcon icon={faHouse} />
            <p>Home</p>
          </a>
          <a href="/test15/preise">
            <FontAwesomeIcon icon={faChartLine} />
            <p>Preis</p>
          </a>
          <a href="/test15/rechner">
            <FontAwesomeIcon icon={faCalculator} />
            <p>Rechner</p>
          </a>
          <a href="/test15/details">
            <FontAwesomeIcon icon={faFileLines} />
            <p>Detail</p>
          </a>
          <a href="/test15/hilfe">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <p>Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;