import { useEffect, useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Container, Grid, Paper, Typography, TextField, Button, Box, Card, CardContent, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEuroSign, faBolt, faChartLine, faQuestionCircle, faCalendarWeek, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement);

const calendarWeeks = {
  // ... (keep the same calendarWeeks object as in the original code, omitted for brevity)
};

export default function EnhancedDynamicTariffDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [eigenerPreis, setEigenerPreis] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [tomorrowPrices, setTomorrowPrices] = useState([]);
  const [tomorrowDate, setTomorrowDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const calculateMonthlyAverage = (monthData) => {
    const validAverages = monthData
      .filter((day) => day.average !== '–')
      .map((day) => parseFloat(day.average));
    return validAverages.length > 0
      ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
      : '–';
  };

  const calculateWeeklyAverages = (monthKey, monthData) => {
    const weeks = calendarWeeks[monthKey] || [];
    const weeklyAverages = [];
    weeks.forEach((week) => {
      let weeklyAverage;
      let weekDays = [];
      if (monthKey === '01/2025' && week.kw === '01') {
        weeklyAverage = '0.00';
      } else {
        weekDays = week.days.filter((day) => {
          const [, month, year] = day.split('/').map(Number);
          return `${month.toString().padStart(2, '0')}/${year}` === monthKey;
        });

        const validAverages = weekDays
          .map((day) => {
            const dayData = monthData.find((d) => d.date === day);
            return dayData && dayData.average !== '–' ? parseFloat(dayData.average) : null;
          })
          .filter((avg) => avg !== null);

        weeklyAverage = validAverages.length > 0
          ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
          : '–';
      }
      weeklyAverages.push({ kw: week.kw, average: weeklyAverage, days: week.days, numDaysInMonth: weekDays.length });
    });
    return weeklyAverages;
  };

  const getWeekDateRange = (days) => {
    if (!days || !days.length) return '–';
    const startDate = days[0];
    const endDate = days[days.length - 1];
    return `${startDate} - ${endDate}`;
  };

  const getCheapestHourTomorrow = () => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const minPrice = Math.min(...tomorrowPrices);
    const hour = tomorrowPrices.indexOf(minPrice);
    return `${hour}:00 - ${hour + 1}:00 Uhr (${minPrice.toFixed(2)} Cent/kWh)`;
  };

  const getMostExpensiveHourTomorrow = () => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const maxPrice = Math.max(...tomorrowPrices);
    const hour = tomorrowPrices.indexOf(maxPrice);
    return `${hour}:00 - ${hour + 1}:00 Uhr (${maxPrice.toFixed(2)} Cent/kWh)`;
  };

  const getAverageCostTomorrow = () => {
    if (!tomorrowPrices.length) return '–';
    const avg = tomorrowPrices.reduce((sum, val) => sum + val, 0) / tomorrowPrices.length;
    return avg.toFixed(2);
  };

  const getDifferenceDynamicVsStandard = (period = 'tomorrow') => {
    if (!adjustedPrice) return '–';
    if (period === 'tomorrow') {
      const avgDynamic = parseFloat(getAverageCostTomorrow()) || 0;
      return (adjustedPrice - avgDynamic).toFixed(2);
    } else if (period === 'month') {
      const monthKey = selectedMonth || '08/2025';
      const monthlyAvg = parseFloat(monthlyAverages[monthKey]) || 0;
      return (adjustedPrice - monthlyAvg).toFixed(2);
    } else if (period === 'year') {
      const yearlyAvg = months.reduce((sum, m) => sum + (parseFloat(monthlyAverages[m]) || 0), 0) / months.length;
      return (adjustedPrice - yearlyAvg).toFixed(2);
    }
  };

  const getSavingsByShifting = (kwh = 10) => {
    if (!tomorrowPrices.length) return 'Keine Daten';
    const minPrice = Math.min(...tomorrowPrices);
    const maxPrice = Math.max(...tomorrowPrices);
    const savingsPerKwh = maxPrice - minPrice;
    return (savingsPerKwh * kwh / 100).toFixed(2);
  };

  const getPriceDevelopment = () => {
    if (!tomorrowPrices.length) return { morning: '–', evening: '–', night: '–' };
    const morning = (tomorrowPrices.slice(6, 12).reduce((sum, val) => sum + val, 0) / 6 || 0).toFixed(2);
    const evening = (tomorrowPrices.slice(18, 22).reduce((sum, val) => sum + val, 0) / 4 || 0).toFixed(2);
    const night = ([...tomorrowPrices.slice(0, 6), ...tomorrowPrices.slice(22, 24)].reduce((sum, val) => sum + val, 0) / 8 || 0).toFixed(2);
    return { morning, evening, night };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mongodb', { cache: 'no-store' });
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

        const currentDate = new Date(2025, 7, 16); // August 16, 2025
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

  const monthlyAverages = useMemo(() => {
    const averages = {};
    months.forEach((monthKey) => {
      const monthData = monthlyData[monthKey] || [];
      averages[monthKey] = calculateMonthlyAverage(monthData);
    });
    return averages;
  }, [monthlyData]);

  const monthlyKwh = useMemo(() => {
    if (!verbrauchInput || parseFloat(verbrauchInput) <= 0) return {};
    const jahresVerbrauch = parseFloat(verbrauchInput);
    const monatsVerbrauch = (jahresVerbrauch / 12).toFixed(2);
    const kwh = {};
    months.forEach((monthKey) => {
      kwh[monthKey] = monthlyData[monthKey]?.length > 0 ? monatsVerbrauch : '–';
    });
    return kwh;
  }, [verbrauchInput, monthlyData]);

  const adjustedPrice = useMemo(() => {
    const basePrice = parseFloat(eigenerPreis) || 0;
    return selectedDiscount ? Math.max(0, basePrice - selectedDiscount.value) : basePrice;
  }, [eigenerPreis, selectedDiscount]);

  const displayedSavings = useMemo(() => {
    const savings = {};
    months.forEach((monthKey) => {
      const monthData = monthlyData[monthKey] || [];
      if (monthData.length > 0 && adjustedPrice) {
        const monatsVerbrauch = parseFloat(monthlyKwh[monthKey]) || 0;
        const monthlyAverage = parseFloat(calculateMonthlyAverage(monthData)) || 0;
        const kostenDynamisch = (monthlyAverage * monatsVerbrauch) / 100;
        const kostenEigener = (adjustedPrice * monatsVerbrauch) / 100;
        savings[monthKey] = (kostenEigener - kostenDynamisch).toFixed(2);
      } else {
        savings[monthKey] = '–';
      }
    });
    return savings;
  }, [adjustedPrice, monthlyKwh, monthlyData]);

  const handleCardClick = (monthKey) => {
    setSelectedMonth(monthKey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMonth(null);
  };

  const handleDiscountClick = (discount) => {
    setSelectedDiscount(selectedDiscount?.label === discount.label ? null : discount);
  };

  const yearlySavings = useMemo(() => {
    return Object.values(displayedSavings).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2);
  }, [displayedSavings]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" color="textSecondary">
          ⏳ Daten werden geladen…
        </Typography>
      </Container>
    );
  }

  if (!data.length && !Object.keys(monthlyData).length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" color="error">
          ⚠️ Keine Daten gefunden.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        Dynamischer Tarif Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Jährlichen Verbrauch und Preis eingeben
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Jährlicher Verbrauch (kWh)"
              type="number"
              value={verbrauchInput}
              onChange={(e) => setVerbrauchInput(e.target.value)}
              variant="outlined"
              helperText="z. B. 3600 kWh/Jahr"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Eigener Preis (Cent/kWh)"
              type="number"
              value={eigenerPreis}
              onChange={(e) => setEigenerPreis(e.target.value)}
              variant="outlined"
              helperText="z. B. 30 Cent/kWh"
            />
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="center" mt={2} gap={2}>
          {discounts.map((discount) => (
            <Button
              key={discount.label}
              variant={selectedDiscount?.label === discount.label ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleDiscountClick(discount)}
              title={discount.tooltip}
            >
              {discount.label}
            </Button>
          ))}
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <FontAwesomeIcon icon={faChartLine} size="lg" style={{ marginRight: 8 }} />
              <Typography variant="h5" align="center">
                Dynamischer Tarif morgen ({tomorrowDate})
              </Typography>
            </Box>
            {tomorrowPrices.length > 0 ? (
              <Line
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                  datasets: [
                    {
                      label: 'Stündliche Preise (Cent/kWh)',
                      data: tomorrowPrices,
                      borderColor: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: { backgroundColor: '#1976d2', titleColor: '#fff', bodyColor: '#fff' },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { callback: (value) => `${value.toFixed(2)} ct` } },
                  },
                }}
              />
            ) : (
              <Typography align="center" color="textSecondary">
                Keine Daten für morgen verfügbar.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <FontAwesomeIcon icon={faMoneyBillWave} size="lg" style={{ marginRight: 8 }} />
              <Typography variant="h5" align="center">
                Monatliche Ersparnisse
              </Typography>
            </Box>
            <Bar
              data={{
                labels: monthNames,
                datasets: [
                  {
                    label: 'Ø Ersparnis (€)',
                    data: months.map((m) => parseFloat(displayedSavings[m] || 0)),
                    backgroundColor: '#4caf50',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value} €` } } },
              }}
            />
            <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
              <FontAwesomeIcon icon={faEuroSign} size="lg" style={{ marginRight: 8, color: '#4caf50' }} />
              <Typography variant="h6" color="success.main">
                Jährliche Ersparnis: {yearlySavings} €
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <FontAwesomeIcon icon={faQuestionCircle} size="lg" style={{ marginRight: 8 }} />
              <Typography variant="h5" align="center">
                Häufige Fragen zu Preisen
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Wann ist morgen die billigste Stunde?
                    </Typography>
                    <Typography>{getCheapestHourTomorrow()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Wann ist morgen die teuerste Stunde?
                    </Typography>
                    <Typography>{getMostExpensiveHourTomorrow()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Wie hoch sind die durchschnittlichen Kosten morgen?
                    </Typography>
                    <Typography>{getAverageCostTomorrow()} Cent/kWh</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Unterschied dynamisch vs. Standardtarif (morgen / Monat / Jahr)
                    </Typography>
                    <Typography>Morgen: {getDifferenceDynamicVsStandard('tomorrow')} Cent/kWh</Typography>
                    <Typography>Monat: {getDifferenceDynamicVsStandard('month')} Cent/kWh</Typography>
                    <Typography>Jahr: {getDifferenceDynamicVsStandard('year')} Cent/kWh</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Sparen durch Verschieben von Großverbrauchern (z.B. 10kWh)
                    </Typography>
                    <Typography>{getSavingsByShifting(10)} € (Verschieben zur günstigsten Stunde)</Typography>
                    <Typography>Für Wärmepumpe (20kWh): {getSavingsByShifting(20)} €</Typography>
                    <Typography>Für Waschmaschine (2kWh): {getSavingsByShifting(2)} €</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Preisentwicklung im Tagesverlauf
                    </Typography>
                    <Typography>Morgen (6-12 Uhr): {getPriceDevelopment().morning} Cent/kWh</Typography>
                    <Typography>Abend (18-22 Uhr): {getPriceDevelopment().evening} Cent/kWh</Typography>
                    <Typography>Nacht (22-6 Uhr): {getPriceDevelopment().night} Cent/kWh</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <FontAwesomeIcon icon={faCalendarWeek} size="lg" style={{ marginRight: 8 }} />
              <Typography variant="h5" align="center">
                Monatsübersicht
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {months.map((monthKey, index) => {
                const monthlyAverage = monthlyAverages[monthKey];
                const savingsValue = displayedSavings[monthKey];
                return (
                  <Grid item xs={6} sm={4} md={2} key={monthKey}>
                    <Card
                      onClick={() => handleCardClick(monthKey)}
                      sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        p: 2,
                        bgcolor: selectedMonth === monthKey ? 'primary.light' : 'background.paper',
                        '&:hover': { boxShadow: 6 },
                      }}
                    >
                      <Typography variant="h6">{monthNames[index]}</Typography>
                      <Typography>Ø Preis: {monthlyAverage !== '–' ? `${monthlyAverage} Cent/kWh` : 'Keine Daten'}</Typography>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <FontAwesomeIcon icon={faEuroSign} size="sm" style={{ marginRight: 4, color: '#4caf50' }} />
                        <Typography>Ø Ersparnis: {savingsValue !== '–' ? `${savingsValue} €` : '–'}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', md: 800 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflowY: 'auto', borderRadius: 2 }}>
          <IconButton onClick={closeModal} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
          {selectedMonth && monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <FontAwesomeIcon icon={faChartLine} size="lg" style={{ marginRight: 8 }} />
                <Typography>Monatsdurchschnitt: {monthlyAverages[selectedMonth]} Cent/kWh</Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <FontAwesomeIcon icon={faBolt} size="lg" style={{ marginRight: 8 }} />
                <Typography>Eingegebener Verbrauch: {monthlyKwh[selectedMonth] || '–'} kWh</Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <FontAwesomeIcon icon={faMoneyBillWave} size="lg" style={{ marginRight: 8 }} />
                <Typography>Eingegebener Preis: {adjustedPrice ? `${adjustedPrice} Cent/kWh` : '–'}
                  {selectedDiscount && ` (${selectedDiscount.label} Rabatt: -${selectedDiscount.value}¢)`}
                </Typography>
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                Zusammenfassung Wöchentliche Kosten
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kalenderwoche</TableCell>
                      <TableCell>Zeitraum</TableCell>
                      <TableCell>Ø Preis (Cent/kWh)</TableCell>
                      <TableCell>Verbrauch (kWh)</TableCell>
                      <TableCell>Kosten (€)</TableCell>
                      <TableCell>Kosten Eigener Preis (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const weekAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                      const numTotalDays = monthlyData[selectedMonth].length;
                      const monatsVerbrauch = parseFloat(monthlyKwh[selectedMonth]) || 0;
                      return weekAverages.map((week, i) => {
                        const weeklyKwh = monatsVerbrauch && numTotalDays > 0 ? ((week.numDaysInMonth / numTotalDays) * monatsVerbrauch).toFixed(2) : '–';
                        const weeklyAverage = week.average !== '–' ? parseFloat(week.average) : 0;
                        const kosten = weeklyKwh !== '–' && weeklyAverage ? (weeklyAverage * parseFloat(weeklyKwh) / 100).toFixed(2) : '–';
                        const kostenEigenerPreis = weeklyKwh !== '–' && adjustedPrice ? (adjustedPrice * parseFloat(weeklyKwh) / 100).toFixed(2) : '–';

                        return (
                          <TableRow key={week.kw} sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                            <TableCell>KW {week.kw}</TableCell>
                            <TableCell>{getWeekDateRange(week.days)}</TableCell>
                            <TableCell>{week.average}</TableCell>
                            <TableCell>{weeklyKwh}</TableCell>
                            <TableCell>{kosten}</TableCell>
                            <TableCell>{kostenEigenerPreis}</TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ bgcolor: 'action.selected' }}>
                      <TableCell colSpan={2}>Gesamt</TableCell>
                      <TableCell>{monthlyAverages[selectedMonth]}</TableCell>
                      <TableCell>{monthlyKwh[selectedMonth] || '–'}</TableCell>
                      <TableCell>
                        {(() => {
                          const monatsAvg = parseFloat(monthlyAverages[selectedMonth]) || 0;
                          const monatsVer = parseFloat(monthlyKwh[selectedMonth]) || 0;
                          return monatsAvg && monatsVer ? (monatsAvg * monatsVer / 100).toFixed(2) : '–';
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const monatsVer = parseFloat(monthlyKwh[selectedMonth]) || 0;
                          return adjustedPrice && monatsVer ? (adjustedPrice * monatsVer / 100).toFixed(2) : '–';
                        })()}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography variant="h6" align="center" color="error">
              ⚠️ Keine Daten {selectedMonth ? `für ${monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} ${selectedMonth.split('/')[1]}` : ''} verfügbar.
            </Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
}