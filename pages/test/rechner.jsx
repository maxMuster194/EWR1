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
import Profil10 from './Profil10'; // Mobile profile
import Profil9 from './Profil9'; // Desktop profile
import LoadingScreen from '../loading/Loadingscreen';

// Register Chart.js components
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

// Simple LoadingScreen component (replace with your own if you have one)


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
      ". ." 12px
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      ". ." 12px
      "footer footer" auto
      / 200px 1fr;
    padding-top: 2.5rem;
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
    padding: 6px 24px;
    background: linear-gradient(90deg, #063d37, #063d37);
    border-bottom: 1px solid #D1D5DB;
    margin: 0;
    border-radius: 0;
  }
  .header-logo {
    width: 125px;
    height: 47.5px;
    object-fit: contain;
  }
  .top-box {
    grid-area: top-box;
    padding: 1.5rem;
    background-color: #fafafa;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #202026;
    border-right: 1px solid #D1D5DB;
    box-sizing: border-box;
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
    color: #FFFFFF !important;
  }
  .sidebar a p {
    text-align: center;
    font-size: 12px;
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
    background-color: #fafafa;
    border-radius: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .content-box {
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
    margin: 0 auto;
  }
  .content-box > div {
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
    padding: 12px 48px;
    background: linear-gradient(90deg, #063d37, #063d37);
    border-top: 1px solid #fafafa;
    margin: 0;
    border-radius: 0;
  }
  .bottom-nav {
    display: none;
  }
  @media (max-width: 1024px) {
    .layout {
      padding-top: 2rem;
      padding-bottom: 2.5rem;
    }
    .main, .bottom-boxes {
      width: 100%;
      max-width: 95vw;
      padding: 1rem;
    }
    .content-box {
      max-width: 90vw;
      max-height: 600px;
    }
    .content-box > div {
      max-width: 90vw;
      max-height: 600px;
    }
    .header-logo {
      width: 80px;
      height: 30.4px;
    }
  }
  @media (max-width: 767px) {
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 1.5rem;
      padding-bottom: 60px;
      min-height: 100vh;
    }
    .header, .footer {
      width: 100%;
      max-width: 100%;
      padding: 6px;
      border: none;
      border-radius: 0;
      position: fixed;
      z-index: 1000;
    }
    .header {
      top: 0;
      border-bottom: 1px solid #D1D5DB;
    }
    .footer {
      bottom: 0;
      padding: 12px;
      border-top: 1px solid #fafafa;
    }
    .sidebar, .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
      display: none;
    }
    .main {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 12px;
      border: none;
      border-radius: 0;
      min-height: calc(100vh - 1.5rem - 4rem - 4rem);
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      background-color: #fafafa;
    }
    .content-box {
      max-width: 100%;
      max-height: none;
      height: 100%;
      border: none;
      border-radius: 0;
      background-color: transparent;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      margin: 0;
    }
    .content-box > div {
      max-width: 100%;
      max-height: none;
      padding: 0.5rem;
      border: none;
      background-color: #FFFFFF;
      border-radius: 8px;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .header-logo {
      width: 60px;
      height: 22.8px;
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
      color: #fafafa;
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
`;

const Energiemanager = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle mobile detection
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);

    // Simulate loading delay (replace with actual data fetching if needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as needed (e.g., 2000ms = 2 seconds)

    // Cleanup both event listener and timer
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // If loading is true, show the LoadingScreen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="layout relative bg-gray-100" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <header className="header">
          <div className="flex items-center">
            <img src="/bilder/ilumylogo2.png" alt="EWR Logo" className="header-logo" />
          </div>
        </header>

        <div className="top-box"><h2>Rechner</h2></div>

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
                <a href="/test/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa' }} />
                  <p className="text-white text-xs font-medium leading-normal">Home</p>
                </a>
                <a href="/test/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa' }} />
                  <p className="text-white text-xs font-medium leading-normal">Preis</p>
                </a>
                <a href="/test/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#063d37] text-white active">
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF' }} />
                  <p className="text-white text-xs font-medium leading-normal">Rechner</p>
                </a>
                <a href="/test/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa' }} />
                  <p className="text-white text-xs font-medium leading-normal">Detail-Rechner</p>
                </a>
                <a href="/test/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-[#063d37] text-white">
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa' }} />
                  <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="main flex flex-col gap-6">
          <div className="content-box flex flex-1 flex-col gap-3 rounded-xl bg-[#fafafa] w-full">
            <div>
              {isMobile ? <Profil10 /> : <Profil9 />}
            </div>
          </div>
        </div>

        <footer className="footer">
          <p className="text-[#fafafa] text-base font-medium leading-normal">© 2025 Energiemanager</p>
        </footer>

        <nav className="bottom-nav">
          <a href="/test/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/test/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/test/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#063d37] text-white active">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/test/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/test/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;