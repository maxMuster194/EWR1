import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Statistik from '@/pages/MASTER/Frame/stk816';
import Durchschnitt from '@/pages/MASTER/Frame/durch18';
import LoadingScreen from '@/pages/loading/Loadingscreen';

const styles = `
  .layout {
    width: 100%;
    display: grid;
    grid:
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      "footer footer" auto
      / 200px 1fr;
    min-height: 100vh;
    background-color: #757474;
    color: #FFFFFF;
    font-family: 'Manrope, "Noto Sans", sans-serif';
  }
  .top-box {
    grid-area: top-box;
    padding: 8px;
    background-color: #757474;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #757474;
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
    transition: background 0.2s;
    background-color: #757474;
  }
  .sidebar a:hover {
    background: linear-gradient(90deg, #063d37, #063d37);
  }
  .sidebar a.active {
    background: linear-gradient(90deg, #063d37, #063d37);
  }
  .sidebar a.active .fa-house {
    color: #FFFFFF !important;
  }
  .sidebar a p {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    margin: 0;
    color: #FFFFFF;
  }
  .sidebar a svg {
    font-size: 20px;
    color: #FFFFFF;
  }
  .main {
    grid-area: main;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background-color: #757474;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    padding: 24px;
    background-color: #757474;
    color: #FFFFFF;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 24px;
    background-color: #757474;
    color: #FFFFFF;
    border-radius: 12px;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 16px;
    background-color: #1D3050;
    color: #FFFFFF;
    border-radius: 12px;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
    background-color: #757474;
    color: #FFFFFF;
  }
  .content {
    flex: 1;
    padding: 8px;
    border-radius: 12px;
    background-color: #757474;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
  }
  .content > * {
    width: 100%;
    flex: 1;
    color: #FFFFFF;
  }
  .content * {
    font-size: 1.1em;
    color: #FFFFFF;
  }
  .chart {
    flex: 1;
    padding: 24px;
    border-radius: 12px;
    background-color: #757474;
    color: #FFFFFF;
  }
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: linear-gradient(90deg, #063d37, #063d37);
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
      background-color: #757474;
    }
    .top-box, .main, .bottom-boxes, .extra-box-1, .extra-box-2, .footer {
      width: 100%;
      padding: 12px;
      background-color: #757474;
      color: #FFFFFF;
    }
    .sidebar {
      display: none;
    }
    .main {
      flex-direction: column;
      gap: 8px;
    }
    .content {
      padding: 8px;
      background-color: #757474;
    }
    .content * {
      font-size: 1em;
      color: #FFFFFF;
    }
    .chart {
      padding: 12px;
      background-color: #757474;
    }
    .extra-box-2 .inner-box {
      max-width: 100%;
      background-color: #757474;
      color: #FFFFFF;
    }
    .footer {
      padding: 12px;
      background: linear-gradient(90deg, #063d37, #063d37);
    }
    .bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color:rgb(66, 66, 66);
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
      transition: background 0.2s;
      flex: 1;
      text-align: center;
      background-color:rgb(66, 66, 66);
    }
    .bottom-nav a:hover {
      background: linear-gradient(90deg, #063d37, #063d37);
    }
    .bottom-nav a.active {
      background: linear-gradient(90deg, #063d37, #063d37);
    }
    .bottom-nav a.active .fa-house {
      color: #FFFFFF !important;
    }
    .bottom-nav a p {
      text-align: center;
      font-size: 10px;
      font-weight: 500;
      margin: 0;
      color: #FFFFFF;
    }
    .bottom-nav a svg {
      font-size: 18px;
      color: #FFFFFF;
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
      <div className="layout relative">
        <div className="top-box p-3 rounded-xl">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-[#FFFFFF] text-4xl font-bold leading-normal">Preise / Rückblick</p>
          </div>
        </div>

        <div className="sidebar w-full p-3 border-r border-gray-300">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <a href="/MASTER/Mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/MASTER/Mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white active">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/MASTER/Mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/MASTER/Mobiledetails" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/MASTER/Mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1 rounded-xl flex flex-col">
            <Statistik />
          </div>
          <div className="chart flex-1 p-6 rounded-xl flex flex-col">
            <Durchschnitt />
          </div>
        </div>

        <div className="bottom-boxes">
          {/* Add content if needed, matching previous structure */}
        </div>

        <div className="extra-box-1">
          {/* Add content if needed */}
        </div>

      

        

        <nav className="bottom-nav">
          <a href="/MASTER/Mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/MASTER/Mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white active">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/MASTER/Mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/MASTER/Mobile/details" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/MASTER/Mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;