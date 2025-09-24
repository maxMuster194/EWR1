import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
import jsPDF from 'jspdf';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import KitchenIcon from '@mui/icons-material/Kitchen';
import TvIcon from '@mui/icons-material/Tv';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  default: 'Description',
};

// Default consumer data and descriptions
const standardVerbrauch = {
  Kühlschrank: 35,
  Gefrierschrank: 38,
  Waschmaschine: 300,
  Geschirrspüler: 600,
  Trockner: 1200,
  Herd: 900,
  Multimedia: 350,
  Licht: 300,
  'E-Auto': 11000,
  'Zweites E-Auto': 7400,
};

const verbraucherBeschreibungen = {
  Kühlschrank: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.',
  Gefrierschrank: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 700 W bei 1 Stunde täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',
  Licht: 'Beleuchtung verbraucht etwa 175 W bei 5 Stunden täglicher Nutzung (umgestellt auf Wochenbasis: ca. 7 Nutzungen pro Woche).',
  'E-Auto': 'Das E-Auto verbraucht ca. 11 kW pro Ladevorgang (z.B. 4h/Woche).',
  'Zweites E-Auto': 'Das zweite E-Auto verbraucht ca. 7.4 kW pro Ladevorgang (z.B. 3h/Woche).',
};

const timePeriods = [
  { label: 'Früh', startzeit: '06:00', endzeit: '09:00' },
  { label: 'Vormittag', startzeit: '09:00', endzeit: '12:00' },
  { label: 'Mittag', startzeit: '12:00', endzeit: '14:00' },
  { label: 'Nachmittag', startzeit: '14:00', endzeit: '16:00' },
  { label: 'Spätnachmittag', startzeit: '16:00', endzeit: '18:00' },
  { label: 'Abend', startzeit: '18:00', endzeit: '21:00' },
  { label: 'Spätabend', startzeit: '21:00', endzeit: '00:00' },
  { label: 'Nachts 1', startzeit: '00:00', endzeit: '03:00' },
  { label: 'Nachts 2', startzeit: '03:00', endzeit: '06:00' },
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
};

// Functions
const getRegionPreis = (selectedRegion) => {
  if (selectedRegion === 'KF') return 10;
  if (selectedRegion === 'MN') return 17;
  if (selectedRegion === 'MOD') return 20;
  return 0;
};

const getPreisDifferenz = (strompreis, selectedRegion) => {
  const regionPreis = getRegionPreis(selectedRegion);
  return (strompreis - regionPreis).toFixed(2);
};

const updateKosten = (watt, verbraucher, strompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen) => {
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100;
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher] || {};
  const totalDauer = einstellung.zeitraeume?.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  const nutzung = einstellung.nutzung || 0;
  const batterieKapazitaet = einstellung.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung.wallboxLeistung || watt;
  const standardLadung = einstellung.standardLadung || false;
  const type = verbraucherTypes[verbraucher] || 'grundlast';

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

  if (kosten < 0) kosten = 0;

  setVerbraucherDaten((prev) => ({
    ...prev,
    [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
  }));
};

