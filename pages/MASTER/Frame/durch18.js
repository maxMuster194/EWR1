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
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [verbrauchInput, setVerbrauchInput] = useState('3600');
  const [eigenerPreis, setEigenerPreis] = useState('34.06');
  const [dynamicMarkup] = useState('2.00'); // Aufschlag auf dynamischen Preis (nicht sichtbar, standardmäßig 0.90 Cent/kWh)
  const [displayedKwh, setDisplayedKwh] = useState({});
  const [displayedSavings, setDisplayedSavings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState('AM');

  const months = [
    '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
    '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
  ];

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/15min', { cache: 'no-store' });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const { monthlyData } = await res.json();
        setMonthlyData(monthlyData || {});
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        setMonthlyData({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDiscount) {
      setEigenerPreis(regionBasisPreise[selectedDiscount].toString());
    } else {
      setEigenerPreis('34.06');
    }
  }, [selectedDiscount]);

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
          const markup = parseFloat(dynamicMarkup) || 0;
          const adjustedDynamicAverage = parseFloat(monthlyAverage) + markup;
          const kostenDynamisch = (adjustedDynamicAverage * monatsVerbrauch) / 100;
          const kostenEigener = (adjustedPrice * monatsVerbrauch) / 100;
          savingsValue = (kostenEigener - kostenDynamisch).toFixed(2);
        }
      }

      kwhValues[monthKey] = kwhValue;
      savingsValues[monthKey] = savingsValue;
    });

    setDisplayedKwh(kwhValues);
    setDisplayedSavings(savingsValues);
  }, [verbrauchInput, eigenerPreis, selectedDiscount, monthlyData, dynamicMarkup]);

  const calculateWeeklyAverages = (monthKey) => {
    const weeks = calendarWeeks[monthKey] || [];
    const monthData = monthlyData[monthKey] || [];
    const monatsVerbrauch = parseFloat(displayedKwh[monthKey]) || 0;

    const totalDaysInMonth = weeks.reduce((sum, week) => {
      const weekDays = week.days.filter((day) => {
        const [, month, year] = day.split('/').map(Number);
        return `${month.toString().padStart(2, '0')}/${year}` === monthKey;
      });
      return sum + weekDays.length;
    }, 0);

    const weeklyAverages = weeks.map((week) => {
      const weekDays = week.days.filter((day) => {
        const [, month, year] = day.split('/').map(Number);
        return `${month.toString().padStart(2, '0')}/${year}` === monthKey;
      });

      const validAverages = monthData
        .filter((data) => data.kw === week.kw)
        .map((data) => parseFloat(data.average))
        .filter((avg) => !isNaN(avg));

      const weeklyAverage = validAverages.length > 0
        ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
        : '–';

      const markup = parseFloat(dynamicMarkup) || 0;
      const adjustedWeeklyAverage = weeklyAverage !== '–' ? (parseFloat(weeklyAverage) + markup).toFixed(2) : '–';

      const weeklyKwh = totalDaysInMonth > 0 && monatsVerbrauch > 0
        ? ((monatsVerbrauch * weekDays.length) / totalDaysInMonth).toFixed(2)
        : '–';

      return {
        kw: week.kw,
        average: adjustedWeeklyAverage,
        days: week.days,
        numDaysInMonth: weekDays.length,
        weeklyKwh,
      };
    });

    weeklyAverages.totalDaysInMonth = totalDaysInMonth;
    return weeklyAverages;
  };

  const calculateMonthlyAverage = (monthData) => {
    const validAverages = monthData
      .filter((data) => data.average !== '–')
      .map((data) => parseFloat(data.average));

    const average = validAverages.length > 0
      ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length)
      : 0;

    const markup = parseFloat(dynamicMarkup) || 0;
    return average > 0 ? (average + markup).toFixed(2) : '–';
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

  const getSavingsLabel = (savings) => {
    if (savings === '–') return '–';
    const savingsValue = parseFloat(savings);
    return savingsValue >= 0 ? 'Ersparnis' : 'Kosten';
  };

  const getSavingsDisplayValue = (savings) => {
    if (savings === '–') return '–';
    const savingsValue = parseFloat(savings);
    return Math.abs(savingsValue).toFixed(2);
  };

  if (loading) {
    return (
      <div className="text-center p-3 text-base text-[#4372b7] bg-transparent rounded-lg">
        ⏳ Daten werden geladen…
      </div>
    );
  }

  if (!Object.keys(monthlyData).length) {
    return (
      <div className="text-center p-3 text-base text-[#4372b7] bg-transparent rounded-lg">
        ⚠️ Keine Daten gefunden.
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-3 bg-transparent rounded-lg">
      <div className="bg-transparent">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-center mb-4">
          Dynamischer Tarif: Strompreise 2025
        </h1>
      </div>

      <div className="bg-transparent p-4 rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <label className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-center sm:text-left">
            Rückblick Kosten und Ersparnis (exklusiv Wärmepumpe und E-Mobilität)
          </label>
          <div className="flex flex-col items-center">
            <div className="text-[#4372b7] font-bold text-sm mb-3 text-center">
              Region auswählen
            </div>
            <div className="flex flex-row gap-4 items-center p-3 rounded-lg">
              {discounts.map((discount) => (
                <div key={discount.label} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#4372b7]">{discount.label}</span>
                  <label className="relative inline-block w-10 h-5">
                    <input
                      type="checkbox"
                      id={`region-${discount.label}`}
                      checked={selectedDiscount === discount.label}
                      onChange={() => handleDiscountToggle(discount)}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                        selectedDiscount === discount.label
                          ? 'bg-gradient-to-r from-[#4372b7] to-[#905fa4]'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute left-1 bottom-1 h-3.5 w-3.5 bg-white rounded-full transition-all duration-300 ${
                          selectedDiscount === discount.label ? 'translate-x-5' : ''
                        }`}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 w-full">
          <div className="relative">
            <label className="block text-xs font-medium text-[#4372b7] mb-1.5">
              Preis pro kWh (Cent)
            </label>
            <input
              type="number"
              id="eigenerPreis"
              placeholder="z. B. 30 Cent/kWh"
              value={eigenerPreis}
              onChange={(e) => setEigenerPreis(e.target.value)}
              className="p-2.5 text-sm border-2 border-[#4372b7] rounded-lg w-full max-w-[250px] bg-white text-[#4372b7] focus:border-[#905fa4] focus:ring-2 focus:ring-[#905fa4] focus:ring-opacity-50 transition-all"
              title="Preis pro kWh in Cent"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-[#4372b7] mb-1.5">
              Jährlicher Verbrauch (kWh)
            </label>
            <input
              type="number"
              id="verbrauchInput"
              placeholder="z. B. 3600 kWh/Jahr"
              value={verbrauchInput}
              onChange={(e) => setVerbrauchInput(e.target.value)}
              className="p-2.5 text-sm border-2 border-[#4372b7] rounded-lg w-full max-w-[250px] bg-white text-[#4372b7] focus:border-[#905fa4] focus:ring-2 focus:ring-[#905fa4] focus:ring-opacity-50 transition-all"
              title="Jährlicher Verbrauch in kWh"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {months.map((monthKey, index) => {
          const monthlyAverage = monthlyData[monthKey]
            ? calculateMonthlyAverage(monthlyData[monthKey])
            : '–';
          const savingsValue = displayedSavings[monthKey] || '–';
          const savingsLabel = getSavingsLabel(savingsValue);
          const displayValue = getSavingsDisplayValue(savingsValue);

          return (
            <div
              key={monthKey}
              onClick={() => handleCardClick(monthKey)}
              className={`p-2 rounded-lg shadow-md cursor-pointer text-center transition-all duration-300 bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white hover:bg-gradient-to-r hover:from-[#905fa4] hover:to-[#4372b7] hover:shadow-lg`}
            >
              <div className="text-sm font-bold">{monthNames[index]}</div>
              <div className="text-[10px]">
                {monthlyAverage !== '–'
                  ? `Ø Preis: ${monthlyAverage} Cent/kWh`
                  : 'Keine Daten'}
              </div>
              <div className="text-[10px]">
                Ø {savingsLabel}: {displayValue !== '–' ? `${displayValue} €` : '–'}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2">
          <div className="bg-white rounded-lg p-3 w-full max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-xl">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl text-[#FF0000] hover:text-[#CC0000] transition-all duration-200"
              title="Schließen"
            >
              ×
            </button>
            {monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
              <>
                <h2 className="text-base font-semibold text-[#4372b7] text-center mb-3">
                  {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                </h2>
                <div className="bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white p-2 rounded-lg mb-3 flex items-center gap-2 text-xs">
                  Monatsdurchschnitt: {calculateMonthlyAverage(monthlyData[selectedMonth])} Cent/kWh
                </div>
                <div className="bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white p-2 rounded-lg mb-3 flex items-center gap-2 text-xs">
                  Eingegebener Verbrauch: {displayedKwh[selectedMonth] || '–'} kWh
                </div>
                <div className="bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white p-2 rounded-lg mb-3 flex items-center gap-2 text-xs">
                  Eingegebener Preis: {getAdjustedPrice() ? `${getAdjustedPrice()} Cent/kWh` : '–'}
                  {selectedDiscount && (
                    <span className="text-[10px]"> ({selectedDiscount} Abzüge: -{discounts.find((r) => r.label === selectedDiscount)?.value}¢)</span>
                  )}
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md mb-3">
                  <h3 className="text-base font-semibold text-[#4372b7] text-center mb-3">
                    Zusammenfassung Wöchentliche Kosten
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-md text-[10px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                          <th className="p-2 text-left font-semibold">Kalenderwoche</th>
                          <th className="p-2 text-left font-semibold">Zeitraum</th>
                          <th className="p-2 text-left font-semibold">Ø Preis (Cent/kWh)</th>
                          <th className="p-2 text-left font-semibold">Verbrauch (kWh)</th>
                          <th className="p-2 text-left font-semibold">Dynamisch (€)</th>
                          <th className="p-2 text-left font-semibold">Normaltrarif (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateWeeklyAverages(selectedMonth).map((week, i) => {
                          const weeklyAvgNum = week.average !== '–' ? parseFloat(week.average) : 0;
                          const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                          const kosten = weeklyAvgNum > 0 && weeklyKwhNum > 0
                            ? (weeklyAvgNum * weeklyKwhNum / 100).toFixed(2)
                            : '–';
                          const kostenEigenerPreis = getAdjustedPrice() > 0 && weeklyKwhNum > 0
                            ? (getAdjustedPrice() * weeklyKwhNum / 100).toFixed(2)
                            : '–';

                          return (
                            <tr key={week.kw} className={i % 2 === 0 ? 'bg-[#f5f5f5]' : 'bg-white'}>
                              <td className="p-2 text-[#4372b7]">KW {week.kw}</td>
                              <td className="p-2 text-[#4372b7]">{getWeekDateRange(week.days)}</td>
                              <td className="p-2 text-[#4372b7]">{week.average}</td>
                              <td className="p-2 text-[#4372b7]">{week.weeklyKwh}</td>
                              <td className="p-2 text-[#4372b7]">{kosten}</td>
                              <td className="p-2 text-[#4372b7]">{kostenEigenerPreis}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gradient-to-r from-[#4372b7] to-[#905fa4] text-white">
                          <td className="p-2 font-bold" colSpan={2}>Gesamt</td>
                          <td className="p-2 font-bold">
                            {calculateMonthlyAverage(monthlyData[selectedMonth])}
                          </td>
                          <td className="p-2 font-bold">
                            {displayedKwh[selectedMonth] || '–'}
                          </td>
                          <td className="p-2 font-bold">
                            {(() => {
                              const weeklyCosts = calculateWeeklyAverages(selectedMonth)
                                .map((week) => {
                                  const weeklyAvgNum = week.average !== '–' ? parseFloat(week.average) : 0;
                                  const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                                  return weeklyAvgNum > 0 && weeklyKwhNum > 0 ? weeklyAvgNum * weeklyKwhNum / 100 : 0;
                                })
                                .reduce((sum, cost) => sum + cost, 0);
                              return weeklyCosts > 0 ? weeklyCosts.toFixed(2) : '–';
                            })()}
                          </td>
                          <td className="p-2 font-bold">
                            {(() => {
                              const weeklyOwnCosts = calculateWeeklyAverages(selectedMonth)
                                .map((week) => {
                                  const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                                  const adjustedPrice = getAdjustedPrice();
                                  return adjustedPrice > 0 && weeklyKwhNum > 0 ? adjustedPrice * weeklyKwhNum / 100 : 0;
                                })
                                .reduce((sum, cost) => sum + cost, 0);
                              return weeklyOwnCosts > 0 ? weeklyOwnCosts.toFixed(2) : '–';
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                {calculateWeeklyAverages(selectedMonth).filter((week) => week.average !== '–').length > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <h2 className="text-base font-semibold text-[#4372b7] text-center mb-3">
                      Wöchentliche Durchschnitte für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                    </h2>
                    <Bar
                      data={{
                        labels: calculateWeeklyAverages(selectedMonth)
                          .filter((week) => week.average !== '–')
                          .map((week) => `KW ${week.kw} (${getWeekDateRange(week.days)})`),
                        datasets: [
                          {
                            label: `Wöchentliche Durchschnitte ${monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} ${selectedMonth.split('/')[1]} (Cent/kWh)`,
                            data: calculateWeeklyAverages(selectedMonth)
                              .filter((week) => week.average !== '–')
                              .map((week) => parseFloat(week.average)),
                            backgroundColor: 'rgba(67, 114, 183, 0.8)',
                            borderColor: '#905fa4',
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
                              color: '#4372b7',
                              font: { size: 10, weight: '500' },
                            },
                          },
                          tooltip: {
                            backgroundColor: '#905fa4',
                            titleColor: '#fafafa',
                            bodyColor: '#fafafa',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#4372b7',
                              callback: (value) => `${value.toFixed(2)} ct`,
                              font: { size: 8 },
                            },
                            grid: { color: 'rgba(144, 95, 164, 0.1)' },
                          },
                          x: {
                            ticks: { color: '#4372b7', font: { size: 8 } },
                            grid: { color: 'rgba(144, 95, 164, 0.1)' },
                          },
                        },
                      }}
                    />
                    <div className="bg-white p-3 rounded-lg mt-3 text-center">
                      <div className="text-xs font-medium text-[#4372b7] mb-2">
                        Gesamtkosten bei Durchschnittspreis: {(() => {
                          const weeklyCosts = calculateWeeklyAverages(selectedMonth)
                            .map((week) => {
                              const weeklyAvgNum = week.average !== '–' ? parseFloat(week.average) : 0;
                              const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                              return weeklyAvgNum > 0 && weeklyKwhNum > 0 ? weeklyAvgNum * weeklyKwhNum / 100 : 0;
                            })
                            .reduce((sum, cost) => sum + cost, 0);
                          return weeklyCosts > 0 ? `${weeklyCosts.toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div className="text-xs font-medium text-[#4372b7] mb-2">
                        Gesamtkosten Eigener Preis: {(() => {
                          const weeklyOwnCosts = calculateWeeklyAverages(selectedMonth)
                            .map((week) => {
                              const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                              const adjustedPrice = getAdjustedPrice();
                              return adjustedPrice > 0 && weeklyKwhNum > 0 ? adjustedPrice * weeklyKwhNum / 100 : 0;
                            })
                            .reduce((sum, cost) => sum + cost, 0);
                          return weeklyOwnCosts > 0 ? `${weeklyOwnCosts.toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div className="text-xs font-medium text-[#4372b7]">
                        {(() => {
                          const weeklyCosts = calculateWeeklyAverages(selectedMonth)
                            .map((week) => {
                              const weeklyAvgNum = week.average !== '–' ? parseFloat(week.average) : 0;
                              const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                              return weeklyAvgNum > 0 && weeklyKwhNum > 0 ? weeklyAvgNum * weeklyKwhNum / 100 : 0;
                            })
                            .reduce((sum, cost) => sum + cost, 0);
                          const weeklyOwnCosts = calculateWeeklyAverages(selectedMonth)
                            .map((week) => {
                              const weeklyKwhNum = week.weeklyKwh !== '–' ? parseFloat(week.weeklyKwh) : 0;
                              const adjustedPrice = getAdjustedPrice();
                              return adjustedPrice > 0 && weeklyKwhNum > 0 ? adjustedPrice * weeklyKwhNum / 100 : 0;
                            })
                            .reduce((sum, cost) => sum + cost, 0);
                          if (weeklyCosts === 0 || weeklyOwnCosts === 0) return '–';
                          const diff = weeklyOwnCosts - weeklyCosts;
                          const savingsLabel = diff >= 0 ? 'Ersparnis' : 'Kosten';
                          const absDiff = Math.abs(diff);
                          return `${savingsLabel} (Verwendung von dynamischem Tarif): ${absDiff.toFixed(2)} €`;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-3 text-base text-[#4372b7] bg-white rounded-lg">
                ⚠️ Keine Daten für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]} verfügbar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}