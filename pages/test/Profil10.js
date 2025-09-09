import { useEffect, useState } from 'react';
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: '8px',
    boxShadow: '0 2px 2px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    margin: '8px 0 8px',
    textAlign: 'center',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    pointerEvents: 'none',
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
    color: '#666',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  householdSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  radioLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
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
    backgroundColor: '#fff',
    position: 'relative',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  inputLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  sliderLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  error: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#D81B60',
    backgroundColor: '#ffe6ec',
    padding: '10px',
    borderRadius: '8px',
  },
  noData: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  consumptionSummary: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    textAlign: 'center',
    color: 'rgb(5,166,150)',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  summaryTableHeader: {
    backgroundColor: 'rgb(64 153 102)',
    fontWeight: '600',
    padding: '8px',
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
    color: '#fff',
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
    width: '14px',
    height: '14px',
    cursor: 'pointer',
    color: 'rgb(64 153 102)',
  },
  noteText: {
    fontSize: '12px',
    color: '#666',
    padding: '10px',
    backgroundColor: '#fff',
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
    backgroundColor: '#ccc',
    borderRadius: '9px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  discountSwitchSliderActive: {
    backgroundColor: 'rgb(6, 35, 22)',
  },
  discountSwitchSliderBefore: {
    position: 'absolute',
    content: '""',
    height: '14px',
    width: '14px',
    left: '2px',
    bottom: '2px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
  },
  discountSwitchSliderBeforeActive: {
    transform: 'translateX(18px)',
  },
  regionLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#333',
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
  },
};

