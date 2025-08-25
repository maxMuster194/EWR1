import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const calendarWeeks = {
  '01/2025': [
    { kw: '01', days: ['30/12/2024', '31/12/2024', '01/01/2025', '02/01/2025', '03/01/2025', '04/01/2025', '05/01/2025'] },
    { kw: '02', days: ['06/01/2025', '07/01/2025', '08/01/2025', '09/01/2025', '10/01/2025', '11/01/2025', '12/01/2025'] },
    { kw: '03', days: ['13/01/2025', '14/01/2025', '15/01/2025', '16/01/2025', '17/01/2025', '18/01/2025', '19/01/2025'] },
    { kw: '04', days: ['20/01/2025', '21/01/2025', '22/01/2025', '23/01/2025', '24/01/2025', '25/01/2025', '26/01/2025'] },
    { kw: '05', days: ['27/01/2025', '28/01/2025', '29/01/2025', '30/01/2025', '31/01/2025', '01/02/2025', '02/02/2025'] },
  ],
  '02/2025': [
    { kw: '05', days: ['27/01/2025', '28/01/2025', '29/01/2025', '30/01/2025', '31/01/2025', '01/02/2025', '02/02/2025'] },
    { kw: '06', days: ['03/02/2025', '04/02/2025', '05/02/2025', '06/02/2025', '07/02/2025', '08/02/2025', '09/02/2025'] },
    { kw: '07', days: ['10/02/2025', '11/02/2025', '12/02/2025', '13/02/2025', '14/02/2025', '15/02/2025', '16/02/2025'] },
    { kw: '08', days: ['17/02/2025', '18/02/2025', '19/02/2025', '20/02/2025', '21/02/2025', '22/02/2025', '23/02/2025'] },
    { kw: '09', days: ['24/02/2025', '25/02/2025', '26/02/2025', '27/02/2025', '28/02/2025', '01/03/2025', '02/03/2025'] },
  ],
  '03/2025': [
    { kw: '09', days: ['24/02/2025', '25/02/2025', '26/02/2025', '27/02/2025', '28/02/2025', '01/03/2025', '02/03/2025'] },
    { kw: '10', days: ['03/03/2025', '04/03/2025', '05/03/2025', '06/03/2025', '07/03/2025', '08/03/2025', '09/03/2025'] },
    { kw: '11', days: ['10/03/2025', '11/03/2025', '12/03/2025', '13/03/2025', '14/03/2025', '15/03/2025', '16/03/2025'] },
    { kw: '12', days: ['17/03/2025', '18/03/2025', '19/03/2025', '20/03/2025', '21/03/2025', '22/03/2025', '23/03/2025'] },
    { kw: '13', days: ['24/03/2025', '25/03/2025', '26/03/2025', '27/03/2025', '28/03/2025', '29/03/2025', '30/03/2025'] },
    { kw: '14', days: ['31/03/2025', '01/04/2025', '02/04/2025', '03/04/2025', '04/04/2025', '05/04/2025', '06/04/2025'] },
  ],
  '04/2025': [
    { kw: '14', days: ['31/03/2025', '01/04/2025', '02/04/2025', '03/04/2025', '04/04/2025', '05/04/2025', '06/04/2025'] },
    { kw: '15', days: ['07/04/2025', '08/04/2025', '09/04/2025', '10/04/2025', '11/04/2025', '12/04/2025', '13/04/2025'] },
    { kw: '16', days: ['14/04/2025', '15/04/2025', '16/04/2025', '17/04/2025', '18/04/2025', '19/04/2025', '20/04/2025'] },
    { kw: '17', days: ['21/04/2025', '22/04/2025', '23/04/2025', '24/04/2025', '25/04/2025', '26/04/2025', '27/04/2025'] },
    { kw: '18', days: ['28/04/2025', '29/04/2025', '30/04/2025', '01/05/2025', '02/05/2025', '03/05/2025', '04/05/2025'] },
  ],
  '05/2025': [
    { kw: '18', days: ['28/04/2025', '29/04/2025', '30/04/2025', '01/05/2025', '02/05/2025', '03/05/2025', '04/05/2025'] },
    { kw: '19', days: ['05/05/2025', '06/05/2025', '07/05/2025', '08/05/2025', '09/05/2025', '10/05/2025', '11/05/2025'] },
    { kw: '20', days: ['12/05/2025', '13/05/2025', '14/05/2025', '15/05/2025', '16/05/2025', '17/05/2025', '18/05/2025'] },
    { kw: '21', days: ['19/05/2025', '20/05/2025', '21/05/2025', '22/05/2025', '23/05/2025', '24/05/2025', '25/05/2025'] },
    { kw: '22', days: ['26/05/2025', '27/05/2025', '28/05/2025', '29/05/2025', '30/05/2025', '31/05/2025', '01/06/2025'] },
  ],
  '06/2025': [
    { kw: '22', days: ['26/05/2025', '27/05/2025', '28/05/2025', '29/05/2025', '30/05/2025', '31/05/2025', '01/06/2025'] },
    { kw: '23', days: ['02/06/2025', '03/06/2025', '04/06/2025', '05/06/2025', '06/06/2025', '07/06/2025', '08/06/2025'] },
    { kw: '24', days: ['09/06/2025', '10/06/2025', '11/06/2025', '12/06/2025', '13/06/2025', '14/06/2025', '15/06/2025'] },
    { kw: '25', days: ['16/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025', '21/06/2025', '22/06/2025'] },
    { kw: '26', days: ['23/06/2025', '24/06/2025', '25/06/2025', '26/06/2025', '27/06/2025', '28/06/2025', '29/06/2025'] },
    { kw: '27', days: ['30/06/2025', '01/07/2025', '02/07/2025', '03/07/2025', '04/07/2025', '05/07/2025', '06/07/2025'] },
  ],
  '07/2025': [
    { kw: '27', days: ['30/06/2025', '01/07/2025', '02/07/2025', '03/07/2025', '04/07/2025', '05/07/2025', '06/07/2025'] },
    { kw: '28', days: ['07/07/2025', '08/07/2025', '09/07/2025', '10/07/2025', '11/07/2025', '12/07/2025', '13/07/2025'] },
    { kw: '29', days: ['14/07/2025', '15/07/2025', '16/07/2025', '17/07/2025', '18/07/2025', '19/07/2025', '20/07/2025'] },
    { kw: '30', days: ['21/07/2025', '22/07/2025', '23/07/2025', '24/07/2025', '25/07/2025', '26/07/2025', '27/07/2025'] },
    { kw: '31', days: ['28/07/2025', '29/07/2025', '30/07/2025', '31/07/2025', '01/08/2025', '02/08/2025', '03/08/2025'] },
  ],
  '08/2025': [
    { kw: '31', days: ['28/07/2025', '29/07/2025', '30/07/2025', '31/07/2025', '01/08/2025', '02/08/2025', '03/08/2025'] },
    { kw: '32', days: ['04/08/2025', '05/08/2025', '06/08/2025', '07/08/2025', '08/08/2025', '09/08/2025', '10/08/2025'] },
    { kw: '33', days: ['11/08/2025', '12/08/2025', '13/08/2025', '14/08/2025', '15/08/2025', '16/08/2025', '17/08/2025'] },
    { kw: '34', days: ['18/08/2025', '19/08/2025', '20/08/2025', '21/08/2025', '22/08/2025', '23/08/2025', '24/08/2025'] },
    { kw: '35', days: ['25/08/2025', '26/08/2025', '27/08/2025', '28/08/2025', '29/08/2025', '30/08/2025', '31/08/2025'] },
  ],
  '09/2025': [
    { kw: '36', days: ['01/09/2025', '02/09/2025', '03/09/2025', '04/09/2025', '05/09/2025', '06/09/2025', '07/09/2025'] },
    { kw: '37', days: ['08/09/2025', '09/09/2025', '10/09/2025', '11/09/2025', '12/09/2025', '13/09/2025', '14/09/2025'] },
    { kw: '38', days: ['15/09/2025', '16/09/2025', '17/09/2025', '18/09/2025', '19/09/2025', '20/09/2025', '21/09/2025'] },
    { kw: '39', days: ['22/09/2025', '23/09/2025', '24/09/2025', '25/09/2025', '26/09/2025', '27/09/2025', '28/09/2025'] },
    { kw: '40', days: ['29/09/2025', '30/09/2025', '01/10/2025', '02/10/2025', '03/10/2025', '04/10/2025', '05/10/2025'] },
  ],
  '10/2025': [
    { kw: '40', days: ['29/09/2025', '30/09/2025', '01/10/2025', '02/10/2025', '03/10/2025', '04/10/2025', '05/10/2025'] },
    { kw: '41', days: ['06/10/2025', '07/10/2025', '08/10/2025', '09/10/2025', '10/10/2025', '11/10/2025', '12/10/2025'] },
    { kw: '42', days: ['13/10/2025', '14/10/2025', '15/10/2025', '16/10/2025', '17/10/2025', '18/10/2025', '19/10/2025'] },
    { kw: '43', days: ['20/10/2025', '21/10/2025', '22/10/2025', '23/10/2025', '24/10/2025', '25/10/2025', '26/10/2025'] },
    { kw: '44', days: ['27/10/2025', '28/10/2025', '29/10/2025', '30/10/2025', '31/10/2025', '01/11/2025', '02/11/2025'] },
  ],
  '11/2025': [
    { kw: '44', days: ['27/10/2025', '28/10/2025', '29/10/2025', '30/10/2025', '31/10/2025', '01/11/2025', '02/11/2025'] },
    { kw: '45', days: ['03/11/2025', '04/11/2025', '05/11/2025', '06/11/2025', '07/11/2025', '08/11/2025', '09/11/2025'] },
    { kw: '46', days: ['10/11/2025', '11/11/2025', '12/11/2025', '13/11/2025', '14/11/2025', '15/11/2025', '16/11/2025'] },
    { kw: '47', days: ['17/11/2025', '18/11/2025', '19/11/2025', '20/11/2025', '21/11/2025', '22/11/2025', '23/11/2025'] },
    { kw: '48', days: ['24/11/2025', '25/11/2025', '26/11/2025', '27/11/2025', '28/11/2025', '29/11/2025', '30/11/2025'] },
  ],
  '12/2025': [
    { kw: '49', days: ['01/12/2025', '02/12/2025', '03/12/2025', '04/12/2025', '05/12/2025', '06/12/2025', '07/12/2025'] },
    { kw: '50', days: ['08/12/2025', '09/12/2025', '10/12/2025', '11/12/2025', '12/12/2025', '13/12/2025', '14/12/2025'] },
    { kw: '51', days: ['15/12/2025', '16/12/2025', '17/12/2025', '18/12/2025', '19/12/2025', '20/12/2025', '21/12/2025'] },
    { kw: '52', days: ['22/12/2025', '23/12/2025', '24/12/2025', '25/12/2025', '26/12/2025', '27/12/2025', '28/12/2025'] },
    { kw: '53', days: ['29/12/2025', '30/12/2025', '31/12/2025', '01/01/2026', '02/01/2026', '03/01/2026', '04/01/2026'] },
  ],
};

