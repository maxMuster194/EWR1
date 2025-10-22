import React from 'react';

const SHOW = ({ backgroundColor = '	#757474' }) => {
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: backgroundColor,
      scrollbarWidth: 'none', // Für Firefox
      msOverflowStyle: 'none', // Für IE und ältere Edge
      '::-webkit-scrollbar': {
        display: 'none', // Für Chrome, Safari und Chromium-basierte Edge
      },
    },
    phoneOuter: {
      width: `calc(var(--phone-css-width) * var(--scale) * 1px)`,
      height: `calc(var(--phone-css-height) * var(--scale) * 1px)`,
      borderRadius: '46px',
      background: 'linear-gradient(180deg, #0f1724 0%, #0b0b0d 100%)',
      padding: '7.56px',
      boxShadow: '0 18px 50px rgba(2,6,23,0.5), inset 0 2px 8px rgba(255,255,255,0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notch: {
      position: 'absolute',
      top: '10px',
      right: '20px',
      height: '26px',
      width: '110px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notchAfter: {
      content: '""',
      width: '6px',
      height: '6px',
      background: '#101112',
      borderRadius: '50%',
    },
    screen: {
      width: `calc(var(--phone-css-width) * 1px - 15.12px)`,
      height: `calc(var(--phone-css-height) * 1px - 15.12px)`,
      borderRadius: '38px',
      overflow: 'hidden',
      background: 'white',
      position: 'relative',
      transformOrigin: 'top left',
      transform: 'scale(var(--scale))',
      boxShadow: '0 6px 30px rgba(15,23,42,0.25)',
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
    <div style={styles.container}>
      <div style={{ '--phone-css-width': 393, '--phone-css-height': 852, '--scale': 1 }}>
        <div style={styles.phoneOuter} title="iPhone 16 Vollbild iFrame">
          <div style={styles.notch} aria-hidden="true">
            <div style={styles.notchAfter}></div>
          </div>
          <div style={styles.screen}>
            <div style={styles.iframeWrapper}>
              <iframe
                style={{ ...styles.iframe, '::-webkit-scrollbar': { display: 'none' } }}
                src="http://localhost:3000/MASTER/Mobile/startseite"
                sandbox="allow-same-origin allow-scripts allow-forms"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SHOW;