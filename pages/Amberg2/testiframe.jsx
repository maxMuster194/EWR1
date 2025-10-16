import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle, faComment, faBackward, faClock } from '@fortawesome/free-solid-svg-icons';
import mongoose from 'mongoose';
import GermanyMin15Prices from '/models/min15Prices'; // Passe den Pfad an
import DynamischerPreis from '../Amberg2/dypreis1';
import LoadingScreen from '../loading/Loadingscreen';

// MongoDB-Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', { message: err.message, stack: err.stack });
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}

// Parse DD/MM/YYYY to YYYY-MM-DD
function parseDeliveryDay(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  const parsedDate = new Date(`${year}-${month}-${day}`);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
}

export async function getServerSideProps() {
  try {
    await connectDB();
    const data = await GermanyMin15Prices.find({}).lean();
    console.log('Available fields in data:', Object.keys(data[0] || {})); // Debug: Verfügbare Felder
    const uniqueDates = [...new Set(data.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null))];
    const todayBerlin = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

    return {
      props: {
        data: JSON.parse(JSON.stringify(data)),
        uniqueDates: uniqueDates || [],
        todayBerlin,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error in getServerSideProps:', { message: err.message, stack: err.stack });
    return {
      props: {
        data: [],
        uniqueDates: [],
        todayBerlin: new Date().toISOString().split('T')[0],
        error: `Failed to fetch data: ${err.message}`,
      },
    };
  }
}

// Angepasster Stil-Code
const styles = `
  .layout {
    width: 100%;
    display: grid;
    grid:
      "header header" auto
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      "footer footer" auto
      / 200px 1fr;
    min-height: 100vh;
    background-color: transparent; /* Hintergrund auf transparent gesetzt */
    color: #FFFFFF;
  }
  .header {
    grid-area: header;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    border-bottom: 1px solid #4a4a4a; /* Rand für Header */
    padding: 6px 24px;
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .header-logo {
    width: 125px;
    height: 47.5px;
    object-fit: contain;
  }
  .top-box { 
    grid-area: top-box; 
    position: relative;
    background-color: #2a2a2a; /* Einheitliches Grau */
  }
  .top-box .button-container {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
  }
  .top-box .button-container a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    background-color: #4372b7;
    color: #FFFFFF;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    position: relative;
  }
  .top-box .button-container a:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .top-box .button-container a.active {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    color: #FFFFFF;
  }
  .top-box .button-container a .tooltip {
    visibility: hidden;
    width: 120px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    color: #FFFFFF;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    margin-left: -60px;
    margin-top: 8px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .top-box .button-container a:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-right: 1px solid #4a4a4a; /* Rand für Sidebar */
    color: #FFFFFF;
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
    background-color: #4372b7;
  }
  .sidebar a.active {
    background: linear-gradient(90deg, #4372b7, #905fa4);
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
  .main {
    grid-area: main;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
    color: #FFFFFF;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    padding: 24px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
    color: #FFFFFF;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 24px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
    color: #FFFFFF;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 16px;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
    color: #FFFFFF;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
    background-color: #2a2a2a; /* Einheitliches Grau */
  }
  .content {
    flex: 1;
    overflow: auto;
    max-height: 100vh;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
  }
  .chart {
    flex: 1;
    overflow: auto;
    max-height: 100vh;
    background-color: #2a2a2a; /* Einheitliches Grau */
    border-radius: 12px;
  }
  .chart .flex.min-w-[200px] {
    background-color: #2a2a2a; /* Einheitliches Grau */
    border: none;
    box-shadow: none;
  }
  .chart canvas {
    max-width: 100%;
  }
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #4a4a4a; /* Rand für Footer */
    padding: 12px 48px;
    background: linear-gradient(90deg, #4372b7, #905fa4);
    color: #FFFFFF;
  }
  .bottom-nav {
    display: none;
  }
  /* Überschriften mit Gradient */
  .gradient-heading {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
  /* Allgemeine Textfarbe weiß */
  p, li, span, a {
    color: #FFFFFF !important;
  }
  /* Buttons mit Gradient */
  a.inline-flex {
    background: linear-gradient(90deg, #4372b7, #905fa4) !important;
  }
  a.inline-flex:hover {
    background: linear-gradient(90deg, #905fa4, #4372b7) !important;
  }
  @media (max-width: 767px) {
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 60px;
      background-color: transparent; /* Transparent auch für Mobile */
    }
    .header, .top-box, .main, .bottom-boxes, .extra-box-1, .extra-box-2, .footer {
      width: 100%;
      padding: 12px;
      background-color: #2a2a2a; /* Einheitliches Grau */
    }
    .header {
      padding: 6px;
      order: 1;
    }
    .top-box {
      order: 3;
      position: relative;
    }
    .top-box .button-container {
      top: 8px;
      right: 8px;
      flex-direction: column;
      gap: 8px;
    }
    .top-box .button-container a {
      font-size: 12px;
      padding: 6px 10px;
    }
    .top-box .button-container a .tooltip {
      width: 100px;
      margin-left: -50px;
      font-size: 10px;
      background-color: #2a2a2a; /* Einheitliches Grau */
    }
    .sidebar {
      display: none;
    }
    .main {
      flex-direction: column;
      order: 2;
      background-color: #2a2a2a; /* Einheitliches Grau */
    }
    .content {
      order: 2;
      max-height: none;
      background-color: #2a2a2a; /* Einheitliches Grau */
    }
    .chart {
      order: 1;
      max-height: none;
      background-color: #2a2a2a; /* Einheitliches Grau */
      padding: 8px 4px;
      width: 100%;
      box-sizing: border-box;
    }
    .chart .flex.min-w-[200px] {
      background-color: #2a2a2a; /* Einheitliches Grau */
      border: none;
      box-shadow: none;
      width: 100%;
      min-width: 0;
    }
    .chart canvas {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
    }
    .bottom-boxes {
      order: 4;
    }
    .extra-box-1 {
      order: 5;
    }
    .extra-box-2 {
      order: 6;
    }
    .footer {
      padding: 12px;
      order: 7;
    }
    .bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #2a2a2a; /* Einheitliches Grau */
      border-top: 1px solid #4a4a4a; /* Rand für Bottom-Nav */
      justify-content: space-around;
      align-items: center;
      padding: 8px 0;
      z-index: 1000;
      order: 8;
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
      background-color: #4372b7;
    }
    .bottom-nav a.active {
      background: linear-gradient(90deg, #4372b7, #905fa4);
    }
    .bottom-nav a.active .fa-house {
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
      color: #FFFFFF;
    }
  }
`;

export default function Energiemanager({ data, uniqueDates, todayBerlin, error }) {
  const [loading, setLoading] = useState(true);
  
  // Größe des DynamischerPreis-Charts
  const [chartWidth, setChartWidth] = useState('80%');
  const [chartHeight, setChartHeight] = useState('600px');

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
      <div className="layout relative" style={{
        backgroundColor: 'transparent', // Zusätzlicher Fallback für Inline-Style
        fontFamily: 'Manrope, "Noto Sans", sans-serif',
        color: '#FFFFFF'
      }}>
        <div className="main flex flex-col lg:flex-row gap-6">
          <div className="content flex-1 p-6 rounded-xl bg-[#2a2a2a] flex flex-col">
            <p className="text-[#FFFFFF] tracking-tight text-3xl font-bold leading-tight text-center gradient-heading"></p>
            <p className="text-[#FFFFFF] text-lg font-normal leading-relaxed text-center mt-2"></p>
            <div className="flex flex-col gap-6 mt-6 flex-1">
              <div className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl p-6 bg-[#2a2a2a]">
                <div className="flex items-center gap-4">
                  <p className="text-[#FFFFFF] text-2xl font-bold leading-normal gradient-heading">
                    Preisrechner dynamische Tarife
                  </p>
                  <a
                    href="/test15/rechner"
                    className="inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl text-white text-lg font-medium leading-normal"
                    style={{ background: 'linear-gradient(90deg, #4372b7, #905fa4)' }}
                  >
                    <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '14px' }} />
                    Zum Rechner
                  </a>
                </div>
                <p className="text-[#FFFFFF] text-base font-normal leading-normal">
                  <p>Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.</p>
                  <p>Wir vergleichen in diesem Tool den reinen Energiepreis. Steuern, Netzentgelte sowie alle weiteren Abgaben sind in den Vergleichen abgezogen.</p>
                </p>
                <p className="text-[#FFFFFF] text-2xl font-bold leading-normal gradient-heading">Was ist ein dynamischer Stromtarif?</p>
                <p className="text-[#FFFFFF] text-base font-normal leading-normal">
                  Dynamische Stromtarife sind flexible Strompreise,
                  die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                  Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage –
                  zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
                </p>
                <a
                  href=""
                  className="inline-flex items-center justify-center gap-1 px-4 py-1.5 mt-4 rounded-xl text-white text-lg font-medium leading-normal w-fit"
                  style={{ background: 'linear-gradient(90deg, #4372b7, #905fa4)' }}
                >
                  <FontAwesomeIcon icon={faComment} style={{ color: '#FFFFFF', fontSize: '19px' }} />
                  Kontakt
                </a>
              </div>
            </div>
          </div>
          <div className="chart flex-1 p-2 rounded-xl flex flex-col" style={{ width: chartWidth, height: chartHeight, margin: '0 auto' }}>
            <div className="flex flex-col gap-2 mt-2 flex-1">
              <div className="flex min-w-[220px] flex-1 flex-col gap-2 rounded-xl p-2">
                <div className="flex min-h-[220px] flex-1 flex-col gap-2 py-2" style={{ height: '100%' }}>
                  <DynamischerPreis
                    data={data}
                    uniqueDates={uniqueDates}
                    todayBerlin={todayBerlin}
                    error={error}
                    chartWidth={chartWidth}
                    chartHeight={chartHeight}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-boxes">
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#2a2a2a] shadow-sm">
            <p className="text-[#FFFFFF] text-xl font-bold leading-normal gradient-heading">Vorteile</p>
            <ul className="text-[#FFFFFF] text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-[#FFFFFF]">Kostenersparnis:</span> <span className="text-[#FFFFFF]">Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Transparenz:</span> <span className="text-[#FFFFFF]">Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Umweltfreundlich:</span> <span className="text-[#FFFFFF]">Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Anreiz zur Automatisierung:</span> <span className="text-[#FFFFFF]">Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</span></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#2a2a2a] shadow-sm mt-4">
            <p className="text-[#FFFFFF] text-xl font-bold leading-normal gradient-heading">Nachteile</p>
            <ul className="text-[#FFFFFF] text-base font-normal leading-relaxed list-disc list-inside space-y-2">
              <li><span className="font-medium text-[#FFFFFF]">Preisschwankungen:</span> <span className="text-[#FFFFFF]">Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Technischer Aufwand:</span> <span className="text-[#FFFFFF]">Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Komplexität:</span> <span className="text-[#FFFFFF]">Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Unvorhersehbarkeit:</span> <span className="text-[#FFFFFF]">Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</span></li>
            </ul>
          </div>
        </div>

        <div className="extra-box-2">
          <div className="inner-box flex flex-col gap-3 rounded-xl p-4 bg-[#2a2a2a] shadow-sm text-center">
            <p className="text-[#FFFFFF] text-lg font-medium leading-normal gradient-heading">Jetzt berechnen, ob der dynamische Stromtarif für Sie in Frage kommt.</p>
            <p className="text-[#FFFFFF] text-base font-normal leading-normal">
              <a
                href="/test15/rechner"
                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-white text-sm font-medium leading-normal"
                style={{ background: 'linear-gradient(90deg, #4372b7, #905fa4)' }}
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}