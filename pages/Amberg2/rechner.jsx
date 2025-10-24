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

// Chart options for line chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#202026', font: { size: 8 } } },
    y: { grid: { color: '#E5E7EB' }, ticks: { color: '#202026', font: { size: 8 } }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: '#202026', font: { size: 8 } } },
  },
};

// CSS styles for ultra-compact layout
const styles = `
html, body {
  background-color: transparent !important;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.layout {
  width: 100%;
  max-width: 1200px;
  height: 800px;
  display: grid;
  grid:
    ". ." 1px
    "top-box" auto
    "main" 1fr
    "bottom-boxes" auto
    "extra-box-1" auto
    "extra-box-2" auto
    ". ." 1px
    / 1fr;
  padding: 0.2rem 0.1rem;
  background-color: transparent;
  box-sizing: border-box;
  margin: 0 auto;
  overflow: hidden;
}
.top-box {
  grid-area: top-box;
  padding: 0.2rem;
  background-color: transparent;
  border-radius: 3px;
  text-align: center;
  margin-top: 0.2rem;
  color: #4372b7;
}
.top-box h2 {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
}
.main {
  grid-area: main;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.1rem;
  background-color: transparent;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.content-box {
  border-radius: 3px;
  max-width: 1180px;
  max-height: 550px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 0 auto;
  background-color: transparent;
  overflow: visible;
}
.content-box > div {
  border-bottom: 1px solid #D1D5DB;
  padding: 0.1rem;
  background-color: transparent;
  max-width: 1180px;
  max-height: 550px;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 1;
  overflow: visible;
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
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.1rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 3px;
  box-sizing: border-box;
}
.extra-box-1 {
  grid-area: extra-box-1;
  padding: 0.2rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 3px;
  box-sizing: border-box;
}
.extra-box-2 {
  grid-area: extra-box-2;
  padding: 0.1rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 3px;
  box-sizing: border-box;
}
.extra-box-2 .inner-box {
  max-width: 180px;
  margin: 0 auto;
}
@media (max-width: 1024px) {
  .layout {
    padding: 0.2rem 0.1rem;
    height: 800px;
  }
  .main, .bottom-boxes {
    width: 100%;
    max-width: 1180px;
    padding: 0.1rem;
    background-color: transparent;
  }
  .content-box {
    max-width: 1180px;
    max-height: 450px;
    background-color: transparent;
  }
  .content-box > div {
    max-width: 1180px;
    max-height: 450px;
    background-color: transparent;
    overflow: visible;
  }
  .header-logo {
    width: 40px;
    height: 15px;
  }
}
@media (max-width: 767px) {
  .layout {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0.2rem 0.1rem;
    height: auto;
    background-color: transparent;
  }
  .top-box, .bottom-boxes, .extra-box-1, .extra-box-2 {
    display: none;
  }
  .main {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0.1rem;
    border: none;
    border-radius: 0;
    min-height: auto;
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
    padding: 0.1rem;
    border: none;
    background-color: transparent;
    border-radius: 3px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;
  }
  .header-logo {
    width: 30px;
    height: 11px;
  }
}
`;

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

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

// Parse delivery day to ISO format
function parseDeliveryDay(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  const parsedDate = new Date(`${year}-${month}-${day}`);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
}

// Server-side data fetching
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

// Main Energiemanager component
const Energiemanager = ({ data, uniqueDates, todayBerlin, error }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Handle mobile detection and loading state
  useEffect(() => {
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);

    // Simulate loading delay (1 second)
    const timer = setTimeout(() => {
      setLoading(false);
      setIsContentVisible(true);
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error if present
  if (error) {
    return (
      <div className="layout relative" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <div className="top-box">
          <h1></h1>
        </div>
        <div className="main flex flex-col gap-2">
          <div className="content-box flex flex-1 flex-col gap-1 rounded-xl w-full">
            <div style={{ color: 'red', textAlign: 'center', fontSize: '0.75rem' }}>
              <p>Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <>
      <style>{styles}</style>
      <div className="layout relative" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
        <div className="top-box">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-center mb-6"></h1>
        </div>
        <div className="main flex flex-col gap-2">
          <div
            className="content-box flex flex-1 flex-col gap-1 rounded-xl w-full"
            style={{ display: isContentVisible ? 'flex' : 'none' }}
          >
            <div>
              {isMobile ? (
                <Profil10 data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} />
              ) : (
                <Profil9 data={data} uniqueDates={uniqueDates} todayBerlin={todayBerlin} error={error} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Energiemanager;