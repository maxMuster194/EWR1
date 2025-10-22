import mongoose from 'mongoose';
import GermanyMin15Prices from '@/models/min15Prices';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker'; // Import react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS for datepicker
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '@/pages/loading/Amberg';



// Dynamisch den Line-Chart importieren, um SSR zu vermeiden
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Chart.js-Komponenten registrieren
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Add imports for icons (assuming MUI)
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import KitchenIcon from '@mui/icons-material/Kitchen';
import TvIcon from '@mui/icons-material/Tv';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import HeatPumpIcon from '@mui/icons-material/HeatPump';
import DescriptionIcon from '@mui/icons-material/Description';
import jsPDF from 'jspdf';

// MongoDB-Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';


async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }

  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
    console.log('Available fields in data:', Object.keys(data[0] || {})); // Debug: Verfügbare Felder
    const uniqueDates = [...new Set(data.map(item => item['Delivery day']).filter(date => date !== null))];
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayBerlin = `${day}/${month}/${year}`;

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
// Icon mapping
const iconMapping = {
  Kühlschrank: 'AcUnit',
  Gefrierschrank: 'AcUnit',
  Waschmaschine: 'LocalLaundryService',
  Trockner: 'LocalLaundryService',
  Herd: 'Kitchen',
  Geschirrspüler: 'Kitchen',
  Multimedia: 'Tv',
  Licht: 'Lightbulb',
  'E-Auto': 'ElectricCar',
  'Zweites E-Auto': 'ElectricCar',
  Wärmepumpe: 'HeatPump',
  default: 'Description',
};

// Änderungen an standardVerbrauch (für Licht auf 120 Watt setzen)
const standardVerbrauch = {
  Kühlschrank: 35,
  Gefrierschrank: 38,
  Waschmaschine: 300,
  Geschirrspüler: 600,
  Trockner: 1200,
  Herd: 900,
  Multimedia: 350,
  Licht: 120,  // Geändert auf 120 Watt wie angegeben
  'E-Auto': 11000,
  'Zweites E-Auto': 7400,
  Wärmepumpe: 12000,
};

// Optionale Änderungen an verbraucherBeschreibungen (angepasst an neue Werte)
const verbraucherBeschreibungen = {
  Kühlschrank: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.',
  Gefrierschrank: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 700 W bei 1 Stunde täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',
  Licht: 'Beleuchtung verbraucht etwa 120 W bei 4 Stunden täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',  // Angepasst
  'E-Auto': 'Das E-Auto verbraucht ca. 11 kW pro Ladevorgang (z.B. 4h/Woche).',
  'Zweites E-Auto': 'Das zweite E-Auto verbraucht ca. 7.4 kW pro Ladevorgang (z.B. 3h/Woche).',
  Wärmepumpe: 'Die Wärmepumpe verbraucht ca. 12 kW mit einer JAZ von 3.4 und 2000 Heizstunden pro Jahr.',
};

const timePeriods = [
  { label: '0 Uhr', startzeit: '00:00', endzeit: 'Beginn' },
  { label: '1 Uhr', startzeit: '01:00', endzeit: 'Beginn' },
  { label: '2 Uhr', startzeit: '02:00', endzeit: 'Beginn' },
  { label: '3 Uhr', startzeit: '03:00', endzeit: 'Beginn' },
  { label: '4 Uhr', startzeit: '04:00', endzeit: 'Beginn' },
  { label: '5 Uhr', startzeit: '05:00', endzeit: 'Beginn' },
  { label: '6 Uhr', startzeit: '06:00', endzeit: 'Beginn' },
  { label: '7 Uhr', startzeit: '07:00', endzeit: 'Beginn' },
  { label: '8 Uhr', startzeit: '08:00', endzeit: 'Beginn' },
  { label: '9 Uhr', startzeit: '09:00', endzeit: 'Beginn' },
  { label: '10 Uhr', startzeit: '10:00', endzeit: 'Beginn' },
  { label: '11 Uhr', startzeit: '11:00', endzeit: 'Beginn' },
  { label: '12 Uhr', startzeit: '12:00', endzeit: 'Beginn' },
  { label: '13 Uhr', startzeit: '13:00', endzeit: 'Beginn' },
  { label: '14 Uhr', startzeit: '14:00', endzeit: 'Beginn' },
  { label: '15 Uhr', startzeit: '15:00', endzeit: 'Beginn' },
  { label: '16 Uhr', startzeit: '16:00', endzeit: 'Beginn' },
  { label: '17 Uhr', startzeit: '17:00', endzeit: 'Beginn' },
  { label: '18 Uhr', startzeit: '18:00', endzeit: 'Beginn' },
  { label: '19 Uhr', startzeit: '19:00', endzeit: 'Beginn' },
  { label: '20 Uhr', startzeit: '20:00', endzeit: 'Beginn' },
  { label: '21 Uhr', startzeit: '21:00', endzeit: 'Beginn' },
  { label: '22 Uhr', startzeit: '22:00', endzeit: 'Beginn' },
  { label: '23 Uhr', startzeit: '23:00', endzeit: 'Beginn' },
  { label: '24 Uhr', startzeit: '24:00', endzeit: 'Beginn' }
];


const verbraucherTypes = {
  Kühlschrank: 'grundlast',
  Gefrierschrank: 'grundlast',
  Waschmaschine: 'week',
  Geschirrspüler: 'week',
  Trockner: 'week',
  Herd: 'week',
  Multimedia: 'week',
  Licht: 'week',
  'E-Auto': 'auto',
  'Zweites E-Auto': 'auto',
  Wärmepumpe: 'waermepumpe',
};

// Feste Preise für dynamischen Tarif
const prices = {
  Q1: 0.131,
  Q2: 0.075,
  Q3: 0.089,
  Q4: 0.122,
};
// Functions
const getRegionPreis = (selectedRegion) => {
  if (selectedRegion === 'AM') return 20.14;
  if (selectedRegion === 'SuRo') return 20.44;
  if (selectedRegion === 'Regio') return 20.98;
  return 0;
}
// Functions
const getRegionStrompreis = (selectedRegion) => {
  if (selectedRegion === 'AM') return 34.06;
  if (selectedRegion === 'SuRo') return 34.82;
  if (selectedRegion === 'Regio') return 34.35;
  return 31; // Fallback-Preis
};

const getPreisDifferenz = (strompreis, selectedRegion) => {
  const regionPreis = getRegionPreis(selectedRegion);
  return (strompreis - regionPreis).toFixed(2);
}

const updateKosten = (watt, verbraucher, strompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen) => {
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100;
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher] || {};
  const type = verbraucherTypes[verbraucher] || 'grundlast';

  if (type === 'waermepumpe') {
    const jaz = einstellung.jaz || 3.4;
    const heizstunden = einstellung.heizstunden || 2000;
    if (jaz === 0) return 0;
    const totalKwh = (watt / jaz) * heizstunden / 1000;
    kosten = totalKwh * preisDifferenz;
  } else {
    const totalDauer = einstellung.zeitraeume?.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
    const nutzung = einstellung.nutzung || 0;
    const batterieKapazitaet = einstellung.batterieKapazitaet || 0;
    const wallboxLeistung = einstellung.wallboxLeistung || watt;
    const standardLadung = einstellung.standardLadung || false;

    if (type === 'week') {
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * preisDifferenz;
    } else if (type === 'auto') {
      if (standardLadung) {
        kosten = (batterieKapazitaet * nutzung * 52) * preisDifferenz;
      } else {
        kosten = (wallboxLeistung * totalDauer * nutzung * 52) / 1000 * preisDifferenz;
      }
    } else if (type === 'grundlast') {
      kosten = (watt * preisDifferenz * 24 * 365) / 1000;
    }
  }

  if (kosten < 0) kosten = 0;

  setVerbraucherDaten((prev) => ({
    ...prev,
    [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
  }));
};

