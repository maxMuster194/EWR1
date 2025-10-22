import mongoose from 'mongoose';
import GermanyMin15Prices from '@/models/min15Prices';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesome Import
import { faComment } from '@fortawesome/free-solid-svg-icons'; // Kommentar-Icon Import

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

// MongoDB-Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

// **AUF SCHLAG AUF DYNAMISCHEN PREIS (unsichtbar, standardmäßig 2.00 Cent/kWh)**
const DYNAMIC_MARKUP = 2.00;

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

// Parse DD/MM/YYYY to YYYY-MM-DD
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

const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    margin: '0',
    padding: '0',
    gap: '24px',
    backgroundColor: 'transparent',
    fontFamily: "'Inter', sans-serif",
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px',
    padding: '16px',
    backgroundColor: 'transparent',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: '16px',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#88bf50',
    margin: '24px 0 12px',
    textAlign: 'center',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    border: 'none',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
  },
  legendLabel: {
    fontSize: '14px',
    color: '#FFFFFF',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '2px solid #ccc',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    position: 'relative',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  inputLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sliderLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '12px',
  },
  error: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
    color: '#D81B60',
    backgroundColor: 'transparent',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: 'none',
  },
  noData: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '12px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    border: 'none',
  },
  consumptionSummary: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#FFFFFF',
    border: 'none',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    textAlign: 'center',
    color: '#88bf50',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  summaryTableHeader: {
    backgroundColor: '#063d37',
    color: '#fafafa',
    fontWeight: '600',
    padding: '8px',
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
  },
  summaryTableRow: {
    borderBottom: '1px solid #eee',
  },
  summaryTableCell: {
    padding: '8px',
    textAlign: 'left',
  },
  tooltipContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: '12px',
    color: '#FFFFFF',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    lineHeight: '1.5',
    border: 'none',
  },
  discountSwitchContainer: {
    display: 'inline-block',
    position: 'relative',
    width: '40px',
    height: '20px',
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
    backgroundColor: '#ccc',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  discountSwitchSliderActive: {
    backgroundColor: '#063d37',
  },
  discountSwitchSliderBefore: {
    position: 'absolute',
    content: '""',
    height: '16px',
    width: '16px',
    left: '2px',
    bottom: '2px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
  },
  discountSwitchSliderBeforeActive: {
    transform: 'translateX(20px)',
  },
  regionLabel: {
    fontSize: '14px',
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
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    margin: '12px 0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    width: '50px',
    height: 'auto',
    objectFit: 'contain',
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

  const profileFactors = { 1: 2.1, 2: 3.4, 3: 5.4, 4: 7, 5: 8.9 };
  const discounts = [
    { label: 'AM', value: 20.14 },
    { label: 'SuRo', value: 20.44 },
    { label: 'Regio', value: 20.98 },
  ];
  const regionBasisPreise = {
    'AM': 34.06,
    'SuRo': 32.84,
    'Regio': 34.35,
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForComparison = (date) => {
    return date
      ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      : '';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        setStrompreisData(data || []);

        const convertedDates = uniqueDates.map(date => {
          const [year, month, day] = date.split('-');
          return `${day}/${month}/${year}`;
        });
        setAvailableDates(convertedDates);

        const h25Response = await fetch('/api/H25');
        if (!h25Response.ok) {
          throw new Error(`HTTP error for H25: ${h25Response.status}`);
        }
        const h25Result = await h25Response.json();
        if (!Array.isArray(h25Result)) {
          throw new Error('No H25 data received from API');
        }
        setH25Data(h25Result);

        const p25Response = await fetch('/api/P25');
        if (!p25Response.ok) {
          throw new Error(`HTTP error for P25: ${p25Response.status}`);
        }
        const p25Result = await p25Response.json();
        if (!Array.isArray(p25Result)) {
          throw new Error('No P25 data received from API');
        }
        setP25Data(p25Result);

        const s25Response = await fetch('/api/S25');
        if (!s25Response.ok) {
          throw new Error(`HTTP error for S25: ${s25Response.status}`);
        }
        const s25Result = await s25Response.json();
        if (!Array.isArray(s25Result)) {
          throw new Error('No S25 data received from API');
        }
        setS25Data(s25Result);

        const currentDate = getCurrentDate();
        if (convertedDates.includes(currentDate)) {
          setSelectedDate(new Date(currentDate.split('/').reverse().join('-')));
        } else if (convertedDates.length > 0) {
          setSelectedDate(new Date(convertedDates[0].split('/').reverse().join('-')));
        } else if (h25Result.length > 0 && h25Result[0].date) {
          setSelectedDate(new Date(h25Result[0].date.split('/').reverse().join('-')));
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data, uniqueDates]);

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
    const profile = parseInt(e.target.value);
    setActiveProfile(profile);
  };

  const handleHouseholdTypeChange = (e) => {
    setHouseholdType(e.target.value);
  };

  const handleDiscountToggle = (value) => {
    const newSelectedDiscount = selectedDiscount === value ? null : value;
    setSelectedDiscount(newSelectedDiscount);
    const region = discounts.find(d => d.value === newSelectedDiscount)?.label;
    if (region) {
      setCustomPrice(regionBasisPreise[region].toFixed(2));
    } else {
      setCustomPrice('32');
    }
  };

  const adjustedCustomPrice = selectedDiscount === null 
    ? parseFloat(customPrice) 
    : (regionBasisPreise[discounts.find(d => d.value === selectedDiscount)?.label] - selectedDiscount) || parseFloat(customPrice);

  // **HILFSFUNKTION: Dynamischen Preis mit Aufschlag anpassen**
  const applyDynamicMarkup = (price) => {
    return price + DYNAMIC_MARKUP;
  };

  // useMemo für sofortige Berechnung (MIT AUF SCHLAG, UNVERÄNDERT FÜR TABELLE)
  const consumptionAndCosts = useMemo(() => {
    const factor = profileFactors[activeProfile] || 2.1;

    // Daten für das gewählte Datum holen
    const selH25 = h25Data.find(i => i.date === formatDateForComparison(selectedDate));
    const selP25 = p25Data.find(i => i.date === formatDateForComparison(selectedDate));
    const selS25 = s25Data.find(i => i.date === formatDateForComparison(selectedDate));

    // Strompreise MIT AUF SCHLAG
    const filtered = strompreisData.filter(r => r['Delivery day'] === formatDateForComparison(selectedDate));
    const priceVals = filtered.length
      ? priceFields.map(f => {
          const v = filtered[0][f]?.$numberDouble ?? filtered[0][f]?.$numberInt ?? filtered[0][f] ?? 0;
          const basePrice = parseFloat(v) * 0.1;
          return applyDynamicMarkup(basePrice); // **AUF SCHLAG ANWENDEN**
        })
      : Array(96).fill(0);

    // Hilfsfunktion: Kosten für ein Profil
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

    const h25 = calc(selH25);
    const p25 = calc(selP25);
    const s25 = calc(selS25);

    return { h25, p25, s25 };
  }, [
    activeProfile,
    householdType,
    selectedDate,
    h25Data,
    p25Data,
    s25Data,
    strompreisData,
    adjustedCustomPrice,
  ]);

  if (propsError) {
    return <p style={styles.error}>{propsError}</p>;
  }

  if (loading) {
    return <p style={styles.loading}>⏳ Daten werden geladen...</p>;
  }

  if (error) {
    return <p style={styles.error}>{error}</p>;
  }

  if (!strompreisData) {
    return <p style={styles.error}>Daten nicht verfügbar</p>;
  }

  // **STROMPREIS WERTE MIT AUF SCHLAG**
  const filteredData = strompreisData.filter(record => record['Delivery day'] === formatDateForComparison(selectedDate));
  const strompreisValues = filteredData.length > 0 ? priceFields.map(field => {
    const record = filteredData[0];
    const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || 0;
    const basePrice = parseFloat(value);
    return applyDynamicMarkup(basePrice * 0.1); // **AUF SCHLAG ANWENDEN**
  }) : [];

  const labelsAll = Array.from({ length: 24 }, (_, hour) =>
    ['00', '15', '30', '45'].map(min => `${String(hour).padStart(2, '0')}:${min}`)
  ).flat();

  const strompreisChartData = labelsAll
    .map((label, i) => ({ label, value: strompreisValues[i], index: i }))
    .filter((entry) => entry.value != null);
  const strompreisChartValues = strompreisChartData.map((entry) => entry.value);

  const selectedH25Data = h25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedP25Data = p25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedS25Data = s25Data.find((item) => item.date === formatDateForComparison(selectedDate));

  const datasets = (householdType === 'none' || activeProfile === null) ? [] : [
    (() => {
      const profile = activeProfile;
      const factor = profileFactors[profile];
      
      // **DYNAMISCHE WERTE MIT AUF SCHLAG, KOMMA VERSCHOBEN**
      const h25AdjustedValues = selectedH25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedH25Data.__parsed_extra).map((h25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && h25Value != null ? ((h25Value / 10) * factor) * strompreisValue * 10 : null; // Multiplikation mit 10
          })
        : Array(96).fill(null);

      const p25AdjustedValues = selectedP25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedP25Data.__parsed_extra).map((p25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && p25Value != null ? ((p25Value / 10) * factor) * strompreisValue * 10 : null; // Multiplikation mit 10
          })
        : Array(96).fill(null);

      const s25AdjustedValues = selectedS25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedS25Data.__parsed_extra).map((s25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && s25Value != null ? ((s25Value / 10) * factor) * strompreisValue * 10 : null; // Multiplikation mit 10
          })
        : Array(96).fill(null);

      const customPriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedH25Data?.__parsed_extra
        ? Object.values(selectedH25Data.__parsed_extra).map((value) => ((value / 10) * factor) * adjustedCustomPrice * 10) // Multiplikation mit 10
        : Array(96).fill(null);

      const customP25PriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedP25Data?.__parsed_extra
        ? Object.values(selectedP25Data.__parsed_extra).map((value) => ((value / 10) * factor) * adjustedCustomPrice * 10) // Multiplikation mit 10
        : Array(96).fill(null);

      const customS25PriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedS25Data?.__parsed_extra
        ? Object.values(selectedS25Data.__parsed_extra).map((value) => ((value / 10) * factor) * adjustedCustomPrice * 10) // Multiplikation mit 10
        : Array(96).fill(null);

      const datasetsForProfile = [];
      if (householdType === 'standard') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: h25AdjustedValues,
            borderColor: '#88bf50',
            backgroundColor: 'rgba(30, 14, 252, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customPriceValues,
            borderColor: '#063d37',
            backgroundColor: 'rgba(67, 114, 183, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
            hidden: isNaN(adjustedCustomPrice) || adjustedCustomPrice < 0,
          }
        );
      } else if (householdType === 'pv') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: p25AdjustedValues,
            borderColor: '#88bf50',
            backgroundColor: 'rgba(144, 95, 164, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customP25PriceValues,
            borderColor: '#063d37',
            backgroundColor: 'rgba(67, 114, 183, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
            hidden: isNaN(adjustedCustomPrice) || adjustedCustomPrice < 0,
          }
        );
      } else if (householdType === 'pvStorage') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: s25AdjustedValues,
            borderColor: '#88bf50',
            backgroundColor: 'rgba(144, 95, 164, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customS25PriceValues,
            borderColor: '#063d37',
            backgroundColor: 'rgba(67, 114, 183, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#333333',
            hidden: isNaN(adjustedCustomPrice) || adjustedCustomPrice < 0,
          }
        );
      }
      return datasetsForProfile;
    })(),
  ].flat();

  const combinedChart = {
    labels: labelsAll,
    datasets,
  };

  const combinedChartOptions = {
    responsive: true,
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
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.raw != null ? context.raw.toFixed(3) : 'N/A';
            return `${label}: ${value} mCt`; // Einheit geändert zu mCt
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Stromkosten in mCt', font: { size: 14, family: "'Inter', sans-serif" }, color: '#FFFFFF' }, // Einheit geändert zu mCt
        ticks: { 
          callback: (value) => `${value.toFixed(2)}`,
          color: '#FFFFFF'
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', font: { size: 14, family: "'Inter', sans-serif" }, color: '#FFFFFF' },
        ticks: { 
          color: '#FFFFFF'
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
      },
    },
  };

  return (
    <div style={styles.mainContainer}>
      <style>
        {`
          html, body {
            background-color: transparent !important;
          }
          .date-picker {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #FFFFFF;
            border-radius: 8px;
            background-color: transparent;
            width: 100%;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #FFFFFF;
          }
          .date-picker * {
            color: #FFFFFF;
            background-color: transparent;
          }
          .date-picker:focus {
            outline: none;
            border-color: #88bf50;
            box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.1);
          }
          .price-input {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #FFFFFF;
            border-radius: 8px;
            background-color: transparent;
            width: 100%;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #FFFFFF;
          }
          .price-input * {
            color: #FFFFFF;
            background-color: transparent;
          }
          .price-input:focus {
            outline: none;
            border-color: #063d37;
            box-shadow: 0 0 0 3px rgba(67, 114, 183, 0.1);
          }
          .input-error {
            color: rgb(218, 17, 17);
            font-size: 12px;
            margin-top: 4px;
          }
          .slider {
            -webkit-appearance: none;
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            outline: none;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: #063d37;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            background: #88bf50;
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #063d37;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            background: #88bf50;
          }
          .radio-input {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #ccc;
            border-radius: 50%;
            background-color: #333333;
            cursor: pointer;
            position: relative;
            transition: border-color 0.2s ease, background-color 0.2s ease;
          }
          .radio-input:checked {
            border: 2px solid #063d37;
            background-color: #333333;
          }
          .radio-input:checked::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background-color: #063d37;
            border-radius: 50%;
          }
          .radio-input:hover {
            border-color: #88bf50;
          }
          .radio-input:checked:hover::before {
            background-color: #88bf50;
          }
          .tooltip {
            position: absolute;
            bottom: 100%;
            right: 0;
            background-color: #063d37;
            color: #fff;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: normal;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            z-index: 10;
            width: 300px;
            transform: translateX(10px);
          }
          .tooltip-container:hover .tooltip {
            visibility: visible;
            opacity: 1;
            background-color: #063d37;
          }
          .discount-switch-container input:checked + .discount-switch-slider {
            background-color: #063d37;
          }
          .discount-switch-container input:checked + .discount-switch-slider:before {
            transform: translateX(20px);
          }
          .discount-switch-container input:focus + .discount-switch-slider {
            box-shadow: 0 0 0 3px rgba(67, 114, 183, 0.1);
          }
          .image-container {
            display: flex;
            flex-direction: row;
            gap: 8px;
            margin: 12px 0;
            align-items: center;
            justify-content: center;
            width: 100%;
            position: relative;
          }
.person-image {
  width: 50px;
  height: auto;
  object-fit: contain;
  transition: opacity 0.2s ease;
  filter: invert(60%) sepia(50%) saturate(1000%) hue-rotate(60deg) brightness(100%) contrast(90%);
}
          .person-1 { transform: translate(0px, 0px); }
          .person-2 { transform: translate(-10px, 0px); }
          .person-3 { transform: translate(-20px, 0px); }
          .person-4 { transform: translate(-30px, 0px); }
          .person-5 { transform: translate(-40px, 0px); }
          @media (max-width: 900px) {
            .main-container {
              flex-direction: column;
            }
            .controls-container {
              width: 100%;
            }
            .date-picker, .price-input, .slider, .radio-input {
              width: 100%;
            }
            .summary-table {
              font-size: 12px;
            }
            .summary-table-cell {
              padding: 6px;
            }
            .legend-container {
              gap: 12px;
            }
            .legend-label {
              font-size: 12px;
            }
            .legend-color {
              width: 12px;
              height: 12px;
            }
            .region-switch-wrapper {
              flex: 1;
              min-width: 60px;
              background-color: #063d37;
            }
            .image-container {
              flex-wrap: wrap;
              justify-content: center;
            }
            .person-image {
              width: 30px;
              height: auto;
              filter: invert(36%) sepia(65%) saturate(1200%) hue-rotate(260deg) brightness(95%) contrast(90%);
            }
            .person-1 { transform: translate(0px, 0px); }
            .person-2 { transform: translate(-5px, 0px); }
            .person-3 { transform: translate(-10px, 0px); }
            .person-4 { transform: translate(-15px, 0px); }
            .person-5 { transform: translate(-20px, 0px); }
          }
        `}
      </style>

      <div style={styles.mainContainer}>
        <div style={styles.controlsContainer}>
          <div style={styles.controlGroup}>
            <label style={styles.sliderLabel}>Wie viele Personen leben in Ihrem Haushalt?</label>
            <div style={styles.imageContainer} className="image-container">
              {Array.from({ length: 5 }, (_, idx) => (
                <img
                  key={`person-${idx}`}
                  src="/bilder/People1.svg"
                  alt={`Haushaltsmitglied ${idx + 1}`}
                  style={{
                    ...styles.image,
                    opacity: idx < activeProfile ? 1 : 0.3,
                  }}
                  className={`person-image person-${idx + 1}`}
                />
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={activeProfile || 1}
              onChange={handleProfileChange}
              style={{ ...styles.slider }}
              className="slider"
            />
            <div style={{ fontSize: '14px', color: '#FFFFFF' }}>
              {activeProfile ? `${activeProfile} Person${activeProfile === 1 ? '' : 'en'}` : '1 Person'}
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
                  style={styles.radioInput}
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
                  style={styles.radioInput}
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
                  style={styles.radioInput}
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
              <span style={styles.infoIcon}>?</span>
              <span className="tooltip">Ihren aktuellen Strompreis entnehmen Sie z.B. Ihrer letzten Stromrechnung</span>
            </div>
            {inputError && <p className="input-error">{inputError}</p>}
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.inputLabel}>Region auswählen:</label>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
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
            <p style={{ fontSize: '12px', color: '#FFFFFF', marginTop: '8px' }}>
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
              disabled={availableDates.length === 0 && h25Data.length === 0 && p25Data.length === 0 && s25Data.length === 0}
            />
          </div>
        </div>

        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Vergleich Normaltarif zu dynamischem Tarif gemessen am Verbrauch </h2>
          <div style={styles.legendContainer}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: '#88bf50' }} />
              <span style={styles.legendLabel}>Dynamischer Tarif</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: '#063d37' }} />
              <span style={styles.legendLabel}>Normaltarif</span>
            </div>
          </div>
          <Line data={combinedChart} options={combinedChartOptions} />
          {datasets.length === 0 && (
            <p style={styles.noData}>Bitte wählen Sie einen Haushaltstyp und ein Profil aus, um die Grafik zu sehen.</p>
          )}
          {strompreisChartData.length === 0 && !selectedH25Data && !selectedP25Data && !selectedS25Data && (
            <p style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</p>
          )}
          <div style={styles.consumptionSummary}>
            <div style={styles.tooltipContainer} className="tooltip-container">
              <h3 style={styles.summaryTitle}>Täglicher Verbrauch und Kosten</h3>
              <span className="tooltip">Preise sind auf zwei Nachkommastellen gerundet</span>
            </div>
            <table style={styles.summaryTable}>
              <thead>
                <tr>
                  <th style={styles.summaryTableHeader}>Verbrauch (kWh)</th>
                  <th style={styles.summaryTableHeader}>Kosten (Euro)</th> {/* Unverändert */}
                  <th style={styles.summaryTableHeader}>
                    <div style={styles.tooltipContainer} className="tooltip-container">
                      <span style={styles.infoIcon}>
                        <FontAwesomeIcon icon={faComment} /> {/* Korrektes Icon */}
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
                      ? `${consumptionAndCosts?.h25.cons ?? 0} kWh`
                      : householdType === 'pv'
                      ? `${consumptionAndCosts?.p25.cons ?? 0} kWh`
                      : householdType === 'pvStorage'
                      ? `${consumptionAndCosts?.s25.cons ?? 0} kWh`
                      : '0 kWh'}
                  </td>
                  <td style={styles.summaryTableCell}>
                    {householdType === 'standard' ? (
                      <>
                        Dynamischer Tarif: {((consumptionAndCosts?.h25.dyn ?? 0) / 100).toFixed(2)} €<br />
                        Normaltarif: {((consumptionAndCosts?.h25.fix ?? 0) / 100).toFixed(2)} €
                      </>
                    ) : householdType === 'pv' ? (
                      <>
                        Dynamischer Tarif: {((consumptionAndCosts?.p25.dyn ?? 0) / 100).toFixed(2)} €<br />
                        Normaltarif: {((consumptionAndCosts?.p25.fix ?? 0) / 100).toFixed(2)} €
                      </>
                    ) : householdType === 'pvStorage' ? (
                      <>
                        Dynamischer Tarif: {((consumptionAndCosts?.s25.dyn ?? 0) / 100).toFixed(2)} €<br />
                        Normaltarif: {((consumptionAndCosts?.s25.fix ?? 0) / 100).toFixed(2)} €
                      </>
                    ) : (
                      <>
                        Dynamischer Tarif: 0.00 €<br />
                        Normaltarif: 0.00 €
                      </>
                    )}
                  </td>
                  <td style={styles.summaryTableCell}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StrompreisChart;