import React, { useState, useEffect } from 'react';
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
import Profil9 from './details28'; // Placeholder: Replace with actual component
import Profil10 from './details29'; // Placeholder: Replace with actual component

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

// Sample chart data (placeholder, replace with actual data)
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Energy Usage',
      data: [65, 59, 80, 81, 56, 55],
      fill: true,
      backgroundColor: 'rgba(64, 153, 102, 0.2)',
      borderColor: '#409966',
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#202026' } },
    y: { grid: { color: '#E5E7EB' }, ticks: { color: '#202026' }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: '#202026' } },
  },
};

const styles = `
  .layout {
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    display: grid;
    grid:
      "header header" auto
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      "footer footer" auto
      / minmax(100px, 200px) 1fr;
    gap: 12px;
    padding-top: 5rem;
    padding-bottom: 3rem;
    background-color: #F3F4F6;
    box-sizing: border-box;
  }
  .header {
    grid-area: header;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #062316, #409966);
    border: none;
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
  .top-box {
    grid-area: top-box;
    padding: 1.5rem;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
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
  .sidebar a.active svg {
    color: #FFFFFF !important;
  }
  .sidebar a p {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
  }
  .sidebar a svg {
    font-size: 16px;
  }
  .main {
    grid-area: main;
    width: 1200px;
    max-width: 90vw;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #F3F4F6;
    border: 1px solid #F3F4F6;
    border-radius: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
  }
  .content, .chart {
    flex: 1;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    overflow: hidden;
    max-height: 800px;
    background-color: #FFFFFF;
    padding: 0.75rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .content > div, .chart > div {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    width: 1200px;
    max-width: 90vw;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 1.5rem;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 1rem;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
  }
  .footer {
    grid-area: footer;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #062316, #409966);
    border: none;
    margin: 0;
    border-radius: 0;
  }
  .bottom-nav {
    display: none;
  }
  @media (max-width: 1024px) {
    .layout {
      padding-top: 4rem;
      padding-bottom: 2.5rem;
    }
    .main, .bottom-boxes {
      width: 100%;
      max-width: 95vw;
      padding: 1rem;
    }
    .content, .chart {
      max-height: 600px;
    }
    .header-logo {
      max-width: 160px;
      max-height: 64px;
    }
  }
  @media (max-width: 767px) {
    .layout {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 3rem;
      padding-bottom: 4rem;
      min-height: 100vh;
    }
    .header, .footer {
      width: 100%;
      max-width: 100%;
      padding: 0.5rem;
      border: none;
      border-radius: 0;
      position: fixed;
      z-index: 1000;
    }
    .header {
      top: 0;
    }
    .footer {
      bottom: 0;
    }
    .sidebar, .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
      display: none;
    }
    .main {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0.75rem;
      border: none;
      border-radius: 0;
      min-height: calc(100vh - 3rem - 4rem - 4rem);
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      background-color: #F3F4F6;
    }
    .content, .chart {
      max-height: none;
      border: none;
      border-radius: 8px;
      background-color: #FFFFFF;
      flex-grow: 1;
    }
    .header-logo {
      max-width: 120px;
      max-height: 48px;
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
      height: 4rem;
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
    .bottom-nav a.active svg {
      color: #FFFFFF !important;
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="layout relative bg-gray-100" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header">
          <div className="flex items-center">
            <img src="/bilder/ilumylogo2.png" alt="EWR Logo" className="header-logo" />
          </div>
        </header>

        <div className="top-box"></div>

        <div className="sidebar w-full p-3 bg-[#202026]">
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
                <a href="/layout1/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#062316] text-white">
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/layout1/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#062316] text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/layout1/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#062316] text-white">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/layout1/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#062316] text-white active">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/layout1/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#062316] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1">
            <div>{isMobile ? <Profil10 /> : <Profil9 />}</div>
          </div>
          <div className="chart flex-1">
            <div>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bottom-boxes"></div>
        <div className="extra-box-1"></div>
        <div className="extra-box-2"></div>

        <footer className="footer">
          <p className="text-[#e6e6bf] text-base font-medium leading-normal">© 2025 Energiemanager</p>
        </footer>

        <nav className="bottom-nav">
          <a href="/layout1/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#062316] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/layout1/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#062316] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/layout1/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#062316] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/layout1/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#062316] text-white active">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/layout1/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#062316] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#e5dbc1', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;