const berechneDynamischenVerbrauch = (watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen) => {
  console.log('berechneDynamischenVerbrauch:', { watt, verbraucher, strompreis, selectedRegion });
  console.log('einstellung:', erweiterteEinstellungen[verbraucher]);
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100;
  const einstellung = erweiterteEinstellungen[verbraucher] || {};
  if (!einstellung.zeitraeume || einstellung.zeitraeume.length === 0 || watt === 0) {
    console.log('Abbruch: Keine Zeiträume oder watt = 0');
    return 0;
  }
  let totalDauer = einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  if (totalDauer === 0) {
    console.log('Abbruch: totalDauer = 0');
    return 0;
  }
  let kosten = 0;
  const batterieKapazitaet = einstellung.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung.wallboxLeistung || watt;
  const standardLadung = einstellung.standardLadung || false;
  const type = verbraucherTypes[verbraucher] || 'grundlast';

  if (type === 'week') {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
  } else if (type === 'auto') {
    if (standardLadung) {
      kosten = (batterieKapazitaet * einstellung.nutzung * 52) * preisDifferenz;
    } else {
      kosten = (wallboxLeistung * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
    }
  }

  console.log('Berechnete Kosten:', kosten);
  return kosten < 0 ? 0 : kosten;
};

const berechneDynamischeErsparnis = (verbraucher, strompreis, prices, verbraucherDaten, erweiterteEinstellungen, selectedRegion) => {
  const watt = verbraucherDaten[verbraucher]?.watt || 0;
  if (watt === 0) return 0;
  const type = verbraucherTypes[verbraucher];
  const einstellung = erweiterteEinstellungen[verbraucher] || {};

  const fixedPrice = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
  const fallbackPrice = fixedPrice;

  if (type === 'grundlast') {
    const totalKWh = (watt * 24 * 365) / 1000;
    if (totalKWh === 0) return 0;
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    for (let hour = 0; hour < 24; hour++) {
      const frac = 1.0;
      totalWeightedPrice += (prices[hour] || fallbackPrice) * frac;
      totalWeight += frac;
    }
    const averagePrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : fixedPrice;
    const dynamicCost = totalKWh * (averagePrice / 100);
    const fixedCost = totalKWh * (fixedPrice / 100);
    let ersparnis = fixedCost - dynamicCost;
    return ersparnis < 0 ? 0 : ersparnis;
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
      totalWeightedPrice += (prices[hour % 24] || fallbackPrice) * frac;
      totalWeight += frac;
      remaining -= frac;
      currentTime += frac;
      if (currentTime >= 24) currentTime -= 24;
    }
  });

  const averagePrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : fixedPrice;
  const dynamicCost = totalKWh * (averagePrice / 100);
  const fixedCost = totalKWh * (fixedPrice / 100);
  let ersparnis = fixedCost - dynamicCost;
  if (ersparnis < 0) ersparnis = 0;

  return ersparnis;
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

  Object.keys(standardVerbrauch).forEach((key) => {
    const kosten = parseFloat(verbraucherDaten[key]?.kosten) || 0;
    if (isNaN(kosten)) return;
    if (verbraucherTypes[key] === 'grundlast') {
      grundlast += kosten;
    } else {
      dynamisch += kosten;
    }
  });

  const totalWattage = calculateTotalWattage(verbraucherDaten);

  setZusammenfassung((prev) => ({
    ...prev,
    grundlast: grundlast.toFixed(2),
    dynamisch: dynamisch.toFixed(2),
    gesamt: (grundlast + dynamisch).toFixed(2),
    totalWattage,
  }));
};

const berechneStundenVerbrauch = (verbraucherDaten, erweiterteEinstellungen) => {
  const stunden = Array(24).fill(0).map(() => ({ total: 0, verbraucher: [] }));
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
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i].total += (useWatt / 1000) * dailyMultiplier;
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

