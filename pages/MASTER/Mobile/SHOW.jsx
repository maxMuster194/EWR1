import React from 'react';

const SHOW = ({ backgroundColor = '#757474' }) => {
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: backgroundColor,
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE and legacy Edge
    },
    phoneOuter: {
      width: `calc(var(--phone-css-width) * var(--scale) * 1px)`,
      height: `calc(var(--phone-css-height) * var(--scale) * 1px)`,
      borderRadius: '50px', // Slightly larger radius for iPhone 16 Pro
      background: 'linear-gradient(180deg, #0a0e1a 0%, #050509 100%)', // Darker, premium titanium-like gradient
      padding: '6px', // Thinner bezel for Pro model
      boxShadow: '0 20px 60px rgba(2,6,23,0.6), inset 0 2px 8px rgba(255,255,255,0.03)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notch: {
      position: 'absolute',
      top: '8px', // Adjusted for iPhone 16 Pro's slimmer notch
      left: '50%',
      transform: 'translateX(-50%)',
      height: '30px',
      width: '120px', // Slightly wider for Dynamic Island
      background: 'rgba(255,255,255,0.05)', // Subtle transparency
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notchDot: {
      width: '6px',
      height: '6px',
      background: '#0a0e1a', // Matches phone outer for seamless look
      borderRadius: '50%',
      marginLeft: '10px', // Simulates camera/sensor
    },
    screen: {
      width: `calc(var(--phone-css-width) * 1px - 12px)`, // Adjusted for thinner bezel
      height: `calc(var(--phone-css-height) * 1px - 12px)`,
      borderRadius: '44px', // Matches outer radius minus padding
      overflow: 'hidden',
      background: 'white',
      position: 'relative',
      transformOrigin: 'top left',
      transform: 'scale(var(--scale))',
      boxShadow: '0 8px 35px rgba(15,23,42,0.3)', // Enhanced shadow for Pro
    },
    iframeWrapper: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    iframe: {
      width: `calc(var(--phone-css-width) * 1px)`,
      height: `calc(var(--phone-css-height) * 1px)`,
      border: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      transform: 'scale(var(--scale))',
      transformOrigin: 'top left',
      overflow: 'scroll',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
  };

  return (
    <div style={styles.container} className="hide-scrollbar">
      <div style={{ '--phone-css-width': 393, '--phone-css-height': 852, '--scale': 1 }}>
        <div style={styles.phoneOuter} title="iPhone 16 Pro Fullscreen iFrame" className="transition-all duration-300">
          <div style={styles.notch} aria-hidden="true" className="bg-opacity-10">
            <div style={styles.notchDot}></div>
          </div>
          <div style={styles.screen} className="bg-white">
            <div style={styles.iframeWrapper}>
              <iframe
                style={styles.iframe}
                className="hide-scrollbar"
                src="http://localhost:3000/MASTER/Mobile/startseite"
                sandbox="allow-same-origin allow-scripts"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SHOW;