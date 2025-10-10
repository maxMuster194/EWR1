import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faClock } from '@fortawesome/free-solid-svg-icons';

// Stil für die Buttons
const buttonStyles = `
  .button-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }
  .button-container a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    background-color: #063d37;
    color: #FFFFFF;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    position: relative;
  }
  .button-container a:hover {
    background-color: #3c6055;
  }
  .button-container a.active {
    background-color: #88bf50;
    color: #FFFFFF;
  }
  .button-container a .tooltip {
    visibility: hidden;
    width: 120px;
    background-color: #202026;
    color: #FFFFFF;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    margin-left: -60px;
    margin-top: 8px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .button-container a:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  @media (max-width: 767px) {
    .button-container {
      flex-direction: column;
      gap: 8px;
    }
    .button-container a {
      font-size: 12px;
      padding: 6px 10px;
    }
    .button-container a .tooltip {
      width: 100px;
      margin-left: -50px;
      font-size: 10px;
    }
  }
`;

// Button-Komponente
export default function DynamicButtons() {
  return (
    <>
      <style>{buttonStyles}</style>
      <div className="button-container">
        <a href="/test15/datenrueckblick" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBackward} style={{ color: '#fafafa', fontSize: '16px' }} />
          <span>Datenrückblick</span>
          <span className="tooltip">Historische Preisdaten anzeigen</span>
        </a>
        <a href="/test15/heute" className="flex items-center gap-2 active">
          <FontAwesomeIcon icon={faClock} style={{ color: '#fafafa', fontSize: '16px' }} />
          <span>Heute</span>
          <span className="tooltip">Preisdaten für heute anzeigen</span>
        </a>
      </div>
    </>
  );
}