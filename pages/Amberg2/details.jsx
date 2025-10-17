'use client';

import React, { useEffect, useState } from 'react';
import StromverbrauchRechnerDesktop from './details41';
import StromverbrauchRechnerMobile from './Mdetails47';
import LoadingScreen from '../loading/Amberg';

const styles = `
  /* GROßER HINTERGRUND TRANSPARENT */
  .layout {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    background: transparent !important;
    box-sizing: border-box;
  }
  
  .main {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent !important;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  
  .content {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: transparent !important;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  
  /* HTML & BODY TRANSPARENT */
  html {
    background: transparent !important;
    height: 100% !important;
  }
  
  body {
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
  }
  
  @media (max-width: 767px) {
    .layout, .main, .content {
      background: transparent !important;
      padding: 0;
    }
  }
`;

const Energiemanager = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia("(max-width: 767px)");
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleResize);

      // HINTERGRUND IMMER TRANSPARENT MACHEN
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => {
        mediaQuery.removeEventListener('change', handleResize);
        clearTimeout(timer);
      };
    }
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{styles}</style>
      <div 
        className="layout" 
        style={{ 
          fontFamily: 'Manrope, "Noto Sans", sans-serif', 
          background: 'transparent !important'
        }}
      >
        <div className="main" style={{ background: 'transparent !important' }}>
          <div className="content" style={{ background: 'transparent !important' }}>
            {isMobile ? <StromverbrauchRechnerMobile /> : <StromverbrauchRechnerDesktop />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Energiemanager;