import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faVideo } from '@fortawesome/free-solid-svg-icons';
import VideosPage from '@/pages/MASTER/Frame/video1';
import LoadingScreen from '@/pages/loading/Loadingscreen';

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
      <style>
        {`
          .layout {
            width: 100%;
            display: grid;
            grid:
              "sidebar main" 1fr
              / 200px 1fr;
            min-height: 100vh;
            background-color: #757474;
            color: #FFFFFF;
            font-family: 'Manrope', 'Noto Sans', sans-serif;
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
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background-color: #757474;
          }
          .content-box {
            background-color: #757474;
            border-radius: 12px;
            padding: 24px;
            flex: 1;
            color: #FFFFFF;
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
            .sidebar {
              display: none;
            }
            .main {
              padding: 12px;
              width: 100%;
            }
            .content-box {
              padding: 12px;
              background-color: #757474;
            }
            .bottom-nav {
              display: flex;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background-color:rgb(66, 66, 66);
              border-top: 1px solid #FFFFFF;
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
        `}
      </style>
      <div className="layout">
        <div className="sidebar">
          <div className="flex flex-col gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmnxnxpn4igDe4BfK3Jk0-s2CVTa4kG5bBXQK5Q3sz97EVpfvDRNoYRZ6IEY1cwzMbdDYAvnZyx1ElWq2chI_K9WMbnvRtLpaXMuFW17eHrHQGE9L767-I personallyWAxet4V8qjLi4FQMa0xDybtXWlP--5VrYcGVklH6MAfwyPJx0hXFxRrf2ayne-MgYYH6E9dYyqmRLSJvKFlhhylpFvpSyM-aHM2XdirG1dzKHzCiz6QAbBjL1skTZVWmnyTGnWwgYTfOZymx-fv0Dms")`,
              }}
            />
            <div className="flex flex-col gap-1">
              <a href="/MASTER/Mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faHouse} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                <p>Home</p>
              </a>
              <a href="/MASTER/Mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faChartLine} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                <p>Preis</p>
              </a>
              <a href="/MASTER/Mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                <p>Rechner</p>
              </a>
              <a href="/MASTER/Mobile/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
                <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '20px' }} />
                <p>Detail-Rechner</p>
              </a>
              <a href="/MASTER/Mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white active">
                <FontAwesomeIcon icon={faVideo} style={{ color: '#FFFFFF', fontSize: '20px' }} />
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

        <nav className="bottom-nav">
          <a href="/MASTER/Mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p>Home</p>
          </a>
          <a href="/MASTER/Mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p>Preis</p>
          </a>
          <a href="/MASTER/Mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p>Rechner</p>
          </a>
          <a href="/MASTER/Mobile/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p>Detail</p>
          </a>
          <a href="/MASTER/Mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-white active">
            <FontAwesomeIcon icon={faVideo} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p>Hilfe Videos</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;