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
import Profil10 from '@/pages/Amberg2/Profil10'; // Mobile profile
import Profil9 from '@/pages/Amberg2/Profil9'; // Desktop profile (wird aber nicht mehr verwendet)
import LoadingScreen from '@/pages/loading/Amberg';
import mongoose from 'mongoose';
import GermanyMin15Prices from '@/models/min15Prices';

// Register Chart.js 
ChartJSInstance.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

// Chart options
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

// Styles - nur Mobile-Styles behalten, Desktop-Elemente entfernt
const styles = `
  .layout {
    width: 100%;
    display: grid;
    grid:
      "sidebar top-box" auto
      "sidebar main" 1fr
      "sidebar bottom-boxes" auto
      "sidebar extra-box-1" auto
      "sidebar extra-box-2" auto
      "footer footer" auto
      / 200px 1fr;
    min-height: 100vh;
    background-color: #1D3050;
    color: #FFFFFF;
    font-family: 'Manrope, "Noto Sans", sans-serif';
  }
  .top-box {
    grid-area: top-box;
    padding: 8px;
    background-color: #1D3050;
  }
  .sidebar {
    grid-area: sidebar;
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background-color: #1D3050;
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
    background-color: #1D3050;
  }
  .sidebar a:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
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
    color: #FFFFFF;
  }
  .sidebar a svg {
    font-size: 20px;
    color: #FFFFFF;
  }
  .main {
    grid-area: main;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 24px;
    background-color: #1D3050;
  }
  .bottom-boxes {
    grid-area: bottom-boxes;
    padding: 24px;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 24px;
    background-color: #1D3050;
    color: #FFFFFF;
    border-radius: 12px;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 16px;
    background-color: #1D3050;
    color: #FFFFFF;
    border-radius: 12px;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .content {
    flex: 1;
    padding: 8px;
    border-radius: 12px;
    background-color: #1D3050;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
  }
  .content > * {
    width: 100%;
    flex: 1;
    color: #FFFFFF;
  }
  .content * {
    font-size: 1.1em;
    color: #FFFFFF;
  }
  .chart {
    flex: 1;
    padding: 24px;
    border-radius: 12px;
    background-color: #1D3050;
    color: #FFFFFF;
  }
  .footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: linear-gradient(90deg, #4372b7, #905fa4);
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
      background-color: #1D3050;
    }
    .top-box, .main, .bottom-boxes, .extra-box-1, .extra-box-2, .footer {
      width: 100%;
      padding: 12px;
      background-color: #1D3050;
      color: #FFFFFF;
    }
    .sidebar {
      display: none;
    }
    .main {
      flex-direction: column;
      gap: 8px;
    }
    .content {
      padding: 8px;
      background-color: #1D3050;
    }
    .content * {
      font-size: 1em;
      color: #FFFFFF;
    }
    .chart {
      padding: 12px;
      background-color: #1D3050;
    }
    .extra-box-2 .inner-box {
      max-width: 100%;
      background-color: #1D3050;
      color: #FFFFFF;
    }
    .footer {
      padding: 12px;
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
  }
`;

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

const Energiemanager = ({ data, uniqueDates, todayBerlin, error }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
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
      <div className="layout">

        <main className="main">
          <div className="content-box">
            <div>
              <Profil10 data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} />
            </div>
          </div>
        </main>

      

        <nav className="bottom-nav">
          <a href="/Amberg2/mobile/startseite" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faHouse} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Home</p>
          </a>
          <a href="/Amberg2/mobile/preise" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Preis</p>
          </a>
          <a href="/Amberg2/mobile/rechner" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-[#063d37] text-white active">
            <FontAwesomeIcon icon={faCalculator} style={{ color: '#FFFFFF', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Rechner</p>
          </a>
          <a href="/Amberg2/mobile/details" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faFileLines} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Detail</p>
          </a>
          <a href="/Amberg2/mobile/hilfe" className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl bg-transparent hover:bg-[#063d37] text-white">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#fafafa', fontSize: '18px' }} />
            <p className="text-white text-xs font-medium leading-normal">Hilfe</p>
          </a>
        </nav>
      </div>
    </>
  );
};

export default Energiemanager;