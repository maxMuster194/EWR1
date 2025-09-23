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
  Wärmepumpe: 'Air',
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
  Wärmepumpe: 460,
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
  Wärmepumpe: 'Eine Wärmepumpe verbraucht ca. 460 W.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 700 W bei 1 Stunde täglicher Nutzung.',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.',
  Licht: 'Beleuchtung verbraucht etwa 175 W bei 5 Stunden täglicher Nutzung.',
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
  Wärmepumpe: 'grundlast',
  Waschmaschine: 'week',
  Geschirrspüler: 'week',
  Trockner: 'week',
  Herd: 'day',
  Multimedia: 'day',
  Licht: 'day',
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
  } else if (type === 'day') {
    kosten = (watt * totalDauer * nutzung * 365) / 1000 * preisDifferenz;
  } else {
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
  } else if (type === 'day') {
    kosten = (watt * totalDauer * einstellung.nutzung * 365) / 1000 * preisDifferenz;
  }

  console.log('Berechnete Kosten:', kosten);
  return kosten < 0 ? 0 : kosten;
};





const berechneDynamischeErsparnis = (verbraucher, strompreis, prices, verbraucherDaten, erweiterteEinstellungen, selectedRegion) => {
    // Wattleistung des Verbrauchers (z. B. 1200 Watt für Waschmaschine)
    const watt = verbraucherDaten[verbraucher]?.watt || 0;
    if (watt === 0) return 0; // Abbruch, wenn keine Leistung angegeben ist
  
    // Verbrauchertyp (z. B. 'grundlast', 'week', 'day', 'auto')
    const type = verbraucherTypes[verbraucher];
    // Einstellungen für den Verbraucher (z. B. Nutzung, Zeiträume, Batteriekapazität)
    const einstellung = erweiterteEinstellungen[verbraucher] || {};
  
    // Prüfen, ob Nutzung und Zeiträume vorhanden sind
    if (!einstellung.nutzung || einstellung.nutzung <= 0 || !einstellung.zeitraeume || einstellung.zeitraeume.length === 0) return 0;
  
    // Gesamtverbrauch in kWh berechnen
    let totalKWh = 0;
    let multiplier = 0;
    let useWatt = watt;
  
    // Gesamtdauer der Betriebszeiten (Summe der Stunden pro Zyklus)
    const totalDauer = einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
    if (totalDauer === 0) return 0; // Abbruch, wenn keine Betriebszeit angegeben ist
  
    // Für E-Autos mit Standardladung: Batteriekapazität verwenden
    if (type === 'auto' && einstellung.standardLadung) {
      totalKWh = (einstellung.batterieKapazitaet || 0) * (einstellung.nutzung || 0) * 52;
    } else {
      // Multiplier basierend auf Verbrauchertyp
      if (type === 'week' || type === 'auto') {
        multiplier = (einstellung.nutzung || 0) * 52; // Nutzung pro Woche * 52 Wochen
      } else if (type === 'day') {
        multiplier = (einstellung.nutzung || 0) * 365; // Nutzung pro Tag * 365 Tage
      } else if (type === 'grundlast') {
        multiplier = (einstellung.nutzung || 0) * 365; // Nutzung pro Tag * 365 Tage
      }
      // Für E-Autos ohne Standardladung: Wallbox-Leistung verwenden
      if (type === 'auto') {
        useWatt = einstellung.wallboxLeistung || watt;
      }
      // Gesamtverbrauch: Wattleistung * Dauer * Häufigkeit / 1000 (für kWh)
      totalKWh = (useWatt * totalDauer * multiplier) / 1000;
    }
    if (totalKWh === 0) return 0; // Abbruch, wenn kein Verbrauch berechnet wurde
  
    // Gewichteten Durchschnittspreis berechnen
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    const fixedPrice = parseFloat(getPreisDifferenz(strompreis, selectedRegion)); // Fester Preis (z. B. 31 - 10 = 21 Cent/kWh)
    const fallbackPrice = fixedPrice; // Fallback, falls kein API-Preis verfügbar
  
    // Für alle Verbraucher: Nur die angegebenen Zeiträume verwenden
    einstellung.zeitraeume.forEach((z) => {
      let currentTime = parseInt(z.startzeit.split(':')[0]) + parseInt(z.startzeit.split(':')[1]) / 60; // Startzeit in Stunden (z. B. 9:00 → 9.0)
      let remaining = parseFloat(z.dauer) || 0; // Verbleibende Dauer des Zeitraums
      while (remaining > 0) {
        const hour = Math.floor(currentTime); // Aktuelle Stunde
        const frac = Math.min(1.0, remaining, hour + 1 - currentTime); // Anteil der Stunde (max. 1 Stunde)
        totalWeightedPrice += (prices[hour % 24] || fallbackPrice) * frac; // Preis * Stundenanteil
        totalWeight += frac; // Gewichtung der Stunde
        remaining -= frac; // Verbleibende Dauer reduzieren
        currentTime += frac; // Zeit voranschreiten
        if (currentTime >= 24) currentTime -= 24; // Tageswechsel
      }
    });
  
    // Durchschnittspreis: Gesamtpreis / Gesamtgewichtung
    const averagePrice = totalWeight > 0 ? totalWeightedPrice / totalWeight : fixedPrice;
  
    // Kosten berechnen
    const dynamicCost = totalKWh * (averagePrice / 100); // Dynamische Kosten (in €)
    const fixedCost = totalKWh * (fixedPrice / 100); // Feste Kosten (in €)
  
    // Ersparnis: Feste Kosten - Dynamische Kosten
    let ersparnis = fixedCost - dynamicCost;
    if (ersparnis < 0) ersparnis = 0; // Keine negativen Ersparnisse
  
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
    // FIX: dailyMultiplier konsistent machen – für 'day': nutzung (pro Tag), für 'week'/'auto': /7 (durchschn. pro Tag)
    const dailyMultiplier = type === 'day' 
      ? (nutzung || 1)  // Anzahl Zyklen pro Tag
      : (type === 'week' || type === 'auto' ? (nutzung || 0) / 7 : 1);  // Durchschnitt pro Tag
    let useWatt = verbraucherDaten[verbraucher]?.watt || 0;
    const standardLadung = einstellung.standardLadung || false;
    const totalDauer = einstellung.zeitraeume?.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 1;
    if (type === 'auto' && standardLadung) {
      useWatt = ((einstellung.batterieKapazitaet || 0) / totalDauer) * 1000;
    }
    // console.log('berechneStundenVerbrauch:', { verbraucher, useWatt, type, standardLadung, dailyMultiplier, nutzung });  // Optional: Log behalten für Debug
    if (useWatt <= 0) return;
    const isGrundlast = type === 'grundlast';
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i].total += (useWatt / 1000) * dailyMultiplier;  // FIX: * dailyMultiplier auch hier (obwohl für grundlast=1)
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
          const add = (useWatt / 1000) * frac * dailyMultiplier;  // FIX: * dailyMultiplier für Konsistenz
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
  // console.log('Stundenverbrauch:', stunden);  // Optional
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
        dauer = 3.0;
        nutzung = 2;
      } else if (type === 'day') {
        startzeit = '18:00';
        endzeit = '21:00';
        dauer = 3.0;
        nutzung = 3;
      } else if (type === 'auto') {
        startzeit = '21:00';
        endzeit = '00:00';
        dauer = 3.0;
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
        { name: 'Wärmepumpe', specifications: 'Leistung: 50 W, Betrieb: 24/7' },
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

      // Migrate old EAuto keys to E-Auto
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

      // Migrate old ZweitesEAuto keys to Zweites E-Auto
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

  // Countdown logic for email verification
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
    if (field === 'dauer' && parsedValue > 7) {
      setError(`Dauer für ${verbraucher} darf 7 Stunden nicht überschreiten.`);
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
    setSelectedRegion(null);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        const type = verbraucherTypes[verbraucher];
        if (type !== 'grundlast') {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher, newStrompreis, null, erweiterteEinstellungen);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher, newStrompreis, null, setVerbraucherDaten, erweiterteEinstellungen);
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
        vType = selectedType === 'week' ? 'week' : 'day';
        if (vType === 'week') {
          startzeit = '09:00';
          endzeit = '12:00';
          dauer = 3.0;
          nutzung = 2;
        } else {
          startzeit = '18:00';
          endzeit = '21:00';
          dauer = 3.0;
          nutzung = 3;
        }
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
        borderColor: '#409966',
        backgroundColor: '#409966',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: `Dynamischer Preis am ${selectedDate || 'N/A'} (Ct/kWh)`,
        data: chartConvertedValues,
        fill: false,
        borderColor: '#062316',
        backgroundColor: '#062316',
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
        label: `Ersparnis (Dynamischer Tarif) am ${selectedDate || 'N/A'} (Ct)`,
        data: hourlyData.map((_, index) => {
          const price = chartConvertedValues[index] != null ? chartConvertedValues[index] : parseFloat(getPreisDifferenz(strompreis, selectedRegion));  // FIX: Fallback auf Differenz
          return (hourlyData[index].total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#062316',
        backgroundColor: '#062316',
        tension: 0.1,
      },
      {
        label: `Ersparnis (Fester Tarif) am ${selectedDate || 'N/A'} (Ct)`,
        data: hourlyData.map((_, index) => {
          const price = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
          return (hourlyData[index].total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#409966',
        backgroundColor: '#409966',
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
<style>{`* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 14px;
}

body {
  font-family: 'Inter', Arial, sans-serif;
  background: #f3f4f6;
  color: #1f2937;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Container für die gesamte App */
.app-container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-height: 100vh;
  padding-top: 296px; /* Angepasst, um Platz für den fixierten Chart zu lassen (280px Chart + 8px Padding oben + 8px Padding unten) */
}

/* Fixierter Chart-Bereich */
.fixed-chart {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #ffffff;
  padding: 8px;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* Chart-Container */
.chart-container {
  height: 280px;
}

/* Container für den Rechenbericht */
.calculation-report {
  background: #ffffff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  flex: 0 0 auto; /* Verhindert Strecken des Containers */
  max-height: calc(100vh - 296px); /* Höhe bis zur Unterkante des Charts */
  overflow-y: auto; /* Scrollbalken bei Überlauf */
  -webkit-overflow-scrolling: touch; /* Sanftes Scrollen auf Touch-Geräten */
}

/* Titel des Rechenberichts */
.report-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #409966;
}

/* Inhalt des Rechenberichts */
.report-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Eingabefelder */
.input-container-html {
  display: flex;
  flex-direction: column;
}

.input-container-html label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 3px;
}

.input-container-html input,
.input-container-html select {
  padding: 5px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.8125rem;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-container-html input:focus,
.input-container-html select:focus {
  outline: none;
  border-color: #409966;
  box-shadow: 0 0 0 1.5px rgba(64, 153, 102, 0.25);
}

/* Region-Buttons */
.region-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin: 6px 0;
  padding: 5px;
}

.region-switch-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 56px;
}

.region-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1a1a;
  text-align: center;
  transition: color 0.2s ease;
}

.discount-switch-container {
  position: relative;
  width: 32px;
  height: 18px;
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
  border-radius: 9px;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.discount-switch-slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.discount-switch-input:checked + .discount-switch-slider {
  background-color: #047857;
}

.discount-switch-input:checked + .discount-switch-slider:before {
  transform: translateX(14px);
}

.discount-switch-input:focus + .discount-switch-slider {
  box-shadow: 0 0 0 1.5px rgba(4, 120, 87, 0.25);
}

.discount-switch-slider:hover {
  background-color: #9ca3af;
}

.discount-switch-input:checked + .discount-switch-slider:hover {
  background-color: #065f46;
}

.region-switch-wrapper:hover .region-label {
  color: #047857;
}

/* Menüs */
.menu {
  background: #f9fafb;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  background: linear-gradient(90deg, #062316, #409966);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: #ffffff;
}

.menu-header span {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #ffffff;
}

.triangle {
  transition: transform 0.2s ease;
}

.menu-content {
  padding: 8px;
  background: #ffffff;
  border-radius: 0 0 6px 6px;
}

/* Checkbox-Gruppe */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkbox-group-header {
  display: grid;
  grid-template-columns: 36px 2fr 56px 72px 72px 36px;
  gap: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  color: #409966;
  padding: 6px 0;
  background: #f0f4f8;
  border-radius: 3px;
  text-align: center;
}

.checkbox-group li {
  display: grid;
  grid-template-columns: 36px 2fr 56px 72px 72px 36px;
  gap: 6px;
  align-items: center;
  padding: 6px 0;
  background: rgb(188, 188, 188);
  border-radius: 3px;
  font-size: 0.75rem;
}

.checkbox-group li:hover {
  background: rgb(188, 188, 188);
}

.icon-field {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-field img {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 3px;
}

.info-field {
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
  font-weight: 400;
}

.info-field .tooltip {
  font-size: 0.9375rem;
  font-weight: bold;
  color: #1f2937;
}

.info-field .tooltip-text {
  visibility: hidden;
  position: absolute;
  background: #409966;
  color: #ffffff;
  font-size: 0.6875rem;
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 10;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0s linear 0.2s;
}

.info-field:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.checkbox-group-label {
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkbox-group-label input {
  width: 18px;
  height: 18px;
  accent-color: #409966;
  cursor: pointer;
}

.input-group {
  display: flex;
  justify-content: center;
  background: #ffffff;
}

.input-group input.watt-input {
  padding: 3px 5px;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  font-size: 0.75rem;
  width: 100%;
  text-align: center;
  background: #ffffff;
}

.input-group input.watt-input:focus {
  outline: none;
  border-color: #409966;
  box-shadow: 0 0 0 1.5px rgba(64, 153, 102, 0.25);
}

.price-display {
  font-size: 0.75rem;
  font-weight: 400;
  color: #1f2937;
  text-align: center;
}

.delete-option-button {
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 3px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 22px;
  height: 22px;
  transition: background-color 0.2s ease;
}

.delete-option-button:hover {
  background: #b91c1c;
}

.confirm-dialog {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  padding: 5px;
  border-radius: 3px;
  margin-top: 3px;
  display: flex;
  gap: 5px;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 20;
  font-size: 0.75rem;
}

.confirm-button {
  background: linear-gradient(90deg, #dc2626, #ef4444);
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.confirm-button:hover {
  background: linear-gradient(90deg, #b91c1c, #dc2626);
}

.cancel-button {
  background: linear-gradient(90deg, #9ca3af, #d1d5db);
  color: #1f2937;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.cancel-button:hover {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
}

.settings-container {
  grid-column: 1 / -1;
  background: rgb(255, 255, 255);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-container h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #409966;
}

.settings-container label {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1f2937;
}

.settings-container select {
  padding: 5px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.75rem;
  width: 100%;
}

.settings-container select:focus {
  outline: none;
  border-color: #409966;
  box-shadow: 0 0 0 1.5px rgba(64, 153, 102, 0.25);
}

.radio-group-settings {
  display: flex;
  gap: 6px;
  margin-top: 3px;
}

.radio-group-settings label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.radio-group-settings input {
  width: 13px;
  height: 13px;
  accent-color: #409966;
  cursor: pointer;
}

.zeitraum-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 6px;
  margin-top: 6px;
}

.add-option-button {
  background: linear-gradient(90deg, #062316, #409966);
  color: #ffffff;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin-top: 6px;
}

.add-option-button:hover {
  background: linear-gradient(90deg, #062316, #4caf50);
}

.download-button {
  background: linear-gradient(90deg, #1e3a8a, #3b82f6);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.download-button:hover {
  background: linear-gradient(90deg, #1e40af, #2563eb);
}

.download-hint {
  font-size: 0.75rem;
  color: #1f2937;
  margin-top: 4px;
}

.new-option-container {
  margin-top: 6px;
  padding: 8px;
  background: linear-gradient(135deg, #f9fafb, #e5e7eb);
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-option-button {
  background: linear-gradient(90deg, #062316, #409966);
  color: #ffffff;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.save-option-button:hover {
  background: linear-gradient(90deg, #062316, #4caf50);
}

/* Modal-Styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: #ffffff;
  padding: 16px;
  border-radius: 6px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.close-modal-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  color: #1f2937;
}

.close-modal-button:hover {
  color: #dc2626;
}

.modal-content h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #409966;
}

.modal-content p {
  font-size: 0.8125rem;
  color: #1f2937;
}

.modal-content input {
  padding: 5px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.8125rem;
  width: 100%;
}

.modal-content input:focus {
  outline: none;
  border-color: #409966;
  box-shadow: 0 0 0 1.5px rgba(64, 153, 102, 0.25);
}

.modal-content label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #1f2937;
}

.modal-content input[type="checkbox"] {
  width: 13px;
  height: 13px;
  accent-color: #409966;
}

/* Neues Layout für dynamische Verbraucher */
.dynamic-consumer-layout {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

/* Eingaben-Wrapper für Strompreis und Datum */
.inputs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 769px) {
  .inputs-wrapper {
    flex-direction: row;
    gap: 12px;
    justify-content: space-between;
  }
  .input-container-html,
  .date-picker-container {
    flex: 1;
    margin-bottom: 0;
    box-shadow: none;
    padding: 0;
    background: transparent;
  }
}

/* Media Query für Mobile */
@media (max-width: 768px) {
  html {
    font-size: 12px;
  }

  .app-container {
    padding: 6px;
    gap: 6px;
    padding-top: 232px; /* Angepasst für mobile Geräte (220px Chart + 6px Padding oben + 6px Padding unten) */
  }

  .fixed-chart {
    top: 64px;
    padding: 6px;
    border-radius: 0 0 5px 5px;
  }

  .chart-container {
    height: 220px;
  }

  .calculation-report {
    max-height: calc(100vh - 232px); /* Angepasst für mobile Geräte */
    overflow-y: auto; /* Scrollbalken für mobilen Rechenbericht */
  }

  .region-buttons {
    gap: 6px;
    margin: 4px 0;
    padding: 4px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .region-switch-wrapper {
    min-width: 48px;
  }

  .region-label {
    font-size: 0.75rem;
  }

  .discount-switch-container {
    width: 30px;
    height: 16px;
  }

  .discount-switch-slider:before {
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
  }

  .discount-switch-input:checked + .discount-switch-slider:before {
    transform: translateX(14px);
  }

  .inputs-wrapper {
    flex-direction: row;
    gap: 6px;
    padding: 6px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 6px;
  }

  .date-picker-container input,
  .date-picker-container select,
  .input-container-html input,
  .input-container-html select {
    padding: 4px;
    font-size: 0.75rem;
    border-radius: 2px;
  }

  .input-container-html label {
    font-size: 0.75rem;
    margin-bottom: 2px;
  }

  .menu {
    margin-bottom: 6px;
  }

  .menu-header {
    padding: 6px;
  }

  .menu-header span {
    font-size: 0.75rem;
    color: #ffffff;
  }

  .menu-content {
    padding: 6px;
    font-size: 0.75rem;
  }

  .checkbox-group {
    gap: 4px;
  }

  .checkbox-group-header {
    font-size: 0.6875rem;
    padding: 4px 0;
    gap: 4px;
    grid-template-columns: 32px 1fr 48px 64px 64px 32px;
  }

  .checkbox-group li {
    font-size: 0.6875rem;
    padding: 4px 0;
    gap: 4px;
    grid-template-columns: 32px 1fr 48px 64px 64px 32px;
  }

  .icon-field img {
    width: 24px;
    height: 24px;
  }

  .info-field .tooltip {
    font-size: 0.9375rem;
    font-weight: bold;
    color: #1f2937;
  }

  .info-field .tooltip-text {
    font-size: 0.625rem;
    padding: 2px 3px;
  }

  .checkbox-group-label input {
    width: 16px;
    height: 16px;
  }

  .input-group {
    background: #ffffff;
  }

  .input-group input.watt-input {
    padding: 3px 4px;
    font-size: 0.6875rem;
    background: #ffffff;
  }

  .price-display {
    font-size: 0.6875rem;
  }

  .delete-option-button {
    width: 20px;
    height: 20px;
    padding: 2px;
  }

  .confirm-dialog {
    font-size: 0.6875rem;
    padding: 4px;
    gap: 4px;
  }

  .confirm-button,
  .cancel-button {
    padding: 2px 4px;
    font-size: 0.6875rem;
  }

  .settings-container {
    padding: 6px;
    margin-top: 4px;
    gap: 6px;
  }

  .settings-container h4 {
    font-size: 0.875rem;
  }

  .settings-container label,
  .settings-container select {
    font-size: 0.6875rem;
  }

  .add-option-button,
  .save-option-button {
    padding: 3px 6px;
    font-size: 0.6875rem;
  }

  .download-button {
    padding: 4px 8px;
    font-size: 0.75rem;
  }

  .modal-content {
    padding: 12px;
    max-width: 320px;
  }

  .modal-content h2 {
    font-size: 1rem;
  }

  .modal-content p,
  .modal-content input,
  .modal-content label {
    font-size: 0.75rem;
  }

  .modal-content input[type="checkbox"] {
    width: 12px;
    height: 12px;
  }

  .close-modal-button {
    font-size: 1rem;
  }

  .dynamic-consumer-layout {
    gap: 4px;
    margin-top: 6px;
  }

  .delete-zeitraum-button {
    background-color: #ef4444;
    color: #ffffff;
    border-radius: 3px;
    padding: 3px 6px;
    font-size: 0.6875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .delete-zeitraum-button:hover {
    background-color: #dc2626;
  }

  .chart-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    transition: opacity 0.3s ease;
  }

  .option-icon {
  font-size: 1.2rem;
  color:rgb(6, 35, 22); /* Adjust to match your theme */
  vertical-align: middle;
  margin-right: 8px;
}

.checkbox-group-label {
  display: flex;
  align-items: center;
  gap: 8px; /* Ensures consistent spacing between checkbox, icon, and text */
}
}`}</style>
<div className="app-container">
  {/* Fixierter Chart-Bereich */}

  
  <div className="fixed-chart">
    <div className="chart-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  </div>

  {/* Rechenbericht */}
  <div className="calculation-report">
    <h2 className="report-title">Rechenbericht</h2>
    <div className="report-content">
      {/* Eingaben: Datum und Strompreis nebeneinander */}
      <div className="inputs-wrapper">
        <div className="date-picker-container">
          <div className="input-container-html">
            <label htmlFor="date-picker">Datum dynamische Preise</label>
            <select
              id="date-picker"
              value={toInputDate(selectedDate)}
              onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
              disabled={apiLoading}
            >
              <option value="">Datum auswählen</option>
              {availableDates.map((date) => (
                <option key={date} value={toInputDate(date)}>
                  {date}
                </option>
              ))}
            </select>
            {apiLoading && <p>Lade dynamische Preise...</p>}
            {error && <p style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}
          </div>
        </div>

        <div className="input-container-html">
          <label htmlFor="strompreis">Strompreis (€/kWh)</label>
          <input
            id="strompreis"
            type="number"
            step="0.01"
            value={strompreis}
            onChange={(e) => handleStrompreisChange(e.target.value)}
          />
        </div>
      </div>

      <div className="region-buttons">
        {['KF', 'MN', 'MOD'].map((region) => (
          <div key={region} className="region-switch-wrapper">
            <label className="region-label">{region}</label>
            <div className="discount-switch-container">
              <input
                type="checkbox"
                className="discount-switch-input"
                id={`region-${region}`}
                checked={selectedRegion === region}
                onChange={() => handleRegionChange(region)}
              />
              <label htmlFor={`region-${region}`} className="discount-switch-slider" />
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}




      {/* Menüs und Verbraucher */}
      {menus.map((menu) => (
        <div key={menu.id} className="menu bg-white rounded-lg shadow-md mb-4">
          <div
            className="menu-header flex justify-between items-center p-3 bg-gray-100 rounded-t-lg cursor-pointer hover:bg-gray-200"
            onClick={() => toggleMenu(menu.id)}
          >
            <span className="text-base font-semibold text-gray-800">{menu.label}</span>
            <span
              className={`triangle transform transition-transform duration-200 ${
                openMenus[menu.id] ? "rotate-180" : ""
              } text-gray-600`}
            >
              &#9660;
            </span>
          </div>

          {openMenus[menu.id] && (
            <div className="menu-content p-3">
              <ul className="checkbox-group space-y-2">
                <li className="checkbox-group-header grid grid-cols-4 gap-2 text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded-md sm:grid-cols-6 sm:gap-3">
                  <span className="col-span-2 sm:col-span-1">Icon</span>
                  <span className="hidden sm:block">Info</span>
                  <span>Aktiv</span>
                  <span>Leistung (W)</span>
                  <span>Kosten (€)</span>
                  <span className="hidden sm:block">Löschen</span>
                </li>
                

                {menu.options.map((option) => (
  <li
    key={option.name}
    className="grid grid-cols-4 gap-2 items-center p-2 hover:bg-gray-50 rounded-md relative sm:grid-cols-6 sm:gap-3"
  >
    {/* Icon + Info */}
    <div className="icon-field col-span-2 flex items-center gap-2">
      {iconMapping[option.name] === 'AcUnit' && <AcUnitIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'Air' && <AirIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'LocalLaundryService' && <LocalLaundryServiceIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'Kitchen' && <KitchenIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'Tv' && <TvIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'Lightbulb' && <LightbulbIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {iconMapping[option.name] === 'ElectricCar' && <ElectricCarIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      {!iconMapping[option.name] && <DescriptionIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" aria-label={`Icon for ${option.name}`} />}
      <div className="info-field relative group cursor-pointer">
        <span className="tooltip text-[15px] font-bold text-gray-700">{option.name}</span>
        {verbraucherBeschreibungen[option.name] && (
          <span className="tooltip-text absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1 -mt-8 sm:-mt-6">
            {verbraucherBeschreibungen[option.name]}
          </span>
        )}
      </div>
    </div>

                    {/* Checkbox */}
                    <div className="checkbox-group-label flex justify-center">
                      <input
                        type="checkbox"
                        checked={verbraucherDaten[option.name]?.checked || false}
                        onChange={(e) => onCheckboxChange(option.name, e.target.checked)}
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Watt Input */}
                    <div className="input-group">
                      <input
                        type="number"
                        value={verbraucherDaten[option.name]?.watt || ""}
                        onChange={(e) => handleWattChange(option.name, e.target.value)}
                        disabled={!verbraucherDaten[option.name]?.checked}
                        className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      />
                    </div>

                    {/* Kosten */}
                    <span className="price-display text-gray-700 text-xs text-center">
                      {verbraucherDaten[option.name]?.kosten || "0.00"}
                    </span>

                    {/* Löschen */}
                    {(menu.id === "grundlastverbraucher" ||
                      menu.id === "dynamischeverbraucher" ||
                      menu.id === "eauto") && (
                      <button
                        className="delete-option-button text-red-500 hover:text-red-700 absolute right-1 top-1 text-xs sm:static sm:text-base"
                        onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                      >
                        x
                      </button>
                    )}

                    {/* Bestätigung Löschen */}
                    {deleteConfirmOption?.menuId === menu.id &&
                      deleteConfirmOption?.optionName === option.name && (
                        <div className="confirm-dialog col-span-4 bg-yellow-50 p-2 rounded-md flex items-center gap-2 sm:col-span-6">
                          <span className="text-xs text-gray-800">{`"${option.name}" löschen?`}</span>
                          <button
                            className="confirm-button bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-xs"
                            onClick={() => confirmDeleteOption(menu.id, option.name)}
                          >
                            Ja
                          </button>
                          <button
                            className="cancel-button bg-gray-300 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-400 text-xs"
                            onClick={cancelDeleteOption}
                          >
                            Nein
                          </button>
                        </div>
                      )}

                    {/* Erweiterte Einstellungen */}
                    {(menu.id === "dynamischeverbraucher" || menu.id === "eauto") && (
                      <div className="settings-container col-span-4 bg-white p-0.5 rounded-lg mt-1 max-w-full sm:col-span-6 sm:max-w-xs">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1 text-center">
                          Einstellungen für {option.name}
                        </h4>
                        {menu.id === "dynamischeverbraucher" && (
                          <div className="dynamic-consumer-layout flex flex-col gap-0.5">
                            {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum, index) => (
                              <div
                                key={zeitraum.id}
                                className="flex flex-row gap-0.5 bg-white p-0.5 rounded-md shadow justify-center"
                              >
                                <div className="flex flex-col gap-2 w-full">
                                  {/* Nutzung pro Woche */}
                                  <div className="flex flex-col items-center justify-center w-full">
                                    <span className="text-[11px] font-semibold text-gray-700 text-center">
                                      Nutzung/Woche
                                    </span>
                                    <span className="text-[15px] font-bold text-gray-700">
                                      {erweiterteEinstellungen[option.name]?.nutzung || 0}
                                    </span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="14"
                                      value={erweiterteEinstellungen[option.name]?.nutzung || 0}
                                      onChange={(e) =>
                                        handleErweiterteEinstellungChange(option.name, "nutzung", Number(e.target.value), null)
                                      }
                                      className="w-full accent-green-600 mt-1"
                                    />
                                  </div>

                                  {/* Zeitraum */}
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
                                      className="w-full accent-green-600 mt-1"
                                    />
                                  </div>

                                  {/* Dauer */}
                                  <div className="flex flex-col items-center justify-center w-full">
                                    <span className="text-[11px] font-semibold text-gray-700 text-center">
                                      Dauer (h)
                                    </span>
                                    <span className="text-[15px] font-bold text-gray-700">
                                      {zeitraum.dauer || 0}
                                    </span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="7"
                                      step="0.5"
                                      value={zeitraum.dauer || 0}
                                      onChange={(e) =>
                                        handleErweiterteEinstellungChange(option.name, "dauer", Number(e.target.value), zeitraum.id)
                                      }
                                      className="w-full accent-green-600 mt-1"
                                    />
                                  </div>

                                  {/* Zeitraum löschen */}
                                  {index > 0 && (
                                    <div className="flex justify-center mt-1">
                                      <button
                                        className="delete-zeitraum-button"
                                        onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                      >
                                        X
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-center mt-1">
                              <button
                                className="bg-gray-600 text-white px-1 py-0.5 rounded-md hover:bg-gray-700 text-[12px] font-semibold sm:px-[2.2px] sm:py-[0.55px] sm:text-[13px]"
                                onClick={() => addZeitraum(option.name)}
                              >
                                Zeitraum hinzufügen
                              </button>
                            </div>
                          </div>
                        )}

                        {menu.id === "eauto" && (
                          <div className="flex flex-col sm:flex-row gap-2 items-start flex-wrap sm:gap-3">
                            <label className="flex flex-col flex-1 min-w-[70px] sm:min-w-[80px]">
                              <span className="text-xs font-medium text-gray-700">Batteriekapazität (kWh)</span>
                              <input
                                type="number"
                                value={erweiterteEinstellungen[option.name]?.batterieKapazitaet || ""}
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(option.name, "batterieKapazitaet", e.target.value, null)
                                }
                                className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                              />
                            </label>

                            <label className="flex flex-col flex-1 min-w-[70px] sm:min-w-[80px]">
                              <span className="text-xs font-medium text-gray-700">Wallbox-Leistung (W)</span>
                              <input
                                type="number"
                                value={erweiterteEinstellungen[option.name]?.wallboxLeistung || ""}
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(option.name, "wallboxLeistung", e.target.value, null)
                                }
                                className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                              />
                            </label>

                            <div className="radio-group-settings flex flex-col gap-1">
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`ladung-${option.name}`}
                                  value="true"
                                  checked={erweiterteEinstellungen[option.name]?.standardLadung === true}
                                  onChange={(e) =>
                                    handleErweiterteEinstellungChange(option.name, "standardLadung", e.target.value, null)
                                  }
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700">Standardladung</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`ladung-${option.name}`}
                                  value="false"
                                  checked={erweiterteEinstellungen[option.name]?.standardLadung === false}
                                  onChange={(e) =>
                                    handleErweiterteEinstellungChange(option.name, "standardLadung", e.target.value, null)
                                  }
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700">Wallbox-Ladung</span>
                              </label>
                            </div>

                            <label className="flex flex-col flex-1 min-w-[70px] sm:min-w-[80px]">
                              <span className="text-xs font-medium text-gray-700">Ladehäufigkeit (pro Woche)</span>
                              <input
                                type="number"
                                value={erweiterteEinstellungen[option.name]?.nutzung || ""}
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(option.name, "nutzung", e.target.value, null)
                                }
                                className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                              />
                            </label>

                            {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum) => (
                              <div key={zeitraum.id} className="zeitraum-section flex flex-row gap-1 items-center sm:gap-2">
                                <label className="flex flex-col flex-1 min-w-[90px] sm:min-w-[100px]">
                                  <span className="text-xs font-medium text-gray-700">Zeitraum</span>
                                  <select
                                    value={
                                      timePeriods.find(
                                        (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                                      )?.label || ""
                                    }
                                    onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                    className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                                  >
                                    <option value="">Zeitraum wählen</option>
                                    {timePeriods.map((period) => (
                                      <option key={period.label} value={period.label}>
                                        {period.label} ({period.startzeit} - {period.endzeit})
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label className="flex flex-col flex-1 min-w-[50px] sm:min-w-[60px]">
                                  <span className="text-xs font-medium text-gray-700">Dauer (Std)</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={zeitraum.dauer || ""}
                                    onChange={(e) =>
                                      handleErweiterteEinstellungChange(option.name, "dauer", e.target.value, zeitraum.id)
                                    }
                                    className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                                  />
                                </label>

                                <button
                                  className="delete-option-button bg-red-500 text-white rounded-md px-1 py-0.5 hover:bg-red-600 text-xs sm:px-2 sm:py-1"
                                  onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                >
                                  X
                                </button>
                              </div>
                            ))}

                            <button
                              className="add-option-button bg-gray-600 text-white rounded-md px-1 py-0.5 hover:bg-gray-700 text-xs mt-1 sm:px-2 sm:py-1 sm:mt-2"
                              onClick={() => addZeitraum(option.name)}
                            >
                              Zeitraum +
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Neue Option hinzufügen */}
              {(menu.id === "grundlastverbraucher" ||
                menu.id === "dynamischeverbraucher" ||
                menu.id === "eauto" ||
                menu.id === "stromerzeuger" ||
                menu.id === "strompeicher") && (
                <>
                  <button
                    className="add-option-button bg-blue-600 text-white rounded-md px-2 py-1 hover:bg-blue-700 mt-2 w-full sm:px-3 sm:py-1 sm:mt-3 sm:w-auto text-xs"
                    onClick={() => toggleNewOptionForm(menu.id)}
                  >
                    {showNewOptionForm[menu.id] ? "Formular schließen" : "Neue Option hinzufügen"}
                  </button>

                  {showNewOptionForm[menu.id] && (
                    <div className="new-option-container bg-gray-50 p-2 rounded-lg mt-2 sm:p-3 sm:mt-3">
                      <label className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">Name</span>
                        <input
                          type="text"
                          value={newOptionNames[menu.id] || ""}
                          onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                          className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs mt-1"
                        />
                      </label>

                      <label className="flex flex-col mt-1 sm:mt-2">
                        <span className="text-xs font-medium text-gray-700">Leistung (W)</span>
                        <input
                          type="number"
                          value={newOptionWatt[menu.id] || ""}
                          onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                          className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs mt-1"
                        />
                      </label>

                      {menu.id === "dynamischeverbraucher" && (
                        <label className="flex flex-col mt-1 sm:mt-2">
                          <span className="text-xs font-medium text-gray-700">Typ</span>
                          <select
                            value={newOptionTypes[menu.id] || "week"}
                            onChange={(e) => handleNewOptionType(menu.id, e.target.value)}
                            className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500 text-xs mt-1"
                          >
                            <option value="week">Wöchentlich</option>
                            <option value="day">Täglich</option>
                          </select>
                        </label>
                      )}

                      <button
                        className="save-option-button bg-blue-600 text-white rounded-md px-2 py-1 hover:bg-blue-700 mt-2 w-full sm:px-3 sm:py-1 sm:mt-3 sm:w-auto text-xs"
                        onClick={() => addNewOption(menu.id)}
                      >
                        Speichern
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Zusammenfassung */}
      <div className="calculation-report">
        <h2 className="report-title">Jahreszusammenfassung pro Jahr</h2>
        <p>Kosten Grundlast : {zusammenfassung.grundlast} €</p>
        <p>Kosten Schaltbere Verbraucher: {zusammenfassung.dynamisch} €</p>
        <p>Kosten Gesamt: {zusammenfassung.gesamt} €</p>
        <p>Gesamtwattage: {zusammenfassung.totalWattage} W/h</p>
        <p>Kosten Grundlast  (dynamischer Tarif):{zusammenfassung.grundlastDyn} €</p>
        <p>Kosten Schaltbare Verbaucher  (dynamischer Tarif): {zusammenfassung.dynamischDyn} €</p>
        <p>Kosten Gesamt  (dynamischer Tarif): {zusammenfassung.gesamtDyn} €</p>
        <p>Vergleich (fester vs. dynamischer Tarif): {(parseFloat(zusammenfassung.gesamt) - parseFloat(zusammenfassung.gesamtDyn)).toFixed(2)} €</p>
    
      </div>

      {/* Download-Button und Hinweis 
      <div className="flex flex-col items-center">
        <button className="download-button" onClick={handleDownloadClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download starten
        </button>
        <p className="download-hint hidden sm:block">
          Bitte verwenden Sie die Desktop-Variante für den Download.
        </p>
      </div>*/}

      {/* Modal für Verifizierung 
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal-button" onClick={closeModal}>
              &times;
            </button>
            {step === 1 ? (
              <>
                <h2>E-Mail-Verifizierung</h2>
                <p>Bitte gib deine E-Mail-Adresse ein, um einen Verifizierungscode zu erhalten.</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-Mail-Adresse"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={agb}
                    onChange={(e) => setAgb(e.target.checked)}
                  />
                  Ich akzeptiere die AGB.
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={werbung}
                    onChange={(e) => setWerbung(e.target.checked)}
                  />
                  Ich möchte Werbung erhalten.
                </label>
                <button
                  className="add-option-button"
                  onClick={requestCode}
                  disabled={cooldown > 0}
                >
                  Code anfordern {cooldown > 0 ? `(${cooldown}s)` : ''}
                </button>
                {message && <p>{message}</p>}
              </>
            ) : (
              <>
                <h2>Code eingeben</h2>
                <p>Bitte gib den erhaltenen Verifizierungscode ein.</p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-stelliger Code"
                />
                <button className="add-option-button" onClick={verifyCode}>
                  Code verifizieren
                </button>
                {message && <p>{message}</p>}
              </>
            )}
          </div>
        </div>
      )}*/}
    </div>
  </div>
</div>
    </>
  );
}