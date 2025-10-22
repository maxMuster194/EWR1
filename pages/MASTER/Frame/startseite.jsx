import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faComment } from '@fortawesome/free-solid-svg-icons';
import mongoose from 'mongoose';
import GermanyMin15Prices from '@/models/min15Prices'; // Adjust path as needed
import DynamischerPreis from '@/pages/MASTER/Frame/dypreis1';
import LoadingScreen from '@/pages/loading/Loadingscreen';

// MongoDB Connection
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
    console.log('Available fields in data:', Object.keys(data[0] || {}));
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

// Updated styles with max-width set to 1000px
const styles = `
  @import url('https://use.typekit.net/oie4cok.css');

  html, body {
    background-color: transparent !important;
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  .layout {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    box-sizing: border-box;
    background-color: transparent;
    color: #FFFFFF;
    font-family: 'ff-good-web-pro', sans-serif;
    font-weight: 400;
    font-style: normal;
    margin: 0 auto; /* Center the layout */
  }

  .main {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    display: flex;
    flex-direction: row;
    gap: 40px;
    background-color: transparent;
    margin: 0 auto;
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
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100%; /* Ensure chart respects container width */
  }

  .chart canvas {
    max-width: 100%;
    height: auto;
  }

  .bottom-boxes {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    background-color: transparent;
    margin: 24px auto;
  }

  .bottom-boxes > div {
    background-color: transparent;
  }

  .extra-box {
    width: 100%;
    max-width: 1000px; /* Set max-width to 1000px */
    text-align: center;
    background-color: transparent;
    margin: 24px auto;
  }

  .extra-box .inner-box {
    background-color: transparent;
  }

  .gradient-heading {
    background: linear-gradient(90deg, #063d37, #88bf50);
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
    font-family: 'ff-good-web-pro', sans-serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
  }

  a.inline-flex {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(90deg, #063d37, #88bf50) !important;
    border-radius: 12px;
    padding: 12px 20px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    border: none;
    font-family: 'ff-good-web-pro', sans-serif !important;
  }

  a.inline-flex:hover {
    background: linear-gradient(90deg, #88bf50, #063d37) !important;
    transform: scale(1.05);
  }

  ul {
    list-style-type: disc;
    padding-left: 20px;
    margin: 0;
  }

  @media (max-width: 1024px) {
    .layout, .main, .bottom-boxes, .extra-box {
      width: 100%;
      max-width: 95vw; /* Use 95vw for slightly smaller screens */
    }
  }

  @media (max-width: 767px) {
    .layout {
      padding: 16px;
      gap: 16px;
      max-width: 100vw; /* Ensure full width on mobile */
    }
    .main {
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 100%;
      margin: 0;
    }
    .bottom-boxes {
      grid-template-columns: 1fr;
      gap: 16px;
      margin: 16px auto;
      max-width: 100%;
    }
    .extra-box {
      margin: 16px auto;
      max-width: 100%;
    }
    .chart {
      width: 100%;
      max-width: 100%;
    }
  }

  /* Ensure iFrame compatibility */
  @container (max-width: 1000px) {
    .layout, .main, .bottom-boxes, .extra-box {
      max-width: 100%;
      width: 100%;
    }
  }
`;

export default function Energiemanager({ data, uniqueDates, todayBerlin, error }) {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handle mobile detection
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);

    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
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
            <h1 className="text-2xl font-bold gradient-heading text-center"></h1>
            <p className="text-lg text-center mt-2 ">Entdecken Sie dynamische Stromtarife</p>
            
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold gradient-heading">Preisrechner dynamische Tarife</h2>
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
              <a href="/" className="inline-flex mt-4">
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
          {/* Add content here if needed */}
        </div>

        {/* Extra-Box */}
        <div className="extra-box">
          {/* Add content here if needed */}
        </div>
      </div>
    </>
  );
}