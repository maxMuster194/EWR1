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

// Updated styles
const styles = `
html, body {
  background-color: transparent !important;
  margin: 0;
  padding: 0;
  overflow: auto; /* Allow scrolling if content overflows */
}
.layout {
  width: 100%;
  max-width: 1100px; /* Match iframe width */
  height: 800px; /* Match iframe height */
  display: grid;
  grid:
    ". ." 6px
    "top-box" auto
    "main" 1fr
    "bottom-boxes" auto
    "extra-box-1" auto
    "extra-box-2" auto
    ". ." 6px
    / 1fr;
  padding: 1rem 0.2rem;
  background-color: transparent;
  box-sizing: border-box;
  margin: 0 auto;
  overflow: auto; /* Allow scrolling within layout if needed */
}
.top-box {
  grid-area: top-box;
  padding: 0.8rem;
  background-color: transparent;
  border-radius: 6px;
  box-sizing: border-box;
  text-align: center;
  margin-top: 0.8rem;
  color: #4372b7;
}
.top-box h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
.main {
  grid-area: main;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: transparent;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.content-box {
  border-radius: 6px;
  max-width: 1080px;
  max-height: 700px; /* Increased to fit within 800px iframe */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 0 auto;
  background-color: transparent;
  overflow: visible; /* Allow content to be visible */
}
.content-box > div {
  border-bottom: 1px solid #D1D5DB;
  padding: 0.4rem;
  background-color: transparent;
  max-width: 1080px;
  max-height: 700px;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 1;
  overflow: visible; /* Allow chart to render fully */
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
  max-width: 1080px;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-sizing: border-box;
}
.extra-box-1 {
  grid-area: extra-box-1;
  padding: 0.8rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-sizing: border-box;
}
.extra-box-2 {
  grid-area: extra-box-2;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-sizing: border-box;
}
.extra-box-2 .inner-box {
  max-width: 280px;
  margin: 0 auto;
}
@media (max-width: 1024px) {
  .layout {
    padding: 0.8rem 0.1rem;
    height: 800px; /* Ensure consistent height */
  }
  .main, .bottom-boxes {
    width: 100%;
    max-width: 1080px;
    padding: 0.2rem;
    background-color: transparent;
  }
  .content-box {
    max-width: 1080px;
    max-height: 600px; /* Adjusted for smaller screens */
    background-color: transparent;
  }
  .content-box > div {
    max-width: 1080px;
    max-height: 600px;
    background-color: transparent;
    overflow: visible;
  }
  .header-logo {
    width: 55px;
    height: 20.9px;
  }
}
@media (max-width: 767px) {
  .layout {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0.8rem 0.1rem;
    height: auto; /* Allow height to adjust */
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
    border-radius: 4px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;
  }
  .header-logo {
    width: 40px;
    height: 15.2px;
  }
}
`;

// MongoDB connection and getServerSideProps remain unchanged
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
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false); // State for visibility toggle

  useEffect(() => {
    // Handle mobile detection
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);

    // Simulate loading delay and show content
    const timer = setTimeout(() => {
      setLoading(false);
      setIsContentVisible(true); // Show content after loading
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
          <h2>Energiemanager</h2>
        </div>

        <div className="main flex flex-col gap-6">
          <div
            className="content-box flex flex-1 flex-col gap-3 rounded-xl w-full"
            style={{ display: isContentVisible ? 'flex' : 'none' }} // Toggle visibility
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