// Home Component
export default function Home() {
  const [strompreis, setStrompreis] = useState(31);
  const [selectedRegion, setSelectedRegion] = useState('KF');
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => {
      let startzeit, endzeit, dauer, nutzung, batterieKapazitaet, wallboxLeistung, standardLadung;
      const type = verbraucherTypes[key];
      if (type === 'grundlast') {
        startzeit = '06:00';
        endzeit = '09:00';
        dauer = 0;
        nutzung = 0;
      } else if (type === 'week') {
        startzeit = '09:00';
        endzeit = '12:00';
        dauer = 7;
        nutzung = 2;
        if (['Herd', 'Multimedia', 'Licht'].includes(key)) {
          nutzung = 7;
        }
      } else if (type === 'auto') {
        startzeit = '21:00';
        endzeit = '00:00';
        dauer = 3;
        nutzung = 3;
        batterieKapazitaet = 60;
        wallboxLeistung = standardVerbrauch[key];
        standardLadung = false;
      }
      return {
        ...acc,
        [key]: {
          nutzung,
          zeitraeume: [{ id: Date.now() + Math.random(), startzeit, endzeit, dauer }],
          ...(type === 'auto' ? { batterieKapazitaet, wallboxLeistung, standardLadung } : {}),
        },
      };
    }, {})
  );
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState({});
  const [zusammenfassung, setZusammenfassung] = useState({
    grundlast: 0,
    dynamisch: 0,
    gesamt: 0,
    totalWattage: 0,
    grundlastDyn: 0,
    dynamischDyn: 0,
    gesamtDyn: 0,
  });
  const [error, setError] = useState('');
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: false,
    grundlastverbraucher: false,
    dynamischeverbraucher: false,
    eauto: false,
    strompeicher: false,
  });

  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [newOptionTypes, setNewOptionTypes] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const [agb, setAgb] = useState(false);
  const [werbung, setWerbung] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mongodb', {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        const germanyData = json.germany || [];
        if (!germanyData.length) {
          setApiData([]);
          setApiLoading(false);
          return;
        }

        setApiData(germanyData);
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
          setSelectedDate(currentDate);
        } else if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        setError('Fehler beim Laden der dynamischen Strompreise.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        const type = verbraucherTypes[verbraucher];
        let kosten = 0;
        if (type !== 'grundlast') {
          kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        } else {
          kosten = (watt * (parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100) * 24 * 365) / 1000;
          if (kosten < 0) kosten = 0;
        }
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  }, [strompreis, selectedRegion, erweiterteEinstellungen]);

  const handleRegionChange = (region) => {
    const newRegion = selectedRegion === region ? null : region;
    setSelectedRegion(newRegion);

    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        const type = verbraucherTypes[verbraucher];
        if (type !== 'grundlast') {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, newRegion, erweiterteEinstellungen);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher, strompreis, newRegion, setVerbraucherDaten, erweiterteEinstellungen);
        }
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const onCheckboxChange = (verbraucher, checked) => {
    console.log('onCheckboxChange:', { verbraucher, checked });
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
      console.log('updated verbraucherDaten:', updatedData);
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
        if (type !== 'grundlast') {
          kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        } else {
          kosten = (watt * (parseFloat(getPreisDifferenz(strompreis, selectedRegion)) / 100) * 24 * 365) / 1000;
          if (kosten < 0) kosten = 0;
        }
      }
      const updatedData = {
        ...prev,
        [verbraucher]: { ...prev[verbraucher], watt, kosten: kosten.toFixed(2) },
      };
      updateZusammenfassung(updatedData, setZusammenfassung);
      return updatedData;
    });
  };

  const handleErweiterteEinstellungChange = (verbraucher, field, value, zeitraumId) => {
    console.log('handleErweiterteEinstellungChange:', { verbraucher, field, value, zeitraumId });
    console.log('Aktuelle erweiterteEinstellungen:', erweiterteEinstellungen[verbraucher]);
    
    const parsedValue = field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung'
      ? parseFloat(value) || 0
      : field === 'standardLadung'
      ? value === 'true'
      : value;
  
    if ((field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung') && parsedValue < 0) {
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
          [field === 'nutzung' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'standardLadung'
            ? field
            : 'zeitraeume']: field === 'nutzung' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'standardLadung'
            ? parsedValue
            : prev[verbraucher].zeitraeume.map(zeitraum =>
                zeitraum.id === zeitraumId ? { ...zeitraum, [field]: parsedValue } : zeitraum
              ),
        },
      };
      console.log('Updated erweiterteEinstellungen:', updatedSettings[verbraucher]);
  
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
          console.log('Updated verbraucherDaten:', updatedData);
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
          endzeit: '08:00',
          dauer: prev[verbraucher].zeitraeume[0]?.dauer || 0,
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
    const newStrompreis = parseFloat(value) || 31;
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        const type = verbraucherTypes[verbraucher];
        if (type !== 'grundlast') {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher, newStrompreis, selectedRegion, erweiterteEinstellungen);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher, newStrompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen);
        }
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
    const watt = parseFloat(newOptionWatt[menuId]) || 100;
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
      let batterieKapazitaet, wallboxLeistung, standardLadung;

      if (menuId === 'grundlastverbraucher') {
        vType = 'grundlast';
        nutzung = 0;
        dauer = 0;
      } else if (menuId === 'dynamischeverbraucher') {
        vType = 'week';
        startzeit = '09:00';
        endzeit = '12:00';
        dauer = 3.0;
        nutzung = 2;
      } else if (menuId === 'eauto') {
        vType = 'auto';
        startzeit = '21:00';
        endzeit = '00:00';
        dauer = 3.0;
        nutzung = 3;
        batterieKapazitaet = 40;
        wallboxLeistung = watt;
        standardLadung = false;
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
    if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher' || menuId === 'eauto') {
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
    doc.text('Rechenbericht', 10, yPosition);
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
          doc.text(`  Watt: ${data?.watt || '0'} W`, 20, yPosition);
          yPosition += subSectionSpacing;
          addNewPageIfNeeded();
          doc.text(`  Ersparnis: ${data?.kosten || '0.00'} €`, 20, yPosition);
          yPosition += subSectionSpacing;

          const ext = erweiterteEinstellungen[option.name];
          if (ext && (menu.id === 'dynamischeverbraucher' || menu.id === 'eauto')) {
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
    doc.text(`Grundlast Kosten: ${zusammenfassung.grundlast} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Dynamische Kosten: ${zusammenfassung.dynamisch} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Gesamtkosten: ${zusammenfassung.gesamt} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Gesamtwattage: ${zusammenfassung.totalWattage} W`, 15, yPosition);
    yPosition += sectionSpacing;

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
  const selectedIndex = apiData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });
  const labelsAll = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const rawValuesAll = selectedIndex !== -1 ? apiData[selectedIndex]?.__parsed_extra?.slice(0, 24) : [];
  const chartDataApi = labelsAll
    .map((label, i) => ({ label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartConvertedValues = chartDataApi.map((entry) =>
    typeof entry.value === 'number' ? entry.value / 10 : parseFloat(entry.value) / 10 || strompreis
  );

  const updateZusammenfassungDyn = () => {
    if (!selectedDate) {
      setZusammenfassung((prev) => ({
        ...prev,
        grundlastDyn: '0.00',
        dynamischDyn: '0.00',
        gesamtDyn: '0.00',
      }));
      return;
    }
    let grundlastDyn = 0;
    let dynamischDyn = 0;
    const prices = chartConvertedValues;
    Object.keys(standardVerbrauch).forEach((key) => {
      if (verbraucherDaten[key]?.watt > 0 || verbraucherDaten[key]?.checked) {
        const costDyn = berechneDynamischeErsparnis(key, strompreis, prices, verbraucherDaten, erweiterteEinstellungen, selectedRegion);
        if (verbraucherTypes[key] === 'grundlast') {
          grundlastDyn += costDyn;
        } else {
          dynamischDyn += costDyn;
        }
      }
    });
    setZusammenfassung((prev) => ({
      ...prev,
      grundlastDyn: grundlastDyn.toFixed(2),
      dynamischDyn: dynamischDyn.toFixed(2),
      gesamtDyn: (grundlastDyn + dynamischDyn).toFixed(2),
    }));
  };

  useEffect(() => {
    updateZusammenfassungDyn();
  }, [verbraucherDaten, erweiterteEinstellungen, selectedDate, apiData, strompreis, selectedRegion]);

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Stromverbrauch (kW)',
        data: hourlyData.map(d => d.total),
        fill: false,
        borderColor: '#063d37',
        backgroundColor: '#063d37',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: `Dynamischer Preis am ${selectedDate || 'N/A'} (Ct/kWh)`,
        data: chartConvertedValues,
        fill: false,
        borderColor: '#88bf50',
        backgroundColor: '#88bf50',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { display: true, text: 'Stündlicher Stromverbrauch und Preis', color: '#333', font: { size: 11.2 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            if (context.dataset.label.includes('Dynamischer Preis')) {
              return `Preis: ${context.raw.toFixed(2)} Ct/kWh`;
            }
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `Verbrauch: ${context.raw.toFixed(2)} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Verbrauch (kW)', color: '#333' },
        ticks: { color: '#333' },
        position: 'left',
      },
      y1: {
        beginAtZero: true,
        title: { display: true, text: 'Preis (Ct/kWh)', color: '#333' },
        ticks: { color: '#333' },
        position: 'right',
        grid: { drawOnChartArea: false },
      },
      x: { title: { display: true, text: 'Uhrzeit', color: '#333' }, ticks: { color: '#333' } },
    },
  };

  const chartDataKosten = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: `Kosten (Dynamischer Tarif) am ${selectedDate || 'N/A'} (Ct)`,
        data: hourlyData.map((_, index) => {
          const price = chartConvertedValues[index] != null ? chartConvertedValues[index] : parseFloat(getPreisDifferenz(strompreis, selectedRegion));
          return (hourlyData[index].total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#88bf50',
        backgroundColor: '#88bf50',
        tension: 0.1,
      },
      {
        label: `Kosten (Fester Tarif) am ${selectedDate || 'N/A'} (Ct)`,
        data: hourlyData.map((_, index) => {
          const price = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
          return (hourlyData[index].total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#063d37',
        backgroundColor: '#063d37',
        tension: 0.1,
      },
    ],
  };

  const chartOptionsKosten = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: {
        display: true,
        text: `Stündliche Stromersparnis (${selectedDate || 'Fallback-Preis'})`,
        color: '#333',
        font: { size: 11.2 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const datasetLabel = context.dataset.label;
            const isDynamic = datasetLabel.includes('Dynamischer Tarif');
            const price = isDynamic ? (chartConvertedValues[index] != null ? chartConvertedValues[index] : parseFloat(getPreisDifferenz(strompreis, selectedRegion))) : parseFloat(getPreisDifferenz(strompreis, selectedRegion));
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `${datasetLabel.split(' am')[0]}: ${context.raw} Ct\nPreis: ${price.toFixed(2)} Ct/kWh\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true, 
        title: { display: true, text: 'Ersparnis (Ct)', color: '#333' },
        ticks: { color: '#333' },
      },
      x: {
        title: { display: true, text: 'Uhrzeit', color: '#333' },
        ticks: { color: '#333' },
      },
    },
  };



return (
  <>
    <style>{`.region-buttons {
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
  color: #1a1a1a;
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
  left: 0px; /* Kugel weiter nach links verschoben */
  bottom: 1.7px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.discount-switch-input:checked + .discount-switch-slider {
  background-color: #063d37; /* Updated color */
}

.discount-switch-input:checked + .discount-switch-slider:before {
  transform: translateX(26px); /* Angepasst für kleinere Kugel */
}

.discount-switch-input:focus + .discount-switch-slider {
  box-shadow: 0 0 0 3px rgba(6, 61, 55, 0.2); /* Updated focus color */
}

.discount-switch-slider:hover {
  background-color: #9ca3af;
}

.discount-switch-input:checked + .discount-switch-slider:hover {
  background-color: #052f2b; /* Darker shade of new color for hover */
}

.region-switch-wrapper:hover .region-label {
  color: #063d37; /* Updated color */
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
  padding-right: 2.5rem; /* Platz für den X-Button */
}

.modal-content .absolute.top-2.right-2 {
  z-index: 10; /* Stellt sicher, dass das X über dem Eingabefeld liegt */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px; /* Base font size for consistency */
}

body {
  font-family: 'Inter', Arial, sans-serif;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  color: #1f2937;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr; /* Single column by default */
  gap: 24px; /* Reduzierter Gap für besseres Layout */
  padding: 20px;
  min-height: calc(100vh - 64px);
}

@media (min-width: 1024px) {
  .app-container {
    grid-template-columns: minmax(0, 600px) minmax(0, 600px);
  }
}

.calculation-report {
  background: #ffffff;
  padding: 24px; /* Reduzierter Padding */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  scrollbar-width: thin;
  scrollbar-color: #063d37 #e5e7eb; /* Updated color */
}

.calculation-report::-webkit-scrollbar {
  width: 8px;
}

.calculation-report::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

.calculation-report::-webkit-scrollbar-thumb {
  background: #063d37; /* Updated color */
  border-radius: 4px;
}

.calculation-report:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.diagrams-container {
  display: flex;
  flex-direction: column;
  gap: 24px; /* Reduzierter Gap */
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  scrollbar-width: thin;
  scrollbar-color: #063d37 #e5e7eb; /* Updated color */
}

.diagrams-container::-webkit-scrollbar {
  width: 8px;
}

.diagrams-container::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

.diagrams-container::-webkit-scrollbar-thumb {
  background: #063d37; /* Updated color */
  border-radius: 4px;
}

.menu {
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  max-width: 600px;
  width: 100%;
}

.menu:hover {
  transform: translateY(-2px);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px; /* Reduzierter Padding */
  cursor: pointer;
  background: linear-gradient(90deg, #062316, #063d37); /* Updated color */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  color: #ffffff;
  transition: background 0.3s ease;
}

.menu-header:hover {
  background: linear-gradient(90deg, #062316, #063d37); /* Updated color */
}

.menu-header span {
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 700;
}

.triangle {
  transition: transform 0.3s ease;
}

.triangle.open {
  transform: rotate(180deg);
}

.menu-content {
  padding: 12px; /* Anpassung für besseres Layout */
  background: #ffffff;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-title {
  font-size: 1.5rem; /* Kleinere Schrift */
  font-weight: 700;
  margin-bottom: 16px; /* Reduzierter Abstand */
  color: #063d37; /* Updated color */
}

@media (min-width: 1024px) {
  .report-title {
    font-size: 1.75rem;
  }
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Reduzierter Gap */
}

.input-container-html {
  display: flex;
  flex-direction: column;
}

.input-container-html label {
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px; /* Reduzierter Abstand */
}

.input-container-html input,
.input-container-html select {
  padding: 8px; /* Kleinere Padding */
  border: 2px solid #d1d5db;
  border-radius: 6px; /* Kleinere Radius */
  font-size: 0.875rem; /* Kleinere Schrift */
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-container-html input:focus,
.input-container-html select:focus {
  outline: none;
  border-color: #063d37; /* Updated color */
  box-shadow: 0 0 0 3px rgba(6, 61, 55, 0.3); /* Updated color */
}

.loading,
.no-data {
  color: #dc2626;
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Anpassung für kompakteres Layout */
}

.checkbox-group-header {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr 1fr;
  gap: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #063d37; /* Updated color */
  padding: 6px 0;
  background: #f0f4f8;
  border-radius: 4px;
}

.checkbox-group-header > *:nth-child(4) {
  padding-left: 40px; /* Verschiebt die "Kosten"-Überschrift 10px nach rechts */
}

.checkbox-group-header > *:nth-child(3) {
  padding-left: 30px; /* Verschiebt die "Kosten"-Überschrift 10px nach rechts */
}

.checkbox-group li {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  background: #ffffff;
  border-radius: 4px;
  transition: background 0.2s ease;
  position: relative;
  font-size: 0.85rem; /* Kleinere Schriftgröße für alle Inhalte in der Liste */
}

.checkbox-group li:hover {
  background: #f9fafb;
}

.checkbox-group-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.checkbox-group-label input {
  width: 16px;
  height: 16px;
  accent-color: #063d37; /* Updated color */
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
  background: #063d37; /* Updated color */
  color: #ffffff;
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
}

.input-group input.watt-input:focus {
  outline: none;
  border-color: #063d37; /* Updated color */
  box-shadow: 0 0 0 2px rgba(6, 61, 55, 0.2); /* Updated color */
}

.price-display {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  text-align: right;
}

.settings-field {
  background: linear-gradient(90deg, #062316, #063d37); /* Updated color */
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.settings-field:hover {
  background: linear-gradient(90deg, #062316, #052f2b); /* Updated hover color */
  transform: scale(1.05);
}

.delete-option-button {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.2s ease;
}

.delete-option-button:hover {
  color: #b91c1c;
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
  color: #ffffff;
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
  color: #1f2937;
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
  background: #ffffff;
  padding: 20px; /* Reduzierter Padding */
  border-radius: 10px; /* Kleinere Radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 10px; /* Reduzierter Abstand */
  display: flex;
  flex-direction: column;
  gap: 16px; /* Reduzierter Gap */
  transition: transform 0.3s ease;
}

.settings-container:hover {
  transform: translateY(-2px);
}

.settings-container h4 {
  font-size: 1.25rem; /* Kleinere Schrift */
  font-weight: 700;
  color: #063d37; /* Updated color */
}

.settings-container h5 {
  font-size: 1rem; /* Kleinere Schrift */
  font-weight: 600;
  color: #063d37; /* Updated color */
  margin-bottom: 10px; /* Reduzierter Abstand */
}

.settings-container .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px; /* Reduzierter Gap */
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
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 600;
  color: #1f2937;
}

.settings-container select {
  padding: 8px; /* Kleinere Padding */
  border: 2px solid #d1d5db;
  border-radius: 6px; /* Kleinere Radius */
  font-size: 0.875rem; /* Kleinere Schrift */
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.settings-container select:focus {
  outline: none;
  border-color: #063d37; /* Updated color */
  box-shadow: 0 0 0 3px rgba(6, 61, 55, 0.3); /* Updated color */
}

.radio-group-settings {
  display: flex;
  gap: 12px; /* Reduzierter Gap */
  margin-top: 6px; /* Reduzierter Abstand */
}

.radio-group-settings label {
  display: flex;
  align-items: center;
  gap: 8px; /* Reduzierter Gap */
}

.radio-group-settings input {
  width: 16px; /* Kleinere Radio-Button */
  height: 16px;
  accent-color: #063d37; /* Updated color */
  cursor: pointer;
}

.zeitraum-section {
  border-top: 1px solid #e5e7eb; /* Dünnerer Rand */
  padding-top: 10px; /* Reduzierter Abstand */
  margin-top: 10px; /* Reduzierter Abstand */
}

.add-option-button {
  background: linear-gradient(90deg, #062316, #063d37); /* Updated color */
  color: #ffffff;
  padding: 6px 12px; /* Reduzierter Padding */
  border-radius: 6px; /* Kleinere Radius */
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 16px; /* Reduzierter Abstand */
  transition: transform 0.2s ease, background 0.3s ease;
}

.add-option-button:hover {
  background: linear-gradient(90deg, #062316, #052f2b); /* Updated hover color */
  transform: scale(1.05);
}

.new-option-container {
  margin-top: 16px; /* Reduzierter Abstand */
  padding: 16px; /* Reduzierter Padding */
  background: linear-gradient(135deg, #f9fafb, #e5e7eb);
  border-radius: 10px; /* Kleinere Radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px; /* Reduzierter Gap */
}

@media (min-width: 640px) {
  .new-option-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

.new-option-input,
.new-option-watt {
  padding: 8px; /* Kleinere Padding */
  border: 2px solid #d1d5db;
  border-radius: 6px; /* Kleinere Radius */
  font-size: 0.875rem; /* Kleinere Schrift */
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.new-option-input:focus,
.new-option-watt:focus {
  outline: none;
  border-color: #062316;
  box-shadow: 0 0 0 3px rgba(6, 61, 55, 0.3); /* Updated color */
}

.save-option-button {
  background: linear-gradient(90deg, #062316, #063d37); /* Updated color */
  color: #ffffff;
  padding: 6px 12px; /* Reduzierter Padding */
  border-radius: 6px; /* Kleinere Radius */
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s ease;
}

.save-option-button:hover {
  background: linear-gradient(90deg, #062316, #052f2b); /* Updated hover color */
  transform: scale(1.05);
}

.summary-container {
  margin-top: 24px; /* Reduzierter Abstand */
  background: linear-gradient(135deg, #f9fafb, #e5e7eb);
  padding: 16px; /* Reduzierter Padding */
  border-radius: 10px; /* Kleinere Radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-title {
  font-size: 1.25rem; /* Kleinere Schrift */
  font-weight: 700;
  color: #063d37; /* Updated color */
  margin-bottom: 10px; /* Reduzierter Abstand */
}

@media (min-width: 1024px) {
  .summary-title {
    font-size: 1.5rem;
  }
}

.summary-item {
  font-size: 0.875rem; /* Kleinere Schrift */
  font-weight: 500;
  margin-bottom: 6px; /* Reduzierter Abstand */
}

.diagram {
  background: #ffffff;
  padding: 24px; /* Reduzierter Padding */
  border-radius: 10px; /* Kleinere Radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.diagram:hover {
  transform: translateY(-4px);
}

.diagram-title {
  font-size: 1.25rem; /* Kleinere Schrift */
  font-weight: 700;
  color: #063d37; /* Updated color */
  margin-bottom: 16px; /* Reduzierter Abstand */
}

@media (min-width: 1024px) {
  .diagram-title {
    font-size: 1.5rem;
  }
}

.chart-container {
  height: 300px; /* Kleinere Höhe */
}

table {
  border-collapse: collapse;
}

table, th, td {
  border: none;
} 

.option-icon {
  font-size: 1.2rem;
  color: #062316; /* Unchanged as it wasn't dark green */
  vertical-align: middle;
  margin-right: 8px;
}

.checkbox-group-label {
  display: flex;
  align-items: center;
  gap: 8px; /* Ensures consistent spacing between checkbox, icon, and text */
}`}</style>
    <div className="app-container">
      <div className="calculation-report">
        <h2 className="report-title">Rechenbericht</h2>
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
                <label className="region-label">KF</label>
                <div className="discount-switch-container">
                  <input
                    type="checkbox"
                    id="region-kf"
                    className="discount-switch-input"
                    checked={selectedRegion === 'KF'}
                    onChange={() => handleRegionChange('KF')}
                    aria-label="Region Kraftwerk auswählen"
                  />
                  <label className="discount-switch-slider" htmlFor="region-kf"></label>
                </div>
              </div>
              <div className="region-switch-wrapper">
                <label className="region-label">MN</label>
                <div className="discount-switch-container">
                  <input
                    type="checkbox"
                    id="region-mn"
                    className="discount-switch-input"
                    checked={selectedRegion === 'MN'}
                    onChange={() => handleRegionChange('MN')}
                    aria-label="Region Mittlerer Netzpreis auswählen"
                  />
                  <label className="discount-switch-slider" htmlFor="region-mn"></label>
                </div>
              </div>
              <div className="region-switch-wrapper">
                <label className="region-label">MOD</label>
                <div className="discount-switch-container">
                  <input
                    type="checkbox"
                    id="region-mod"
                    className="discount-switch-input"
                    checked={selectedRegion === 'MOD'}
                    onChange={() => handleRegionChange('MOD')}
                    aria-label="Region Modellregion auswählen"
                  />
                  <label className="discount-switch-slider" htmlFor="region-mod"></label>
                </div>
              </div>
            </div>
          </div>
          <div className="input-container-html">
            <label>Energiepreis(Ct/kWh):</label>
            <span>{getPreisDifferenz(strompreis, selectedRegion)}</span>
          </div>
          <div className="input-container-html date-picker-container">
            <label className="date-picker-label" htmlFor="date-picker">Datum für dynamischen Preis:</label>
            <input
              type="date"
              id="date-picker"
              className="date-picker"
              value={selectedDate ? toInputDate(selectedDate) : ''}
              onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
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
                      <span>Watt / h</span>
                      <span>Kosten/Jahr</span>
                      {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && <span></span>}
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
                          {!iconMapping[option.name] && <DescriptionIcon className="option-icon" aria-label={`Icon for ${option.name}`} />}
                          <span>{option.name}</span>
                        </label>
                        <div className="info-field">
                          <span className="tooltip">{verbraucherBeschreibungen[option.name] || option.specifications}</span>
                          <span>ℹ️</span>
                        </div>
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
                        <div className="price-display">
                          {verbraucherDaten[option.name]?.kosten || '0.00'} €
                        </div>
                        {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
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

                        {showErweiterteOptionen[menu.id]?.[option.name] && (menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
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
                                      value={erweiterteEinstellungen[option.name]?.batterieKapazitaet || 0}
                                      onChange={(e) => handleErweiterteEinstellungChange(option.name, 'batterieKapazitaet', e.target.value, null)}
                                      min="0"
                                      step="0.1"
                                    />
                                  </label>
                                  <label>
                                    Wallbox-Leistung (W):
                                    <input
                                      type="number"
                                      className="settings-input"
                                      value={erweiterteEinstellungen[option.name]?.wallboxLeistung || 0}
                                      onChange={(e) => handleErweiterteEinstellungChange(option.name, 'wallboxLeistung', e.target.value, null)}
                                      min="0"
                                      step="100"
                                    />
                                  </label>
                                  <label>
                                    Ladehäufigkeit (pro Woche):
                                    <input
                                      type="number"
                                      className="settings-input"
                                      value={erweiterteEinstellungen[option.name]?.nutzung || 0}
                                      onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                      min="0"
                                      max="20"
                                      step="1"
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
                                        <label>
                                          Zeitraum:
                                          <select
                                            value={timePeriods.find(p => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit)?.label || ''}
                                            onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                          >
                                            {timePeriods.map((period, index) => (
                                              <option key={`${period.label}-${index}`} value={period.label}>
                                                {`${period.label} (${period.startzeit} - ${period.endzeit})`}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                        <label>
                                          Dauer (h):
                                          <input
                                            type="number"
                                            value={zeitraum.dauer || ''}
                                            onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                            min="0"
                                            max="23"
                                            step="0.1"
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
                            ) : (
                              <div>
                                <h4>Verbraucher Einstellungen</h4>
                                <div className="grid">
                                  <label>
                                    Nutzung (pro Woche):
                                    <input
                                      type="number"
                                      value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                                      onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value)}
                                      min="0"
                                      max="20"
                                      step="1"
                                    />
                                  </label>
                                </div>
                                <div className="zeitraum-section">
                                  <h5>Zeiträume</h5>
                                  {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum, index) => (
                                    <div key={zeitraum.id} className="zeitraum-grid">
                                      <label>
                                        Zeitraum:
                                        <select
                                          value={timePeriods.find(p => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit)?.label || ''}
                                          onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                        >
                                          {timePeriods.map((period) => (
                                            <option key={period.label} value={period.label}>
                                              {period.label} ({period.startzeit} - {period.endzeit})
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      <label>
                                        Dauer (h):
                                        <input
                                          type="number"
                                          className="settings-input"
                                          value={zeitraum.dauer}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                          min="0"
                                          max="23"
                                          step="1"
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
                      <input
                        type="number"
                        className="new-option-watt"
                        placeholder="Wattleistung"
                        value={newOptionWatt[menu.id] || ''}
                        onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                        min="0"
                      />
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
            <h3 className="summary-title">Zusammenfassung pro Jahr</h3>
            <div className="summary-item"> Kosten Grundlast : {zusammenfassung.grundlast} €</div>
            <div className="summary-item"> Kosten Schaltbere Verbraucher : {zusammenfassung.dynamisch} €</div>
            <div className="summary-item">Kosten Gesamt: {zusammenfassung.gesamt} €</div>
            <div className="summary-item">Gesamtwatt: {zusammenfassung.totalWattage} W/h</div>
            <div className="summary-item">Kosten Grundlast  (dynamischer Tarif):{zusammenfassung.grundlastDyn} €</div>
            <div className="summary-item"> Kosten Schaltbare Verbaucher (dynamischer Tarif): {zusammenfassung.dynamischDyn} €</div>
            <div className="summary-item">Kosten Gesamt (dynamischer Tarif): {zusammenfassung.gesamtDyn} €</div>
            <div className="summary-item">Vergleich (fester vs. dynamischer Tarif): {(parseFloat(zusammenfassung.gesamt) - parseFloat(zusammenfassung.gesamtDyn)).toFixed(2)} €</div>
            <button className="download-button bg-[#063d37] text-white py-2 px-4 rounded hover:bg-blue-700" onClick={handleDownloadClick}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <div className="diagrams-container">
        <div className="diagram">
          <h3 className="diagram-title">Stromverbrauch pro Stunde</h3>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="diagram">
          <h3 className="diagram-title">Stromersparnis pro Stunde</h3>
          <div className="chart-container">
            <Line data={chartDataKosten} options={chartOptionsKosten} />
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
                                       </>
                                     );
                                   }