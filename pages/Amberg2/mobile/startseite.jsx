import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle, faComment, faBackward, faClock } from '@fortawesome/free-solid-svg-icons';
import mongoose from 'mongoose';
import GermanyMin15Prices from '/models/min15Prices'; // Adjust path as needed
import DynamischerPreis from '@/pages/Amberg2/dypreis1';
import LoadingScreen from '@/pages/loading/Amberg';

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
    display: flex;
    flex-direction: column;
    gap: 8px; /* Reduzierte Lücke */
    padding-bottom: 60px;
    background-color: #1D3050;
    color: #FFFFFF;
    min-height: 100vh;
    font-family: 'Manrope, "Noto Sans", sans-serif';
  }
  .top-box, .main, .bottom-boxes, .extra-box-1, .extra-box-2, .footer {
    width: 100%;
    padding: 8px; /* Reduzierte Padding */
    color: #FFFFFF;
  }
  .top-box {
    order: 1;
    position: relative;
    background-color: #1D3050;
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
    border-radius: 8px;
    background-color: #1D3050;
    color: #FFFFFF;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s;
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
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
    width: 100px;
    background-color: #1D3050;
    color: #FFFFFF;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    margin-left: -50px;
    margin-top: 8px;
    font-size: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .top-box .button-container a:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .sidebar {
    display: none;
  }
  .main {
    flex-direction: column;
    order: 2;
    background-color: #1D3050;
  }
  .content {
    order: 2;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .content p {
    color: #FFFFFF;
  }
  .content a.rechner-button,
  .content a.kontakt-button {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .content a.rechner-button:hover,
  .content a.kontakt-button:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .chart {
    order: 1;
    background-color: #1D3050;
    padding: 4px 4px 0 4px; /* Reduziertes Padding unten auf 0 */
    width: 100%;
    box-sizing: border-box;
    color: #FFFFFF;
    margin-bottom: 0px; /* Etwa 2cm Abstand unter dem Chart */
  }
  .chart .flex.min-w-[200px] {
    background-color: #1D3050;
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
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .bottom-boxes p, .bottom-boxes li, .bottom-boxes span {
    color: #FFFFFF;
  }
  .bottom-boxes .border-black {
    border-color: #FFFFFF;
  }
  .extra-box-1 {
    order: 5;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .extra-box-2 {
    order: 6;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .extra-box-2 .inner-box {
    background-color: #1D3050;
    color: #FFFFFF;
    border-color: #FFFFFF;
  }
  .extra-box-2 .inner-box p {
    color: #FFFFFF;
  }
  .extra-box-2 .inner-box a.rechner-button {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .extra-box-2 .inner-box a.rechner-button:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .footer {
    padding: 12px;
    order: 7;
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #1D3050;
    border-top: 1px solid #D1D5DB;
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
    transition: background 0.2s;
    flex: 1;
    text-align: center;
    background-color: #1D3050;
  }
  .bottom-nav a:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
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
    color: #FFFFFF;
  }
  .bottom-nav a svg {
    font-size: 18px;
    color: #FFFFFF;
  }
  .dynamischer-preis-container {
    border-radius: 8px;
    padding: 4px;
    max-height: 500px; /* Set maximum height to 500px for desktop */
  }
  @media (max-width: 768px) {
    .main {
      gap: 4px; /* Noch kleinere Lücke auf mobilen Geräten */
    }
    .content, .chart {
      padding: 4px; /* Reduzierte Padding für mobile Geräte */
    }
    .dynamischer-preis-container {
      max-height: 470px; /* Set maximum height to 450px for mobile */
    }
  }
`;

export default function Energiemanager({ data, uniqueDates, todayBerlin, error }) {
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
          <div className="flex flex-col gap-3 rounded-xl p-3 text-center relative">
            <div className="flex items-center justify-center gap-4">
              <p className="text-[#FFFFFF] text-4xl font-bold leading-normal">Dynamischer Stromtarif</p>
            </div>
          </div>
        </div>

        <div className="main flex flex-col gap-4">
          <div className="dynamischer-preis-container">
            <DynamischerPreis data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-col gap-2 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <p className="text-[#FFFFFF] text-2xl font-bold leading-normal">Preisrechner dynamische Tarife</p>
                <a
                  href="/test15/rechner"
                  className="rechner-button inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white text-lg font-medium leading-normal"
                >
                  <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '19px' }} />
                  Zum Rechner
                </a>
              </div>
              <p className="text-[#FFFFFF] text-base font-normal leading-normal">
                Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.
              </p>
              <p className="text-[#FFFFFF] text-base font-normal leading-normal">
                Wir vergleichen in diesem Tool den reinen Energiepreis. Steuern, Netzentgelte sowie alle weiteren Abgaben sind in den Vergleichen abgezogen.
              </p>
              <p className="text-[#FFFFFF] text-2xl font-bold leading-normal">Was ist ein dynamischer Stromtarif?</p>
              <p className="text-[#FFFFFF] text-base font-normal leading-normal">
                Dynamische Stromtarife sind flexible Strompreise, 
                die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – 
                zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
              </p>
              <a
                href=""
                className="kontakt-button inline-flex items-center justify-center gap-1 px-4 py-1.5 mt-2 rounded-xl bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white text-lg font-medium leading-normal w-fit"
              >
                <FontAwesomeIcon icon={faComment} style={{ color: '#FFFFFF', fontSize: '19px' }} />
                Kontakt
              </a>
            </div>
          </div>
        </div>

        <div className="bottom-boxes">
          <div className="flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-black">
            <p className="text-[#FFFFFF] text-xl font-bold leading-normal">Vorteile</p>
            <ul className="text-[#FFFFFF] text-base font-normal leading-relaxed list-disc list-inside space-y-1">
              <li><span className="font-medium text-[#FFFFFF]">Kostenersparnis:</span> <span className="text-[#FFFFFF]">Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Transparenz:</span> <span className="text-[#FFFFFF]">Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Umweltfreundlich:</span> <span className="text-[#FFFFFF]">Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Anreiz zur Automatisierung:</span> <span className="text-[#FFFFFF]">Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</span></li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-black mt-3">
            <p className="text-[#FFFFFF] text-xl font-bold leading-normal">Nachteile</p>
            <ul className="text-[#FFFFFF] text-base font-normal leading-relaxed list-disc list-inside space-y-1">
              <li><span className="font-medium text-[#FFFFFF]">Preisschwankungen:</span> <span className="text-[#FFFFFF]">Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Technischer Aufwand:</span> <span className="text-[#FFFFFF]">Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Komplexität:</span> <span className="text-[#FFFFFF]">Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</span></li>
              <li><span className="font-medium text-[#FFFFFF]">Unvorhersehbarkeit:</span> <span className="text-[#FFFFFF]">Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</span></li>
            </ul>
          </div>
        </div>

        <div className="extra-box-2">
          <div className="inner-box flex flex-col gap-2 rounded-xl p-3 shadow-sm border border-gray-300 text-center">
            <p className="text-[#FFFFFF] text-lg font-medium leading-normal">Jetzt berechnen, ob der dynamischer Stromtarif für Sie in Frage kommt.</p>
            <p className="text-[#FFFFFF] text-base font-normal leading-normal">
              <a
                href="/test15/rechner"
                className="rechner-button inline-flex items-center justify-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white text-sm font-medium leading-normal"
              >
                <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '14px' }} />
                Zum Rechner
              </a>
            </p>
          </div>
        </div>

        <nav className="bottom-nav">
          <a href="/Amberg2/mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white active">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/Amberg2/mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/Amberg2/mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/Amberg2/mobile/details" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/Amberg2/mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 bg-[#1D3050] hover:bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
}