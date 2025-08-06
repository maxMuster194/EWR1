import React from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Dypreis0 from '../dynamisch/dypreis0.js';

const Home = () => {
  const router = useRouter();

  const menuKlick = (item) => {
    const routes = {
      Home: '/final/test',
      Preis: '/final/preis',
      Rechner: '/final/rechner',
      Details: '/final/details',
      Hilfe: '/final/hilfe',
    };
    router.push(routes[item] || '/');
  };

  const handleImportClick = () => {
    alert('Import-Funktion ausgelöst!');
  };

  return (
    <>
      <style jsx>{`
        body {
          margin: 0;
          font-family: 'Roboto', Arial, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          color: #333;
        }

        .top-box {
          width: 100%;
          max-width: 3000px;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(3, 160, 129), rgb(0, 200, 150));
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          font-size: 28px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .logo {
          width: 120px;
          height: 70px;
          margin-left: 50px;
          object-fit: contain;
          cursor: pointer;
          position: relative;
          top: -15px;
        }

        .logo:hover {
          transform: scale(1.1);
        }

        .header-text {
          margin-right: 30px;
          font-weight: 700;
        }

        .sidebar {
          width: 80px;
          background-color: #ffffff;
          color: rgb(3, 160, 129);
          padding: 15px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: fixed;
          top: 70px;
          height: calc(100vh - 70px);
          left: 0;
          z-index: 998;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          margin-top: 30px;
        }

        .sidebar .icon-container {
          margin: 15px 0;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sidebar .icon-container:hover {
          color: rgb(0, 100, 80);
          transform: scale(1.2);
        }

        .sidebar .icon-container .icon {
          font-size: 26px;
          margin-bottom: 5px;
        }

        .sidebar .icon-container .icon-label {
          font-size: 12px;
          color: rgb(3, 160, 129);
          transition: color 0.3s ease;
        }

        .sidebar .icon-container:hover .icon-label {
          color: rgb(0, 100, 80);
        }

        .main-content {
          margin-left: 80px;
          margin-top: 70px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 30px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          min-height: calc(100vh - 110px);
        }

        .main-content h2 {
          font-size: 38px;
          color: rgb(3, 160, 129);
          margin-bottom: 15px;
          font-weight: 700;
          text-align: center;
        }

        .header-text {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .header-button {
          background: rgb(3, 160, 129);
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .header-button:hover {
          background: rgb(0, 100, 80);
          transform: scale(1.05);
        }

        .header-button .chart-icon {
          font-size: 18px;
        }

        .section-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 1100px;
          margin-bottom: 30px;
        }

        .content-section {
          width: 100%;
          max-width: 500px;
          background: transparent;
          padding: 35px;
          border: none;
          box-shadow: none;
        }

        .calculation-prompt {
          background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
          padding: 30px;
          border-radius: 12px;
          margin: 30px auto;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .calculation-prompt:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .calculation-prompt p {
          font-size: 20px;
          line-height: 1.7;
          color: #333;
          margin: 0 0 20px 0;
          font-weight: 500;
        }

        .calculation-button {
          background: linear-gradient(90deg, rgb(3, 160, 129), rgb(0, 200, 150));
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 20px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: inline-block;
        }

        .calculation-button:hover {
          background: linear-gradient(90deg, rgb(0, 100, 80), rgb(0, 150, 120));
          transform: scale(1.05);
        }

        .dirgam-section {
          width: 100%;
          max-width: 500px;
          background: transparent;
          padding: 35px;
          border: none;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dirgam-section h2 {
          font-size: 38px;
          color: rgb(3, 160, 129);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
        }

        .content-section h3 {
          font-size: 26px;
          color: #333;
          margin: 25px 0 15px;
          font-weight: 600;
        }

        .content-section p {
          font-size: 18px;
          line-height: 1.7;
          color: #555;
          margin: 15px 0;
        }

        .content-section ul {
          list-style-type: disc;
          padding-left: 30px;
          font-size: 18px;
          line-height: 1.7;
          color: #555;
          margin: 15px 0;
        }

        .full-width-section {
          width: 100%;
          max-width: 1100px;
          background: transparent;
          padding: 35px;
          border: none;
          box-shadow: none;
          margin-bottom: 30px;
        }

        .full-width-section h3 {
          font-size: 28px;
          color: #333;
          margin: 30px 0 20px;
          font-weight: 700;
          border-bottom: 2px solid rgb(3, 160, 129);
          padding-bottom: 10px;
        }

        .full-width-section h3.disadvantage {
          border-bottom: 2px solid rgb(200, 50, 50);
        }

        .list-box {
          background: #ffffff;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .list-box:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .full-width-section ul {
          list-style-type: disc;
          padding-left: 30px;
          font-size: 18px;
          line-height: 1.8;
          color: #555;
          margin: 0;
        }

        .full-width-section li {
          margin-bottom: 15px;
        }

        .full-width-section li strong {
          color: #333;
          font-weight: 600;
          font-size: 19px;
        }

        .full-width-section li p {
          margin: 0;
          font-size: 17px;
          color: #444;
          line-height: 1.6;
          display: inline;
        }

        .import-button {
          background: rgb(3, 160, 129);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 25px;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .import-button:hover {
          background: rgb(0, 100, 80);
          transform: scale(1.05);
        }

        .footer-box {
          width: 100%;
          max-width: 3000px;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(3, 160, 129), rgb(0, 200, 150));
          color: white;
          text-align: center;
          padding: 25px;
          font-size: 20px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 999;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
          transition: transform 0.3s ease;
        }

        .footer-box:hover {
          transform: translateY(-2px);
        }

        .footer-text {
          background: linear-gradient(90deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 80px;
            padding: 30px 15px;
            flex-direction: column;
          }
          .section-container {
            flex-direction: column;
            align-items: center;
          }
          .content-section,
          .dirgam-section,
          .full-width-section {
            padding: 20px;
            margin-right: 0;
            margin-bottom: 20px;
            max-width: 100%;
          }
          .content-section h2,
          .dirgam-section h2 {
            font-size: 32px;
          }
          .content-section h3,
          .full-width-section h3 {
            font-size: 24px;
          }
          .content-section p,
          .full-width-section li p {
            font-size: 16px;
          }
          .full-width-section ul {
            padding-left: 20px;
            font-size: 16px;
          }
          .full-width-section li {
            margin-bottom: 12px;
          }
          .full-width-section li strong {
            font-size: 17px;
          }
          .list-box {
            padding: 15px;
            margin-bottom: 15px;
          }
          .calculation-prompt {
            max-width: 100%;
            padding: 20px;
          }
          .calculation-prompt p {
            font-size: 18px;
          }
          .calculation-button {
            padding: 12px 30px;
            font-size: 18px;
          }
          .sidebar {
            width: 70px;
          }
          .sidebar .icon-container .icon-label {
            font-size: 10px;
          }
          .header-button {
            padding: 10px 18px;
            font-size: 16px;
          }
          .header-button .chart-icon {
            font-size: 16px;
          }
          .footer-box {
            font-size: 18px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="modules">
        <div className="top-box">
          <img
            src="/bilder/logo.png"
            alt="Logo"
            className="logo"
            onClick={() => menuKlick('Home')}
          />
          <span className="header-text">Header Bild</span>
        </div>

        <div className="sidebar">
          <div className="icon-container" onClick={() => menuKlick('Home')} title="Home">
            <FontAwesomeIcon icon={faHouse} className="icon" />
            <span className="icon-label">Home</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Preis')} title="Preis">
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <span className="icon-label">Preis</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Rechner')} title="Rechner">
            <FontAwesomeIcon icon={faCalculator} className="icon" />
            <span className="icon-label">Rechner</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Details')} title="Details">
            <FontAwesomeIcon icon={faFileLines} className="icon" />
            <span className="icon-label">Details</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Hilfe')} title="Hilfe">
            <FontAwesomeIcon icon={faQuestionCircle} className="icon" />
            <span className="icon-label">Hilfe</span>
          </div>
        </div>

        <div className="main-content" id="main-content">
          <h2>Preisrechner dynamische Tarife <button className="header-button" onClick={() => menuKlick('Rechner')}>
            <FontAwesomeIcon icon={faChartLine} className="chart-icon" />
            Zum Rechner
          </button></h2>
          <p className="header-text">Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.</p>
          
          <div className="section-container">
            <div className="content-section">
              <h3>Was ist ein dynamischer Stromtarif?</h3>
              <p>
                Dynamische Stromtarife sind flexible Strompreise, die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren. Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
              </p>
            </div>

            <div className="dirgam-section">
              <Dypreis0 />
            </div>
          </div>

          <div className="full-width-section">
            <h3>Vorteile</h3>
            <div className="list-box">
              <ul>
                <li>
                  <p><strong>Kostenersparnis:</strong> Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</p>
                </li>
                <li>
                  <p><strong>Transparenz:</strong> Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</p>
                </li>
                <li>
                  <p><strong>Umweltfreundlich:</strong> Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</p>
                </li>
                <li>
                  <p><strong>Anreiz zur Automatisierung:</strong> Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</p>
                </li>
              </ul>
            </div>
            <h3 className="disadvantage">Nachteile</h3>
            <div className="list-box">
              <ul>
                <li>
                  <p><strong>Preisschwankungen:</strong> Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</p>
                </li>
                <li>
                  <p><strong>Technischer Aufwand:</strong> Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</p>
                </li>
                <li>
                  <p><strong>Komplexität:</strong> Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</p>
                </li>
                <li>
                  <p><strong>Unvorhersehbarkeit:</strong> Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="calculation-prompt">
            <p><b>Jetzt berechnen, ob der dynamischer Stromtarif für Sie in Frage kommt.</b></p>
            <button className="calculation-button" onClick={() => menuKlick('Rechner')}>
              Zum Rechner
            </button>
          </div>
        </div>

        <div className="footer-box">
          <span className="footer-text">© 2025 Energie Dashboard</span>
        </div>
      </div>
    </>
  );
};

export default Home;