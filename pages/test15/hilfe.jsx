import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faVideo } from '@fortawesome/free-solid-svg-icons';
import VideosPage from '../test/video1';
import LoadingScreen from '../loading/Loadingscreen';

const Energiemanager = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (replace with actual data fetching if needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as needed (e.g., 2000ms = 2 seconds)

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // If loading is true, show the LoadingScreen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>
        {`
          .layout {
            width: 100%;
            display: grid;
            grid:
              "header header" auto
              "sidebar main" 1fr
              "footer footer" auto
              / 200px 1fr;
            min-height: 100vh;
            background-color: #fafafa;
            font-family: 'Manrope', 'Noto Sans', sans-serif;
          }
          .header {
            grid-area: header;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 6px 24px;
            background: linear-gradient(90deg, #063d37, #063d37);
            border-bottom: 1px solid #D1D5DB;
          }
          .header-logo {
            width: 125px;
            height: 47.5px;
            object-fit: contain;
          }
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
            background-color: #063d37;
          }
          .sidebar a.active {
            background-color: #063d37;
          }
          .sidebar a p {
            text-align: center;
            font-size: 12px;
            font-weight: 500;
            margin: 0;
          }
          .main {
            grid-area: main;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .overview-box {
            background-color: #fafafa;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #D1D5DB;
          }
          .overview-box p {
            color: #063d37;
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0;
          }
          .content-box {
            background-color: #fafafa;
            border-radius: 12px;
            padding: 24px;
            flex: 1;
          }
          .footer {
            grid-area: footer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 48px;
            background: linear-gradient(90deg, #063d37, #063d37);
            border-top: 1px solid #D1D5DB;
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
            .header {
              padding: 6px;
              order: 1;
            }
            .sidebar {
              display: none;
            }
            .main {
              order: 2;
              padding: 12px;
              width: 100%;
            }
            .overview-box, .content-box {
              padding: 12px;
            }
            .footer {
              order: 3;
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
              order: 4;
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
              background-color: #063d37;
            }
            .bottom-nav a.active {
              background-color: #063d37;
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
        `}
      </style>
      <div className="layout">
        <header className="header">
          <img src="/bilder/ilumylogo2.png" alt="Ilumy Logo" className="header-logo" />
        </header>

        <div className="sidebar">
          <div className="flex flex-col gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmnxnxpn4igDe4BfK3Jk0-s2CVTa4kG5bBXQK5Q3sz97EVpfvDRNoYRZ6IEY1cwzMbdDYAvnZyx1ElWq2chI_K9WMbnvRtLpaXMuFW17eHrHQGE9L767-I personallyWAxet4V8qjLi4FQMa0xDybtXWlP--5VrYcGVklH6MAfwyPJx0hXFxRrf2ayne-MgYYH6E9dYyqmRLSJvKFlhhylpFvpSyM-aHM2XdirG1dzKHzCiz6QAbBjL1skTZVWmnyTGnWwgYTfOZymx-fv0Dms")`,
              }}
            />
            <div className="flex flex-col gap-1">
              <a href="/test15/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '20px' }} />
                <p>Home</p>
              </a>
              <a href="/test15/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '20px' }} />
                <p>Preis</p>
              </a>
              <a href="/test15/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#fafafa', fontSize: '20px' }} />
                <p>Rechner</p>
              </a>
              <a href="/test15/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '20px' }} />
                <p>Detail-Rechner</p>
              </a>
              <a href="/test15/hilfe-videos" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white active">
                <FontAwesomeIcon icon={faVideo} style={{ color: '#fafafa', fontSize: '20px' }} />
                <p>Hilfe Videos</p>
              </a>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="content-box">
            <VideosPage />
          </div>
        </div>

        <footer className="footer"></footer>

        <nav className="bottom-nav">
          <a href="/test15/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p>Home</p>
          </a>
          <a href="/test15/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p>Preis</p>
          </a>
          <a href="/test15/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p>Rechner</p>
          </a>
          <a href="/test15/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p>Detail</p>
          </a>
          <a href="/test15/hilfe-videos" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white active">
            <FontAwesomeIcon icon={faVideo} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p>Hilfe Videos</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;