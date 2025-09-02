import React from 'react';
import { Line } from 'react-chartjs-2'; // Annahme: Chart.js ist importiert

// Annahme: Diese Props und States werden von der ursprünglichen Komponente bereitgestellt
const menus = [
  { id: 'grundlastverbraucher', label: 'Grundlastverbraucher', options: [{ name: 'Kühlschrank' }, { name: 'Beleuchtung' }] },
  { id: 'dynamischeverbraucher', label: 'Dynamische Verbraucher', options: [{ name: 'Waschmaschine' }, { name: 'Trockner' }] },
  { id: 'eauto', label: 'E-Auto', options: [{ name: 'Tesla' }] },
  // Weitere Menüs...
];
const toInputDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const fromInputDate = (inputDate) => {
    if (!inputDate) return '';
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

const App = ({
  chartData,
  chartOptions,
  selectedDate,
  setSelectedDate,
  toInputDate,
  fromInputDate,
  apiLoading,
  availableDates,
  error,
  strompreis,
  handleStrompreisChange,
  selectedRegion,
  handleRegionChange,
  openMenus,
  toggleMenu,
  verbraucherDaten,
  onCheckboxChange,
  handleWattChange,
  verbraucherBeschreibungen,
  showErweiterteOptionen,
  toggleErweiterteOptionen,
  deleteConfirmOption,
  handleDeleteOptionClick,
  confirmDeleteOption,
  cancelDeleteOption,
  erweiterteEinstellungen,
  handleErweiterteEinstellungChange,
  timePeriods,
  handleTimePeriodChange,
  removeZeitraum,
  addZeitraum,
  showNewOptionForm,
  toggleNewOptionForm,
  newOptionNames,
  handleNewOptionName,
  newOptionWatt,
  handleNewOptionWatt,
  newOptionTypes,
  handleNewOptionType,
  addNewOption,
  zusammenfassung,
  handleDownloadClick,
  showModal,
  closeModal,
  step,
  email,
  setEmail,
  agb,
  setAgb,
  werbung,
  setWerbung,
  cooldown,
  requestCode,
  code,
  setCode,
  verifyCode,
  message,
}) => {
  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          font-size: 14px;
        }

        body {
          font-family: Arial, sans-serif;
          background: #f0f0f0;
          color: #ffffff;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Container für die gesamte App */
        .app-container {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          min-height: 100vh;
        }

        /* Fixierter Chart-Bereich */
        .fixed-chart {
          position: sticky;
          top: 95px;
          z-index: 10;
          background: #333;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 12px;
        }

        .chart-container {
          height: 250px;
        }

        /* Zeitraumauswahl */
        .date-picker-container {
          background: #333;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 12px;
        }

        /* Rechenbericht */
        .calculation-report {
          background: #333;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          flex: 1;
        }

        .report-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #ffffff;
        }

        .report-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Eingabefelder */
        .input-container-html {
          display: flex;
          flex-direction: column;
        }

        .input-container-html label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .input-container-html input,
        .input-container-html select {
          padding: 6px;
          border: 1px solid #666;
          border-radius: 4px;
          font-size: 0.875rem;
          width: 100%;
          background: #444;
          color: #ffffff;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .input-container-html input:focus,
        .input-container-html select:focus {
          outline: none;
          border-color: #00f;
          box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.3);
        }

        /* Region-Buttons */
        .region-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
          margin: 8px 0;
          padding: 6px;
        }

        .region-switch-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }

        .region-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          text-align: center;
          margin-bottom: 4px;
          transition: color 0.2s ease;
        }

        .discount-switch-container {
          position: relative;
          width: 36px;
          height: 20px;
        }

        .discount-switch-input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .discount-switch-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #666;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.3s ease, box-shadow 0.2s ease;
        }

        .discount-switch-slider:before {
          position: absolute;
          content: '';
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }

        .discount-switch-input:checked + .discount-switch-slider {
          background-color: #00f;
        }

        .discount-switch-input:checked + .discount-switch-slider:before {
          transform: translateX(16px);
        }

        .discount-switch-input:focus + .discount-switch-slider {
          box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.2);
        }

        .discount-switch-slider:hover {
          background-color: #999;
        }

        .discount-switch-input:checked + .discount-switch-slider:hover {
          background-color: #0000cc;
        }

        .region-switch-wrapper:hover .region-label {
          color: #00f;
        }

        /* Menüs - Neues blockbasiertes Layout */
        .menu {
          background: #333;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 12px;
        }

        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          cursor: pointer;
          background: #666;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          color: #ffffff;
        }

        .menu-header span {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .triangle {
          transition: transform 0.3s ease;
        }

        .triangle.open {
          transform: rotate(180deg);
        }

        .menu-content {
          padding: 10px;
          background: #333;
          border-radius: 0 0 10px 10px;
        }

        /* Blockbasiertes Layout für Verbraucher */
        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: stretch;
          justify-content: center;
        }

        .block-row {
          display: flex;
          gap: 5px;
          align-items: center;
          justify-content: center;
        }

        .block {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
        }

        .gray-large {
          width: 100px;
          height: 40px;
          background-color: #666;
          border-radius: 4px;
        }

        .header-text {
          color: white;
          font-size: 12px;
          width: 100px;
          text-align: center;
        }

        .blue {
          width: 20px;
          background-color: #00f;
          border-radius: 4px;
        }

        .gray {
          width: 20px;
          background-color: #999;
          border-radius: 4px;
        }

        .yellow {
          width: 50px;
          background-color: rgb(232, 36, 203);
          border-radius: 4px;
        }

        .purple {
          width: 50px;
          background-color: #800080;
          border-radius: 4px;
        }

        .red {
          width: 30px;
          background-color: #f00;
          border-radius: 4px;
        }

        .block input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #00f;
          cursor: pointer;
        }

        .block input[type="number"] {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          color: #ffffff;
          text-align: center;
          font-size: 12px;
        }

        .block input[type="number"]:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
        }

        .block button {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 12px;
          cursor: pointer;
        }

        .block button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Einstellungen und Zeitraumbereich */
        .settings-container {
          background: #333;
          padding: 12px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .settings-container h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
        }

        .settings-container h5 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .settings-container .grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .settings-container label {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          font-weight: 600;
          color: #ffffff;
        }

        .settings-container select,
        .settings-container input {
          padding: 6px;
          border: 1px solid #666;
          border-radius: 4px;
          font-size: 0.75rem;
          width: 100%;
          background: #444;
          color: #ffffff;
        }

        .settings-container select:focus,
        .settings-container input:focus {
          outline: none;
          border-color: #00f;
          box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.2);
        }

        .radio-group-settings {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .radio-group-settings label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .radio-group-settings input {
          width: 14px;
          height: 14px;
          accent-color: #00f;
          cursor: pointer;
        }

        .zeitraum-section {
          border-top: 1px solid #666;
          padding-top: 8px;
          margin-top: 8px;
        }

        .add-option-button {
          background: #666;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          margin-top: 8px;
        }

        .add-option-button:hover {
          background: #999;
        }

        .new-option-container {
          margin-top: 8px;
          padding: 10px;
          background: #444;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .new-option-input,
        .new-option-watt {
          padding: 6px;
          border: 1px solid #666;
          border-radius: 4px;
          font-size: 0.75rem;
          width: 100%;
          background: #555;
          color: #ffffff;
        }

        .new-option-input:focus,
        .new-option-watt:focus {
          outline: none;
          border-color: #00f;
          box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.2);
        }

        .save-option-button {
          background: #666;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .save-option-button:hover {
          background: #999;
        }

        /* Modal-Styling */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .modal-content {
          background: #333;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          color: #ffffff;
        }

        .close-modal-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #ffffff;
        }

        .close-modal-button:hover {
          color: #f00;
        }

        .modal-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .modal-content p {
          font-size: 0.875rem;
          color: #ffffff;
        }

        .modal-content input {
          padding: 6px;
          border: 1px solid #666;
          border-radius: 4px;
          font-size: 0.875rem;
          width: 100%;
          background: #444;
          color: #ffffff;
        }

        .modal-content input:focus {
          outline: none;
          border-color: #00f;
          box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.2);
        }

        .modal-content label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #ffffff;
        }

        .modal-content input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #00f;
        }

        /* Dark Mode */
        .dark-mode-toggle {
          background: #666;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          margin-bottom: 12px;
          align-self: flex-start;
        }

        .dark-mode-toggle:hover {
          background: #999;
        }

        body.dark {
          background: #1f2937;
          color: #f3f4f6;
        }

        .dark .calculation-report,
        .dark .date-picker-container,
        .dark .fixed-chart,
        .dark .menu,
        .dark .menu-content {
          background: #374151;
          color: #f3f4f6;
        }

        .dark .menu-header {
          background: #4b5563;
        }

        .dark .report-title {
          color: #4ade80;
        }

        .dark .input-container-html input,
        .dark .input-container-html select {
          background: #4b5563;
          color: #f3f4f6;
          border-color: #6b7280;
        }

        /* Mobile Anpassungen */
        @media (max-width: 768px) {
          .block-row {
            flex-direction: column;
            gap: 4px;
          }

          .region-buttons {
            flex-direction: column;
          }

          .fixed-chart {
            position: relative;
            top: 0;
          }

          .chart-container {
            height: 200px;
          }

          .settings-container .grid {
            flex-direction: column;
          }

          .app-container {
            padding: 8px;
            gap: 8px;
          }

          html {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="app-container">
        {/* Dark Mode Toggle */}
        <button className="dark-mode-toggle" onClick={() => document.body.classList.toggle('dark')}>
          Dark Mode umschalten
        </button>

        {/* Fixierter Chart-Bereich */}
        <div className="fixed-chart">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Zeitraumauswahl */}
        <div className="date-picker-container">
          <div className="input-container-html">
            <label htmlFor="date-picker">Datum für dynamische Preise</label>
            <select
              id="date-picker"
              value={toInputDate(selectedDate)}
              onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
              disabled={apiLoading}
            >
              <option value="">Datum auswählen</option>
              {availableDates.map((date) => (
                <option key={date} value={toInputDate(date)}>
                  {date}
                </option>
              ))}
            </select>
            {apiLoading && <p>Lade dynamische Preise...</p>}
            {error && <p style={{ color: '#f00', fontSize: '0.75rem' }}>{error}</p>}
          </div>
        </div>

        {/* Rechenbericht */}
        <div className="calculation-report">
          <h2 className="report-title">Rechenbericht</h2>
          <div className="report-content">
            {/* Eingaben */}
            <div className="input-container-html">
              <label htmlFor="strompreis">Strompreis (€/kWh)</label>
              <input
                id="strompreis"
                type="number"
                step="0.01"
                value={strompreis}
                onChange={(e) => handleStrompreisChange(e.target.value)}
              />
            </div>

            <div className="region-buttons">
              {['KF', 'MN', 'MOD'].map((region) => (
                <div key={region} className="region-switch-wrapper">
                  <label className="region-label">{region}</label>
                  <div className="discount-switch-container">
                    <input
                      type="checkbox"
                      className="discount-switch-input"
                      id={`region-${region}`}
                      checked={selectedRegion === region}
                      onChange={() => handleRegionChange(region)}
                    />
                    <label htmlFor={`region-${region}`} className="discount-switch-slider" />
                  </div>
                </div>
              ))}
            </div>

            {error && <p style={{ color: '#f00', fontSize: '0.75rem' }}>{error}</p>}

            {/* Menüs und Verbraucher */}
            {menus.map((menu) => (
              <div key={menu.id} className="menu">
                <div className="menu-header" onClick={() => toggleMenu(menu.id)}>
                  <span>{menu.label}</span>
                  <span className={`triangle ${openMenus[menu.id] ? 'open' : ''}`}>&#9660;</span>
                </div>
                {openMenus[menu.id] && (
                  <div className="menu-content">
                    <div className="control-panel">
                      {/* Kopfzeile */}
                      <div className="block-row">
                        <div className="block gray-large">Name</div>
                        <div className="block gray">Aktiv</div>
                        <div className="block blue">Watt</div>
                        <div className="block yellow">€</div>
                        <div className="block purple">Einst.</div>
                        <div className="block red">Löschen</div>
                      </div>
                      {/* Optionen */}
                      {menu.options.map((option) => (
                        <div key={option.name} className="block-row">
                          <div className="block gray-large header-text">{option.name}</div>
                          <div className="block gray">
                            <input
                              type="checkbox"
                              checked={verbraucherDaten[option.name]?.checked || false}
                              onChange={(e) => onCheckboxChange(option.name, e.target.checked)}
                            />
                          </div>
                          <div className="block blue">
                            <input
                              type="number"
                              value={verbraucherDaten[option.name]?.watt || ''}
                              onChange={(e) => handleWattChange(option.name, e.target.value)}
                              disabled={!verbraucherDaten[option.name]?.checked}
                            />
                          </div>
                          <div className="block yellow header-text">
                            {verbraucherDaten[option.name]?.kosten || '0.00'}
                          </div>
                          {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                            <div className="block purple">
                              <button
                                onClick={() => toggleErweiterteOptionen(menu.id, option.name)}
                              >
                                {showErweiterteOptionen[menu.id]?.[option.name] ? 'Verbergen' : 'Einst.'}
                              </button>
                            </div>
                          )}
                          {(menu.id === 'grundlastverbraucher' ||
                            menu.id === 'dynamischeverbraucher' ||
                            menu.id === 'eauto') && (
                            <div className="block red">
                              <button
                                onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                              >
                                x
                              </button>
                            </div>
                          )}
                          {deleteConfirmOption?.menuId === menu.id &&
                            deleteConfirmOption?.optionName === option.name && (
                              <div className="confirm-dialog">
                                <span>{`"${option.name}" löschen?`}</span>
                                <button
                                  className="confirm-button"
                                  onClick={() => confirmDeleteOption(menu.id, option.name)}
                                >
                                  Ja
                                </button>
                                <button className="cancel-button" onClick={cancelDeleteOption}>
                                  Nein
                                </button>
                              </div>
                            )}
                          {showErweiterteOptionen[menu.id]?.[option.name] &&
                            (menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                              <div className="settings-container">
                                <h4>Einstellungen für {option.name}</h4>
                                <div className="grid">
                                  {menu.id === 'eauto' && (
                                    <>
                                      <label>
                                        Batteriekapazität (kWh)
                                        <input
                                          type="number"
                                          value={erweiterteEinstellungen[option.name]?.batterieKapazitaet || ''}
                                          onChange={(e) =>
                                            handleErweiterteEinstellungChange(
                                              option.name,
                                              'batterieKapazitaet',
                                              e.target.value,
                                              null
                                            )
                                          }
                                        />
                                      </label>
                                      <label>
                                        Wallbox-Leistung (W)
                                        <input
                                          type="number"
                                          value={erweiterteEinstellungen[option.name]?.wallboxLeistung || ''}
                                          onChange={(e) =>
                                            handleErweiterteEinstellungChange(
                                              option.name,
                                              'wallboxLeistung',
                                              e.target.value,
                                              null
                                            )
                                          }
                                        />
                                      </label>
                                      <div className="radio-group-settings">
                                        <label>
                                          <input
                                            type="radio"
                                            name={`ladung-${option.name}`}
                                            value="true"
                                            checked={erweiterteEinstellungen[option.name]?.standardLadung === true}
                                            onChange={(e) =>
                                              handleErweiterteEinstellungChange(
                                                option.name,
                                                'standardLadung',
                                                e.target.value,
                                                null
                                              )
                                            }
                                          />
                                          Standardladung
                                        </label>
                                        <label>
                                          <input
                                            type="radio"
                                            name={`ladung-${option.name}`}
                                            value="false"
                                            checked={erweiterteEinstellungen[option.name]?.standardLadung === false}
                                            onChange={(e) =>
                                              handleErweiterteEinstellungChange(
                                                option.name,
                                                'standardLadung',
                                                e.target.value,
                                                null
                                              )
                                            }
                                          />
                                          Wallbox-Ladung
                                        </label>
                                      </div>
                                      <label>
                                        Ladehäufigkeit (pro Woche)
                                        <input
                                          type="number"
                                          value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                                          onChange={(e) =>
                                            handleErweiterteEinstellungChange(
                                              option.name,
                                              'nutzung',
                                              e.target.value,
                                              null
                                            )
                                          }
                                        />
                                      </label>
                                    </>
                                  )}
                                  {menu.id === 'dynamischeverbraucher' && (
                                    <div className="dynamic-consumer-layout">
                                      <div className="block-row">
                                        <div className="block gray-large">WASCHEN</div>
                                        <input className="block blue" type="text" placeholder="Beschreibung" />
                                      </div>
                                      <div className="block-row">
                                        <div className="block gray-large">Nutzung pro Woche</div>
                                        <input
                                          className="block blue"
                                          type="number"
                                          value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                                          onChange={(e) =>
                                            handleErweiterteEinstellungChange(
                                              option.name,
                                              'nutzung',
                                              e.target.value,
                                              null
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="block-row">
                                        <div className="block gray-large">Dauer</div>
                                        <input className="block blue" type="number" step="0.1" placeholder="Stunden" />
                                      </div>
                                      <div className="block-row">
                                        <div className="block gray-large">Zeitraum</div>
                                        <select className="block blue">
                                          <option>Zeitraum wählen</option>
                                          {/* Optionen hinzufügen */}
                                        </select>
                                      </div>
                                      <div className="block-row">
                                        <div className="block gray-large">Ergebnis</div>
                                        <div className="block yellow">Berechnet...</div>
                                      </div>
                                    </div>
                                  )}
                                  <h5>Zeiträume</h5>
                                  {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum) => (
                                    <div key={zeitraum.id} className="zeitraum-section">
                                      <label>
                                        Zeitraum
                                        <select
                                          value={timePeriods.find(
                                            (p) =>
                                              p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                          )?.label || ''}
                                          onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                        >
                                          <option value="">Zeitraum wählen</option>
                                          {timePeriods.map((period) => (
                                            <option key={period.label} value={period.label}>
                                              {period.label} ({period.startzeit} - {period.endzeit})
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      <label>
                                        Dauer (Stunden)
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={zeitraum.dauer || ''}
                                          onChange={(e) =>
                                            handleErweiterteEinstellungChange(
                                              option.name,
                                              'dauer',
                                              e.target.value,
                                              zeitraum.id
                                            )
                                          }
                                        />
                                      </label>
                                      <button
                                        className="delete-option-button"
                                        onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                      >
                                        Zeitraum löschen
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="add-option-button"
                                    onClick={() => addZeitraum(option.name)}
                                  >
                                    Zeitraum hinzufügen
                                  </button>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                    {(menu.id === 'grundlastverbraucher' ||
                      menu.id === 'dynamischeverbraucher' ||
                      menu.id === 'eauto' ||
                      menu.id === 'stromerzeuger' ||
                      menu.id === 'strompeicher') && (
                      <>
                        <button
                          className="add-option-button"
                          onClick={() => toggleNewOptionForm(menu.id)}
                        >
                          {showNewOptionForm[menu.id]
                            ? 'Formular schließen'
                            : 'Neue Option hinzufügen'}
                        </button>
                        {showNewOptionForm[menu.id] && (
                          <div className="new-option-container">
                            <label>
                              Name
                              <input
                                className="new-option-input"
                                type="text"
                                value={newOptionNames[menu.id] || ''}
                                onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                              />
                            </label>
                            <label>
                              Leistung (W)
                              <input
                                className="new-option-watt"
                                type="number"
                                value={newOptionWatt[menu.id] || ''}
                                onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                              />
                            </label>
                            {(menu.id === 'dynamischeverbraucher') && (
                              <label>
                                Typ
                                <select
                                  value={newOptionTypes[menu.id] || 'week'}
                                  onChange={(e) => handleNewOptionType(menu.id, e.target.value)}
                                >
                                  <option value="week">Wöchentlich</option>
                                  <option value="day">Täglich</option>
                                </select>
                              </label>
                            )}
                            <button
                              className="save-option-button"
                              onClick={() => addNewOption(menu.id)}
                            >
                              Speichern
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Zusammenfassung */}
            <div className="calculation-report">
              <h2 className="report-title">Zusammenfassung</h2>
              <p>Grundlast Ersparnis: {zusammenfassung.grundlast} €</p>
              <p>Dynamische Ersparnis: {zusammenfassung.dynamisch} €</p>
              <p>Gesamtersparnis: {zusammenfassung.gesamt} €</p>
              <p>Gesamtwattage: {zusammenfassung.totalWattage} W</p>
            </div>

            {/* Download-Button */}
            <button className="add-option-button" onClick={handleDownloadClick}>
              Rechenbericht herunterladen
            </button>

            {/* Modal für Verifizierung */}
            {showModal && (
              <div className="modal">
                <div className="modal-content">
                  <button className="close-modal-button" onClick={closeModal}>
                    &times;
                  </button>
                  {step === 1 ? (
                    <>
                      <h2>E-Mail-Verifizierung</h2>
                      <p>Bitte gib deine E-Mail-Adresse ein, um einen Verifizierungscode zu erhalten.</p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-Mail-Adresse"
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={agb}
                          onChange={(e) => setAgb(e.target.checked)}
                        />
                        Ich akzeptiere die AGB.
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={werbung}
                          onChange={(e) => setWerbung(e.target.checked)}
                        />
                        Ich möchte Werbung erhalten.
                      </label>
                      <button
                        className="add-option-button"
                        onClick={requestCode}
                        disabled={cooldown > 0}
                      >
                        Code anfordern {cooldown > 0 ? `(${cooldown}s)` : ''}
                      </button>
                      {message && <p>{message}</p>}
                    </>
                  ) : (
                    <>
                      <h2>Code eingeben</h2>
                      <p>Bitte gib den erhaltenen Verifizierungscode ein.</p>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="6-stelliger Code"
                      />
                      <button className="add-option-button" onClick={verifyCode}>
                        Code verifizieren
                      </button>
                      {message && <p>{message}</p>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;