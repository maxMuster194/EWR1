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
import LoadingScreen from '../loading/Amberg';
import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices';

// Register Chart.js components
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

// Styles with updated transparency for iframe compatibility
const styles = `
  html, body {
    background-color: transparent !important;
  }
  .layout {
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    display: grid;
    grid:
      ". ." 12px
      "top-box" auto
      "main" 1fr
      "bottom-boxes" auto
      "extra-box-1" auto
      "extra-box-2" auto
      ". ." 12px
      / 1fr;
    padding-top: 2.5rem;
    padding-bottom: 3rem;
    background-color: transparent;
    box-sizing: border-box;
  }
  .top-box {
    grid-area: top-box;
    padding: 1.5rem;
    background-color: transparent;
    border-radius: 12px;
    box-sizing: border-box;
    text-align: center;
    margin-top: 1.5rem;
    color: #4372b7;
  }
  .top-box h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }
  .main {
    grid-area: main;
    width: 1200px;
    max-width: 90vw;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: transparent;
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
    background-color: transparent;
  }
  .content-box > div {
    border-bottom: 1px solid #D1D5DB;
    padding: 0.75rem;
    background-color: transparent;
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
    background-color: transparent;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-1 {
    grid-area: extra-box-1;
    padding: 1.5rem;
    background-color: transparent;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 {
    grid-area: extra-box-2;
    padding: 1rem;
    background-color: transparent;
    border: 1px solid #D1D5DB;
    border-radius: 12px;
    box-sizing: border-box;
  }
  .extra-box-2 .inner-box {
    max-width: 400px;
    margin: 0 auto;
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
      background-color: transparent;
    }
    .content-box {
      max-width: 90vw;
      max-height: 600px;
      background-color: transparent;
    }
    .content-box > div {
      max-width: 90vw;
      max-height: 600px;
      background-color: transparent;
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
      background-color: transparent;
    }
    .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
      display: none;
    }
    .main {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 12px;
      border: none;
      border-radius: 0;
      min-height: calc(100vh - 1.5rem);
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      background-color: transparent;
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
      background-color: transparent;
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

const Energiemanager = ({ data, uniqueDates, todayBerlin, error }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle mobile detection
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

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
      <div className="layout relative" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <div className="top-box">
          <h2></h2>
        </div>

        <div className="main flex flex-col gap-6">
          <div className="content-box flex flex-1 flex-col gap-3 rounded-xl w-full">
            <div>
              {isMobile ? <Profil10 data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} /> : <Profil9 data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Energiemanager;