export default function DynamicTariffDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [eigenerPreis, setEigenerPreis] = useState('');
  const [displayedKwh, setDisplayedKwh] = useState({});
  const [displayedSavings, setDisplayedSavings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [tomorrowPrices, setTomorrowPrices] = useState([]);
  const [tomorrowDate, setTomorrowDate] = useState('');

  const months = [
    '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
    '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
  ];

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

  const discounts = [
    { label: 'KF', value: 15, tooltip: '15 Cent/kWh Rabatt' },
    { label: 'MOD', value: 13, tooltip: '13 Cent/kWh Rabatt' },
    { label: 'MN', value: 17, tooltip: '17 Cent/kWh Rabatt' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mongodb', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        const germanyData = json.germany || [];
        if (!germanyData.length) {
          setData([]);
          setLoading(false);
          return;
        }

        const uniqueData = [];
        const seenDates = new Set();
        germanyData.forEach((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          if (!dateKey) return;
          const dateStr = entry[dateKey];
          if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return;
          if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueData.push(entry);
          }
        });

        const sortedData = uniqueData.sort((a, b) => {
          const dateKeyA = Object.keys(a).find((key) => key.includes('Prices - EPEX'));
          const dateKeyB = Object.keys(b).find((key) => key.includes('Prices - EPEX'));
          if (!dateKeyA || !dateKeyB) return 0;
          const [dayA, monthA, yearA] = a[dateKeyA].split('/').map(Number);
          const [dayB, monthB, yearB] = b[dateKeyB].split('/').map(Number);
          return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        setData(sortedData);

        const groupedByMonth = {};
        sortedData.forEach((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          if (!dateKey) return;
          const dateStr = entry[dateKey];
          if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return;

          const [, month, year] = dateStr.split('/').map(Number);
          const monthKey = `${month.toString().padStart(2, '0')}/${year}`;

          if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];

          const prices = entry.__parsed_extra?.slice(0, 24) || [];
          const validPrices = prices
            .map((v) => {
              const num = typeof v === 'number' ? v : parseFloat(v);
              return isNaN(num) ? null : num * 0.1;
            })
            .filter((v) => v !== null);

          const dailyAverage = validPrices.length > 0
            ? (validPrices.reduce((sum, val) => sum + val, 0) / validPrices.length).toFixed(2)
            : null;

          groupedByMonth[monthKey].push({
            date: dateStr,
            average: dailyAverage !== null ? dailyAverage : '–',
            hourlyPrices: validPrices,
          });
        });

        setMonthlyData(groupedByMonth);

        // Find tomorrow's date (assuming current date is 14/08/2025, tomorrow is 15/08/2025)
        const currentDate = new Date(2025, 7, 14); // August is month 7 (0-indexed)
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;

        setTomorrowDate(tomorrowStr);

        const tomorrowEntry = sortedData.find((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          return entry[dateKey] === tomorrowStr;
        });

        if (tomorrowEntry) {
          const prices = tomorrowEntry.__parsed_extra?.slice(0, 24) || [];
          const validPrices = prices
            .map((v) => {
              const num = typeof v === 'number' ? v : parseFloat(v);
              return isNaN(num) ? null : num * 0.1;
            })
            .filter((v) => v !== null);
          setTomorrowPrices(validPrices);
        }

      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!verbrauchInput || parseFloat(verbrauchInput) <= 0) {
      setDisplayedKwh({});
      setDisplayedSavings({});
      return;
    }

    const jahresVerbrauch = parseFloat(verbrauchInput);
    const monatsVerbrauch = jahresVerbrauch / 12;
    const kwhValues = {};
    const savingsValues = {};

    months.forEach((monthKey) => {
      const monthData = monthlyData[monthKey] || [];
      let kwhValue = '–';
      let savingsValue = '–';

      if (monthData.length > 0) {
        kwhValue = monatsVerbrauch.toFixed(2);
        const monthlyAverage = calculateMonthlyAverage(monthData);
        if (monthlyAverage !== '–' && eigenerPreis) {
          const adjustedPrice = getAdjustedPrice();
          const kostenDynamisch = (parseFloat(monthlyAverage) * monatsVerbrauch) / 100;
          const kostenEigener = (adjustedPrice * monatsVerbrauch) / 100;
          savingsValue = (kostenEigener - kostenDynamisch).toFixed(2);
        }
      }

      kwhValues[monthKey] = kwhValue;
      savingsValues[monthKey] = savingsValue;
    });

    setDisplayedKwh(kwhValues);
    setDisplayedSavings(savingsValues);
  }, [verbrauchInput, eigenerPreis, selectedDiscount, monthlyData]);

  const calculateWeeklyAverages = (monthKey, monthData) => {
    const weeks = calendarWeeks[monthKey] || [];
    const weeklyAverages = [];

    weeks.forEach((week) => {
      if (monthKey === '01/2025' && week.kw === '01') {
        weeklyAverages.push({ kw: '01', average: '0.00', days: week.days });
      } else {
        const weekDays = week.days.filter((day) => {
          const [, month, year] = day.split('/').map(Number);
          return `${month.toString().padStart(2, '0')}/${year}` === monthKey;
        });

        const validAverages = weekDays
          .map((day) => {
            const dayData = monthData.find((d) => d.date === day);
            return dayData && dayData.average !== '–' ? parseFloat(dayData.average) : null;
          })
          .filter((avg) => avg !== null);

        const weeklyAverage = validAverages.length > 0
          ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
          : '–';

        weeklyAverages.push({ kw: week.kw, average: weeklyAverage, days: week.days });
      }
    });

    return weeklyAverages;
  };

  const calculateMonthlyAverage = (monthData) => {
    const validAverages = monthData
      .filter((day) => day.average !== '–')
      .map((day) => parseFloat(day.average));

    return validAverages.length > 0
      ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
      : '–';
  };

  const getWeekDateRange = (days) => {
    if (!days || !days.length) return '–';
    const startDate = days[0];
    const endDate = days[days.length - 1];
    return `${startDate} - ${endDate}`;
  };

  const handleCardClick = (monthKey) => {
    setSelectedMonth(monthKey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMonth(null);
  };

  const handleDiscountClick = (discount) => {
    setSelectedDiscount(discount.label === selectedDiscount?.label ? null : discount);
  };

  const getAdjustedPrice = () => {
    const basePrice = parseFloat(eigenerPreis) || 0;
    return selectedDiscount ? Math.max(0, basePrice - selectedDiscount.value) : basePrice;
  };

  // New functions for the requested features
  const getCheapestHourTomorrow = () => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const minPrice = Math.min(...tomorrowPrices);
    const hour = tomorrowPrices.indexOf(minPrice);
    return `${hour}:00 - ${hour + 1}:00 Uhr (Preis: ${minPrice.toFixed(2)} Cent/kWh)`;
  };

  const getMostExpensiveHourTomorrow = () => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const maxPrice = Math.max(...tomorrowPrices);
    const hour = tomorrowPrices.indexOf(maxPrice);
    return `${hour}:00 - ${hour + 1}:00 Uhr (Preis: ${maxPrice.toFixed(2)} Cent/kWh)`;
  };

  const getAverageCostTomorrow = () => {
    if (!tomorrowPrices.length) return '–';
    const avg = tomorrowPrices.reduce((sum, val) => sum + val, 0) / tomorrowPrices.length;
    return avg.toFixed(2);
  };

  const getDifferenceDynamicVsStandard = (period = 'tomorrow') => {
    const adjustedPrice = getAdjustedPrice();
    if (!adjustedPrice) return '–';

    if (period === 'tomorrow') {
      const avgDynamic = parseFloat(getAverageCostTomorrow()) || 0;
      return (adjustedPrice - avgDynamic).toFixed(2);
    } else { // for a month, using selectedMonth or default to current
      const monthKey = selectedMonth || '08/2025'; // Default to August
      const monthData = monthlyData[monthKey] || [];
      const monthlyAvg = parseFloat(calculateMonthlyAverage(monthData)) || 0;
      return (adjustedPrice - monthlyAvg).toFixed(2);
    }
  };

  const getSavingsByShifting = (device = 'E-Auto', kwh = 10) => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const minPrice = Math.min(...tomorrowPrices);
    const maxPrice = Math.max(...tomorrowPrices);
    const savingsPerKwh = maxPrice - minPrice;
    return (savingsPerKwh * kwh / 100).toFixed(2); // in €
  };

  const getPriceDevelopment = () => {
    if (!tomorrowPrices.length) return { morning: '–', evening: '–', night: '–' };
    const morning = tomorrowPrices.slice(6, 12).reduce((sum, val) => sum + val, 0) / 6 || 0;
    const evening = tomorrowPrices.slice(18, 22).reduce((sum, val) => sum + val, 0) / 4 || 0;
    const night = [...tomorrowPrices.slice(0, 6), ...tomorrowPrices.slice(22, 24)].reduce((sum, val) => sum + val, 0) / 8 || 0;
    return {
      morning: morning.toFixed(2),
      evening: evening.toFixed(2),
      night: night.toFixed(2),
    };
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-2xl text-[#001f3f] bg-gray-100 rounded-2xl">
        ⏳ Daten werden geladen…
      </div>
    );
  }

  if (!data.length && !Object.keys(monthlyData).length) {
    return (
      <div className="text-center p-10 text-2xl text-[#001f3f] bg-gray-100 rounded-2xl">
        ⚠️ Keine Daten gefunden.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-[#001f3f] text-center mb-8">Dynamischer Tarif Dashboard</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <label className="block text-xl font-semibold text-[#001f3f] mb-4 text-center">
          Jährlichen Verbrauch und Preis eingeben
        </label>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <div className="relative">
            <input
              type="number"
              id="verbrauchInput"
              placeholder="z. B. 3600 kWh/Jahr"
              value={verbrauchInput}
              onChange={(e) => setVerbrauchInput(e.target.value)}
              className="p-3 text-lg border-2 border-[#001f3f] rounded-lg w-64 bg-white text-[#001f3f] focus:border-[#007bff] focus:shadow-md transition-all"
              title="Jährlicher Verbrauch in kWh"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              id="eigenerPreis"
              placeholder="z. B. 30 Cent/kWh"
              value={eigenerPreis}
              onChange={(e) => setEigenerPreis(e.target.value)}
              className="p-3 text-lg border-2 border-[#001f3f] rounded-lg w-64 bg-white text-[#001f3f] focus:border-[#007bff] focus:shadow-md transition-all"
              title="Preis pro kWh in Cent"
            />
          </div>
        </div>
        <div className="flex gap-4 justify-center mt-4 flex-wrap">
          {discounts.map((discount) => (
            <button
              key={discount.label}
              onClick={() => handleDiscountClick(discount)}
              className={`px-4 py-2 text-lg font-medium rounded-lg transition-all ${
                selectedDiscount?.label === discount.label
                  ? 'bg-[#001f3f] text-white shadow-md'
                  : 'bg-[#007bff] text-white hover:bg-[#001f3f]'
              }`}
              title={discount.tooltip}
            >
              {discount.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Section: Daily Dynamic Tariff Chart for Tomorrow */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-[#001f3f] text-center mb-4">Dynamischer Tarif über den Tag (Morgen: {tomorrowDate})</h2>
        {tomorrowPrices.length > 0 ? (
          <Line
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
              datasets: [
                {
                  label: 'Stündliche Preise (Cent/kWh)',
                  data: tomorrowPrices,
                  borderColor: '#007bff',
                  backgroundColor: 'rgba(0, 123, 255, 0.2)',
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: '#001f3f',
                    font: { size: 14, weight: '500' },
                  },
                },
                tooltip: {
                  backgroundColor: '#001f3f',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: '#001f3f',
                    callback: (value) => `${value.toFixed(2)} ct`,
                  },
                  grid: { color: 'rgba(0, 31, 63, 0.1)' },
                },
                x: {
                  ticks: { color: '#001f3f' },
                  grid: { color: 'rgba(0, 31, 63, 0.1)' },
                },
              },
            }}
          />
        ) : (
          <p className="text-center text-[#001f3f]">Keine Daten für morgen verfügbar.</p>
        )}
      </div>

      {/* Integrated Questions Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-[#001f3f] text-center mb-4">Häufige Fragen zu Preisen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#212121]">Wann ist morgen die billigste Stunde?</p>
            <p>{getCheapestHourTomorrow()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#001f3f]">Wann ist morgen die teuerste Stunde?</p>
            <p>{getMostExpensiveHourTomorrow()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#001f3f]">Wie hoch sind die durchschnittlichen Kosten morgen?</p>
            <p>{getAverageCostTomorrow()} Cent/kWh</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#001f3f]">Unterschied dynamisch vs. Standardtarif (morgen / Monat)</p>
            <p>Morgen: {getDifferenceDynamicVsStandard('tomorrow')} Cent/kWh</p>
            <p>Monat: {getDifferenceDynamicVsStandard('month')} Cent/kWh</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#001f3f]">Sparen durch Verschieben von Großverbrauchern (z.B. E-Auto 10kWh)</p>
            <p>{getSavingsByShifting('E-Auto', 10)} € (Verschieben zur günstigsten Stunde)</p>
            <p>Für Wärmepumpe (20kWh): {getSavingsByShifting('Wärmepumpe', 20)} €</p>
            <p>Für Waschmaschine (2kWh): {getSavingsByShifting('Waschmaschine', 2)} €</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-bold text-[#001f3f]">Preisentwicklung im Tagesverlauf</p>
            <p>Morgen (6-12 Uhr): {getPriceDevelopment().morning} Cent/kWh</p>
            <p>Abend (18-22 Uhr): {getPriceDevelopment().evening} Cent/kWh</p>
            <p>Nacht (22-6 Uhr): {getPriceDevelopment().night} Cent/kWh</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {months.map((monthKey, index) => {
          const monthlyAverage = monthlyData[monthKey]
            ? calculateMonthlyAverage(monthlyData[monthKey])
            : '–';
          const savingsValue = displayedSavings[monthKey] || '–';

          return (
            <div
              key={monthKey}
              onClick={() => handleCardClick(monthKey)}
              className={`p-6 rounded-xl shadow-md cursor-pointer text-center transition-all ${
                selectedMonth === monthKey
                  ? 'bg-[#001f3f] text-white transform -translate-y-1'
                  : 'bg-[#001f3f] text-white hover:bg-[#007bff] hover:text-white hover:shadow-lg'
              }`}
            >
              <div className="text-xl font-bold">{monthNames[index]}</div>
              <div className="text-lg">
                {monthlyAverage !== '–'
                  ? `Ø Preis: ${monthlyAverage} Cent/kWh`
                  : 'Keine Daten'}
              </div>
              <div className="text-base">
                Ø Ersparnis: {savingsValue !== '–' ? `${savingsValue} €` : '–'}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-100 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-2xl text-red-600 hover:text-red-800 transition-all"
              title="Schließen"
            >
              ×
            </button>
            {monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-[#001f3f] text-center mb-4">
                  {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                </h2>
                <div className="bg-[#001f3f] text-white p-4 rounded-lg mb-4 flex items-center gap-3">
                  Monatsdurchschnitt: {calculateMonthlyAverage(monthlyData[selectedMonth])} Cent/kWh
                </div>
                <div className="bg-[#001f3f] text-white p-4 rounded-lg mb-4 flex items-center gap-3">
                  Eingegebener Verbrauch: {displayedKwh[selectedMonth] || '–'} kWh
                </div>
                <div className="bg-[#001f3f] text-white p-4 rounded-lg mb-4 flex items-center gap-3">
                  Eingegebener Preis: {getAdjustedPrice() ? `${getAdjustedPrice()} Cent/kWh` : '–'}
                  {selectedDiscount && (
                    <span className="text-sm"> ({selectedDiscount.label} Rabatt: -{selectedDiscount.value}¢)</span>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-[#001f3f] text-center mb-4">
                    Zusammenfassung Wöchentliche Kosten
                  </h3>
                  <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                    <thead>
                      <tr className="bg-[#001f3f] text-white">
                        <th className="p-3 text-left font-semibold">Kalenderwoche</th>
                        <th className="p-3 text-left font-semibold">Zeitraum</th>
                        <th className="p-3 text-left font-semibold">Ø Preis (Cent/kWh)</th>
                        <th className="p-3 text-left font-semibold">Verbrauch (kWh)</th>
                        <th className="p-3 text-left font-semibold">Kosten (€)</th>
                        <th className="p-3 text-left font-semibold">Kosten Eigener Preis (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]).map((week, i) => {
                        const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                        const weeklyAverage = week.average !== '–' ? parseFloat(week.average) : 0;
                        const adjustedPrice = getAdjustedPrice();
                        const weeklyKwh = monatsVerbrauch ? (monatsVerbrauch / 4).toFixed(2) : '–';
                        const kosten = monatsVerbrauch && weeklyAverage ? ((weeklyAverage * monatsVerbrauch) / 100 / 4).toFixed(2) : '–';
                        const kostenEigenerPreis = monatsVerbrauch && adjustedPrice ? ((adjustedPrice * monatsVerbrauch) / 100 / 4).toFixed(2) : '–';

                        return (
                          <tr key={week.kw} className={i % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
                            <td className="p-3 text-[#001f3f]">KW {week.kw}</td>
                            <td className="p-3 text-[#001f3f]">{getWeekDateRange(week.days)}</td>
                            <td className="p-3 text-[#001f3f]">{week.average}</td>
                            <td className="p-3 text-[#001f3f]">{weeklyKwh}</td>
                            <td className="p-3 text-[#001f3f]">{kosten}</td>
                            <td className="p-3 text-[#001f3f]">{kostenEigenerPreis}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-200">
                        <td className="p-3 font-bold text-[#001f3f]" colSpan={2}>Gesamt</td>
                        <td className="p-3 font-bold text-[#001f3f]">
                          {(() => {
                            const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                            const validAverages = weeklyAverages
                              .filter((week) => week.average !== '–')
                              .map((week) => parseFloat(week.average));
                            return validAverages.length > 0
                              ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
                              : '–';
                          })()}
                        </td>
                        <td className="p-3 font-bold text-[#001f3f]">
                          {(() => {
                            const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                            return monatsVerbrauch ? (monatsVerbrauch / 4).toFixed(2) : '–';
                          })()}
                        </td>
                        <td className="p-3 font-bold text-[#001f3f]">
                          {(() => {
                            const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                            const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                            const totalKosten = weeklyAverages
                              .filter((week) => week.average !== '–')
                              .reduce((sum, week) => {
                                const weeklyAverage = parseFloat(week.average);
                                return sum + (weeklyAverage * monatsVerbrauch) / 100 / 4;
                              }, 0);
                            return totalKosten ? totalKosten.toFixed(2) : '–';
                          })()}
                        </td>
                        <td className="p-3 font-bold text-[#001f3f]">
                          {(() => {
                            const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                            const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                            const adjustedPrice = getAdjustedPrice();
                            const totalKostenEigenerPreis = weeklyAverages
                              .filter((week) => week.average !== '–')
                              .reduce((sum) => sum + (adjustedPrice * monatsVerbrauch) / 100 / 4, 0);
                            return totalKostenEigenerPreis ? totalKostenEigenerPreis.toFixed(2) : '–';
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center p-10 text-2xl text-[#001f3f] bg-white rounded-2xl">
                ⚠️ Keine Daten für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]} verfügbar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}