import { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

// **Konstanten**
const DYNAMIC_MARKUP = 2.00; // Aufschlag in Cent/kWh

// **Styles**
const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0',
    backgroundColor: 'transparent',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  chartContainer: {
    backgroundColor: 'transparent',
    padding: '8px',
    borderRadius: '2px',
    margin: '0px 0',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    height: '300px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  controlsContainer: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '1400px',
    maxHeight: 'calc(100vh - 300px)',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#905fa4',
    margin: '8px 0 8px',
    textAlign: 'center',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: 'transparent',
    borderRadius: '4px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  legendColor: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
  legendLabel: {
    fontSize: '10px',
    color: '#FFFFFF',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'transparent',
    padding: '12px',
    borderRadius: '8px',
  },
  householdSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  radioLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  radioInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    border: '2px solid #FFFFFF',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  inputLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sliderLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loading: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#FFFFFF',
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },
  error: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ff6b6b',
    backgroundColor: 'transparent',
    padding: '10px',
    borderRadius: '8px',
  },
  noData: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#FFFFFF',
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },
  consumptionSummary: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    textAlign: 'center',
    color: '#905fa4',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  summaryTableHeader: {
    backgroundColor: '#905fa4',
    fontWeight: '600',
    padding: '8px',
    borderBottom: '1px solid #FFFFFF',
    textAlign: 'left',
    color: '#FFFFFF',
  },
  summaryTableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  summaryTableCell: {
    padding: '8px',
    textAlign: 'left',
    color: '#FFFFFF',
  },
  tooltipContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
    color: '#905fa4',
  },
  noteText: {
    fontSize: '12px',
    color: '#FFFFFF',
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    lineHeight: '1.5',
  },
  discountSwitchContainer: {
    display: 'inline-block',
    position: 'relative',
    width: '36px',
    height: '18px',
  },
  discountSwitchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  discountSwitchSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '9px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  discountSwitchSliderActive: {
    backgroundColor: '#4372b7',
  },
  discountSwitchSliderBefore: {
    position: 'absolute',
    content: '""',
    height: '14px',
    width: '14px',
    left: '2px',
    bottom: '2px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
  },
  discountSwitchSliderBeforeActive: {
    transform: 'translateX(18px)',
  },
  regionLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '4px',
  },
  regionSwitchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    margin: '8px 0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    width: '40px',
    height: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
};

