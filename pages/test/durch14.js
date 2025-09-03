import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

export default function MongoDBPricesPage() {
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

  const months = [
    '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
    '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
  ];

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

  const discounts = [
    { label: 'KF', value: 15 },
    { label: 'MOD', value: 13 },
    { label: 'MN', value: 17 },
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
          });
        });

        setMonthlyData(groupedByMonth);
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

  const handleDiscountToggle = (discount) => {
    setSelectedDiscount((prev) => (prev === discount.label ? null : discount.label));
  };

  const getAdjustedPrice = () => {
    const basePrice = parseFloat(eigenerPreis) || 0;
    const discountValue = discounts.find((d) => d.label === selectedDiscount)?.value || 0;
    return Math.max(0, basePrice - discountValue);
  };

  if (loading) {
    return (
      <div className="text-center p-4 sm:p-6 text-lg sm:text-xl text-[#062316] bg-white rounded-2xl">
        ⏳ Daten werden geladen…
      </div>
    );
  }

  if (!data.length && !Object.keys(monthlyData).length) {
    return (
      <div className="text-center p-4 sm:p-6 text-lg sm:text-xl text-[#062316] bg-white rounded-2xl">
        ⚠️ Keine Daten gefunden.
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#062316] text-center mb-6 sm:mb-8">Kalkulation Ihrer Einsparmöglichkeiten</h1>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-8">
        <label className="block text-lg sm:text-xl font-semibold text-[#062316] mb-4 text-center">
          Jährlichen Verbrauch, Preis und Region auswählen
        </label>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4">
            <div className="text-black font-bold text-base sm:text-lg">Region auswählen</div>
            <div className="flex flex-row flex-wrap gap-4 items-center">
              {discounts.map((discount) => (
                <div key={discount.label} className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-medium text-[#062316]">{discount.label}</span>
                  <label className="relative inline-block w-[50px] h-[24px]">
                    <input
                      type="checkbox"
                      id={`region-${discount.label}`}
                      checked={selectedDiscount === discount.label}
                      onChange={() => handleDiscountToggle(discount)}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-400 ${
                        selectedDiscount === discount.label ? 'bg-[#409966]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute left-[2px] bottom-[2px] h-[20px] w-[20px] bg-white rounded-full transition-all duration-400 ${
                          selectedDiscount === discount.label ? 'translate-x-[26px]' : ''
                        }`}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="relative">
              <input
                type="number"
                id="verbrauchInput"
                placeholder="z. B. 3600 kWh/Jahr"
                value={verbrauchInput}
                onChange={(e) => setVerbrauchInput(e.target.value)}
                className="p-3 text-base sm:text-lg border-2 border-[#062316] rounded-lg w-full max-w-[300px] bg-white text-[#062316] focus:border-[#409966] focus:shadow-md transition-all"
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
                className="p-3 text-base sm:text-lg border-2 border-[#062316] rounded-lg w-full max-w-[300px] bg-white text-[#062316] focus:border-[#409966] focus:shadow-md transition-all"
                title="Preis pro kWh in Cent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {months.map((monthKey, index) => {
          const monthlyAverage = monthlyData[monthKey]
            ? calculateMonthlyAverage(monthlyData[monthKey])
            : '–';
          const savingsValue = displayedSavings[monthKey] || '–';

          return (
            <div
              key={monthKey}
              onClick={() => handleCardClick(monthKey)}
              className={`p-4 sm:p-6 rounded-xl shadow-md cursor-pointer text-center transition-all duration-300 ${
                selectedMonth === monthKey
                  ? 'bg-[#062316] text-white transform -translate-y-1'
                  : 'bg-[#062316] text-white hover:bg-[#e5dbc1] hover:text-[#062316] hover:shadow-lg'
              }`}
            >
              <div className="text-lg sm:text-xl font-bold">{monthNames[index]}</div>
              <div className="text-sm sm:text-lg">
                {monthlyAverage !== '–'
                  ? `Ø Preis: ${monthlyAverage} Cent/kWh`
                  : 'Keine Daten'}
              </div>
              <div className="text-sm sm:text-base">
                Ø Ersparnis: {savingsValue !== '–' ? `${savingsValue} €` : '–'}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-full sm:max-w-4xl max-h-[95vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-2xl sm:text-3xl text-[#FF0000] hover:text-[#CC0000] transition-all duration-200"
              title="Schließen"
            >
              ×
            </button>
            {monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#062316] text-center mb-4 sm:mb-6">
                  {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                </h2>
                <div className="bg-[#062316] text-white p-3 sm:p-4 rounded-lg mb-4 flex items-center gap-3 text-sm sm:text-base">
                  Monatsdurchschnitt: {calculateMonthlyAverage(monthlyData[selectedMonth])} Cent/kWh
                </div>
                <div className="bg-[#062316] text-white p-3 sm:p-4 rounded-lg mb-4 flex items-center gap-3 text-sm sm:text-base">
                  Eingegebener Verbrauch: {displayedKwh[selectedMonth] || '–'} kWh
                </div>
                <div className="bg-[#062316] text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex items-center gap-3 text-sm sm:text-base">
                  Eingegebener Preis: {getAdjustedPrice() ? `${getAdjustedPrice()} Cent/kWh` : '–'}
                  {selectedDiscount && (
                    <span className="text-xs sm:text-sm"> ({selectedDiscount} Rabatt: -{discounts.find((r) => r.label === selectedDiscount)?.value}¢)</span>
                  )}
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#062316] text-center mb-4">
                    Zusammenfassung Wöchentliche Kosten
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-md text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#062316] text-white">
                          <th className="p-2 sm:p-3 text-left font-semibold">Kalenderwoche</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Zeitraum</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Ø Preis (Cent/kWh)</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Verbrauch (kWh)</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Kosten (€)</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Kosten Eigener Preis (€)</th>
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
                            <tr key={week.kw} className={i % 2 === 0 ? 'bg-[#e6e6bf]' : 'bg-white'}>
                              <td className="p-2 sm:p-3 text-[#062316]">KW {week.kw}</td>
                              <td className="p-2 sm:p-3 text-[#062316]">{getWeekDateRange(week.days)}</td>
                              <td className="p-2 sm:p-3 text-[#062316]">{week.average}</td>
                              <td className="p-2 sm:p-3 text-[#062316]">{weeklyKwh}</td>
                              <td className="p-2 sm:p-3 text-[#062316]">{kosten}</td>
                              <td className="p-2 sm:p-3 text-[#062316]">{kostenEigenerPreis}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#e6e6bf]">
                          <td className="p-2 sm:p-3 font-bold text-[#062316]" colSpan={2}>Gesamt</td>
                          <td className="p-2 sm:p-3 font-bold text-[#062316]">
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
                          <td className="p-2 sm:p-3 font-bold text-[#062316]">
                            {(() => {
                              const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              return monatsVerbrauch ? monatsVerbrauch.toFixed(2) : '–';
                            })()}
                          </td>
                          <td className="p-2 sm:p-3 font-bold text-[#062316]">
                            {(() => {
                              const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                              const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              const totalKosten = weeklyAverages
                                .filter((week) => week.average !== '–')
                                .reduce((sum, week) => {
                                  const weeklyAverage = parseFloat(week.average);
                                  return sum + (weeklyAverage * monatsVerbrauch) / 100 / 4;
                                }, 0);
                              return totalKosten ? (totalKosten * 4).toFixed(2) : '–';
                            })()}
                          </td>
                          <td className="p-2 sm:p-3 font-bold text-[#062316]">
                            {(() => {
                              const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                              const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              const adjustedPrice = getAdjustedPrice();
                              const totalKostenEigenerPreis = weeklyAverages
                                .filter((week) => week.average !== '–')
                                .reduce((sum) => sum + (adjustedPrice * monatsVerbrauch) / 100 / 4, 0);
                              return totalKostenEigenerPreis ? (totalKostenEigenerPreis * 4).toFixed(2) : '–';
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                {calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]).filter((week) => week.average !== '–').length > 0 && (
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#062316] text-center mb-4">
                      Wöchentliche Durchschnitte für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                    </h2>
                    <Bar
                      data={{
                        labels: calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth])
                          .filter((week) => week.average !== '–')
                          .map((week) => `KW ${week.kw} (${getWeekDateRange(week.days)})`),
                        datasets: [
                          {
                            label: `Wöchentliche Durchschnitte ${monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} ${selectedMonth.split('/')[1]} (Cent/kWh)`,
                            data: calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth])
                              .filter((week) => week.average !== '–')
                              .map((week) => parseFloat(week.average)),
                            backgroundColor: '#e5dbc1',
                            borderColor: '#062316',
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: '#062316',
                              font: { size: 12, weight: '500' },
                            },
                          },
                          tooltip: {
                            backgroundColor: '#062316',
                            titleColor: '#e6e6bf',
                            bodyColor: '#e6e6bf',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#062316',
                              callback: (value) => `${value.toFixed(2)} ct`,
                              font: { size: 10, sm: 12 },
                            },
                            grid: { color: 'rgba(6, 35, 22, 0.1)' },
                          },
                          x: {
                            ticks: { color: '#062316', font: { size: 10, sm: 12 } },
                            grid: { color: 'rgba(6, 35, 22, 0.1)' },
                          },
                        },
                      }}
                    />
                    <div className="bg-white p-4 rounded-lg mt-4 sm:mt-6 text-center">
                      <div className="text-sm sm:text-lg font-medium text-[#062316] mb-2">
                        Gesamtkosten bei Durchschnittspreis: {(() => {
                          const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const monthlyAverage = parseFloat(calculateMonthlyAverage(monthlyData[selectedMonth])) || 0;
                          return monatsVerbrauch && monthlyAverage ? `${(monthlyAverage * monatsVerbrauch / 100).toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div className="text-sm sm:text-lg font-medium text-[#062316] mb-2">
                        Gesamtkosten Eigener Preis: {(() => {
                          const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const adjustedPrice = getAdjustedPrice();
                          return monatsVerbrauch && adjustedPrice ? `${(adjustedPrice * monatsVerbrauch / 100).toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div className="text-sm sm:text-lg font-medium text-[#062316]">
                        Sparbetrag (Verwendung von dynamischem Tarif): {(() => {
                          const monatsVerbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const monthlyAverage = parseFloat(calculateMonthlyAverage(monthlyData[selectedMonth])) || 0;
                          const adjustedPrice = getAdjustedPrice();
                          if (!monatsVerbrauch || !monthlyAverage || !adjustedPrice) return '–';
                          const diff = (adjustedPrice * monatsVerbrauch / 100) - (monthlyAverage * monatsVerbrauch / 100);
                          return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} €`;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-4 sm:p-6 text-lg sm:text-xl text-[#062316] bg-white rounded-2xl">
                ⚠️ Keine Daten für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]} verfügbar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}