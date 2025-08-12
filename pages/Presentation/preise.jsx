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
import Statistik from '../Presentation/stk3';
import Durchschnitt from '../Presentation/durch12';

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

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
    grid:
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      / minmax(100px, 120px) 1fr;
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
    max-height: 70px;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .top-box {
    grid-area: top-box;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
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
    background-color: #e6e6bf;
  }
  .sidebar a.active {
    background-color: #e6e6bf;
  }
  .sidebar a.active .fa-chart-line {
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
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    width: 1200px;
    max-width: 90vw;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 1.5rem;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 1rem;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    max-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  .main .content-box, .bottom-boxes .content-box {
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    overflow: hidden;
    max-width: 800px;
    max-height: 800px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  .main .content-box > div, .bottom-boxes .content-box > div {
    border-bottom: 1px solid #D1D5DB;
    padding: 0.75rem;
    background-color: #F9FAFB;
    max-width: 800px;
    max-height: 800px;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    flex-grow: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  .content-box > div:last-child {
    border-bottom: none;
  }
  .content-box > div > * {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    display: block;
    margin: 0 auto;
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
    .main, .bottom-boxes {
      width: 100%;
      max-width: 95vw;
      padding: 1rem;
    }
    .main .content-box, .bottom-boxes .content-box {
      max-width: 90vw;
      max-height: 600px;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .main .content-box > div, .bottom-boxes .content-box > div {
      max-width: 90vw;
      max-height: 600px;
      width: 100%;
      height: 100%;
      flex-shrink: 0;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .header-logo {
      max-width: 160px;
      max-height: 64px;
    }
    .header {
      padding: 0.75rem 1.5rem;
      border-radius: 0;
      border: none;
      margin: 0;
    }
    .footer {
      padding: 0.75rem 1.5rem;
      border-radius: 0;
      border: none;
      margin: 0;
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
    .header, .footer, .sidebar, .main, .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
      width: 100%;
      max-width: 100%;
      padding: 0.5rem;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
    }
    .main, .bottom-boxes {
      max-width: 100%;
      margin: 0;
      padding: 0.75rem;
    }
    .header {
      padding: 0.5rem;
      border-radius: 0;
      border: none;
      margin: 0;
    }
    .footer {
      padding: 0.5rem;
      border-radius: 0;
      border: none;
      margin: 0;
    }
    .header-logo {
      max-width: 120px;
      max-height: 48px;
    }
    .extra-box-2 .inner-box {
      max-width: 100%;
    }
    .content {
      max-height: none;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .main .content-box, .bottom-boxes .content-box {
      max-width: 100%;
      max-height: 500px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .main .content-box > div, .bottom-boxes .content-box > div {
      padding: 0.5rem;
      max-width: 100%;
      max-height: 500px;
      width: 100%;
      height: 100%;
      flex-shrink: 0;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .sidebar {
      padding: 0.5rem;
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
            <img src="/bilder/Ilumylogo2.png" alt="Ilumy Logo" className="header-logo" />
          </div>
        </header>

        <div className="content-wrapper">
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
                  <a
                    href="/Presentation/startseite"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#D9043D] text-white"
                  >
                    <FontAwesomeIcon icon={faHouse} style={{ color: '#75ff2b' }} />
                    <p className="text-white text-xs font-medium leading-normal">Home</p>
                  </a>
                  <a
                    href="/Presentation/preise"
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#D9043D] text-white active"
                  >
                    <FontAwesomeIcon icon={faChartLine} style={{ color: '#75ff2b' }} />
                    <p className="text-white text-xs font-medium leading-normal">Preis</p>
                  </a>
                  <a href="/Presentation/rechner" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                    <FontAwesomeIcon icon={faCalculator} style={{ color: '#75ff2b' }} />
                    <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                  </a>
                  <a href="/Presentation/details" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                    <FontAwesomeIcon icon={faFileLines} style={{ color: '#75ff2b' }} />
                    <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                  </a>
                  <a href="/Presentation/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-[#D9043D] text-white">
                    <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#75ff2b' }} />
                    <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="main flex flex-col gap-6">
            <div className="content flex-1 p-6 rounded-xl bg-white shadow-md flex flex-col">
              <div className="flex flex-col gap-6 mt-6 flex-1">
                <div className="content-box flex min-w-[150px] flex-1 flex-col gap-3 rounded-xl bg-gray-50 shadow-sm">
                  <div>
                    <Statistik />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-boxes">
            <Durchschnitt />
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