const berechneDynamischenVerbrauch = (watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen) => {
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100;
  const einstellung = erweiterteEinstellungen[verbraucher] || {};
  const type = verbraucherTypes[verbraucher] || 'grundlast';

  if (type === 'waermepumpe') {
    const jaz = einstellung.jaz || 3.4;
    const heizstunden = einstellung.heizstunden || 2000;
    if (jaz === 0) return 0;
    const totalKwh = (watt / jaz) * heizstunden / 1000;
    const kosten = totalKwh * preisDifferenz;
    return kosten < 0 ? 0 : kosten;
  }

  if (!einstellung.zeitraeume || einstellung.zeitraeume.length === 0 || watt === 0) {
    return 0;
  }
  let totalDauer = einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  if (totalDauer === 0) {
    return 0;
  }
  let kosten = 0;
  const batterieKapazitaet = einstellung.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung.wallboxLeistung || watt;
  const standardLadung = einstellung.standardLadung || false;

  if (type === 'week') {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
  } else if (type === 'auto') {
    if (standardLadung) {
      kosten = (batterieKapazitaet * einstellung.nutzung * 52) * preisDifferenz;
    } else {
      kosten = (wallboxLeistung * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
    }
  }

  return kosten < 0 ? 0 : kosten;
};

const berechneDynamischeKosten = (verbraucher, strompreis, pricesApi, verbraucherDaten, erweiterteEinstellungen, selectedRegion) => {
  const watt = verbraucherDaten[verbraucher]?.watt || 0;
  if (watt === 0) return 0;
  const type = verbraucherTypes[verbraucher];
  const einstellung = erweiterteEinstellungen[verbraucher] || {};

  const fixedPrice = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
  const fallbackPrice = fixedPrice;

  if (type === 'waermepumpe') {
    const jaz = einstellung.jaz || 3.4;
    const heizstunden = einstellung.heizstunden || 2000;
    if (jaz === 0) return 0;
    const totalKwh = (watt / jaz) * heizstunden / 1000;
    const quarterlyKwh = {
      Q1: totalKwh * 0.4,
      Q2: totalKwh * 0.15,
      Q3: totalKwh * 0.05,
      Q4: totalKwh * 0.4,
    };
    const quarterlyCosts = {
      Q1: quarterlyKwh.Q1 * prices.Q1,
      Q2: quarterlyKwh.Q2 * prices.Q2,
      Q3: quarterlyKwh.Q3 * prices.Q3,
      Q4: quarterlyKwh.Q4 * prices.Q4,
    };
    return Object.values(quarterlyCosts).reduce((sum, cost) => sum + cost, 0);
  }

  if (type === 'grundlast') {
    const totalKWh = (watt * 24 * 365) / 1000;
    if (totalKWh === 0) return 0;
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    for (let hour = 0; hour < 24; hour++) {
      const frac = 1.0;
      totalWeightedPrice += (pricesApi[hour] || fallbackPrice) * frac;
      totalWeight += frac;
    }
    const averagePrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : fixedPrice;
    const dynamicCost = totalKWh * (averagePrice / 100);
    return dynamicCost < 0 ? 0 : dynamicCost;
  }

  if (!einstellung.nutzung || einstellung.nutzung <= 0 || !einstellung.zeitraeume || einstellung.zeitraeume.length === 0) return 0;

  let totalKWh = 0;
  let multiplier = 0;
  let useWatt = watt;

  const totalDauer = einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  if (totalDauer === 0) return 0;

  if (type === 'auto' && einstellung.standardLadung) {
    totalKWh = (einstellung.batterieKapazitaet || 0) * (einstellung.nutzung || 0) * 52;
  } else {
    if (type === 'week' || type === 'auto') {
      multiplier = (einstellung.nutzung || 0) * 52;
    }
    if (type === 'auto') {
      useWatt = einstellung.wallboxLeistung || watt;
    }
    totalKWh = (useWatt * totalDauer * multiplier) / 1000;
  }
  if (totalKWh === 0) return 0;

  let totalWeightedPrice = 0;
  let totalWeight = 0;

  einstellung.zeitraeume.forEach((z) => {
    let currentTime = parseInt(z.startzeit.split(':')[0]) + parseInt(z.startzeit.split(':')[1]) / 60;
    let remaining = parseFloat(z.dauer) || 0;
    while (remaining > 0) {
      const hour = Math.floor(currentTime);
      const frac = Math.min(1.0, remaining, hour + 1 - currentTime);
      totalWeightedPrice += (pricesApi[hour % 24] || fallbackPrice) * frac;
      totalWeight += frac;
      remaining -= frac;
      currentTime += frac;
      if (currentTime >= 24) currentTime -= 24;
    }
  });

  const averagePrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : fixedPrice;
  const dynamicCost = totalKWh * (averagePrice / 100);
  return dynamicCost < 0 ? 0 : dynamicCost;
};

const calculateTotalWattage = (verbraucherDaten) => {
  return Object.keys(verbraucherDaten).reduce((total, verbraucher) => {
    const watt = parseFloat(verbraucherDaten[verbraucher].watt) || 0;
    return total + watt;
  }, 0).toFixed(2);
};

const updateZusammenfassung = (verbraucherDaten, setZusammenfassung) => {
  let grundlast = 0;
  let dynamisch = 0;
  let waermepumpe = 0;

  Object.keys(standardVerbrauch).forEach((key) => {
    const kosten = parseFloat(verbraucherDaten[key]?.kosten) || 0;
    if (isNaN(kosten) ) return;
    if (verbraucherTypes[key] === 'grundlast') {
      grundlast += kosten;
    } else if (verbraucherTypes[key] === 'waermepumpe') {
      waermepumpe += kosten;
    } else {
      dynamisch += kosten;
    }
  });

  const totalWattage = calculateTotalWattage(verbraucherDaten);

  setZusammenfassung((prev) => ({
    ...prev,
    grundlast: grundlast.toFixed(2),
    dynamisch: dynamisch.toFixed(2),
    waermepumpe: waermepumpe.toFixed(2),
    gesamt: (grundlast + dynamisch + waermepumpe).toFixed(2),
    totalWattage,
  }));
};

const berechneStundenVerbrauch = (verbraucherDaten, erweiterteEinstellungen) => {
  const stunden = Array(24).fill(0).map(() => ({
    grundlast: 0,
    dynamisch: 0,
    waermepumpe: 0,
    total: 0,
    verbraucher: [],
  }));
  Object.keys(standardVerbrauch).forEach((verbraucher) => {
    const einstellung = erweiterteEinstellungen[verbraucher] || {};
    const type = verbraucherTypes[verbraucher] || 'grundlast';
    const nutzung = einstellung.nutzung || 0;
    const dailyMultiplier = (type === 'week' || type === 'auto') ? (nutzung / 7) : 1;
    let useWatt = verbraucherDaten[verbraucher]?.watt || 0;
    const standardLadung = einstellung.standardLadung || false;
    const totalDauer = einstellung.zeitraeume?.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 1;
    if (type === 'auto' && standardLadung) {
      useWatt = ((einstellung.batterieKapazitaet || 0) / totalDauer) * 1000;
    }
    if (useWatt <= 0) return;
    const isGrundlast = type === 'grundlast';
    let category = 'dynamisch';
    if (type === 'grundlast') category = 'grundlast';
    else if (type === 'waermepumpe') category = 'waermepumpe';

    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        const add = (useWatt / 1000) * dailyMultiplier;
        stunden[i][category] += add;
        stunden[i].total += add;
        if (!stunden[i].verbraucher.includes(verbraucher)) {
          stunden[i].verbraucher.push(verbraucher);
        }
      }
    } else {
      einstellung.zeitraeume?.forEach(zeitraum => {
        const startzeit = zeitraum.startzeit;
        const dauer = parseFloat(zeitraum.dauer) || 0;
        if (!startzeit || dauer <= 0) return;
        let currentTime = parseInt(startzeit.split(':')[0]) + parseInt(startzeit.split(':')[1]) / 60;
        let remaining = dauer;
        while (remaining > 0) {
          const hour = Math.floor(currentTime);
          const frac = Math.min(1.0, remaining, hour + 1 - currentTime);
          const add = (useWatt / 1000) * frac * dailyMultiplier;
          stunden[hour % 24][category] += add;
          stunden[hour % 24].total += add;
          if (!stunden[hour % 24].verbraucher.includes(verbraucher)) {
            stunden[hour % 24].verbraucher.push(verbraucher);
          }
          remaining -= frac;
          currentTime += frac;
          if (currentTime >= 24) currentTime -= 24;
        }
      });
    }
  });
  return stunden;
};

