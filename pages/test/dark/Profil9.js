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
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: '0',
    padding: '16px',
    boxShadow: 'none',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
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
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
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
    color: '#333',
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
    fontWeight: '500',
    color: '#333',
  },
  sliderLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
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
    backgroundColor: '#ffe6ec',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  noData: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '12px',
    backgroundColor: '#f9f9f9',
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
    color: 'rgb(64 153 102)',
  },
  noteText: {
    fontSize: '12px',
    color: '#666',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    lineHeight: '1.5',
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
    backgroundColor: 'rgb(64 153 102)',
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
    color: '#333',
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
    width: '60px',
    height: 'auto',
    objectFit: 'contain',
  },
};

function StrompreisChart() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [h0Data, setH0Data] = useState([]);
  const [h0PVData, setH0PVData] = useState([]);
  const [h0PVStorageData, setH0PVStorageData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [customPrice, setCustomPrice] = useState('32');
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProfile, setActiveProfile] = useState(1);
  const [householdType, setHouseholdType] = useState('none');
  const [selectedDiscount, setSelectedDiscount] = useState(null);

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

        const h0Response = await fetch('/api/h0');
        if (!h0Response.ok) {
          throw new Error(`HTTP error for H0: ${h0Response.status}`);
        }
        const h0Result = await h0Response.json();
        if (!Array.isArray(h0Result)) {
          throw new Error('No H0 data received from API');
        }
        setH0Data(h0Result);

        const h0PVResponse = await fetch('/api/h0pv');
        if (!h0PVResponse.ok) {
          throw new Error(`HTTP error for H0PV: ${h0PVResponse.status}`);
        }
        const h0PVResult = await h0PVResponse.json();
        if (!Array.isArray(h0PVResult)) {
          throw new Error('No H0PV data received from API');
        }
        setH0PVData(h0PVResult);

        // Uncomment if /api/h0pvStorage is available
        // const h0PVStorageResponse = await fetch('/api/h0pvStorage');
        // if (!h0PVStorageResponse.ok) {
        //   throw new Error(`HTTP error for H0PVStorage: ${h0PVStorageResponse.status}`);
        // }
        // const h0PVStorageResult = await h0PVStorageResponse.json();
        // if (!Array.isArray(h0PVStorageResult)) {
        //   throw new Error('No H0PVStorage data received from API');
        // }
        // setH0PVStorageData(h0PVStorageResult);

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
        } else if (h0Result.length > 0 && h0Result[0].date) {
          setSelectedDate(new Date(h0Result[0].date.split('/').reverse().join('-')));
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
        setInputError('Bitte geben Sie einen gültigen positiven Preis in Cent/kWh ein.');
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

  const labelsAll = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const rawStrompreisValues = selectedStrompreisIndex !== -1 ? strompreisData[selectedStrompreisIndex]?.__parsed_extra.slice(0, 24) : [];
  const strompreisChartData = labelsAll
    .map((label, i) => ({ label, value: rawStrompreisValues[i], index: i }))
    .filter((entry) => entry.value != null);
  const strompreisChartValues = strompreisChartData.map((entry) => {
    const value = entry.value;
    return typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1 || null;
  });

  const selectedH0Data = h0Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedH0PVData = h0PVData.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedH0PVStorageData = h0PVStorageData.find((item) => item.date === formatDateForComparison(selectedDate));

  const calculateConsumptionAndCosts = (profile) => {
    const factor = profileFactors[profile];
    const h0Consumption = selectedH0Data?.__parsed_extra
      ? Object.values(selectedH0Data.__parsed_extra).reduce((sum, value) => sum + (value * factor || 0), 0)
      : 0;
    const h0PVConsumption = selectedH0PVData?.__parsed_extra
      ? Object.values(selectedH0PVData.__parsed_extra).reduce((sum, value) => sum + (value * factor || 0), 0)
      : 0;
    const h0PVStorageConsumption = selectedH0PVStorageData?.__parsed_extra
      ? Object.values(selectedH0PVStorageData.__parsed_extra).reduce((sum, value) => sum + (value * factor || 0), 0)
      : 0;

    const h0Cost = selectedH0Data?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedH0Data.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + ((value * factor) * price || 0);
        }, 0)
      : 0;

    const h0PVCost = selectedH0PVData?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedH0PVData.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + ((value * factor) * price || 0);
        }, 0)
      : 0;

    const h0PVStorageCost = selectedH0PVStorageData?.__parsed_extra && strompreisChartValues.length > 0
      ? Object.values(selectedH0PVStorageData.__parsed_extra).reduce((sum, value, index) => {
          const price = strompreisChartValues[index] || 0;
          return sum + ((value * factor) * price || 0);
        }, 0)
      : 0;

    const h0CustomCost = selectedH0Data?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedH0Data.__parsed_extra).reduce((sum, value) => sum + ((value * factor) * adjustedCustomPrice || 0), 0)
      : 0;

    const h0PVCustomCost = selectedH0PVData?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedH0PVData.__parsed_extra).reduce((sum, value) => sum + ((value * factor) * adjustedCustomPrice || 0), 0)
      : 0;

    const h0PVStorageCustomCost = selectedH0PVStorageData?.__parsed_extra && !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0
      ? Object.values(selectedH0PVStorageData.__parsed_extra).reduce((sum, value) => sum + ((value * factor) * adjustedCustomPrice || 0), 0)
      : 0;

    return {
      h0Consumption: h0Consumption.toFixed(3),
      h0PVConsumption: h0PVConsumption.toFixed(3),
      h0PVStorageConsumption: h0PVStorageConsumption.toFixed(3),
      h0Cost: {
        cent: h0Cost.toFixed(2),
        euro: (h0Cost / 100).toFixed(2),
      },
      h0PVCost: {
        cent: h0PVCost.toFixed(2),
        euro: (h0PVCost / 100).toFixed(2),
      },
      h0PVStorageCost: {
        cent: h0PVStorageCost.toFixed(2),
        euro: (h0PVStorageCost / 100).toFixed(2),
      },
      h0CustomCost: {
        cent: h0CustomCost.toFixed(2),
        euro: (h0CustomCost / 100).toFixed(2),
      },
      h0PVCustomCost: {
        cent: h0PVCustomCost.toFixed(2),
        euro: (h0PVCustomCost / 100).toFixed(2),
      },
      h0PVStorageCustomCost: {
        cent: h0PVStorageCustomCost.toFixed(2),
        euro: (h0PVStorageCustomCost / 100).toFixed(2),
      },
    };
  };

  const datasets = (householdType === 'none' || activeProfile === null) ? [] : [
    (() => {
      const profile = activeProfile;
      const factor = profileFactors[profile];
      const h0AdjustedValues = selectedH0Data?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedH0Data.__parsed_extra).map((h0Value, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && h0Value != null ? (h0Value * factor) * strompreisValue : null;
          })
        : Array(24).fill(null);

      const h0PVAdjustedValues = selectedH0PVData?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedH0PVData.__parsed_extra).map((h0pvValue, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && h0pvValue != null ? (h0pvValue * factor) * strompreisValue : null;
          })
        : Array(24).fill(null);

      const h0PVStorageAdjustedValues = selectedH0PVStorageData?.__parsed_extra && strompreisChartValues.length > 0
        ? Object.values(selectedH0PVStorageData.__parsed_extra).map((h0pvStorageValue, index) => {
            const strompreisValue = strompreisChartValues[index];
            return strompreisValue != null && h0pvStorageValue != null ? (h0pvStorageValue * factor) * strompreisValue : null;
          })
        : Array(24).fill(null);

      const customPriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedH0Data?.__parsed_extra
        ? Object.values(selectedH0Data.__parsed_extra).map((value) => (value * factor) * adjustedCustomPrice)
        : Array(24).fill(null);

      const customH0PVPriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedH0PVData?.__parsed_extra
        ? Object.values(selectedH0PVData.__parsed_extra).map((value) => (value * factor) * adjustedCustomPrice)
        : Array(24).fill(null);

      const customH0PVStoragePriceValues = !isNaN(adjustedCustomPrice) && adjustedCustomPrice >= 0 && selectedH0PVStorageData?.__parsed_extra
        ? Object.values(selectedH0PVStorageData.__parsed_extra).map((value) => (value * factor) * adjustedCustomPrice)
        : Array(24).fill(null);

      const datasetsForProfile = [];
      if (householdType === 'standard') {
        datasetsForProfile.push(
          {
            label: `Dynamischer Tarif (Profil ${profile}, Faktor ${factor})`,
            data: h0AdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Cent/kWh, Profil ${profile}, Faktor ${factor})`,
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
            data: h0PVAdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Cent/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customH0PVPriceValues,
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
            data: h0PVStorageAdjustedValues,
            borderColor: 'rgb(6, 35, 22)',
            backgroundColor: 'rgba(3, 160, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
          {
            label: `Normaltarif (${adjustedCustomPrice.toFixed(2) || 'N/A'} Cent/kWh, Profil ${profile}, Faktor ${factor})`,
            data: customH0PVStoragePriceValues,
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
            return `${label}: ${value} ct/kWh`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Stromkosten in ct/kWh', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        ticks: { callback: (value) => `${value.toFixed(2)}` },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
      },
    },
  };

  return (
    <div style={styles.mainContainer}>
      <style>
        {`
          .date-picker {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #f9f9f9;
            width: 100%;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #000000;
          }
          .date-picker * {
            color: #000000;
          }
          .date-picker:focus {
            outline: none;
            border-color: rgb(64, 153, 102);
            box-shadow: 0 0 0 3px rgba(3, 160, 129, 0.1);
          }
          .price-input {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #f9f9f9;
            width: 100%;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: #000000;
          }
          .price-input * {
            color: #000000;
          }
          .price-input:focus {
            outline: none;
            border-color: rgb(64, 153, 102);
            box-shadow: 0 0 0 3px rgba(3, 160, 129, 0.1);
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
            background: rgb(64, 153, 102);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            background: rgb(64, 153, 102);
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: rgb(64, 153, 102);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            background: rgb(64, 153, 102);
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
            border: 2px solid rgb(64, 153, 102);
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
            background-color: rgb(64, 153, 102);
            border-radius: 50%;
          }
          .radio-input:hover {
            border-color: rgb(64, 153, 102);
          }
          .radio-input:checked:hover::before {
            background-color: rgb(64, 153, 102);
          }
          .tooltip {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: #333;
            color: #fff;
            padding: 8px;
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
            background-color: rgb(5,166,150);
          }
          .discount-switch-container input:checked + .discount-switch-slider:before {
            transform: translateX(20px);
          }
          .discount-switch-container input:focus + .discount-switch-slider {
            box-shadow: 0 0 0 3px rgba(3, 160, 129, 0.1);
          }
          /* CSS für individuelle Bildpositionierung */
          .menschen1 {
            transform: translate(0px, 0px); /* Beispiel: Bild 1 bleibt an Originalposition */
          }
          .menschen2 {
            transform: translate(10px, 0px); /* Beispiel: Bild 2 leicht verschoben */
          }
          .menschen3 {
            transform: translate(15px, 0px); /* Beispiel: Bild 3 nach oben/links */
          }
          .menschen4 {
            transform: translate(18px, 0px); /* Beispiel: Bild 4 nach rechts */
          }
          .menschen5 {
            transform: translate(20px, 0px); /* Beispiel: Bild 5 nach unten */
          }
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
            }
            .image-container {
              flex-wrap: wrap;
              justifyContent: center;
            }
            .image {
              width: 50px;
            }
            .menschen1, .menschen2, .menschen3, .menschen4, .menschen5 {
              transform: none; /* Entfernt Verschiebung auf kleinen Bildschirmen */
            }
          }
        `}
      </style>

      <div style={styles.controlsContainer}>
        {loading && <p style={styles.loading}>⏳ Daten werden geladen...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>Wie viele Personen leben in Ihrem Haushalt?</label>
              {activeProfile >= 1 && (
                <div style={styles.imageContainer} className="image-container">
                  {['menschen1', 'menschen2', 'menschen3', 'menschen4', 'menschen5'].map((id) => (
                    <img
                      key={id}
                      src={`/bilder/${id}.jpg`}
                      alt={`Haushaltsmitglied ${id.replace('menschen', '')}`}
                      style={styles.image}
                      className={id}
                    />
                  ))}
                </div>
              )}
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
              <div style={{ fontSize: '14px', color: '#333' }}>
                {activeProfile ? `${activeProfile} Person${activeProfile === 1 ? '' : 'en'}` : '1 Person'}
              </div>
            </div>
            <div style={styles.controlGroup}>
              <label style={styles.inputLabel}>Haben Sie eine PV-Anlage?</label>
              <div style={styles.householdSelector}>
                <label style={styles.radioLabel}>
                 
                  Bitte wählen
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
              </div>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.inputLabel} htmlFor="priceInput">Preis (Cent/kWh):</label>
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
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
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
              <p style={{ fontSize: '12px', color: '#333', marginTop: '8px' }}>
                {selectedDiscount === null
                  ? `Keine Region ausgewählt, Preis: ${parseFloat(customPrice).toFixed(2) || 'N/A'} Cent/kWh`
                  : `Ausgewählte Region: ${
                      regionOptions.find((r) => r.value === selectedDiscount)?.label
                    }, Angepasster Preis: ${adjustedCustomPrice.toFixed(2)} Cent/kWh`}
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
                disabled={availableDates.length === 0 && h0Data.length === 0 && h0PVData.length === 0 && h0PVStorageData.length === 0}
              />
            </div>
          </>
        )}
      </div>

      <div style={styles.chartContainer}>
        <h2 style={styles.chartTitle}>Vergleichsansicht</h2>
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
        <Line data={combinedChart} options={combinedChartOptions} />
        {datasets.length === 0 && (
          <p style={styles.noData}>Bitte wählen Sie einen Haushaltstyp und ein Profil aus, um die Grafik zu sehen.</p>
        )}
        {strompreisChartData.length === 0 && !selectedH0Data && !selectedH0PVData && !selectedH0PVStorageData && (
          <p style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</p>
        )}
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
                  const { h0Consumption, h0PVConsumption, h0PVStorageConsumption, h0Cost, h0PVCost, h0PVStorageCost, h0CustomCost, h0PVCustomCost, h0PVStorageCustomCost } = calculateConsumptionAndCosts(profile);
                  return (
                    <tr key={profile} style={styles.summaryTableRow}>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard' ? `H0: ${h0Consumption} kWh` : householdType === 'pv' ? `H0PV: ${h0PVConsumption} kWh` : `H0PVStorage: ${h0PVStorageConsumption} kWh`}
                      </td>
                      <td style={styles.summaryTableCell}>
                        {householdType === 'standard' ? (
                          <>
                            Dynamischer Tarif: {h0Cost.euro} €<br />
                            Normaltarif: {h0CustomCost.euro} €
                          </>
                        ) : householdType === 'pv' ? (
                          <>
                            Dynamischer Tarif: {h0PVCost.euro} €<br />
                            Normaltarif: {h0PVCustomCost.euro} €
                          </>
                        ) : (
                          <>
                            Dynamischer Tarif: {h0PVStorageCost.euro} €<br />
                            Normaltarif: {h0PVStorageCustomCost.euro} €
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
        <p style={styles.noteText}>
          *Hinweis: Bei den gezeigten Daten handelt es sich um Vergleichswerte, die für 1 bis zu 5 Personen in einem Haushalt
          durchschnittlich ermittelt werden. Diese Daten sind nur als grober Richtwert zu verstehen und bieten keine genaue
          Auskunft über die zu erwartende Ersparnis gegenüber einem gewöhnlichen Stromvertrag. Für genauere Daten, die
          genau auf Ihren Haushalt abgestimmt sind, bitte zum Detailrechner wechseln.
        </p>
      </div>
    </div>
  );
}

export default StrompreisChart;