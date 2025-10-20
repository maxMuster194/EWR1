import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Statistik from '../Amberg2/stk816';
import Durchschnitt from '../Amberg2/durch18';
import LoadingScreen from '../loading/Amberg';

const styles = `
  * {
    box-sizing: border-box;
  }
  .layout {
    width: 100%;
    max-width: 100%;
    min-height: 100vh; /* Use viewport height instead of fixed 800px */
    display: flex;
    flex-direction: column;
    font-family: Manrope, "Noto Sans", sans-serif;
    background: transparent;
    overflow-x: hidden; /* Prevent horizontal overflow */
  }
  .main {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    background: transparent;
    flex: 1;
    overflow: auto; /* Allow scrolling if content overflows */
  }
  .content {
    flex: 1;
    padding: 6px;
    border-radius: 8px;
    background: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  .content > * {
    width: 100%;
    height: 100%;
    flex: 1;
  }
  .chart {
    flex: 1;
    padding: 6px;
    border-radius: 8px;
    background: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  .chart > * {
    width: 100%;
    height: 100%;
    flex: 1;
  }
  .bottom-nav {
    display: none;
  }
  @media (min-width: 768px) {
    .main {
      flex-direction: row;
      gap: 10px;
    }
    .content, .chart {
      flex: 1;
    }
  }
  @media (max-width: 767px) {
    .layout {
      min-height: calc(100vh - 60px); /* Adjust for bottom-nav height */
      padding-bottom: 60px;
    }
    .main {
      padding: 6px;
    }
    .content, .chart {
      padding: 4px;
    }
    .content > *, .chart > * {
      font-size: 0.9em;
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
      padding: 6px 0;
      z-index: 1000;
      height: 60px;
    }
    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px;
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
      font-size: 10px;
      font-weight: 500;
      margin: 0;
    }
    .bottom-nav a svg {
      font-size: 16px;
      color: #fafafa;
    }
  }
  @media (max-width: 500px) {
    .main {
      padding: 4px;
    }
    .content, .chart {
      padding: 4px;
    }
    .bottom-nav a {
      padding: 4px;
    }
    .bottom-nav a svg {
      font-size: 14px;
    }
    .bottom-nav a p {
      font-size: 8px;
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