export default function StromverbrauchRechnerDesktop({ data = [], uniqueDates = [], todayBerlin, error: propError }) {
  const initialDate = uniqueDates.includes(todayBerlin) ? todayBerlin : uniqueDates[0] || '';
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [strompreis, setStrompreis] = useState(34.06); // Standardpreis für AM
  const [selectedRegion, setSelectedRegion] = useState('AM');
 // Initialisierung von verbraucherDaten (Checkboxen für die genannten Verbraucher checked setzen und Watt-Werte zuweisen)
const [verbraucherDaten, setVerbraucherDaten] = useState(
  Object.keys(standardVerbrauch).reduce((acc, key) => {
    let watt = 0;
    let checked = false;
    if (['Waschmaschine', 'Trockner', 'Herd', 'Geschirrspüler', 'Multimedia', 'Licht'].includes(key)) {
      checked = true;
      watt = standardVerbrauch[key];
    }
    return {
      ...acc,
      [key]: { watt, checked, kosten: 0 },
    };
  }, {})
);
// Initialisierung von erweiterteEinstellungen (spezifische Defaults für die genannten Verbraucher setzen)
const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
  Object.keys(standardVerbrauch).reduce((acc, key) => {
    let startzeit, endzeit, dauer, nutzung, batterieKapazitaet, wallboxLeistung, standardLadung, jaz, heizstunden;
    const type = verbraucherTypes[key];

    if (type === 'grundlast') {
      startzeit = '06:00';
      endzeit = '09:00';
      dauer = 0;
      nutzung = 0;
    } else if (type === 'week') {
      // Standardwerte überschreiben für spezifische Verbraucher
      if (key === 'Waschmaschine') {
        startzeit = '17:00';
        endzeit = '20:00';
        dauer = 3;
        nutzung = 4;
      } else if (key === 'Trockner') {
        startzeit = '20:00';
        endzeit = '21:30';
        dauer = 1.5;
        nutzung = 3;
      } else if (key === 'Herd') {
        startzeit = '12:00';
        endzeit = '13:00';
        dauer = 1;
        nutzung = 6;
      } else if (key === 'Geschirrspüler') {
        startzeit = '14:00';
        endzeit = '16:00';
        dauer = 2;
        nutzung = 4;
      } else if (key === 'Multimedia') {
        startzeit = '19:00';
        endzeit = '22:00';
        dauer = 3;
        nutzung = 7;
      } else if (key === 'Licht') {
        startzeit = '18:30';
        endzeit = '22:30';
        dauer = 4;
        nutzung = 7;
      } else {
        // Fallback für andere 'week'-Typen
        startzeit = '12:00';
        endzeit = '19:00';
        dauer = 2;
        nutzung = 2;
      }
    } else if (type === 'auto') {
      startzeit = '21:00';
      endzeit = '00:00';
      dauer = 3;
      nutzung = 3;
      batterieKapazitaet = 60;
      wallboxLeistung = standardVerbrauch[key];
      standardLadung = false;
    } else if (type === 'waermepumpe') {
      startzeit = '06:00';
      endzeit = '09:00';
      dauer = 2;
      nutzung = 1;
      jaz = 3.4;
      heizstunden = 2000;
    }

    return {
      ...acc,
      [key]: {
        nutzung,
        zeitraeume: [{ id: Date.now() + Math.random(), startzeit, endzeit, dauer }],
        ...(type === 'auto' ? { batterieKapazitaet, wallboxLeistung, standardLadung } : {}),
        ...(type === 'waermepumpe' ? { jaz, heizstunden } : {}),
      },
    };
  }, {})
);
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState({});
  const [zusammenfassung, setZusammenfassung] = useState({
    grundlast: 0,
    dynamisch: 0,
    waermepumpe: 0,
    gesamt: 0,
    totalWattage: 0,
    grundlastDyn: 0,
    dynamischDyn: 0,
    waermepumpeDyn: 0,
    gesamtDyn: 0,
    quarterlyCosts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
    dynselbstbestimmt: 0,
  });
  const [error, setError] = useState(propError || '');
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: false,
    grundlastverbraucher: false,
    dynamischeverbraucher: false,
    eauto: false,
    waermepumpe: false,
    strompeicher: false,
  });

  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [newOptionKW, setNewOptionKW] = useState({});
  const [newOptionTypes, setNewOptionTypes] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [apiData, setApiData] = useState(data);
  const [apiLoading, setApiLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState(uniqueDates);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const [agb, setAgb] = useState(false);
  const [werbung, setWerbung] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(true);





  
  const [menus, setMenus] = useState([
    {
      id: 'grundlastverbraucher',
      label: 'Grundlastverbraucher',
      options: [
        { name: 'Kühlschrank', specifications: 'Leistung: 100-200 W, Energieeffizienz: A+++, Betrieb: 24/7' },
        { name: 'Gefrierschrank', specifications: 'Leistung: 150-300 W, Energieeffizienz: A++, Betrieb: 24/7' },
      ],
    },
    {
      id: 'waermepumpe',
      label: 'Wärmepumpe',
      options: [
        { name: 'Wärmepumpe', specifications: 'Leistung: 5-15 kW, Betrieb: variabel, Energieeffizienz: A+++' },
      ],
    },
    {
      id: 'dynamischeverbraucher',
      label: 'Schaltbare Verbraucher',
      options: [
        { name: 'Waschmaschine', specifications: 'Leistung: 2-3 kW, Betrieb: 1-2h pro Zyklus, Energieeffizienz: A+++' },
        { name: 'Trockner', specifications: 'Leistung: 2-4 kW, Betrieb: 1-3h pro Zyklus, Energieeffizienz: A++' },
        { name: 'Herd', specifications: 'Leistung: 0.7 kW, Betrieb: variabel, Typ: Induktion/Elektro' },
        { name: 'Geschirrspüler', specifications: 'Leistung: 1-2 kW, Betrieb: 1-3h pro Zyklus, Energieeffizienz: A+++' },
        { name: 'Multimedia', specifications: 'Leistung: 0.1-1 kW, Betrieb: variabel, z.B. TV, Computer' },
        { name: 'Licht', specifications: 'Leistung: 0.01-0.1 kW, Typ: LED, Betrieb: variabel' },
      ],
    },
    {
      id: 'eauto',
      label: 'E-Auto',
      options: [
        { name: 'E-Auto', specifications: 'Leistung: 11 kW, Betrieb: variabel, z.B. Laden über Wallbox' },
        { name: 'Zweites E-Auto', specifications: 'Leistung: 7.4 kW, Betrieb: variabel, z.B. Laden über Wallbox' },
      ],
    },
  ]);

  // localStorage migration and loading
  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const migratedVerbraucherDaten = { ...parsed.verbraucherDaten };
      const migratedErweiterteEinstellungen = { ...parsed.erweiterteEinstellungen };
      const migratedStandardVerbrauch = { ...parsed.standardVerbrauch };
      const migratedVerbraucherTypes = { ...parsed.verbraucherTypes };
      const migratedVerbraucherBeschreibungen = { ...parsed.verbraucherBeschreibungen };

      if (migratedVerbraucherDaten['EAuto']) {
        migratedVerbraucherDaten['E-Auto'] = migratedVerbraucherDaten['EAuto'];
        delete migratedVerbraucherDaten['EAuto'];
      }
      if (migratedErweiterteEinstellungen['EAuto']) {
        migratedErweiterteEinstellungen['E-Auto'] = migratedErweiterteEinstellungen['EAuto'];
        delete migratedErweiterteEinstellungen['EAuto'];
      }
      if (migratedStandardVerbrauch['EAuto']) {
        migratedStandardVerbrauch['E-Auto'] = migratedStandardVerbrauch['EAuto'];
        delete migratedStandardVerbrauch['EAuto'];
      }
      if (migratedVerbraucherTypes['EAuto']) {
        migratedVerbraucherTypes['E-Auto'] = migratedVerbraucherTypes['EAuto'];
        delete migratedVerbraucherTypes['EAuto'];
      }
      if (migratedVerbraucherBeschreibungen['EAuto']) {
        migratedVerbraucherBeschreibungen['E-Auto'] = migratedVerbraucherBeschreibungen['EAuto'];
        delete migratedVerbraucherBeschreibungen['EAuto'];
      }

      if (migratedVerbraucherDaten['ZweitesEAuto']) {
        migratedVerbraucherDaten['Zweites E-Auto'] = migratedVerbraucherDaten['ZweitesEAuto'];
        delete migratedVerbraucherDaten['ZweitesEAuto'];
      }
      if (migratedErweiterteEinstellungen['ZweitesEAuto']) {
        migratedErweiterteEinstellungen['Zweites E-Auto'] = migratedErweiterteEinstellungen['ZweitesEAuto'];
        delete migratedErweiterteEinstellungen['ZweitesEAuto'];
      }
      if (migratedStandardVerbrauch['ZweitesEAuto']) {
        migratedStandardVerbrauch['Zweites E-Auto'] = migratedStandardVerbrauch['ZweitesEAuto'];
        delete migratedStandardVerbrauch['ZweitesEAuto'];
      }
      if (migratedVerbraucherTypes['ZweitesEAuto']) {
        migratedVerbraucherTypes['Zweites E-Auto'] = migratedVerbraucherTypes['ZweitesEAuto'];
        delete migratedVerbraucherTypes['ZweitesEAuto'];
      }
      if (migratedVerbraucherBeschreibungen['ZweitesEAuto']) {
        migratedVerbraucherBeschreibungen['Zweites E-Auto'] = migratedVerbraucherBeschreibungen['ZweitesEAuto'];
        delete migratedVerbraucherBeschreibungen['ZweitesEAuto'];
      }

      setVerbraucherDaten(migratedVerbraucherDaten || verbraucherDaten);
      setErweiterteEinstellungen(migratedErweiterteEinstellungen || erweiterteEinstellungen);
      Object.assign(standardVerbrauch, migratedStandardVerbrauch || {});
      Object.assign(verbraucherTypes, migratedVerbraucherTypes || {});
      Object.assign(verbraucherBeschreibungen, migratedVerbraucherBeschreibungen || {});
      updateZusammenfassung(migratedVerbraucherDaten || verbraucherDaten, setZusammenfassung);
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      verbraucherDaten,
      erweiterteEinstellungen,
      verbraucherTypes,
      standardVerbrauch,
      verbraucherBeschreibungen,
    };
    localStorage.setItem('appData', JSON.stringify(dataToSave));
  }, [verbraucherDaten, erweiterteEinstellungen]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  useEffect(() => {
    const currentDate = todayBerlin;
    if (availableDates.includes(currentDate)) {
      setSelectedDate(currentDate);
    } else if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, todayBerlin]);

  useEffect(() => {
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        updateKosten(watt, verbraucher, strompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen);
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  }, [strompreis, selectedRegion, erweiterteEinstellungen]);

  const handleRegionChange = (region) => {
    const newRegion = selectedRegion === region ? null : region;
    setSelectedRegion(newRegion);
    const newStrompreis = newRegion ? getRegionStrompreis(newRegion) : 31;
    setStrompreis(newStrompreis);

    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        updateKosten(watt, verbraucher, newStrompreis, newRegion, setVerbraucherDaten, erweiterteEinstellungen);
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const onCheckboxChange = (verbraucher, checked) => {
    setVerbraucherDaten((prev) => {
      const watt = checked ? standardVerbrauch[verbraucher] || 0 : 0;
      const type = verbraucherTypes[verbraucher] || 'grundlast';
      let kosten = 0;

      if (checked) {
        if (type !== 'grundlast') {
          kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        } else {
          kosten = (watt * (parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100) * 24 * 365) / 1000;
          if (kosten < 0) kosten = 0;
        }
      }

      const updatedData = {
        ...prev,
        [verbraucher]: { ...prev[verbraucher], watt, checked, kosten: kosten.toFixed(2) },
      };
      updateZusammenfassung(updatedData, setZusammenfassung);
      return updatedData;
    });
  };

  const handleWattChange = (verbraucher, value) => {
    const watt = parseFloat(value) || 0;
    if (watt < 0) {
      setError(`Wattleistung für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setError('');
    setVerbraucherDaten((prev) => {
      const type = verbraucherTypes[verbraucher] || 'grundlast';
      let kosten = 0;
      if (prev[verbraucher]?.checked || watt > 0) {
        kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
      }
      const updatedData = {
        ...prev,
        [verbraucher]: { ...prev[verbraucher], watt, kosten: kosten.toFixed(2) },
      };
      updateZusammenfassung(updatedData, setZusammenfassung);
      return updatedData;
    });
  };

  const handleKWChange = (verbraucher, value) => {
    const kw = parseFloat(value) || 0;
    if (kw < 0) {
      setError(`kW-Leistung für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setError('');
    setVerbraucherDaten((prev) => {
      const watt = kw * 1000;
      const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
      const updatedData = {
        ...prev,
        [verbraucher]: { ...prev[verbraucher], watt, kosten: kosten.toFixed(2) },
      };
      updateZusammenfassung(updatedData, setZusammenfassung);
      return updatedData;
    });
  };

  const handleErweiterteEinstellungChange = (verbraucher, field, value, zeitraumId) => {
    const parsedValue = field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'jaz' || field === 'heizstunden'
      ? parseFloat(value) || 0
      : field === 'standardLadung'
      ? value === 'true'
      : value;

    if ((field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'jaz' || field === 'heizstunden') && parsedValue < 0) {
      setError(`Wert für ${field} bei ${verbraucher} darf nicht negativ sein.`);
      return;
    }

    if (field === 'nutzung' && parsedValue > 20) {
      setError(`Nutzungen pro Woche für ${verbraucher} dürfen 20 nicht überschreiten.`);
      return;
    }

    if (field === 'dauer' && parsedValue > 23) {
      setError(`Dauer für ${verbraucher} darf 23 Stunden nicht überschreiten.`);
      return;
    }

    setError('');
    setErweiterteEinstellungen((prev) => {
      const updatedSettings = {
        ...prev,
        [verbraucher]: {
          ...prev[verbraucher],
          [field]: parsedValue,
        },
      };
      if (field === 'dauer') {
        updatedSettings[verbraucher].zeitraeume = prev[verbraucher].zeitraeume.map(zeitraum =>
          zeitraum.id === zeitraumId ? { ...zeitraum, dauer: parsedValue } : zeitraum
        );
      }
      const type = verbraucherTypes[verbraucher];
      if (type !== 'grundlast') {
        setVerbraucherDaten((prev) => {
          const kosten = berechneDynamischenVerbrauch(
            prev[verbraucher].watt,
            verbraucher,
            strompreis,
            selectedRegion,
            updatedSettings
          );
          const updatedData = {
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          };
          updateZusammenfassung(updatedData, setZusammenfassung);
          return updatedData;
        });
      }
      return updatedSettings;
    });
  };

  const handleTimePeriodChange = (verbraucher, periodLabel, zeitraumId) => {
    const period = timePeriods.find(p => p.label === periodLabel);
    if (period) {
      setErweiterteEinstellungen((prev) => ({
        ...prev,
        [verbraucher]: {
          ...prev[verbraucher],
          zeitraeume: prev[verbraucher].zeitraeume.map(zeitraum =>
            zeitraum.id === zeitraumId ? { ...zeitraum, startzeit: period.startzeit, endzeit: period.endzeit } : zeitraum
          ),
        },
      }));
      const type = verbraucherTypes[verbraucher];
      if (type !== 'grundlast') {
        const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
        updateZusammenfassung(verbraucherDaten, setZusammenfassung);
      }
    }
  };

  const addZeitraum = (verbraucher) => {
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        zeitraeume: [...prev[verbraucher].zeitraeume, {
          id: Date.now() + Math.random(),
          startzeit: '06:00',
          endzeit: '09:00',
          dauer: prev[verbraucher].zeitraeume[0]?.dauer || 2,
        }],
      },
    }));
  };

  const removeZeitraum = (verbraucher, zeitraumId) => {
    setErweiterteEinstellungen((prev) => {
      const zeitraeume = prev[verbraucher].zeitraeume;
      if (zeitraeume.length <= 1) {
        setError(`Mindestens ein Zeitraum muss für ${verbraucher} bestehen bleiben.`);
        return prev;
      }
      return {
        ...prev,
        [verbraucher]: {
          ...prev[verbraucher],
          zeitraeume: zeitraeume.filter((zeitraum) => zeitraum.id !== zeitraumId),
        },
      };
    });
    const type = verbraucherTypes[verbraucher];
    if (type !== 'grundlast') {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung(verbraucherDaten, setZusammenfassung);
    }
  };

  const handleStrompreisChange = (value) => {
    const newStrompreis = parseFloat(value) || (selectedRegion ? getRegionStrompreis(selectedRegion) : 31);
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        updateKosten(watt, verbraucher, newStrompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen);
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const handleNewOptionName = (menuId, value) => {
    setNewOptionNames((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionWatt = (menuId, value) => {
    setNewOptionWatt((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionKW = (menuId, value) => {
    setNewOptionKW((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionType = (menuId, value) => {
    setNewOptionTypes((prev) => ({ ...prev, [menuId]: value }));
  };

  const toggleNewOptionForm = (menuId) => {
    setShowNewOptionForm((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const addNewOption = (menuId) => {
    const name = newOptionNames[menuId]?.trim();
    const watt = menuId === 'waermepumpe' ? (parseFloat(newOptionKW[menuId]) || 12) * 1000 : parseFloat(newOptionWatt[menuId]) || 100;
    let selectedType = newOptionTypes[menuId] || 'week';
    const menu = menus.find((m) => m.id === menuId);
    if (menu.options.some((opt) => opt.name === name)) {
      setError(`Der Name "${name}" existiert bereits in ${menu.label}.`);
      return;
    }
    if (name && !isNaN(watt) && watt > 0) {
      let vType;
      let nutzung = 0;
      let dauer = 0;
      let startzeit = '06:00';
      let endzeit = '09:00';
      let batterieKapazitaet, wallboxLeistung, standardLadung, jaz, heizstunden;

      if (menuId === 'grundlastverbraucher') {
        vType = 'grundlast';
        nutzung = 0;
        dauer = 0;
      } else if (menuId === 'dynamischeverbraucher') {
        vType = 'week';
        startzeit = '09:00';
        endzeit = '12:00';
        dauer = 3;
        nutzung = 2;
      } else if (menuId === 'eauto') {
        vType = 'auto';
        startzeit = '21:00';
        endzeit = '00:00';
        dauer = 3;
        nutzung = 3;
        batterieKapazitaet = 40;
        wallboxLeistung = watt;
        standardLadung = false;
      } else if (menuId === 'waermepumpe') {
        vType = 'waermepumpe';
        startzeit = '06:00';
        endzeit = '09:00';
        dauer = 2;
        nutzung = 1;
        jaz = 3.4;
        heizstunden = 2000;
      } else {
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId
              ? { ...menu, options: [...menu.options, { name, specifications: `Leistung: ${watt} W` }] }
              : menu
          )
        );
        setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
        setNewOptionWatt((prev) => ({ ...prev, [menuId]: '' }));
        setNewOptionKW((prev) => ({ ...prev, [menuId]: '' }));
        setShowNewOptionForm((prev) => ({ ...prev, [menuId]: false }));
        return;
      }

      verbraucherTypes[name] = vType;
      standardVerbrauch[name] = watt;
      verbraucherBeschreibungen[name] = `Benutzerdefinierter Verbraucher mit ${watt} W.`;

      setVerbraucherDaten((prev) => ({
        ...prev,
        [name]: { watt: 0, checked: false, kosten: 0 },
      }));

      setErweiterteEinstellungen((prev) => ({
        ...prev,
        [name]: {
          nutzung,
          zeitraeume: [{ id: Date.now() + Math.random(), startzeit, endzeit, dauer }],
          ...(vType === 'auto' ? { batterieKapazitaet, wallboxLeistung, standardLadung } : {}),
          ...(vType === 'waermepumpe' ? { jaz, heizstunden } : {}),
        },
      }));

      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? { ...menu, options: [...menu.options, { name, specifications: `Leistung: ${watt} W` }] }
            : menu
        )
      );

      setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionWatt((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionKW((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionTypes((prev) => ({ ...prev, [menuId]: '' }));
      setShowNewOptionForm((prev) => ({ ...prev, [menuId]: false }));
    } else {
      setError('Bitte geben Sie einen gültigen Namen und Wattleistung ein.');
    }
  };

  const handleDeleteOptionClick = (menuId, optionName) => {
    setDeleteConfirmOption({ menuId, optionName });
  };

  const confirmDeleteOption = (menuId, optionName) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? { ...menu, options: menu.options.filter((opt) => opt.name !== optionName) }
          : menu
      )
    );
    if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher' || menuId === 'eauto' || menuId === 'waermepumpe') {
      setVerbraucherDaten((prev) => {
        const newData = { ...prev };
        delete newData[optionName];
        return newData;
      });
      setErweiterteEinstellungen((prev) => {
        const newSettings = { ...prev };
        delete newSettings[optionName];
        return newSettings;
      });
      delete standardVerbrauch[optionName];
      delete verbraucherBeschreibungen[optionName];
      delete verbraucherTypes[optionName];
    }
    setDeleteConfirmOption(null);
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const cancelDeleteOption = () => {
    setDeleteConfirmOption(null);
  };

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const toggleErweiterteOptionen = (menuId, option) => {
    setShowErweiterteOptionen((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: !prev[menuId]?.[option] },
    }));
  };

  async function requestCode() {
    setMessage('');
    if (!email.includes('@')) {
      setMessage('Bitte gültige E-Mail eingeben.');
      return;
    }
    if (!agb) {
      setMessage('Bitte akzeptiere die Allgemeinen Geschäftsbedingungen.');
      return;
    }
    if (cooldown > 0) {
      setMessage(`Bitte warte noch ${cooldown} Sekunden, bevor du erneut einen Code anforderst.`);
      return;
    }

    try {
      const res = await fetch('/api/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, werbung }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Code wurde an deine E-Mail gesendet.');
        setStep(2);
        setCooldown(60);
      } else {
        setMessage(data.error || 'Fehler beim Senden des Codes.');
      }
    } catch (error) {
      setMessage('Fehler beim Senden des Codes.');
    }
  }














  async function verifyCode() {
    setMessage('');
    if (code.length !== 6) {
      setMessage('Bitte 6-stelligen Code eingeben.');
      return;
    }
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setVerified(true);
        setMessage('Verifiziert!');
      } else {
        setMessage('Falscher Code!');
      }
    } catch (error) {
      setMessage('Fehler bei der Code-Verifizierung.');
    }
  }

  const handleDownloadClick = () => {
    if (!verified) {
      setShowModal(true);
    } else {
      handleDownloadPDF();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEmail('');
    setCode('');
    setStep(1);
    setMessage('');
    setAgb(false);
    setWerbung(false);
  };

  const handleDownloadPDF = () => {
    if (!verified) return;
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = 280;
    const lineHeight = 7;
    const sectionSpacing = 10;
    const subSectionSpacing = 5;
    const pageWidth = 190;

    const addNewPageIfNeeded = (requiredSpace = lineHeight) => {
      if (yPosition + requiredSpace > pageHeight) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Seite ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, pageHeight + 10, { align: 'right' });
        doc.addPage();
        yPosition = 20;
      }
    };

    const drawSectionLine = () => {
      addNewPageIfNeeded();
      doc.setLineWidth(0.5);
      doc.line(10, yPosition, pageWidth, yPosition);
      yPosition += subSectionSpacing;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Detail-Rechner', 10, yPosition);
    yPosition += sectionSpacing;
    drawSectionLine();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Eingaben', 10, yPosition);
    yPosition += sectionSpacing;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    addNewPageIfNeeded();
    doc.text(`Strompreis: ${strompreis} Ct/kWh`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Region: ${selectedRegion || 'Keine ausgewählt'}`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Berechneter Preis: ${getPreisDifferenz(strompreis, selectedRegion)} Ct/kWh`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();

    let formattedDate = 'Nicht ausgewählt';
    if (selectedDate) {
      if (typeof selectedDate === 'string' && selectedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = selectedDate.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        formattedDate = isNaN(date.getTime())
          ? 'Ungültiges Datum'
          : date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    }
    doc.text(`Datum: ${formattedDate}`, 15, yPosition);
    yPosition += sectionSpacing;
    drawSectionLine();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Ausgewählte Verbraucher/Erzeuger', 10, yPosition);
    yPosition += sectionSpacing;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    menus.forEach((menu) => {
      addNewPageIfNeeded(sectionSpacing + lineHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Menü: ${menu.label}`, 10, yPosition);
      yPosition += lineHeight;
      doc.setFont('helvetica', 'normal');

      menu.options.forEach((option) => {
        const data = verbraucherDaten[option.name];
        if (data?.checked || data?.watt || data?.kosten) {
          addNewPageIfNeeded();
          doc.text(`- ${option.name}:`, 15, yPosition);
          yPosition += subSectionSpacing;
          addNewPageIfNeeded();
          doc.text(`  Leistung: ${menu.id === 'waermepumpe' ? (data?.watt / 1000).toFixed(2) + ' kW' : data?.watt + ' W'}`, 20, yPosition);
          yPosition += subSectionSpacing;
          addNewPageIfNeeded();
          doc.text(`  Kosten (fixer Tarif): ${data?.kosten || '0.00'} €`, 20, yPosition);
          yPosition += subSectionSpacing;

          const ext = erweiterteEinstellungen[option.name];
          if (ext && (menu.id === 'dynamischeverbraucher' || menu.id === 'eauto' || menu.id === 'waermepumpe')) {
            addNewPageIfNeeded();
            doc.text(`  Erweiterte Einstellungen:`, 20, yPosition);
            yPosition += subSectionSpacing;
            if (menu.id === 'eauto') {
              addNewPageIfNeeded();
              doc.text(`    Batteriekapazität: ${ext.batterieKapazitaet} kWh`, 25, yPosition);
              yPosition += subSectionSpacing;
              addNewPageIfNeeded();
              doc.text(`    Wallbox-Leistung: ${ext.wallboxLeistung} W`, 25, yPosition);
              yPosition += subSectionSpacing;
              addNewPageIfNeeded();
              doc.text(`    Ladehäufigkeit: ${ext.nutzung} pro Woche`, 25, yPosition);
              yPosition += subSectionSpacing;
              addNewPageIfNeeded();
              doc.text(`    Standardladung: ${ext.standardLadung ? 'Ja' : 'Nein'}`, 25, yPosition);
              yPosition += subSectionSpacing;
            } else if (menu.id === 'waermepumpe') {
              addNewPageIfNeeded();
              doc.text(`    JAZ: ${ext.jaz}`, 25, yPosition);
              yPosition += subSectionSpacing;
              addNewPageIfNeeded();
              doc.text(`    Heizstunden: ${ext.heizstunden} pro Jahr`, 25, yPosition);
              yPosition += subSectionSpacing;
            } else {
              addNewPageIfNeeded();
              doc.text(`    Nutzung: ${ext.nutzung} pro Woche`, 25, yPosition);
              yPosition += subSectionSpacing;
            }
            if (ext.zeitraeume && ext.zeitraeume.length > 0) {
              addNewPageIfNeeded();
              doc.text(`    Zeiträume:`, 25, yPosition);
              yPosition += subSectionSpacing;
              ext.zeitraeume.forEach((z) => {
                addNewPageIfNeeded();
                doc.text(`      - ${z.startzeit} - ${z.endzeit}: Dauer ${z.dauer} h`, 30, yPosition);
                yPosition += subSectionSpacing;
              });
            }
          }
        }
      });
      yPosition += sectionSpacing;
      drawSectionLine();
    });

    addNewPageIfNeeded(sectionSpacing + lineHeight);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Zusammenfassung', 10, yPosition);
    yPosition += sectionSpacing;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    addNewPageIfNeeded();
    doc.text(`Grundlast Kosten (fixer Tarif): ${zusammenfassung.grundlast} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Dynamische Verbraucher Kosten (fixer Tarif): ${zusammenfassung.dynamisch} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Wärmepumpe Kosten (fixer Tarif): ${zusammenfassung.waermepumpe} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Gesamtkosten (fixer Tarif): ${zusammenfassung.gesamt} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Gesamtwattage: ${zusammenfassung.totalWattage} W`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Grundlast Kosten (dynamischer Tarif): ${zusammenfassung.grundlastDyn} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Dynamische Verbraucher Kosten (dynamischer Tarif): ${zusammenfassung.dynamischDyn} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Wärmepumpe Kosten (dynamischer Tarif): ${zusammenfassung.waermepumpeDyn} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Wärmepumpe Tageskosten (dynamischer Tarif): ${zusammenfassung.dynselbstbestimmt} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    const ersparnis = (parseFloat(zusammenfassung.gesamt) - parseFloat(zusammenfassung.gesamtDyn)).toFixed(2);
    doc.text(`Ersparnis (fixer vs. dynamischer Tarif): ${ersparnis} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text('Wärmepumpe Kosten pro Quartal (dynamischer Tarif):', 15, yPosition);
    yPosition += lineHeight;
    Object.entries(zusammenfassung.quarterlyCosts).forEach(([quarter, cost]) => {
      addNewPageIfNeeded();
      doc.text(`  ${quarter}: ${cost.toFixed(2)} €`, 20, yPosition);
      yPosition += lineHeight;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Seite ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, pageHeight + 10, { align: 'right' });

    doc.save('rechenbericht.pdf');
    setVerified(false);
    setShowModal(false);
    setEmail('');
    setCode('');
    setStep(1);
    setMessage('');
    setAgb(false);
    setWerbung(false);
  };

  const hourlyData = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  if (apiData.length === 0 || availableDates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <p className="text-lg font-semibold text-red-900">
          {apiData.length === 0
            ? 'Keine Daten in der Datenbank gefunden.'
            : 'Keine gültigen Datumswerte im Feld "Delivery day" gefunden.'}
        </p>
      </div>
    );
  }

  // Define price fields (Hour 1 Q1 to Hour 24 Q4, handling Hour 3A and skipping 3B if null)
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

  // Memoize chart data to prevent unnecessary recalculations
  const { chartConvertedValues } = useMemo(() => {
    const selectedIndex = apiData.findIndex(item => item['Delivery day'] === selectedDate);
    const selectedRecord = selectedIndex !== -1 ? apiData[selectedIndex] : {};
    const rawValuesAll = priceFields.map(field => {
      const v = selectedRecord[field];
      if (v == null) return null;
      const value = v.$numberDouble || v.$numberInt || v;
      return value;
    });
    const chartConvertedValues = rawValuesAll.map(v => (v != null ? parseFloat(v.toString().replace(',', '.')) / 10 : strompreis));
    return { chartConvertedValues };
  }, [apiData, selectedDate, strompreis]);

  // Define fixedPrice
  const fixedPrice = parseFloat(getPreisDifferenz(strompreis, selectedRegion));

  const hourlyPrices = Array(24).fill(0).map((_, h) => {
    const start = h * 4;
    const quarters = chartConvertedValues.slice(start, start + 4);
    const validQuarters = quarters.filter(q => q != null);
    if (validQuarters.length === 0) return fixedPrice;
    return validQuarters.reduce((sum, q) => sum + q, 0) / validQuarters.length;
  });

  // Consumption chart data
  const chartData = {
    labels: priceFields.map((field, index) => {
      let hourNum;
      if (field.includes('Hour 3A')) {
        hourNum = 3;
      } else {
        hourNum = Math.floor(index / 4) + 1;
      }
      const quarterNum = (index % 4) * 15;
      return `${(hourNum - 1).toString().padStart(2, '0')}:${quarterNum.toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Stromverbrauch ohne Wärmepumpe (kW)',
        data: hourlyData.flatMap(d => Array(4).fill(d.total - d.waermepumpe)),
        fill: false,
        borderColor: '#4372b7',
        backgroundColor: '#4372b7',
        tension: 0.1,
        yAxisID: 'y',
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#4372b7',  // Punktfarbe (innen)
      pointBorderColor: '#4372b7',      // Punktfarbe (außen)
      pointBorderWidth: 1,

      },
      {
        label: 'Wärmepumpen-Verbrauch (kW)',
        data: hourlyData.flatMap(d => Array(4).fill(d.waermepumpe)),
        fill: false,
        borderColor: '#f93b01',
        backgroundColor: '#f93b01',
        tension: 0.1,
        yAxisID: 'y',
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#f93b01',  // Punktfarbe (innen)
      pointBorderColor: '#f93b01',      // Punktfarbe (außen)
      pointBorderWidth: 1,
      },
      {
        label: 'Dynamischer Preis (Ct/kWh)',
        data: chartConvertedValues,
        fill: false,
        borderColor: '#905fa4',
        backgroundColor: '#905fa4',
        tension: 0.1,
        yAxisID: 'y1',
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#905fa4',  // Punktfarbe (innen)
      pointBorderColor: '#905fa4',      // Punktfarbe (außen)
      pointBorderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
      title: { display: true, text: '', color: '#fff', font: { size: 13 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw.toFixed(2);
            const index = context.dataIndex;
            const hour = Math.floor(index / 4);
            let verbraucherList = '';
            if (label.includes('ohne Wärmepumpe')) {
              verbraucherList = hourlyData[hour].verbraucher.filter(v => verbraucherTypes[v] !== 'waermepumpe').join(', ');
              return `${label}: ${value} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
            } else if (label.includes('Wärmepumpen')) {
              verbraucherList = hourlyData[hour].verbraucher.filter(v => verbraucherTypes[v] === 'waermepumpe').join(', ');
              return `${label}: ${value} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
            } else if (label.includes('Dynamischer Preis')) {
              return `${label}: ${value} Ct/kWh`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Verbrauch (kW)', color: '#fff' },
        ticks: { color: '#fff' },
        position: 'left',
      },
      y1: {
        beginAtZero: true,
        title: { display: true, text: 'Preis (Ct/kWh)', color: '#fff' },
        ticks: { color: '#fff' },
        position: 'right',
        grid: {
          drawOnChartArea: false, // Vermeide Überlappung der Grids
        },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', color: '#fff' },
        ticks: {
          color: '#fff',
          callback: function(value, index, values) {
            if (index % 4 === 0) {
              const hourNum = Math.floor(index / 4);
              return `${hourNum.toString().padStart(2, '0')}:00`;
            }
            return null;
          },
        },
      },
    },
  };

  // Costs chart data
  const chartDataKosten = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Kosten Dynamischer Tarif  (Ct/h)',
        data: hourlyData.flatMap((d, h) => chartConvertedValues.slice(h*4, (h+1)*4).map(price => (d.total - d.waermepumpe) * price)),
        fill: false,
        borderColor: '#905fa4',
        backgroundColor: '#905fa4',
        tension: 0.1,
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#905fa4',  // Punktfarbe (innen)
      pointBorderColor: '#905fa4',      // Punktfarbe (außen)
      pointBorderWidth: 1,
      },
      {
        label: 'Kosten Wärmepumpe (Ct/h)',
        data: hourlyData.flatMap((d, h) => chartConvertedValues.slice(h*4, (h+1)*4).map(price => d.waermepumpe * price)),
        fill: false,
        borderColor: '#f93b01',
        backgroundColor: '#f93b01',
        tension: 0.1,
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#f93b01',  // Punktfarbe (innen)
      pointBorderColor: '#f93b01',      // Punktfarbe (außen)
      pointBorderWidth: 1,
      },
      {
        label: 'Kosten Fester Tarif (Ct/h)',
        data: hourlyData.flatMap(d => Array(4).fill(d.total * fixedPrice)),
        fill: false,
        borderColor: '#4372b7',
        backgroundColor: '#4372b7',
        tension: 0.1,
        // Linie dünner machen
      borderWidth: 1,
    
      // Punkte anzeigen
      pointRadius: 1,       // Größe der Punkte
      pointBackgroundColor: '#4372b7',  // Punktfarbe (innen)
      pointBorderColor: '#4372b7',      // Punktfarbe (außen)
      pointBorderWidth: 1,
      },
    ],
  };

  const chartOptionsKosten = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
      title: { display: true, text: ``, color: '#fff', font: { size: 16 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw.toFixed(2);
            const unit = 'Ct/h';
            return `${label}: ${value} ${unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Kosten (Ct/h)', color: '#fff' },
        ticks: { color: '#fff' },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', color: '#fff' },
        ticks: {
          color: '#fff',
          callback: function(value, index, values) {
            if (index % 4 === 0) {
              const hourNum = Math.floor(index / 4);
              return `${hourNum.toString().padStart(2, '0')}:00`;
            }
            return null;
          },
        },
      },
    },
  };

  
  // Überprüfen, ob Wärmepumpe aktiv ist
  const isWaermepumpeActive = Object.keys(verbraucherDaten).some(
    (key) => verbraucherTypes[key] === 'waermepumpe' && (verbraucherDaten[key].checked || verbraucherDaten[key].watt > 0)
  );

  function updateZusammenfassungDyn() {
    if (!selectedDate) {
      setZusammenfassung((prev) => ({
        ...prev,
        grundlastDyn: '0.00',
        dynamischDyn: '0.00',
        waermepumpeDyn: '0.00',
        gesamtDyn: '0.00',
        quarterlyCosts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        dynselbstbestimmt: '0.00',
      }));
      return;
    }

    let grundlastDyn = 0;
    let dynamischDyn = 0;
    let waermepumpeDyn = 0;
    let quarterlyCosts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    let dynselbstbestimmt = 0;
    const pricesApi = hourlyPrices;

    // Debugging: Ausgabe der gesamten pricesApi-Daten
    console.log('API Preise (pricesApi):', pricesApi);

    Object.keys(standardVerbrauch).forEach((key) => {
      if (verbraucherDaten[key]?.watt > 0 || verbraucherDaten[key]?.checked) {
        const costDyn = berechneDynamischeKosten(
          key,
          strompreis,
          pricesApi,
          verbraucherDaten,
          erweiterteEinstellungen,
          selectedRegion
        );
        if (verbraucherTypes[key] === 'grundlast') {
          grundlastDyn += costDyn;
        } else if (verbraucherTypes[key] === 'waermepumpe') {
          waermepumpeDyn += costDyn;
          const einstellung = erweiterteEinstellungen[key] || {};
          const jaz = einstellung.jaz || 3.4;
          const heizstunden = einstellung.heizstunden || 2000;
          if (jaz !== 0) {
            const totalKwh = (verbraucherDaten[key].watt / jaz) * heizstunden / 1000;
            quarterlyCosts = {
              Q1: totalKwh * 0.4 * prices.Q1,
              Q2: totalKwh * 0.15 * prices.Q2,
              Q3: totalKwh * 0.05 * prices.Q3,
              Q4: totalKwh * 0.4 * prices.Q4,
            };

            // Debugging: Ausgabe der Verbraucher-Daten und Einstellungen
            console.log(`Verbraucher: ${key}, Watt: ${verbraucherDaten[key].watt}, JAZ: ${jaz}, Heizstunden: ${heizstunden}`);

            let totalWeightedPrice = 0;
            let totalWeight = 0;
            if (einstellung.zeitraeume && einstellung.zeitraeume.length > 0) {
              einstellung.zeitraeume.forEach((z, index) => {
                let currentTime = parseInt(z.startzeit.split(':')[0]) + parseInt(z.startzeit.split(':')[1]) / 60;
                let remaining = parseFloat(z.dauer) || 0;
                console.log(`Zeitraum ${index + 1}: Startzeit=${z.startzeit}, Dauer=${z.dauer}, Startzeit (Stunden)=${currentTime}`);

                while (remaining > 0) {
                  const hour = Math.floor(currentTime);
                  const frac = Math.min(1.0, remaining, hour + 1 - currentTime);
                  const apiPrice = pricesApi[hour % 24] || parseFloat(getPreisDifferenz(strompreis, selectedRegion));

                  // Debugging: Ausgabe der Stunde und des abgerufenen Preises
                  console.log(`Stunde: ${hour}, API-Preis: ${apiPrice}, Fraktion: ${frac}`);

                  totalWeightedPrice += apiPrice * frac;
                  totalWeight += frac;
                  remaining -= frac;
                  currentTime += frac;
                  if (currentTime >= 24) currentTime -= 24;
                }
              });
            } else {
              // Fallback: Gleichmäßige Verteilung über 24 Stunden
              console.log('Fallback: Gleichmäßige Verteilung über 24 Stunden');
              for (let hour = 0; hour < 24; hour++) {
                const apiPrice = pricesApi[hour] || parseFloat(getPreisDifferenz(strompreis, selectedRegion));
                console.log(`Stunde: ${hour}, API-Preis: ${apiPrice}`);
                totalWeightedPrice += apiPrice * 1.0;
                totalWeight += 1.0;
              }
            }

            // Debugging: Ausgabe der gewichteten Preise
            const weightedPrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : parseFloat(getPreisDifferenz(strompreis, selectedRegion));
            console.log(`Gewichteter Preis für ${key}: ${weightedPrice}, TotalWeightedPrice: ${totalWeightedPrice}, TotalWeight: ${totalWeight}`);

            dynselbstbestimmt += (((verbraucherDaten[key].watt/1000) / jaz) * totalWeight * (weightedPrice)/100);
          }
        } else {
          dynamischDyn += costDyn;
        }
      }
    });

    setZusammenfassung((prev) => ({
      ...prev,
      grundlastDyn: grundlastDyn.toFixed(2),
      dynamischDyn: dynamischDyn.toFixed(2),
      waermepumpeDyn: waermepumpeDyn.toFixed(2),
      gesamtDyn: (grundlastDyn + dynamischDyn + waermepumpeDyn).toFixed(2),
      quarterlyCosts,
      dynselbstbestimmt: Math.max(0, dynselbstbestimmt).toFixed(2),
    }));
  };
  useEffect(() => {
    updateZusammenfassungDyn();
  }, [verbraucherDaten, erweiterteEinstellungen, selectedDate, strompreis, selectedRegion, chartConvertedValues]);

  // Variablen für Wärmepumpen-Berechnungen
  const waermepumpeResults = {
    waermepumpeDyn: zusammenfassung.waermepumpeDyn,
    quarterlyCosts: zusammenfassung.quarterlyCosts,
    waermepumpeFix: zusammenfassung.waermepumpe,
    waermepumpeAlternative: zusammenfassung.waermepumpeAlternative,
  };

  const validDates = availableDates.map(dateStr => {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  });

  // Filter data for the selected date
  const filteredData = selectedDate
    ? data.filter(record => record['Delivery day'] === selectedDate)
    : [];
  console.log('Filtered data:', filteredData); // Debug log

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
        <style>{`* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #ffffff;
}

html {
  font-size: 16px;
}

body {
  font-family: 'Inter', Arial, sans-serif;
  background: #1D3050;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.region-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
  padding: 8px;
}

.region-switch-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.region-label {
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 6px;
  transition: color 0.2s ease;
}

.discount-switch-container {
  display: inline-block;
  position: relative;
  width: 48px;
  height: 30px;
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
  background-color: #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
}

.discount-switch-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 0px;
  bottom: 1.7px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.discount-switch-input:checked + .discount-switch-slider {
  background-color: #905fa4;
}

.discount-switch-input:checked + .discount-switch-slider:before {
  transform: translateX(26px);
}

.discount-switch-input:focus + .discount-switch-slider {
  box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.2);
}

.discount-switch-slider:hover {
  background-color: #9ca3af;
}

.discount-switch-input:checked + .discount-switch-slider:hover {
  background-color: #7a4d8b;
}

.region-switch-wrapper:hover .region-label {
  color: #ffffff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.relative {
  position: relative;
}

.modal-content input.pr-10 {
  padding-right: 2.5rem;
}

.modal-content .absolute.top-2.right-2 {
  z-index: 10;
}

.app-container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 20px;
  min-height: calc(100vh - 64px);
}

@media (min-width: 1100px) {
  .app-container {
    grid-template-columns: minmax(0, 550px) minmax(0, 550px);
  }
}

.calculation-report {
  background: transparent;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(144, 95, 164, 0.1), 0 0 40px rgba(67, 114, 183, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(144, 95, 164, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  scrollbar-width: thin;
  scrollbar-color: #905fa4 #e5e7eb;
}

.calculation-report::-webkit-scrollbar {
  width: 8px;
}

.calculation-report::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.5);
  border-radius: 4px;
}

.calculation-report::-webkit-scrollbar-thumb {
  background: #905fa4;
  border-radius: 4px;
}

.calculation-report:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 30px rgba(144, 95, 164, 0.2), 0 0 60px rgba(67, 114, 183, 0.1);
  border-color: rgba(144, 95, 164, 0.4);
}

.diagrams-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  scrollbar-width: thin;
  scrollbar-color: #905fa4 #e5e7eb;
  background: transparent;
}

.diagrams-container::-webkit-scrollbar {
  width: 8px;
}

.diagrams-container::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.5);
  border-radius: 4px;
}

.diagrams-container::-webkit-scrollbar-thumb {
  background: #905fa4;
  border-radius: 4px;
}

.diagram {
  background: transparent;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(144, 95, 164, 0.1), 0 0 30px rgba(67, 114, 183, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(144, 95, 164, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.diagram:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 25px rgba(144, 95, 164, 0.2), 0 0 50px rgba(67, 114, 183, 0.1);
  border-color: rgba(144, 95, 164, 0.3);
}

.menu {
  background: transparent;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  max-width: 550px;
  width: 100%;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(144, 95, 164, 0.1);
}

.menu:hover {
  transform: translateY(-2px);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: linear-gradient(90deg, #7a4d8b, #905fa4, #4372b7);
  border-radius: 12px;
  color: #ffffff;
  transition: background 0.3s ease;
}

.menu-header:hover {
  background: linear-gradient(90deg, #6a437b, #7a4d8b, #355f9a);
}

.menu-header span {
  font-size: 0.875rem;
  font-weight: 700;
}

.triangle {
  transition: transform 0.3s ease;
}

.triangle.open {
  transform: rotate(180deg);
}

.menu-content {
  padding: 12px;
  background: transparent;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.menu-content input,
.menu-content select {
  border: 2px solid #ffffff;
  border-radius: 6px;
  padding: 8px;
  font-size: 0.875rem;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: transparent;
  backdrop-filter: blur(5px);
  color: #ffffff;
}

.menu-content input:focus,
.menu-content select:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.3);
}

.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ffffff;
}

@media (min-width: 1100px) {
  .report-title {
    font-size: 1.75rem;
  }
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-container-html {
  display: flex;
  flex-direction: column;
}

.input-container-html label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.input-container-html input,
.input-container-html select {
  padding: 8px;
  border: 2px solid #ffffff;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: transparent;
  backdrop-filter: blur(5px);
}

.input-container-html input:focus,
.input-container-html select:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.3);
}

.loading,
.no-data {
  font-size: 0.875rem;
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-group-header {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr 1fr;
  gap: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 6px 0;
  background: transparent;
  border-radius: 4px;
  backdrop-filter: blur(5px);
}

.checkbox-group-header > *:nth-child(4) {
  padding-left: 40px;
}

.checkbox-group-header > *:nth-child(3) {
  padding-left: 30px;
}

.checkbox-group li {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  background: transparent;
  border-radius: 4px;
  transition: background 0.2s ease;
  position: relative;
  font-size: 0.85rem;
  backdrop-filter: blur(5px);
}

.checkbox-group li:hover {
  background: transparent;
}

.checkbox-group-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.checkbox-group-label input {
  width: 16px;
  height: 16px;
  accent-color: #905fa4;
  cursor: pointer;
}

.info-field {
  position: relative;
  display: flex;
  align-items: center;
}

.info-field .tooltip {
  visibility: hidden;
  position: absolute;
  background: #905fa4;
  font-size: 0.75rem;
  padding: 4px 6px;
  border-radius: 3px;
  z-index: 10;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0s linear 0.2s;
}

.info-field:hover .tooltip {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.input-group input.watt-input {
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.875rem;
  width: 100%;
  transition: border-color 0.2s ease;
  background: transparent;
  backdrop-filter: blur(5px);
}

.input-group input.watt-input:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 2px rgba(144, 95, 164, 0.2);
}

.price-display {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
}

.settings-field {
  background: linear-gradient(90deg, #905fa4, #4372b7);
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.settings-field:hover {
  background: linear-gradient(90deg, #7a4d8b, #355f9a);
  transform: scale(1.05);
}

.delete-option-button {
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.2s ease;
}

.delete-option-button:hover {
  color: #ffffff;
}

.confirm-dialog {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 20;
}

.confirm-button {
  background: linear-gradient(90deg, #dc2626, #ef4444);
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.confirm-button:hover {
  background: linear-gradient(90deg, #b91c1c, #dc2626);
  transform: scale(1.05);
}

.cancel-button {
  background: linear-gradient(90deg, #9ca3af, #d1d5db);
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.cancel-button:hover {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
  transform: scale(1.05);
}

.settings-container {
  grid-column: 1 / -1;
  background: transparent;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(144, 95, 164, 0.1);
}

.settings-container:hover {
  transform: translateY(-2px);
}

.settings-container h4 {
  font-size: 1.25rem;
  font-weight: 700;
}

.settings-container h5 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.settings-container .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .settings-container .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .settings-container .zeitraum-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.settings-container label {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  font-weight: 600;
}

.settings-container select {
  padding: 8px;
  border: 2px solid #ffffff;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: transparent;
  backdrop-filter: blur(5px);
}

.settings-container select:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.3);
}

.radio-group-settings {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.radio-group-settings label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-group-settings input {
  width: 16px;
  height: 16px;
  accent-color: #905fa4;
  cursor: pointer;
}

.zeitraum-section {
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  padding-top: 10px;
  margin-top: 10px;
}

.add-option-button {
  background: linear-gradient(90deg, #905fa4, #4372b7);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 16px;
  transition: transform 0.2s ease, background 0.3s ease;
}

.add-option-button:hover {
  background: linear-gradient(90deg, #7a4d8b, #355f9a);
  transform: scale(1.05);
}

.new-option-container {
  margin-top: 16px;
  padding: 16px;
  background: transparent;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(144, 95, 164, 0.1);
}

@media (min-width: 640px) {
  .new-option-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

.new-option-input,
.new-option-watt {
  padding: 8px;
  border: 2px solid #ffffff;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: transparent;
  backdrop-filter: blur(5px);
}

.new-option-input:focus,
.new-option-watt:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 3px rgba(144, 95, 164, 0.3);
}

.save-option-button {
  background: linear-gradient(90deg, #905fa4, #4372b7);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s ease;
}

.save-option-button:hover {
  background: linear-gradient(90deg, #7a4d8b, #355f9a);
  transform: scale(1.05);
}

.summary-container {
  margin-top: 24px;
  margin-bottom: 40px;
  background: transparent;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid #ffffff;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
}

@media (min-width: 1100px) {
  .summary-title {
    font-size: 1.5rem;
  }
}

.summary-item {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 6px;
}

.chart-container {
  height: 300px;
}

table {
  border-collapse: collapse;
}

table, th, td {
  border: none;
}

.option-icon {
  font-size: 1.2rem;
  vertical-align: middle;
  margin-right: 8px;
}

.checkbox-group-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kw-input-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.kw-input {
  width: 50px;
  padding: 4px 2px 4px 4px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  background: transparent;
  backdrop-filter: blur(5px);
}

.kw-input:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 2px rgba(144, 95, 164, 0.2);
}

.kw-label {
  font-size: 12px;
  white-space: nowrap;
}

.dynamic-consumer-layout {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.dynamic-consumer-layout input[type="range"] {
  width: 100%;
  accent-color: #905fa4;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .dynamic-consumer-layout {
    gap: 4px;
    margin-top: 6px;
  }

  .dynamic-consumer-layout input[type="range"] {
    width: 100%;
    accent-color: #905fa4;
    margin-top: 4px;
  }
}

.new-option-kw {
  width: 50px;
  padding: 4px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
  text-align: right;
  background: transparent;
  backdrop-filter: blur(5px);
}

.new-option-kw:focus {
  outline: none;
  border-color: #905fa4;
  box-shadow: 0 0 0 2px rgba(144, 95, 164, 0.2);
}


.bottom-nav {
  display: none;
}
@media (max-width: 767px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #1D3050;
    border-top: 1px solid #D1D5DB;
    justify-content: space-around;
    align-items: center;
    padding: 8px 0;
    z-index: 1000;
  }
  .bottom-nav a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-radius: 12px;
    color: #FFFFFF;
    text-decoration: none;
    transition: background 0.2s;
    flex: 1;
    text-align: center;
    background-color: #1D3050;
  }
  .bottom-nav a:hover {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .bottom-nav a.active {
    background: linear-gradient(90deg, #4372b7, #905fa4);
  }
  .bottom-nav a.active .fa-house {
    color: #FFFFFF !important;
  }
  .bottom-nav a p {
    text-align: center;
    font-size: 10px;
    font-weight: 500;
    margin: 0;
    color: #FFFFFF;
  }
  .bottom-nav a svg {
    font-size: 18px;
    color: #FFFFFF;
  }
}
`}</style>


<div className="layout relative bg-transparent" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
  <div className="app-container">
  <h2 className="report-title">Detail-Rechner</h2>
  <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>

    <div className="calculation-report">
    
      <div className="report-content">
        <div className="input-container-html">
          <label htmlFor="strompreis">Strompreis (Ct/kWh):</label>
          <input
            type="number"
            id="strompreis"
            value={strompreis}
            onChange={(e) => handleStrompreisChange(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>
        <div className="input-container-html">
          <label>Region:</label>
          <div className="region-buttons">
            <div className="region-switch-wrapper">
              <label className="region-label">AM</label>
              <div className="discount-switch-container">
                <input
                  type="checkbox"
                  id="region-kf"
                  className="discount-switch-input"
                  checked={selectedRegion === 'AM'}
                  onChange={() => handleRegionChange('AM')}
                  aria-label="Region Kraftwerk auswählen"
                />
                <label className="discount-switch-slider" htmlFor="region-kf"></label>
              </div>
            </div>
            <div className="region-switch-wrapper">
              <label className="region-label">SuRo</label>
              <div className="discount-switch-container">
                <input
                  type="checkbox"
                  id="region-mn"
                  className="discount-switch-input"
                  checked={selectedRegion === 'SuRo'}
                  onChange={() => handleRegionChange('SuRo')}
                  aria-label="Region Mittlerer Netzpreis auswählen"
                />
                <label className="discount-switch-slider" htmlFor="region-mn"></label>
              </div>
            </div>
            <div className="region-switch-wrapper">
              <label className="region-label">Regio</label>
              <div className="discount-switch-container">
                <input
                  type="checkbox"
                  id="region-mod"
                  className="discount-switch-input"
                  checked={selectedRegion === 'Regio'}
                  onChange={() => handleRegionChange('Regio')}
                  aria-label="Region Modellregion auswählen"
                />
                <label className="discount-switch-slider" htmlFor="region-mod"></label>
              </div>
            </div>
          </div>
        </div>
        <div className="input-container-html">
          <label>Energiepreis (Ct/kWh):</label>
          <span>{getPreisDifferenz(strompreis, selectedRegion)}</span>
        </div>
        <div className="input-container-html">
          <label className="date-picker-label" htmlFor="date-picker">Datum für dynamischen Preis:</label>
          <DatePicker
            id="date-picker"
            selected={selectedDate ? new Date(toInputDate(selectedDate)) : null}
            onChange={(date) => setSelectedDate(date ? fromInputDate(date.toISOString().split('T')[0]) : '')}
            includeDates={validDates}
            dateFormat="yyyy-MM-dd"
            className="mt-1 block w-full max-w-xs p-2 border border-black rounded-md shadow-sm focus:ring-red-500 focus:border-black sm:text-sm text-black"
            placeholderText="Datum auswählen"
            disabled={availableDates.length === 0}
          />
        </div>
        {apiLoading && <div className="loading">Lade dynamische Strompreise...</div>}
        {!apiLoading && availableDates.length === 0 && (
          <div className="no-data">Keine Daten für dynamische Strompreise verfügbar.</div>
        )}
        {error && <div className="no-data">{error}</div>}

        {menus.map((menu) => (
          <div key={menu.id} className="menu">
            <div className="menu-header" onClick={() => toggleMenu(menu.id)}>
              <span>{menu.label}</span>
              <span className={`triangle ${openMenus[menu.id] ? 'open' : 'closed'}`}>▼</span>
            </div>

            {openMenus[menu.id] && (
              <div className="menu-content">
                <ul className="checkbox-group">
                  <li className="checkbox-group-header">
                    <span>{menu.id === 'stromerzeuger' ? 'Erzeuger' : 'Verbraucher'}</span>
                    <span>Info</span>
                    {menu.id !== 'waermepumpe' && <span>Watt/h</span>}
                    {menu.id === 'waermepumpe' && <span>kW</span>}
                    <span>Normaltarif/Jahr</span>
                    {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto' || menu.id === 'waermepumpe') && <span></span>}
                  </li>

                  {menu.options.map((option) => (
                    <li key={option.name}>
                      <label className="checkbox-group-label">
                        <input
                          type="checkbox"
                          checked={verbraucherDaten[option.name]?.checked || false}
                          onChange={(e) => onCheckboxChange(option.name, e.target.checked)}
                        />
                        {iconMapping[option.name] === 'AcUnit' && <AcUnitIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'Air' && <AirIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'LocalLaundryService' && <LocalLaundryServiceIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'Kitchen' && <KitchenIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'Tv' && <TvIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'Lightbulb' && <LightbulbIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'ElectricCar' && <ElectricCarIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {iconMapping[option.name] === 'HeatPump' && <HeatPumpIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        {!iconMapping[option.name] && <DescriptionIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                        <span>{option.name}</span>
                      </label>
                      <div className="info-field">
                        <span className="tooltip">{verbraucherBeschreibungen[option.name] || option.specifications}</span>
                        <span>ℹ️</span>
                      </div>
                      {menu.id !== 'waermepumpe' && (
                        <div className="input-group">
                          <input
                            type="number"
                            className="watt-input"
                            value={verbraucherDaten[option.name]?.watt || ''}
                            onChange={(e) => handleWattChange(option.name, e.target.value)}
                            min="0"
                            placeholder="Watt"
                          />
                        </div>
                      )}
                      {menu.id === 'waermepumpe' && (
                        <div className="input-group kw-input-container">
                          <input
                            type="number"
                            className="kw-input"
                            value={(verbraucherDaten[option.name]?.watt / 1000) || ''}
                            onChange={(e) => handleKWChange(option.name, e.target.value)}
                            min="0"
                            step="0.1"
                            placeholder=""
                          />
                          <span className="kw-label">kW</span>
                        </div>
                      )}
                      <div className="price-display">
                        {verbraucherDaten[option.name]?.kosten || '0.00'} €
                      </div>
                      {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto' || menu.id === 'waermepumpe') && (
                        <button
                          className="settings-field"
                          onClick={() => toggleErweiterteOptionen(menu.id, option.name)}
                        >
                          Einstellungen
                        </button>
                      )}
                      <button
                        className="delete-option-button"
                        onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                      >
                        Löschen
                      </button>

                      {deleteConfirmOption?.menuId === menu.id &&
                        deleteConfirmOption?.optionName === option.name && (
                        <div className="col-span-4 sm:col-span-6 bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
                          <span className="text-sm sm:text-base text-red-800 font-medium">
                            Möchten Sie <strong>"{option.name}"</strong> wirklich löschen?
                          </span>
                          <div className="flex gap-2 sm:ml-auto">
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors duration-150"
                              onClick={() => confirmDeleteOption(menu.id, option.name)}
                            >
                              Ja, löschen
                            </button>
                            <button
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1.5 rounded-md transition-colors duration-150"
                              onClick={cancelDeleteOption}
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      )}

                      {showErweiterteOptionen[menu.id]?.[option.name] && (
                        <div className="settings-container">
                          {menu.id === 'eauto' ? (
                            <div>
                              <h4>E-Auto Einstellungen</h4>
                              <div className="grid">
                                <label>
                                  Batteriekapazität (kWh):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.batterieKapazitaet || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'batterieKapazitaet', e.target.value, null)}
                                    min="0"
                                    step="0.1"
                                    placeholder="z.B. 50"
                                  />
                                </label>
                                <label>
                                  Wallbox-Leistung (W):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.wallboxLeistung || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'wallboxLeistung', e.target.value, null)}
                                    min="0"
                                    step="100"
                                    placeholder="z.B. 11000"
                                  />
                                </label>
                                <label>
                                  Ladehäufigkeit (pro Woche):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                    min="0"
                                    max="20"
                                    step="1"
                                    placeholder="z.B. 2"
                                  />
                                </label>
                                <label>
                                  Standardladung:
                                  <div className="radio-group-settings">
                                    <label>
                                      <input
                                        type="radio"
                                        name={`standardLadung-${option.name}`}
                                        value={true}
                                        checked={erweiterteEinstellungen[option.name]?.standardLadung === true}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                      />
                                      Ja
                                    </label>
                                    <label>
                                      <input
                                        type="radio"
                                        name={`standardLadung-${option.name}`}
                                        value={false}
                                        checked={erweiterteEinstellungen[option.name]?.standardLadung === false}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                      />
                                      Nein
                                    </label>
                                  </div>
                                </label>
                              </div>
                              {!erweiterteEinstellungen[option.name]?.standardLadung && (
                                <div className="zeitraum-section">
                                  <h5>Zeiträume</h5>
                                  {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum, index) => (
                                    <div key={zeitraum.id} className="zeitraum-grid">
                                      <div className="dynamic-consumer-layout flex flex-col gap-0.5">
                                        <div className="flex flex-col items-center justify-center w-full">
                                          <span className="text-[11px] font-semibold text-gray-700 text-center">
                                            Zeitraum
                                          </span>
                                          <span className="text-[11px] text-gray-700 text-center">
                                            {timePeriods.find(
                                              (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                            )
                                              ? `${timePeriods.find(
                                                  (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                                ).label} (${zeitraum.startzeit}-${zeitraum.endzeit})`
                                              : "–"}
                                          </span>
                                          <input
                                            type="range"
                                            min="0"
                                            max={timePeriods.length - 1}
                                            value={timePeriods.findIndex(
                                              (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                            )}
                                            onChange={(e) =>
                                              handleTimePeriodChange(option.name, timePeriods[e.target.value].label, zeitraum.id)
                                            }
                                            className="w-full accent-[#063d37] mt-1"
                                          />
                                        </div>
                                      </div>
                                      <label>
                                        Dauer (h):
                                        <input
                                          type="number"
                                          className="settings-input"
                                          value={zeitraum.dauer || ''}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                          min="0"
                                          max="23"
                                          step="1"
                                          placeholder="z.B. 2"
                                        />
                                      </label>
                                      {index > 0 && (
                                        <div>
                                          <button
                                            className="delete-option-button"
                                            onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                          >
                                            Zeitraum löschen
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    className="add-option-button"
                                    onClick={() => addZeitraum(option.name)}
                                  >
                                    Zeitraum hinzufügen
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : menu.id === 'waermepumpe' ? (
                            <div>
                              <h4>Wärmepumpe Einstellungen</h4>
                              <div className="grid">
                                <label>
                                  JAZ (Jahresarbeitszahl):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.jaz || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'jaz', e.target.value, null)}
                                    min="0"
                                    step="0.1"
                                    placeholder="z.B. 3.4"
                                  />
                                </label>
                                <label>
                                  Heizstunden (pro Jahr):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.heizstunden || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'heizstunden', e.target.value, null)}
                                    min="0"
                                    step="1"
                                    placeholder="z.B. 2000"
                                  />
                                </label>
                              </div>
                              <div className="zeitraum-section">
                                <h5>Zeiträume</h5>
                                {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum, index) => (
                                  <div key={zeitraum.id} className="zeitraum-grid">
                                    <div className="dynamic-consumer-layout flex flex-col gap-0.5">
                                      <div className="flex flex-col items-center justify-center w-full">
                                        <span className="text-[11px] font-semibold text-gray-700 text-center">
                                          Zeitraum
                                        </span>
                                        <span className="text-[11px] text-gray-700 text-center">
                                          {timePeriods.find(
                                            (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                          )
                                            ? `${timePeriods.find(
                                                (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                              ).label} (${zeitraum.startzeit}-${zeitraum.endzeit})`
                                            : "–"}
                                        </span>
                                        <input
                                          type="range"
                                          min="0"
                                          max={timePeriods.length - 1}
                                          value={timePeriods.findIndex(
                                            (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                          )}
                                          onChange={(e) =>
                                            handleTimePeriodChange(option.name, timePeriods[e.target.value].label, zeitraum.id)
                                          }
                                          className="w-full accent-[#063d37] mt-1"
                                        />
                                      </div>
                                    </div>
                                    <label>
                                      Dauer (h):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={zeitraum.dauer || ''}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                        min="0"
                                        max="23"
                                        step="1"
                                        placeholder="z.B. 2"
                                      />
                                    </label>
                                    {index > 0 && (
                                      <div>
                                        <button
                                          className="delete-option-button"
                                          onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                        >
                                          Zeitraum löschen
                                        </button>
                                      </div>
                                    )}
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
                          ) : (
                            <div>
                              <h4>Verbraucher Einstellungen</h4>
                              <div className="grid">
                                <label>
                                  Nutzung (pro Woche):
                                  <input
                                    type="number"
                                    className="settings-input"
                                    value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                    min="0"
                                    max="20"
                                    step="1"
                                    placeholder="z.B. 2"
                                  />
                                </label>
                              </div>
                              <div className="zeitraum-section">
                                <h5>Zeiträume</h5>
                                {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum, index) => (
                                  <div key={zeitraum.id} className="zeitraum-grid">
                                    <div className="dynamic-consumer-layout flex flex-col gap-0.5">
                                      <div className="flex flex-col items-center justify-center w-full">
                                        <span className="text-[11px] font-semibold text-gray-700 text-center">
                                          Zeitraum
                                        </span>
                                        <span className="text-[11px] text-gray-700 text-center">
                                          {timePeriods.find(
                                            (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                          )
                                            ? `${timePeriods.find(
                                                (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                              ).label} (${zeitraum.startzeit}-${zeitraum.endzeit})`
                                            : "–"}
                                        </span>
                                        <input
                                          type="range"
                                          min="0"
                                          max={timePeriods.length - 1}
                                          value={timePeriods.findIndex(
                                            (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                          )}
                                          onChange={(e) =>
                                            handleTimePeriodChange(option.name, timePeriods[e.target.value].label, zeitraum.id)
                                          }
                                          className="w-full accent-[#063d37] mt-1"
                                        />
                                      </div>
                                    </div>
                                    <label>
                                      Dauer (h):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={zeitraum.dauer || ''}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                        min="0"
                                        max="23"
                                        step="1"
                                        placeholder="z.B. 2"
                                      />
                                    </label>
                                    {index > 0 && (
                                      <div>
                                        <button
                                          className="delete-option-button"
                                          onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                        >
                                          Zeitraum löschen
                                        </button>
                                      </div>
                                    )}
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
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  className="add-option-button"
                  onClick={() => toggleNewOptionForm(menu.id)}
                >
                  Neue Option hinzufügen
                </button>
                {showNewOptionForm[menu.id] && (
                  <div className="new-option-container">
                    <input
                      type="text"
                      className="new-option-input"
                      placeholder="Name der neuen Option"
                      value={newOptionNames[menu.id] || ''}
                      onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                    />
                    {menu.id !== 'waermepumpe' && (
                      <input
                        type="number"
                        className="new-option-watt"
                        placeholder="Wattleistung"
                        value={newOptionWatt[menu.id] || ''}
                        onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                        min="0"
                      />
                    )}
                    {menu.id === 'waermepumpe' && (
                      <div className="kw-input-container">
                        <input
                          type="number"
                          className="new-option-kw"
                          placeholder=""
                          value={newOptionKW[menu.id] || ''}
                          onChange={(e) => handleNewOptionKW(menu.id, e.target.value)}
                          min="0"
                          step="0.1"
                        />
                        <span className="kw-label">kW</span>
                      </div>
                    )}
                    {menu.id === 'dynamischeverbraucher' && (
                      <select
                        value={newOptionTypes[menu.id] || 'week'}
                        onChange={(e) => handleNewOptionType(menu.id, e.target.value)}
                      >
                        <option value="week">Wöchentlich (z.B. Waschmaschine)</option>
                      </select>
                    )}
                    <button
                      className="save-option-button"
                      onClick={() => addNewOption(menu.id)}
                    >
                      Speichern
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="summary-container">
          <h3 className="summary-title">Zusammenfassung pro Jahr (Energie)</h3>
          <div className="summary-item">Kosten Grundlast (fixer Tarif): {zusammenfassung.grundlast} €</div>
          <div className="summary-item">Kosten Schaltbare Verbraucher (fixer Tarif): {zusammenfassung.dynamisch} €</div>
          <div className="summary-item">Kosten Wärmepumpe (fixer Tarif): {zusammenfassung.waermepumpe} €</div>
          <div className="summary-item">Kosten Gesamt (fixer Tarif): {zusammenfassung.gesamt} €</div>
          <div className="summary-item">Gesamtwattage: {zusammenfassung.totalWattage} W</div>
          <div className="summary-item">Kosten Grundlast (dynamischer Tarif): {zusammenfassung.grundlastDyn} €</div>
          <div className="summary-item">Kosten Schaltbare Verbraucher (dynamischer Tarif): {zusammenfassung.dynamischDyn} €</div>
          <div className="summary-item">Kosten Gesamt (dynamischer Tarif): {zusammenfassung.gesamtDyn} €</div>
          <div className="summary-item">Ersparnis (fixer vs. dynamischer Tarif): {(parseFloat(zusammenfassung.gesamt) - parseFloat(zusammenfassung.gesamtDyn)).toFixed(2)} €</div>
          <h3 className="summary-title">Wärmepumpe</h3>
          <div className="summary-item"> Wärmepumpe Jahreskosten (fixer Tarif): {zusammenfassung.waermepumpe} €</div>
          <div className="summary-item"> Wärmepumpe Jahreskosten (dynamischer Tarif): {zusammenfassung.waermepumpeDyn} €</div>
          <div className="summary-item"> Wärmepumpe Tageskosten (dynamischer Tarif): {zusammenfassung.dynselbstbestimmt} €</div>
          <button className="download-button bg-[#4372b7] text-white py-2 px-4 rounded hover:bg-blue-700" onClick={handleDownloadClick}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
    
    {showModal && (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="modal-content relative bg-white rounded-lg p-6 w-full max-w-md">
          <button
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-3xl font-extrabold"
            onClick={closeModal}
          >
            ✕
          </button>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Download mit E-Mail-Verifizierung
          </h1>
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Deine E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={agb}
                    onChange={(e) => setAgb(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-red-500">
                    AGB akzeptieren <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
              <div className="text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={werbung}
                    onChange={(e) => setWerbung(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-green-500">
                    Einwilligung zur Verwendung für Werbung (optional)
                  </span>
                </label>
              </div>
              <button
                onClick={requestCode}
                disabled={cooldown > 0}
                className={`w-full py-3 rounded-md transition-colors ${
                  cooldown > 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {cooldown > 0 ? `Erneut anfordern in ${cooldown}s` : 'Code anfordern'}
              </button>
            </div>
          )}
          {step === 2 && !verified && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Code wurde an <span className="font-semibold">{email}</span> gesendet. Bitte gib ihn ein:
              </p>
              <input
                type="text"
                placeholder="6-stelliger Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <button
                onClick={verifyCode}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Code prüfen
              </button>
              {cooldown > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Du kannst den Code in {cooldown} Sekunden erneut anfordern.
                </p>
              )}
            </div>
          )}
          {verified && (
            <div className="space-y-4 text-center">
              <p className="text-green-500 text-lg font-semibold">
                Verifiziert!
              </p>
              <button
                onClick={() => {
                  handleDownloadPDF();
                  closeModal();
                }}
                className="w-full bg-[#063d37] text-white py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                Hier klicken für Download
              </button>
            </div>
          )}
          {message && (
            <p
              className={`mt-4 text-center ${
                message.includes('Fehler') || message.includes('Falscher') || message.includes('Bitte')
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    )}
  </div>
</div>





<nav className="bottom-nav">
        <a href="/Amberg2/mobile/startseite" >
          <FontAwesomeIcon icon={faHouse} />
          <p>Home</p>
        </a>
        <a href="/Amberg2/mobile/preise">
          <FontAwesomeIcon icon={faChartLine} />
          <p>Preis</p>
        </a>
        <a href="/Amberg2/mobile/rechner">
          <FontAwesomeIcon icon={faCalculator} />
          <p>Rechner</p>
        </a>
        <a href="/Amberg2/mobile/details"className="active">
          <FontAwesomeIcon icon={faFileLines} />
          <p>Detail</p>
        </a>
        <a href="/Amberg2/mobile/hilfe">
          <FontAwesomeIcon icon={faQuestionCircle} />
          <p>Hilfe</p>
        </a>
      </nav>
        </>
      );
    }