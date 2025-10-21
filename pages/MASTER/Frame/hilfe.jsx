import React, { useState, useEffect } from 'react';
import VideosPage from './video1';
import LoadingScreen from '@/pages/loading/Loadingscreen';

const Energiemanager = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (replace with actual data fetching if needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as needed (e.g., 2000ms = 2 seconds)

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // If loading is true, show the LoadingScreen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>
        {`
          .layout {
            width: 100%;
            min-height: 100vh;
            background-color: transparent;
            font-family: 'Manrope', 'Noto Sans', sans-serif;
            display: flex;
            flex-direction: column;
          }
          .main {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex: 1;
          }
          .content-box {
            background-color: transparent;
            
            padding: 24px;
            flex: 1;
           
            
          }
          @media (max-width: 767px) {
            .main {
              padding: 12px;
              width: 100%;
            }
            .content-box {
              padding: 12px;
            }
          }
        `}
      </style>
      <div className="layout">
        <div className="main">
          <div className="content-box">
            <VideosPage />
          </div>
        </div>
      </div>
    </>
  );
};

export default Energiemanager;