import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const IframeNavigation = ({
  backgroundColor = 'rgb(117, 116, 116)',
  menuBackgroundColor = '	rgb(6,61,55)',
  menuHoverColor = '	rgb(60,96,85)',
  menuActiveColor = '	rgb(60,96,85)',
  menuBorderColor = 	'rgb(6,61,55)',
  baseUrl = 'http://localhost:3000/MASTER/Frame/',
}) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false); // Spinner nur bei Tab-Wechsel
  const [activeTab, setActiveTab] = useState(`${baseUrl}/startseite`); // Verfolgt aktiven Tab

  useEffect(() => {
    const tabs = document.querySelectorAll('.tab');
    const iframe = iframeRef.current;

    const handleTabClick = (tab) => {
      // Nur wenn die neue URL anders ist, Spinner anzeigen und Tab wechseln
      if (iframe.src !== tab.dataset.src) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        setActiveTab(tab.dataset.src); // Aktualisiere aktiven Tab
        setIsLoading(true); // Spinner anzeigen
        iframe.src = tab.dataset.src;
      }
    };

    const handleIframeLoad = () => {
      setIsLoading(false); // Spinner ausblenden, wenn Iframe geladen ist
      // Sicherstellen, dass activeTab mit der geladenen URL übereinstimmt
      setActiveTab(iframe.src);
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => handleTabClick(tab));
    });

    iframe.addEventListener('load', handleIframeLoad);

    // Initial die active-Klasse basierend auf activeTab setzen
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.src === activeTab);
    });

    return () => {
      tabs.forEach(tab => {
        tab.removeEventListener('click', () => handleTabClick(tab));
      });
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [activeTab]); // Abhängigkeit von activeTab, um bei Änderungen zu aktualisieren

  return (
    <div className="flex items-center justify-center min-h-screen font-sans" style={{ backgroundColor }}>
      <style>
        {`
          .tab {
            transition: transform 0.3s ease, background-color 0.3s ease;
          }
          .tab:hover {
            background-color: ${menuHoverColor};
            transform: translateY(-2px);
          }
          .tab.active {
            background-color: ${menuActiveColor};
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #063d37;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="w-[1200px] h-[900px] flex flex-col rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Menüleiste */}
        <div
          className="flex text-white h-[60px] items-center justify-around font-bold text-base cursor-pointer"
          style={{ backgroundColor: menuBackgroundColor, borderBottom: `1px solid ${menuBorderColor}` }}
        >
          <div
            className={`tab flex-1 text-center py-4 transition-all duration-300 ${activeTab === `${baseUrl}/startseite` ? 'active' : ''}`}
            data-src={`${baseUrl}/startseite`}
          >
            Start
          </div>
          <div
            className={`tab flex-1 text-center py-4 transition-all duration-300 ${activeTab === `${baseUrl}/preise` ? 'active' : ''}`}
            data-src={`${baseUrl}/preise`}
          >
            Preise / Rückblick
          </div>
          <div
            className={`tab flex-1 text-center py-4 transition-all duration-300 ${activeTab === `${baseUrl}/rechner` ? 'active' : ''}`}
            data-src={`${baseUrl}/rechner`}
          >
            Rechner
          </div>
          <div
            className={`tab flex-1 text-center py-4 transition-all duration-300 ${activeTab === `${baseUrl}/details` ? 'active' : ''}`}
            data-src={`${baseUrl}/details`}
          >
            Details
          </div>
          <div
            className={`tab flex-1 text-center py-4 transition-all duration-300 ${activeTab === `${baseUrl}/hilfe` ? 'active' : ''}`}
            data-src={`${baseUrl}/hilfe`}
          >
            Hilfe
          </div>
        </div>

        {/* Iframe und Lade-Indikator */}
        <div className="flex-1 bg-transparent relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
              <div className="loader"></div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            id="main-iframe"
            src={`${baseUrl}/startseite`}
            className="w-full h-full border-none bg-transparent"
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

IframeNavigation.propTypes = {
  backgroundColor: PropTypes.string,
  menuBackgroundColor: PropTypes.string,
  menuHoverColor: PropTypes.string,
  menuActiveColor: PropTypes.string,
  menuBorderColor: PropTypes.string,
  baseUrl: PropTypes.string,
};

export default IframeNavigation;