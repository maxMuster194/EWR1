import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faComment } from '@fortawesome/free-solid-svg-icons';
import mongoose from 'mongoose';
import GermanyMin15Prices from '/models/min15Prices'; // Passe den Pfad an
import DynamischerPreis from '../Amberg2/dypreis1';
import LoadingScreen from '../loading/Amberg';

// MongoDB-Verbindung (unverändert)
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

// Parse DD/MM/YYYY to YYYY-MM-DD (unverändert)
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

// Überarbeiteter Stil-Code: Alles transparent, keine Ränder, keine Hintergründe, einfaches Layout mit Fokus auf Inhalt.
const styles = `
  .layout {
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: transparent;
    color: #FFFFFF;
    font-family: 'Manrope', sans-serif;
    gap: 32px;
    padding: 24px;
  }
  .main {
    display: flex;
    flex-direction: row;
    gap: 40px;
    background-color: transparent;
    color: #FFFFFF;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background-color: transparent;
  }
  .chart {
    flex: 1;
    background-color: transparent;
  }
  .chart canvas {
    max-width: 100%;
    height: auto;
  }
  .bottom-boxes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    background-color: transparent;
  }
  .bottom-boxes > div {
    background-color: transparent;
  }
  .extra-box {
    text-align: center;
    background-color: transparent;
  }
  .extra-box .inner-box {
    background-color: transparent;
  }
  .gradient-heading {
    background: linear-gradient(90deg, #4372b7, #905fa4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
  p, li, span, a, h1, h2, h3, ul {
    background-color: transparent !important;
    color: #FFFFFF !important;
    border: none !important;
    box-shadow: none !important;
  }
  a.inline-flex {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(90deg, #4372b7, #905fa4) !important;
    border-radius: 12px;
    padding: 12px 20px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    border: none;
  }
  a.inline-flex:hover {
    background: linear-gradient(90deg, #905fa4, #4372b7) !important;
    transform: scale(1.05);
  }
  ul {
    list-style-type: disc;
    padding-left: 20px;
    margin: 0;
  }
  @media (max-width: 767px) {
    .layout {
      padding: 16px;
      gap: 24px;
    }
    .main {
      flex-direction: column;
      gap: 24px;
    }
    .bottom-boxes {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
`;

export default function Energiemanager({ data, uniqueDates, todayBerlin, error }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="layout" style={{ backgroundColor: 'transparent' }}>
        {/* Main: Content + Chart */}
        <div className="main">
          <div className="content">
            <h1 className="text-3xl font-bold gradient-heading text-center">Energiemanager</h1>
            <p className="text-lg text-center mt-2">Entdecken Sie dynamische Stromtarife</p>
            
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold gradient-heading">Preisrechner dynamische Tarife</h2>
                <a href="/test15/rechner" className="inline-flex">
                  <FontAwesomeIcon icon={faCalculator} /> Zum Rechner
                </a>
              </div>
              <p className="text-base">
                Jetzt in wenigen Schritten herausfinden, ob sich ein dynamischer Stromtarif für Ihren Haushalt lohnt.<br />
                Wir vergleichen in diesem Tool den reinen Energiepreis. Steuern, Netzentgelte sowie alle weiteren Abgaben sind in den Vergleichen abgezogen.
              </p>
              <h2 className="text-2xl font-bold gradient-heading mt-6">Was ist ein dynamischer Stromtarif?</h2>
              <p className="text-base">
                Dynamische Stromtarife sind flexible Strompreise, die sich in Echtzeit oder stündlich an den aktuellen Börsenstrompreisen orientieren.
                Im Gegensatz zu festen Tarifen variiert der Preis je nach Angebot und Nachfrage – zum Beispiel ist Strom nachts oder bei viel Wind und Sonne oft günstiger.
              </p>
              <a href="/kontakt" className="inline-flex mt-4">
                <FontAwesomeIcon icon={faComment} /> Kontakt
              </a>
            </div>
          </div>

          <div className="chart">
            <DynamischerPreis
              data={data}
              uniqueDates={uniqueDates}
              todayBerlin={todayBerlin}
              error={error}
              chartWidth="100%"
              chartHeight="auto"
            />
          </div>
        </div>

        {/* Bottom-Boxes: Vorteile & Nachteile */}
        <div className="bottom-boxes">
          <div>
            <h3 className="text-xl font-bold gradient-heading mb-4">Vorteile</h3>
            <ul className="space-y-2">
              <li><strong>Kostenersparnis:</strong> Wer seinen Stromverbrauch in günstige Zeiten verlegt (z. B. Wäsche nachts waschen), kann spürbar sparen.</li>
              <li><strong>Transparenz:</strong> Nutzer sehen, wann Strom teuer oder billig ist, und können entsprechend reagieren.</li>
              <li><strong>Umweltfreundlich:</strong> Fördert die Nutzung von erneuerbaren Energien, wenn diese im Überfluss verfügbar sind.</li>
              <li><strong>Anreiz zur Automatisierung:</strong> Smarte Haushaltsgeräte oder Energiemanagementsysteme lassen sich optimal einsetzen.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold gradient-heading mb-4">Nachteile</h3>
            <ul className="space-y-2">
              <li><strong>Preisschwankungen:</strong> Strom kann zu bestimmten Tageszeiten sehr teuer sein, was die Planung erschwert.</li>
              <li><strong>Technischer Aufwand:</strong> Ein digitaler Stromzähler (Smart Meter) ist meist Voraussetzung.</li>
              <li><strong>Komplexität:</strong> Erfordert aktives Mitdenken oder technische Lösungen, um vom günstigen Preis zu profitieren.</li>
              <li><strong>Unvorhersehbarkeit:</strong> Bei starker Nachfrage oder Krisen können Preise unerwartet steigen.</li>
            </ul>
          </div>
        </div>

        {/* Extra-Box */}
        <div className="extra-box">
          <div className="inner-box">
            <p className="text-lg font-medium gradient-heading">Jetzt berechnen, ob der dynamische Stromtarif für Sie in Frage kommt.</p>
            <a href="/test15/rechner" className="inline-flex mt-4">
              <FontAwesomeIcon icon={faCalculator} /> Zum Rechner
            </a>
          </div>
        </div>
      </div>
    </>
  );
}