function StrompreisChart() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [h25Data, setH25Data] = useState([]);
  const [p25Data, setP25Data] = useState([]);
  const [s25Data, setS25Data] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [customPrice, setCustomPrice] = useState('32');
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProfile, setActiveProfile] = useState(1);
  const [householdType, setHouseholdType] = useState('none');
  const [selectedDiscount, setSelectedDiscount] = useState(15); // Default to KF (15)

  const profileFactors = { 1: 2.1, 2: 3.4, 3: 5.4, 4: 7, 5: 8.9 };
  const regionOptions = [
    { label: 'KF', value: 15 },
    { label: 'MN', value: 17 },
    { label: 'MOD', value: 13 },
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const strompreisRes = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!strompreisRes.ok) {
          throw new Error(`API error for Strompreis: ${strompreisRes.status} ${strompreisRes.statusText}`);
        }
        const strompreisJson = await strompreisRes.json();
        const germanyData = strompreisJson.germany || [];
        setStrompreisData(germanyData);

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

        const uniqueDates = [...new Set(
          germanyData
            .map((entry) => {
              const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
              if (!dateKey) return null;
              const dateStr = entry[dateKey];
              if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
              return dateStr;
            })
            .filter((d) => d)
        )];
        setAvailableDates(uniqueDates);

        const currentDate = getCurrentDate();
        if (uniqueDates.includes(currentDate)) {
          setSelectedDate(new Date(currentDate.split('/').reverse().join('-')));
        } else if (uniqueDates.length > 0) {
          setSelectedDate(new Date(uniqueDates[0].split('/').reverse().join('-')));
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
  }, []);

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
    setSelectedDiscount(selectedDiscount === value ? null : value);
  };

  const adjustedCustomPrice = selectedDiscount === null ? parseFloat(customPrice) : parseFloat(customPrice) - selectedDiscount;

  const selectedStrompreisIndex = strompreisData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === formatDateForComparison(selectedDate);
  });

  const labelsAll = Array.from({ length: 24 }, (_, hour) =>
    ['00', '15', '30', '45'].map(min => `${String(hour).padStart(2, '0')}:${min}`)
  ).flat();

  const rawStrompreisValues = selectedStrompreisIndex !== -1 ? strompreisData[selectedStrompreisIndex]?.__parsed_extra.slice(0, 24) : [];
  const expandedStrompreisValues = [];
  rawStrompreisValues.forEach(value => {
    expandedStrompreisValues.push(value, value, value, value);
  });

  const strompreisChartData = labelsAll
    .map((label, i) => ({ label, value: expandedStrompreisValues[i], index: i }))
    .filter((entry) => entry.value != null);
  const strompreisChartValues = strompreisChartData.map((entry) => {
    const value = entry.value;
    return typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1 || null;
  });

  const selectedH25Data = h25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedP25Data = p25Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedS25Data = s25Data.find((item) => item.date === formatDateForComparison(selectedDate));

  const calculateConsumptionAndCosts = (profile) => {
    const factor = profileFactors[profile];
    const h25Consumption = selectedH25Data?.__parsed_extra
      ? Object.values(selectedH25Data.__parsed_extra).reduce((sum, value) => sum + ((value * factor) / 10 || 0), 0)
      : 0;
    const p25Consumption = selectedP25Data?.__parsed_extra
      ? Object.values(selectedP25Data.__parsed_extra).reduce((sum, value) => sum + ((value * factor) / 10 || 0), 0)
      : 0;
    const s25Consumption = selectedS25Data?.__parsed_extra
      ? Object.values(selectedS25Data.__parsed_extra).reduce((sum, value) => sum + ((value * factor) / 10 || 0), 0)
      : 0;

    const h25Cost = selectedH25Data?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedH25Data.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + (((value * factor) / 10) * price || 0);
        }, 0)
      : 0;

    const p25Cost = selectedP25Data?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedP25Data.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + (((value * factor) / 10) * price || 0);
        }, 0)
      : 0;

    const s25Cost = selectedS25Data?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedS25Data.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + (((value * factor) / 10) * price || 0);
        }, 0)
      : 0;

    const h25CustomCost = selectedH25Data?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedH25Data.__parsed_extra).reduce((sum, value) => sum + (((value * factor) / 10) * adjustedCustomPrice || 0), 0)
      : 0;

    const p25CustomCost = selectedP25Data?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedP25Data.__parsed_extra).reduce((sum, value) => sum + (((value * factor) / 10) * adjustedCustomPrice || 0), 0)
      : 0;

    const s25CustomCost = selectedS25Data?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedS25Data.__parsed_extra).reduce((sum, value) => sum + (((value * factor) / 10) * adjustedCustomPrice || 0), 0)
      : 0;

    return {
      h25Consumption: h25Consumption.toFixed(3),
      p25Consumption: p25Consumption.toFixed(3),
      s25Consumption: s25Consumption.toFixed(3),
      h25Cost: {
        cent: h25Cost.toFixed(2),
        euro: (h25Cost / 100).toFixed(2),
      },
      p25Cost: {
        cent: p25Cost.toFixed(2),
        euro: (p25Cost / 100).toFixed(2),
      },
      s25Cost: {
        cent: s25Cost.toFixed(2),
        euro: (s25Cost / 100).toFixed(2),
      },
      h25CustomCost: {
        cent: h25CustomCost.toFixed(2),
        euro: (h25CustomCost / 100).toFixed(2),
      },
      p25CustomCost: {
        cent: p25CustomCost.toFixed(2),
        euro: (p25CustomCost / 100).toFixed(2),
      },
      s25CustomCost: {
        cent: s25CustomCost.toFixed(2),
        euro: (s25CustomCost / 100).toFixed(2),
      },
    };
  };

  const datasets = (householdType === 'none' || activeProfile === null) ? [] : [
    (() => {
      const profile = activeProfile;
      const factor = profileFactors[profile];
      const h25AdjustedValues = selectedH25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedH25Data.__parsed_extra).map((h25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && h25Value != null ? (((h25Value * factor) / 10) * strompreisValue) : null;
          })
        : Array(96).fill(null);

      const p25AdjustedValues = selectedP25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedP25Data.__parsed_extra).map((p25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && p25Value != null ? (((p25Value * factor) / 10) * strompreisValue) : null;
          })
        : Array(96).fill(null);

      const s25AdjustedValues = selectedS25Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedS25Data.__parsed_extra).map((s25Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && s25Value != null ? (((s25Value * factor) / 10) * strompreisValue) : null;
          })
        : Array(96).fill(null);

      const customPriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedH25Data?.__parsed_extra
        ? Object.values(selectedH25Data.__parsed_extra).map((value) => ((value * factor) / 10) * adjustedCustomPrice)
        : Array(96).fill(null);

      const customP25PriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedP25Data?.__parsed_extra
        ? Object.values(selectedP25Data.__parsed_extra).map((value) => ((value * factor) / 10) * adjustedCustomPrice)
        : Array(96).fill(null);

      const customS25PriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedS25Data?.__parsed_extra
        ? Object.values(selectedS25Data.__parsed_extra).map((value) => ((value * factor) / 10) * adjustedCustomPrice)
        : Array(96).fill(null);

      const datasetsForProfile = [];
      if (householdType === 'standard') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: h25AdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customPriceValues,
            borderColor: 'rgb(64, 153, 102)',
            backgroundColor: 'rgba(251, 140, 0, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
            hidden: isNaN(adjustedCustomPrice) || adjustedCustomPrice < 0,
          }
        );
      } else if (householdType === 'pv') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: p25AdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customP25PriceValues,
            borderColor: 'rgb(64, 153, 102)',
            backgroundColor: 'rgba(251, 140, 0, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
            hidden: isNaN(adjustedCustomPrice) || adjustedCustomPrice < 0,
          }
        );
      } else if (householdType === 'pvStorage') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: s25AdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Ct/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customS25PriceValues,
            borderColor: 'rgb(64, 153, 102)',
            backgroundColor: 'rgba(251, 140, 0, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
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
          label: function (context) {
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
        title: { display: true, text: 'Stromkosten in Ct', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        ticks: { callback: (value) => `${value.toFixed(2)} Ct` },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
      },
      x: {
        title: { display: true, text: '', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        ticks: {
          font: { size: 9, family: "'Inter', sans-serif" },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 24,
          padding: 5,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
      },
    },
  };

  return (
    <div style={styles.mainContainer} className="main-container">
      <style>
        {`
          .date-picker {
            padding: 8px 10px;
            font-size: 13px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background-color: #f9f9f9;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #333;
            cursor: pointer;
          }
          .date-picker:focus {
            outline: none;
            border-color: rgb(5,166,150,0.2);
            box-shadow: 0 0 0 2px rgba(5,166,150,0.2);
          }
          .price-input {
            padding: 8px 10px;
            font-size: 13px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background-color: #fff;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #333;
          }
          .price-input:focus {
            outline: none;
            border-color: rgb(5,166,150,0.2);
            box-shadow: 0 0 0 2px rgba(5,166,150,0.2);
          }
          .input-error {
            color: rgb(218, 17, 17);
            font-size: 12px;
            margin-top: 4px;
          }
          .slider {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            outline: none;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: rgb(6, 35, 22);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            background: rgb(6, 35, 22);
          }
          .slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            background: rgb(6, 35, 22);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            background: rgb(6, 35, 22);
          }
          .radio-input {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #ccc;
            border-radius: 50%;
            background-color: #fff;
            cursor: pointer;
            position: relative;
            transition: border-color 0.2s ease, background-color 0.2s ease;
          }
          .radio-input:checked {
            border: 2px solid rgb(6, 35, 22);
            background-color: #fff;
          }
          .radio-input:checked::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background-color: rgb(6, 35, 22);
            border-radius: 50%;
          }
          .radio-input:hover {
            border-color: rgb(6, 35, 22);
          }
          .tooltip {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: #333;
            color: #fff;
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
          .discount-switch-container input:checked + .discount-switch-slider {
            background-color: rgb(35, 29, 6);
          }
          .discount-switch-container input:checked + .discount-switch-slider:before {
            transform: translateX(18px);
          }
          .discount-switch-container input:focus + .discount-switch-slider {
            box-shadow: 0 0 0 2px rgba(6, 35, 22);
          }
          .image-container {
            justify-content: center;
          }
          .image {
            transition: transform 0.2s ease;
          }
          .image:hover {
            transform: scale(1.1);
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
            }
            .legend-container {
              gap: 10px;
              padding: 6px;
            }
            .legend-label {
              font-size: 10px;
            }
            .legend-color {
              width: 10px;
              height: 10px;
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
            .no-data {
              font-size: 12px !important;
              padding: 8px !important;
              width: 90% !important;
            }
            .legend-container {
              gap: 6px;
              padding: 4px;
            }
            .legend-label {
              font-size: 9px;
            }
            .legend-color {
              width: 8px;
              height: 8px;
            }
          }
        `}
      </style>

      <div style={styles.chartContainer} className="chart-container">
        <div style={styles.legendContainer}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: 'rgb(6, 35, 22)' }} />
            <span style={styles.legendLabel}>Dynamischer Tarif</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: 'rgb(64, 153, 102)' }} />
            <span style={styles.legendLabel}>Normaltarif</span>
          </div>
        </div>
        <h2 style={styles.chartTitle}>Vergleich Normaltarif zu dynamischem Tarif</h2>
        <div style={{ height: '250px', position: 'relative' }}>
          {datasets.length === 0 ? (
            <div
              style={{
                ...styles.noData,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                padding: '8px',
                textAlign: 'center',
                width: '90%',
              }}
              className="no-data"
            >
              Bitte wählen Sie einen Haushaltstyp und ein Profil aus, um die Grafik zu sehen.
            </div>
          ) : (
            <Line data={combinedChart} options={combinedChartOptions} />
          )}
          {strompreisChartData.length === 0 && !selectedH25Data && !selectedP25Data && !selectedS25Data && (
            <div
              style={{
                ...styles.noData,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                padding: '8px',
                textAlign: 'center',
                width: '90%',
              }}
              className="no-data"
            >
              ⚠️ Keine Daten für das ausgewählte Datum.
            </div>
          )}
        </div>
        {householdType !== 'none' && activeProfile && (
          <div style={styles.consumptionSummary}>
            <div style={styles.tooltipContainer} className="tooltip-container">
              <h3 style={styles.summaryTitle}>Täglicher Verbrauch und Kosten</h3>
              <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span className="tooltip">Preise sind auf zwei Nachkommastellen gerundet</span>
            </div>
            <table style={styles.summaryTable}>
              <thead>
                <tr style={styles.summaryTableHeader}>
                  <th style={styles.summaryTableCell}>Verbrauch (kWh)</th>
                  <th style={styles.summaryTableCell}>Kosten (Euro)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const profile = activeProfile;
                  const { h25Consumption, p25Consumption, s25Consumption, h25Cost, p25Cost, s25Cost, h25CustomCost, p25CustomCost, s25CustomCost } = calculateConsumptionAndCosts(profile);
                  return (
                    <tr key={profile} style={styles.summaryTableRow}>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard' ? `${h25Consumption} kWh` : householdType === 'pv' ? `${p25Consumption} kWh` : `${s25Consumption} kWh`}
                      </td>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard' ? (
                          <>
                            Dynamischer Tarif: {h25Cost.euro} €<br />
                            Normaltarif: {h25CustomCost.euro} €
                          </>
                        ) : householdType === 'pv' ? (
                          <>
                            Dynamischer Tarif: {p25Cost.euro} €<br />
                            Normaltarif: {p25CustomCost.euro} €
                          </>
                        ) : (
                          <>
                            Dynamischer Tarif: {s25Cost.euro} €<br />
                            Normaltarif: {s25CustomCost.euro} €
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.controlsContainer} className="controls-container">
        {loading && <p style={styles.loading}>⏳ Daten werden geladen...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>Wie viele Personen leben in Ihrem Haushalt?</label>
              <div style={styles.imageContainer} className="image-container">
                {['menschen1', 'menschen2', 'menschen3', 'menschen4', 'menschen5'].slice(0, activeProfile).map((id) => (
                  <img
                    key={id}
                    src={`/bilder/${id}.jpg`}
                    alt={`Haushaltsmitglied ${id.replace('menschen', '')}`}
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
                value={activeProfile || 1}
                onChange={handleProfileChange}
                className="slider"
              />
              <div style={{ fontSize: '13px', color: '#333', textAlign: 'center' }}>
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
                {regionOptions.map((region) => (
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
              <p style={{ fontSize: '12px', color: '#333', marginTop: '8px', textAlign: 'center' }}>
                {selectedDiscount === null
                  ? `Keine Region ausgewählt, Preis: ${parseFloat(customPrice).toFixed(2) || 'N/A'} Ct/kWh`
                  : `Ausgewählte Region: ${
                      regionOptions.find((r) => r.value === selectedDiscount)?.label
                    }, Angepasster Preis: ${adjustedCustomPrice.toFixed(2)} Ct/kWh`}
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
                disabled={availableDates.length === 0 && h25Data.length === 0 && p25Data.length === 0 && s25Data.length === 0}
                onKeyDown={(e) => e.preventDefault()}
                onInput={(e) => e.preventDefault()}
                popperPlacement="bottom-start"
              />
            </div>

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