function StrompreisChart({ data, uniqueDates, todayBerlin, error: propsError }) {
  const [strompreisData, setStrompreisData] = useState([]);
  const [h25Data, setH25Data] = useState([]);
  const [p25Data, setP25Data] = useState([]);
  const [s25Data, setS25Data] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [customPrice, setCustomPrice] = useState('34.06');
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProfile, setActiveProfile] = useState(1);
  const [householdType, setHouseholdType] = useState('none');
  const [selectedDiscount, setSelectedDiscount] = useState(20.14);

  // **Konstanten**
  const profileFactors = { 1: 2.1, 2: 3.4, 3: 5.4, 4: 7, 5: 8.9 };
  const discounts = [
    { label: 'AM', value: 20.14 },
    { label: 'SuRo', value: 20.44 },
    { label: 'Regio', value: 20.98 },
  ];
  const regionBasisPreise = {
    AM: 34.06,
    SuRo: 32.84,
    Regio: 34.35,
  };

  const priceFields = Array.from({ length: 24 }, (_, h) => {
    const hour = h + 1;
    if (hour === 3) {
      return ['Hour 3A Q1', 'Hour 3A Q2', 'Hour 3A Q3', 'Hour 3A Q4'];
    }
    return [
      `Hour ${hour} Q1`,
      `Hour ${hour} Q2`,
      `Hour ${hour} Q3`,
      `Hour ${hour} Q4`,
    ];
  }).flat();

  // **Hilfsfunktionen**
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForComparison = (date) => {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const applyDynamicMarkup = (price) => {
    return price + DYNAMIC_MARKUP;
  };

  // **Effekte**
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        setStrompreisData(data || []);

        const convertedDates = uniqueDates.map((date) => {
          const [year, month, day] = date.split('-');
          return `${day}/${month}/${year}`;
        });
        setAvailableDates(convertedDates);

        const fetchApiData = async (endpoint, setter) => {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`HTTP error for ${endpoint}: ${response.status}`);
          }
          const result = await response.json();
          if (!Array.isArray(result)) {
            throw new Error(`No data received from ${endpoint}`);
          }
          setter(result);
        };

        await Promise.all([
          fetchApiData('/api/H25', setH25Data),
          fetchApiData('/api/P25', setP25Data),
          fetchApiData('/api/S25', setS25Data),
        ]);

        const currentDate = getCurrentDate();
        if (convertedDates.includes(currentDate)) {
          setSelectedDate(new Date(currentDate.split('/').reverse().join('-')));
        } else if (convertedDates.length > 0) {
          setSelectedDate(new Date(convertedDates[0].split('/').reverse().join('-')));
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data, uniqueDates]);

  // **Event-Handler**
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setCustomPrice(value);
    if (value === '') {
      setInputError('Bitte geben Sie einen Preis ein.');
    } else {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue) || parsedValue < 0) {
        setInputError('Bitte geben Sie einen gültigen positiven Preis in Ct/kWh ein.');
      } else {
        setInputError(null);
      }
    }
  };

  const handleProfileChange = (e) => {
    setActiveProfile(parseInt(e.target.value));
  };

  const handleHouseholdTypeChange = (e) => {
    setHouseholdType(e.target.value);
  };

  const handleDiscountToggle = (value) => {
    const newSelectedDiscount = selectedDiscount === value ? null : value;
    setSelectedDiscount(newSelectedDiscount);
    const region = discounts.find((d) => d.value === newSelectedDiscount)?.label;
    setCustomPrice(region ? regionBasisPreise[region].toFixed(2) : '32.00');
  };

  // **Berechnungen**
  const adjustedCustomPrice = useMemo(() => {
    if (selectedDiscount === null) {
      return parseFloat(customPrice) || 0;
    }
    const region = discounts.find((d) => d.value === selectedDiscount)?.label;
    return region ? regionBasisPreise[region] - selectedDiscount : parseFloat(customPrice) || 0;
  }, [selectedDiscount, customPrice]);

  const consumptionAndCosts = useMemo(() => {
    const factor = profileFactors[activeProfile] || 2.1;
    const selH25 = h25Data.find((i) => i.date === formatDateForComparison(selectedDate));
    const selP25 = p25Data.find((i) => i.date === formatDateForComparison(selectedDate));
    const selS25 = s25Data.find((i) => i.date === formatDateForComparison(selectedDate));

    const filtered = strompreisData.filter((r) => r['Delivery day'] === formatDateForComparison(selectedDate));
    const priceVals = filtered.length
      ? priceFields.map((f) => {
          const v = filtered[0][f]?.$numberDouble ?? filtered[0][f]?.$numberInt ?? filtered[0][f] ?? 0;
          const basePrice = parseFloat(v) * 0.1;
          return applyDynamicMarkup(basePrice);
        })
      : Array(96).fill(0);

    const calc = (profileData) => {
      if (!profileData?.__parsed_extra) return { cons: 0, dyn: 0, fix: 0 };
      const cons = Object.values(profileData.__parsed_extra).reduce(
        (s, v) => s + ((v * factor) / 10 || 0),
        0
      );
      const dyn = Object.values(profileData.__parsed_extra).reduce(
        (s, v, i) => s + (((v / 10) * factor) * (priceVals[i] ?? 0)),
        0
      );
      const fix = cons * adjustedCustomPrice;
      return { cons: cons.toFixed(0), dyn: dyn.toFixed(2), fix: fix.toFixed(2) };
    };

    return {
      h25: calc(selH25),
      p25: calc(selP25),
      s25: calc(selS25),
    };
  }, [activeProfile, selectedDate, h25Data, p25Data, s25Data, strompreisData, adjustedCustomPrice]);

  // **Daten für das Diagramm**
  const filteredData = strompreisData.filter((record) => record['Delivery day'] === formatDateForComparison(selectedDate));
  const strompreisValues = filteredData.length
    ? priceFields.map((field) => {
        const value = filteredData[0][field]?.$numberDouble || filteredData[0][field]?.$numberInt || filteredData[0][field] || 0;
        return applyDynamicMarkup(parseFloat(value) * 0.1);
      })
    : Array(96).fill(0);

  const labelsAll = Array.from({ length: 24 }, (_, hour) =>
    ['00', '15', '30', '45'].map((min) => `${String(hour).padStart(2, '0')}:${min}`)
  ).flat();

  const strompreisChartData = labelsAll.map((label, i) => ({
    label,
    value: strompreisValues[i],
    index: i,
  }));

  const selectedH25Data = h25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedP25Data = p25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedS25Data = s25Data.find((item) => item.date === formatDateForComparison(selectedDate));

  const datasets = useMemo(() => {
    if (householdType === 'none' || activeProfile === null) return [];
    const factor = profileFactors[activeProfile];

    const createDataset = (data, values, labelPrefix, color) => ({
      label: `${labelPrefix} (Profil ${activeProfile}, Faktor ${factor})`,
      data: values,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 0,
      hidden: values.every((v) => v === null),
    });

    const h25Values = selectedH25Data?.__parsed_extra && strompreisValues.length
      ? Object.values(selectedH25Data.__parsed_extra).map((h25Value, index) =>
          strompreisValues[index] != null && h25Value != null ? ((h25Value / 10) * factor) * strompreisValues[index] * 10 : null
        )
      : Array(96).fill(null);

    const p25Values = selectedP25Data?.__parsed_extra && strompreisValues.length
      ? Object.values(selectedP25Data.__parsed_extra).map((p25Value, index) =>
          strompreisValues[index] != null && p25Value != null ? ((p25Value / 10) * factor) * strompreisValues[index] * 10 : null
        )
      : Array(96).fill(null);

    const s25Values = selectedS25Data?.__parsed_extra && strompreisValues.length
      ? Object.values(selectedS25Data.__parsed_extra).map((s25Value, index) =>
          strompreisValues[index] != null && s25Value != null ? ((s25Value / 10) * factor) * strompreisValues[index] * 10 : null
        )
      : Array(96).fill(null);

    const customValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? (householdType === 'standard' && selectedH25Data?.__parsed_extra
          ? Object.values(selectedH25Data.__parsed_extra)
          : householdType === 'pv' && selectedP25Data?.__parsed_extra
          ? Object.values(selectedP25Data.__parsed_extra)
          : householdType === 'pvStorage' && selectedS25Data?.__parsed_extra
          ? Object.values(selectedS25Data.__parsed_extra)
          : Array(96).fill(null)
        ).map((value) => (value != null ? ((value / 10) * factor) * adjustedCustomPrice * 10 : null))
      : Array(96).fill(null);

    const datasetsForProfile = [];
    if (householdType === 'standard') {
      datasetsForProfile.push(
        createDataset(selectedH25Data, h25Values, 'Dynamischer Tarif', '#905fa4'),
        createDataset(selectedH25Data, customValues, `Normaltarif (${adjustedCustomPrice.toFixed(2)} Ct/kWh)`, '#4372b7')
      );
    } else if (householdType === 'pv') {
      datasetsForProfile.push(
        createDataset(selectedP25Data, p25Values, 'Dynamischer Tarif', '#905fa4'),
        createDataset(selectedP25Data, customValues, `Normaltarif (${adjustedCustomPrice.toFixed(2)} Ct/kWh)`, '#4372b7')
      );
    } else if (householdType === 'pvStorage') {
      datasetsForProfile.push(
        createDataset(selectedS25Data, s25Values, 'Dynamischer Tarif', '#905fa4'),
        createDataset(selectedS25Data, customValues, `Normaltarif (${adjustedCustomPrice.toFixed(2)} Ct/kWh)`, '#4372b7')
      );
    }
    return datasetsForProfile;
  }, [
    householdType,
    activeProfile,
    selectedH25Data,
    selectedP25Data,
    selectedS25Data,
    strompreisValues,
    adjustedCustomPrice,
  ]);

  const combinedChart = {
    labels: labelsAll,
    datasets,
  };

  const combinedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw != null ? context.raw.toFixed(3) : 'N/A';
            return `${label}: ${value} Ct`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Stromkosten in Ct', font: { size: 14, family: "'Inter', sans-serif" }, color: '#FFFFFF' },
        ticks: { callback: (value) => `${value.toFixed(2)} Ct`, color: '#FFFFFF' },
        grid: { color: 'rgba(255, 255, 255, 0.2)', lineWidth: 1 },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', font: { size: 14, family: "'Inter', sans-serif" }, color: '#FFFFFF' },
        ticks: {
          font: { size: 9, family: "'Inter', sans-serif" },
          color: '#FFFFFF',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 24,
          padding: 5,
        },
        grid: { color: 'rgba(255, 255, 255, 0.2)', lineWidth: 1 },
      },
    },
  };

  // **Rendering**
  if (propsError) {
    return <p style={styles.error}>{propsError}</p>;
  }

  if (loading) {
    return <p style={styles.loading}>⏳ Daten werden geladen...</p>;
  }

  if (error) {
    return <p style={styles.error}>{error}</p>;
  }

  if (!strompreisData.length && !h25Data.length && !p25Data.length && !s25Data.length) {
    return <p style={styles.noData}>Daten nicht verfügbar</p>;
  }

  return (
    <div style={styles.mainContainer} className="main-container">
      <style>
        {`
          html, body {
            background-color: transparent !important;
            color: #FFFFFF !important;
          }
          .date-picker {
            padding: 8px 10px;
            font-size: 13px;
            border: 1px solid #FFFFFF;
            border-radius: 6px;
            background-color: transparent;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #FFFFFF;
            cursor: pointer;
          }
          .date-picker:focus {
            outline: none;
            border-color: #905fa4;
            box-shadow: 0 0 0 2px rgba(144, 95, 164, 0.2);
          }
          .price-input {
            padding: 8px 10px;
            font-size: 13px;
            border: 1px solid #FFFFFF;
            border-radius: 6px;
            background-color: transparent;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #FFFFFF;
          }
          .price-input:focus {
            outline: none;
            border-color: #4372b7;
            box-shadow: 0 0 0 2px rgba(67, 114, 183, 0.2);
          }
          .input-error {
            color: #ff6b6b !important;
            font-size: 12px;
            margin-top: 4px;
          }
          .slider {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            outline: none;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #4372b7;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            background: #905fa4;
          }
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #4372b7;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            background: #905fa4;
          }
          .radio-input {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            background-color: transparent;
            cursor: pointer;
            position: relative;
            transition: border-color 0.2s ease, background-color 0.2s ease;
          }
          .radio-input:checked {
            border: 2px solid #4372b7;
            background-color: transparent;
          }
          .radio-input:checked::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background-color: #4372b7;
            border-radius: 50%;
          }
          .radio-input:hover {
            border-color: #905fa4;
          }
          .tooltip {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: #4372b7;
            color: #FFFFFF;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            z-index: 10;
          }
          .tooltip-container:hover .tooltip {
            visibility: visible;
            opacity: 1;
          }
          .image {
            filter: brightness(0) invert(1) !important;
          }
          .no-data {
            color: #FFFFFF !important;
            background-color: transparent !important;
          }
          @media (min-width: 900px) {
            .main-container {
              flex-direction: column;
              overflow: hidden;
            }
            .chart-container {
              width: 100%;
              max-width: 98%;
              margin: 12px auto;
              height: 300px;
            }
            .controls-container {
              width: 100%;
              max-width: 1400px;
              margin: 12px auto;
              overflow-y: auto;
              overflow-x: hidden;
              max-height: calc(100vh - 300px);
            }
            .chart-title {
              font-size: 20px;
              color: #905fa4;
            }
            .image {
              width: 50px;
            }
          }
          @media (max-width: 600px) {
            .chart-container {
              margin: 4px 0;
              padding: 4px;
              max-width: 100%;
              height: 250px;
            }
            .controls-container {
              padding: 8px;
              max-width: 100%;
              max-height: calc(100vh - 250px);
            }
            .control-group {
              padding: 10px;
            }
            .summary-table {
              font-size: 12px;
            }
            .summary-table-cell {
              padding: 6px;
            }
            .image {
              width: 35px;
            }
          }
        `}
      </style>

      <div style={styles.chartContainer} className="chart-container">
        <div style={styles.legendContainer}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#905fa4' }} />
            <span style={styles.legendLabel}>Dynamischer Tarif</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#4372b7' }} />
            <span style={styles.legendLabel}>Normaltarif</span>
          </div>
        </div>
        <h2 style={styles.chartTitle}>Vergleich Normaltarif zu dynamischem Tarif</h2>
        <div style={{ height: '250px', position: 'relative' }}>
          {datasets.length === 0 ? (
            <div style={{ ...styles.noData, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', padding: '8px', textAlign: 'center', width: '90%' }} className="no-data">
              Bitte wählen Sie einen Haushaltstyp und ein Profil aus, um die Grafik zu sehen.
            </div>
          ) : (
            <Line data={combinedChart} options={combinedChartOptions} />
          )}
          {strompreisValues.every((v) => v === 0) && !selectedH25Data && !selectedP25Data && !selectedS25Data && (
            <div style={{ ...styles.noData, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', padding: '8px', textAlign: 'center', width: '90%' }} className="no-data">
              ⚠️ Keine Daten für das ausgewählte Datum.
            </div>
          )}
        </div>
      </div>

      <div style={styles.controlsContainer} className="controls-container">
        {loading && <p style={styles.loading}>⏳ Daten werden geladen...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>Wie viele Personen leben in Ihrem Haushalt?</label>
              <div style={styles.imageContainer} className="image-container">
                {Array(activeProfile)
                  .fill('People1')
                  .map((id, index) => (
                    <img
                      key={`${id}-${index}`}
                      src={`/bilder/${id}.svg`}
                      alt={`Haushaltsmitglied ${index + 1}`}
                      style={styles.image}
                      className="image"
                    />
                  ))}
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={activeProfile}
                onChange={handleProfileChange}
                className="slider"
              />
              <div style={{ fontSize: '13px', color: '#FFFFFF', textAlign: 'center' }}>
                {activeProfile} Person{activeProfile === 1 ? '' : 'en'}
              </div>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.inputLabel}>Haben Sie eine PV-Anlage?</label>
              <div style={styles.householdSelector}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    value="standard"
                    name="householdType"
                    checked={householdType === 'standard'}
                    onChange={handleHouseholdTypeChange}
                    className="radio-input"
                  />
                  Nein
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    value="pv"
                    name="householdType"
                    checked={householdType === 'pv'}
                    onChange={handleHouseholdTypeChange}
                    className="radio-input"
                  />
                  Ja
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    value="pvStorage"
                    name="householdType"
                    checked={householdType === 'pvStorage'}
                    onChange={handleHouseholdTypeChange}
                    className="radio-input"
                  />
                  Ja, mit Speicher
                </label>
              </div>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.inputLabel} htmlFor="priceInput">Preis (Ct/kWh):</label>
              <div style={styles.tooltipContainer} className="tooltip-container">
                <input
                  id="priceInput"
                  type="number"
                  value={customPrice}
                  onChange={handlePriceChange}
                  placeholder="z.B. 32"
                  className="price-input"
                  step="0.01"
                  min="0"
                />
                <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span className="tooltip">Ihren aktuellen Strompreis entnehmen Sie z.B. Ihrer letzten Stromrechnung</span>
              </div>
              {inputError && <p className="input-error">{inputError}</p>}
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.inputLabel}>Region auswählen:</label>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                {discounts.map((region) => (
                  <div key={region.value} style={styles.regionSwitchWrapper} className="region-switch-wrapper">
                    <span style={styles.regionLabel}>{region.label}</span>
                    <label style={{ display: 'block', cursor: 'pointer' }}>
                      <div style={styles.discountSwitchContainer} className="discount-switch-container">
                        <input
                          type="checkbox"
                          id={`region-${region.value}`}
                          checked={selectedDiscount === region.value}
                          onChange={() => handleDiscountToggle(region.value)}
                          style={styles.discountSwitchInput}
                        />
                        <span
                          style={{
                            ...styles.discountSwitchSlider,
                            ...(selectedDiscount === region.value ? styles.discountSwitchSliderActive : {}),
                          }}
                        >
                          <span
                            style={{
                              ...styles.discountSwitchSliderBefore,
                              ...(selectedDiscount === region.value ? styles.discountSwitchSliderBeforeActive : {}),
                            }}
                          />
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#FFFFFF', marginTop: '8px', textAlign: 'center' }}>
                {selectedDiscount === null
                  ? `Keine Region ausgewählt, Preis: ${parseFloat(customPrice).toFixed(2) || 'N/A'} Ct/kWh`
                  : `Ausgewählte Region: ${
                      discounts.find((r) => r.value === selectedDiscount)?.label
                    }, Basispreis: ${regionBasisPreise[discounts.find((r) => r.value === selectedDiscount)?.label].toFixed(2)} Ct/kWh, Angepasster Preis: ${adjustedCustomPrice.toFixed(2)} Ct/kWh`}
              </p>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.inputLabel} htmlFor="datePicker">Datum auswählen:</label>
              <DatePicker
                id="datePicker"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Datum auswählen"
                className="date-picker"
                includeDates={availableDates.map((dateStr) => {
                  const [day, month, year] = dateStr.split('/');
                  return new Date(`${year}-${month}-${day}`);
                })}
                showPopperArrow={false}
                disabled={availableDates.length === 0}
                popperPlacement="bottom-start"
              />
            </div>

            {householdType !== 'none' && activeProfile && (
              <div style={styles.consumptionSummary}>
                <div style={styles.tooltipContainer} className="tooltip-container">
                  <h3 style={styles.summaryTitle}>Täglicher Verbrauch und Kosten</h3>
                  <span className="tooltip">Preise sind auf zwei Nachkommastellen gerundet</span>
                </div>
                <table style={styles.summaryTable}>
                  <thead>
                    <tr>
                      <th style={styles.summaryTableHeader}>Verbrauch (kWh)</th>
                      <th style={styles.summaryTableHeader}>Kosten (Euro)</th>
                      <th style={styles.summaryTableHeader}>
                        <div style={styles.tooltipContainer} className="tooltip-container">
                          <span style={styles.infoIcon}>
                            <FontAwesomeIcon icon={faComment} />
                          </span>
                          <span className="tooltip">
                            *Hinweis: Bei den gezeigten Daten handelt es sich um Vergleichswerte, die für 1 bis zu 5 Personen in einem Haushalt
                            durchschnittlich ermittelt werden. Diese Daten sind nur als grober Richtwert zu verstehen und bieten keine genaue
                            Auskunft über die zu erwartende Ersparnis gegenüber einem gewöhnlichen Stromvertrag. Für genauere Daten, die
                            genau auf Ihren Haushalt abgestimmt sind, bitte zum Detailrechner wechseln.
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.summaryTableRow}>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard'
                          ? `${consumptionAndCosts.h25.cons} kWh`
                          : householdType === 'pv'
                          ? `${consumptionAndCosts.p25.cons} kWh`
                          : `${consumptionAndCosts.s25.cons} kWh`}
                      </td>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard' ? (
                          <>
                            Dynamischer Tarif: {(consumptionAndCosts.h25.dyn / 100).toFixed(2)} €<br />
                            Normaltarif: {(consumptionAndCosts.h25.fix / 100).toFixed(2)} €
                          </>
                        ) : householdType === 'pv' ? (
                          <>
                            Dynamischer Tarif: {(consumptionAndCosts.p25.dyn / 100).toFixed(2)} €<br />
                            Normaltarif: {(consumptionAndCosts.p25.fix / 100).toFixed(2)} €
                          </>
                        ) : (
                          <>
                            Dynamischer Tarif: {(consumptionAndCosts.s25.dyn / 100).toFixed(2)} €<br />
                            Normaltarif: {(consumptionAndCosts.s25.fix / 100).toFixed(2)} €
                          </>
                        )}
                      </td>
                      <td style={styles.summaryTableCell}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <p style={styles.noteText}>
              *Hinweis: Bei den gezeigten Daten handelt es sich um Vergleichswerte, die für 1 bis zu 5 Personen in einem Haushalt
              durchschnittlich ermittelt werden. Diese Daten sind nur als grober Richtwert zu verstehen und bieten keine genaue
              Auskunft über die zu erwartende Ersparnis gegenüber einem gewöhnlichen Stromvertrag. Für genauere Daten, die
              genau auf Ihren Haushalt abgestimmt sind, bitte zum Detailrechner wechseln.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default StrompreisChart;