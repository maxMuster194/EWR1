'use client';

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

// Default consumer data and descriptions
const standardVerbrauch = {
  Kühlschrank: 135,
  Gefrierschrank: 175,
  Aquarium: 120,
  Waschmaschine: 1200,
  Geschirrspüler: 600,
  Trockner: 3500,
  Herd: 1000,
  Multimedia: 350,
  Licht: 140,
  EAuto: 11000,
  ZweitesEAuto: 7400,
};

const verbraucherBeschreibungen = {
  Kühlschrank: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.',
  Gefrierschrank: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.',
  Aquarium: 'Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 700 W bei 1 Stunde täglicher Nutzung.',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.',
  Licht: 'Beleuchtung verbraucht etwa 175 W bei 5 Stunden täglicher Nutzung.',
  EAuto: 'Das E-Auto verbraucht ca. 11 kW pro Ladevorgang (z.B. 4h/Woche).',
  ZweitesEAuto: 'Das zweite E-Auto verbraucht ca. 7.4 kW pro Ladevorgang (z.B. 3h/Woche).',
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
];;

// Functions
const getStrompreis = (strompreis) => strompreis;

const updateKosten = (watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen) => {
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher];
  const totalDauer = einstellung?.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  const nutzung = einstellung?.nutzung || 0;
  const batterieKapazitaet = einstellung?.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung?.wallboxLeistung || watt;
  const standardLadung = einstellung?.standardLadung || false;

  switch (verbraucher.toLowerCase()) {
    case 'waschmaschine':
    case 'geschirrspüler':
    case 'trockner':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis;
      break;
    case 'eauto':
    case 'zweiteseauto':
      if (standardLadung) {
        kosten = (batterieKapazitaet * nutzung * 52) / 1000 * strompreis;
      } else {
        kosten = (wallboxLeistung * totalDauer * nutzung * 52) / 1000 * strompreis;
      }
      break;
    case 'herd':
    case 'multimedia':
    case 'licht':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis;
      break;
    default:
      kosten = (watt * strompreis * 24 * 365) / 1000;
  }
  setVerbraucherDaten((prev) => ({
    ...prev,
    [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
  }));
};

const berechneDynamischenVerbrauch = (watt, verbraucher, strompreis, erweiterteEinstellungen) => {
  const einstellung = erweiterteEinstellungen[verbraucher];
  if (!einstellung || einstellung.zeitraeume.length === 0 || watt === 0) return 0;
  let totalDauer = 0;
  einstellung.zeitraeume.forEach(zeitraum => {
    const dauer = parseFloat(zeitraum.dauer) || 0;
    totalDauer += dauer;
  });
  if (totalDauer === 0) return 0;
  let kosten = 0;
  const batterieKapazitaet = einstellung?.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung?.wallboxLeistung || watt;
  const standardLadung = einstellung?.standardLadung || false;

  if (['waschmaschine', 'geschirrspüler', 'trockner'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis;
  } else if (['eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase())) {
    if (standardLadung) {
      kosten = (batterieKapazitaet * einstellung.nutzung * 52) / 1000 * strompreis;
    } else {
      kosten = (wallboxLeistung * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis;
    }
  } else if (['herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 365) / 1000 * strompreis;
  }
  return kosten;
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
    if (['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase())) {
      grundlast += kosten;
    } else {
      dynamisch += kosten;
    }
  });
  const totalWattage = calculateTotalWattage(verbraucherDaten);
  setZusammenfassung({
    grundlast: grundlast.toFixed(2),
    dynamisch: dynamisch.toFixed(2),
    gesamt: (grundlast + dynamisch).toFixed(2),
    totalWattage,
  });
};

const berechneStundenVerbrauch = (verbraucherDaten, erweiterteEinstellungen) => {
  const stunden = Array(24).fill(0).map(() => ({ total: 0, verbraucher: [] }));
  Object.keys(standardVerbrauch).forEach((verbraucher) => {
    const einstellung = erweiterteEinstellungen[verbraucher];
    const watt = einstellung?.standardLadung && ['eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase())
      ? einstellung.batterieKapazitaet / einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0)
      : verbraucherDaten[verbraucher]?.watt || 0;
    if (watt <= 0) return;
    const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase());
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i].total += watt / 1000;
        stunden[i].verbraucher.push(verbraucher);
      }
    } else {
      einstellung?.zeitraeume.forEach(zeitraum => {
        const startzeit = zeitraum.startzeit;
        const dauer = parseFloat(zeitraum.dauer) || 0;
        if (!startzeit || dauer <= 0) return;
        let startStunde = parseInt(startzeit.split(':')[0]);
        let endStunde = startStunde + Math.ceil(dauer);
        if (endStunde > 24) endStunde = 24;
        for (let i = startStunde; i < endStunde; i++) {
          stunden[i % 24].total += watt / 1000;
          stunden[i % 24].verbraucher.push(verbraucher);
        }
      });
    }
  });
  return stunden;
};

// Home Component
export default function Home() {
  const [strompreis, setStrompreis] = useState(0.31);
  const [plz, setPlz] = useState('');
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => {
      let startzeit, endzeit, dauer, nutzung, batterieKapazitaet, wallboxLeistung, standardLadung;
      switch (key.toLowerCase()) {
        case 'waschmaschine':
          startzeit = '09:00'; // Vormittag
          endzeit = '12:00';
          dauer = 3.0;
          nutzung = 2;
          break;
        case 'trockner':
          startzeit = '14:00'; // Nachmittag
          endzeit = '16:00';
          dauer = 2.0;
          nutzung = 2;
          break;
        case 'geschirrspüler':
          startzeit = '18:00'; // Abend
          endzeit = '21:00';
          dauer = 3.0;
          nutzung = 7;
          break;
        case 'herd':
          startzeit = '12:00'; // Mittag
          endzeit = '14:00';
          dauer = 2.0;
          nutzung = 3;
          break;
        case 'multimedia':
          startzeit = '18:00'; // Abend
          endzeit = '21:00';
          dauer = 3.0;
          nutzung = 3;
          break;
        case 'licht':
          startzeit = '18:00'; // Abend
          endzeit = '21:00';
          dauer = 3.0;
          nutzung = 3;
          break;
        case 'eauto':
          startzeit = '21:00'; // Spätabend
          endzeit = '00:00';
          dauer = 3.0;
          nutzung = 3;
          batterieKapazitaet = 60;
          wallboxLeistung = 11000;
          standardLadung = false;
          break;
        case 'zweiteseauto':
          startzeit = '00:00'; // Nachts 1
          endzeit = '03:00';
          dauer = 3.0;
          nutzung = 2;
          batterieKapazitaet = 40;
          wallboxLeistung = 7400;
          standardLadung = false;
          break;
        default:
          startzeit = '06:00'; // Früh
          endzeit = '09:00';
          dauer = 0;
          nutzung = 0;
      }
      return {
        ...acc,
        [key]: {
          nutzung,
          zeitraeume: [{ id: Date.now() + Math.random(), startzeit, endzeit, dauer }],
          ...(key.toLowerCase() === 'eauto' || key.toLowerCase() === 'zweiteseauto'
            ? { batterieKapazitaet, wallboxLeistung, standardLadung }
            : {}),
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
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  const [menus, setMenus] = useState([
    {
      id: 'stromerzeuger',
      label: 'Stromerzeuger',
      options: [
        { name: 'Photovoltaik', specifications: 'Leistung: 5-20 kWp, Effizienz: ~20%, Lebensdauer: ~25 Jahre' },
        { name: 'Windrad', specifications: 'Leistung: 2-10 kW, Windgeschwindigkeit: 3-25 m/s' },
        { name: 'Sonstige', specifications: 'Individuelle Stromerzeugung, z.B. Wasserkraft' },
      ],
    },
    {
      id: 'grundlastverbraucher',
      label: 'Grundlastverbraucher',
      options: [
        { name: 'Kühlschrank', specifications: 'Leistung: 100-200 W, Energieeffizienz: A+++, Betrieb: 24/7' },
        { name: 'Gefrierschrank', specifications: 'Leistung: 150-300 W, Energieeffizienz: A++, Betrieb: 24/7' },
        { name: 'Aquarium', specifications: 'Leistung: 50 W, Betrieb: 24/7' },
      ],
    },
    {
      id: 'dynamischeverbraucher',
      label: 'Dynamische Verbraucher',
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
        { name: 'EAuto', specifications: 'Leistung: 11 kW, Betrieb: variabel, z.B. Laden über Wallbox' },
        { name: 'ZweitesEAuto', specifications: 'Leistung: 7.4 kW, Betrieb: variabel, z.B. langsamere Wallbox' },
      ],
    },
    {
      id: 'strompeicher',
      label: 'Strompeicher',
      options: [
        { name: 'Lithium-Ionen', specifications: 'Leistung: 500 W, Kapazität: 5 kWh' },
        { name: 'Blei-Säure', specifications: 'Leistung: 300 W, Kapazität: 3 kWh' },
      ],
    },
  ]);

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

  const onCheckboxChange = (verbraucher, checked, menuId) => {
    const watt = checked ? standardVerbrauch[verbraucher] || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt, checked },
    }));
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (checked) {
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, erweiterteEinstellungen);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
      } else {
        updateKosten(watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen);
      }
    } else {
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: 0 },
      }));
    }
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const handleWattChange = (verbraucher, value) => {
    const watt = parseFloat(value) || 0;
    if (watt < 0) {
      setError(`Wattleistung für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt },
    }));
    setError('');
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
    } else {
      updateKosten(watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen);
    }
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  
    const handleErweiterteEinstellungChange = (verbraucher, field, value, zeitraumId) => {
      const parsedValue = field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung'
        ? parseFloat(value) || 0
        : field === 'standardLadung'
        ? value === 'true'
        : value;
      if ((field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung') && parsedValue < 0) {
        setError(`Wert für ${field} bei ${verbraucher} darf nicht negativ sein.`);
        return;
      }
      if (field === 'dauer') {
        const zeitraum = erweiterteEinstellungen[verbraucher].zeitraeume.find(z => z.id === zeitraumId);
        const period = timePeriods.find(p => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit);
        if (period) {
          const [startHour, startMin] = period.startzeit.split(':').map(Number);
          const [endHour, endMin] = period.endzeit.split(':').map(Number);
          const periodHours = (endHour + endMin / 60) - (startHour + startMin / 60);
          if (parsedValue > periodHours) {
            setError(`Dauer für ${verbraucher} darf ${periodHours} Stunden nicht überschreiten.`);
            return;
          }
        }
      }
      setErweiterteEinstellungen((prev) => ({
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
      }));
      setError('');
      const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
        updateZusammenfassung(verbraucherDaten, setZusammenfassung);
      }
    };

  const handleTimePeriodChange = (verbraucher, periodLabel, zeitraumId) => {
    const periodIndex = timePeriods.findIndex((p, index) => p.label === periodLabel && index === timePeriods.findIndex(q => q.label === periodLabel && q.startzeit === p.startzeit));
    const period = timePeriods[periodIndex];
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
      const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
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
          dauer: prev[verbraucher].zeitraeume[0].dauer || 0,
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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung(verbraucherDaten, setZusammenfassung);
    }
  };

  const handleStrompreisChange = (value) => {
    const newStrompreis = parseFloat(value) || 0;
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        if (isDynamisch(verbraucher)) {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher, newStrompreis, erweiterteEinstellungen);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher, newStrompreis, setVerbraucherDaten, erweiterteEinstellungen);
        }
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const isDynamisch = (verbraucher) => ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());

  const handleNewOptionName = (menuId, value) => {
    setNewOptionNames((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionWatt = (menuId, value) => {
    setNewOptionWatt((prev) => ({ ...prev, [menuId]: value }));
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
    if (name && !isNaN(watt) && watt > 0) {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? { ...menu, options: [...menu.options, { name, specifications: `Leistung: ${watt} W` }] }
            : menu
        )
      );
      if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher' || menuId === 'eauto') {
        standardVerbrauch[name] = watt;
        setVerbraucherDaten((prev) => ({
          ...prev,
          [name]: { watt: 0, checked: false, kosten: 0 },
        }));
        setErweiterteEinstellungen((prev) => ({
          ...prev,
          [name]: {
            nutzung: 0,
            zeitraeume: [{ id: Date.now() + Math.random(), startzeit: '06:00', endzeit: '08:00', dauer: 0 }],
            ...(menuId === 'eauto' ? { batterieKapazitaet: 40, wallboxLeistung: watt, standardLadung: false } : {}),
          },
        }));
        verbraucherBeschreibungen[name] = `Benutzerdefinierter Verbraucher mit ${watt} W.`;
      }
      setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionWatt((prev) => ({ ...prev, [menuId]: '' }));
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

  useEffect(() => {
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  }, [verbraucherDaten, erweiterteEinstellungen]);

  // Chart data for hourly consumption (kW) and dynamic price
  const hourlyData = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);
  const selectedIndex = apiData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });
  const labelsAll = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const rawValuesAll = selectedIndex !== -1 ? apiData[selectedIndex]?.__parsed_extra?.slice(0, 24) : [];
  const chartDataApi = labelsAll
    .map((label, i) => ({ label: label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartConvertedValues = chartDataApi.map((entry) => 
    typeof entry.value === 'number' ? entry.value * 0.1 / 100 : parseFloat(entry.value) * 0.1 / 100 || strompreis
  );

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
        label: `Dynamischer Preis am ${selectedDate || 'N/A'} (€/kWh)`,
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
              return `Preis: ${context.raw.toFixed(2)} €/kWh`;
            }
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `Verbrauch: ${context.raw} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
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
        title: { display: true, text: 'Preis (€/kWh)', color: '#333' },
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
        label: `Ersparnis (Dynamischer Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d, i) => {
          const price = chartConvertedValues[i] != null ? chartConvertedValues[i] : strompreis;
          return (d.total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#062316',
        backgroundColor: '#062316',
        tension: 0.1,
      },
      {
        label: `Ersparnis (Fester Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d) => (d.total * strompreis).toFixed(2)),
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
        font: { size: 11.2 } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const datasetLabel = context.dataset.label;
            const isDynamic = datasetLabel.includes('Dynamischer Tarif');
            const price = isDynamic ? (chartConvertedValues[index] != null ? chartConvertedValues[index] : strompreis) : strompreis;
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `${datasetLabel.split(' am')[0]}: ${context.raw} €\nPreis: ${(price * 100).toFixed(2)} ct/kWh\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Ersparnis (€)', color: '#333' }, 
        ticks: { color: '#333' } 
      },
      x: { 
        title: { display: true, text: 'Uhrzeit', color: '#333' }, 
        ticks: { color: '#333' } 
      },
    },
  };

  return (
    <>
      <style>{`
/* CSS Reset for consistent rendering across browsers */
* {
/* CSS Reset for consistent rendering across browsers */
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
  scrollbar-color: #409966 #e5e7eb;
}

.calculation-report::-webkit-scrollbar {
  width: 8px;
}

.calculation-report::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

.calculation-report::-webkit-scrollbar-thumb {
  background: #409966;
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
  scrollbar-color: #409966 #e5e7eb;
}

.diagrams-container::-webkit-scrollbar {
  width: 8px;
}

.diagrams-container::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

.diagrams-container::-webkit-scrollbar-thumb {
  background: #409966;
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
  background: linear-gradient(90deg, #062316, #409966);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  color: #ffffff;
  transition: background 0.3s ease;
}

.menu-header:hover {
  background: linear-gradient(90deg, #062316, #409966);
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
  color: #409966;
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
  border-color: #409966;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.3); /* Kleinere Schattengröße */
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
  color: #409966;
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
  accent-color: #409966;
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
  background: #409966;
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
  border-color: #409966;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2);
}

.price-display {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  text-align: right;
}

.settings-field {
  background: linear-gradient(90deg, #062316, #409966);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.settings-field:hover {
  background: linear-gradient(90deg, #062316, #4caf50);
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
  color: #409966;
}

.settings-container h5 {
  font-size: 1rem; /* Kleinere Schrift */
  font-weight: 600;
  color: #409966;
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
  border-color: #409966;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.3); /* Kleinere Schattengröße */
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
  accent-color: #409966;
  cursor: pointer;
}

.zeitraum-section {
  border-top: 1px solid #e5e7eb; /* Dünnerer Rand */
  padding-top: 10px; /* Reduzierter Abstand */
  margin-top: 10px; /* Reduzierter Abstand */
}

.add-option-button {
  background: linear-gradient(90deg, #062316, #409966);
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
  background: linear-gradient(90deg, #062316, #409966);
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
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.3); /* Kleinere Schattengröße */
}

.save-option-button {
  background: linear-gradient(90deg, #062316, #409966);
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
  background: linear-gradient(90deg, #062316, #409966);
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
  color: #409966;
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
  color: #409966;
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
} `
}</style>
      <div className="app-container">
        <div className="calculation-report">
          <h2 className="report-title">Rechenbericht</h2>
          <div className="report-content">
            <div className="input-container-html">
              <label htmlFor="strompreis">Strompreis (Cent/kWh):</label>
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
              <label htmlFor="plz">Postleitzahl:</label>
              <input
                type="text"
                id="plz"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="z.B. 10115"
              />
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
                        <span>Watt</span>
                        <span>Kosten</span>
                        {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && <span></span>}
                      </li>
                      {menu.options.map((option) => (
                        <li key={option.name}>
                          <label className="checkbox-group-label">
                            <input
                              type="checkbox"
                              checked={verbraucherDaten[option.name]?.checked || false}
                              onChange={(e) => onCheckboxChange(option.name, e.target.checked, menu.id)}
                            />
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
                          {deleteConfirmOption?.menuId === menu.id && deleteConfirmOption?.optionName === option.name && (
                            <div className="confirm-dialog">
                              <span>{`Möchten Sie "${option.name}" wirklich löschen?`}</span>
                              <button
                                className="confirm-button"
                                onClick={() => confirmDeleteOption(menu.id, option.name)}
                              >
                                Ja
                              </button>
                              <button
                                className="cancel-button"
                                onClick={cancelDeleteOption}
                              >
                                Nein
                              </button>
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
                                        value={erweiterteEinstellungen[option.name].batterieKapazitaet}
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
                                        value={erweiterteEinstellungen[option.name].wallboxLeistung}
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
                                        value={erweiterteEinstellungen[option.name].nutzung}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                        min="0"
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
                                            checked={erweiterteEinstellungen[option.name].standardLadung === true}
                                            onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                          />
                                          Ja
                                        </label>
                                        <label>
                                          <input
                                            type="radio"
                                            name={`standardLadung-${option.name}`}
                                            value={false}
                                            checked={erweiterteEinstellungen[option.name].standardLadung === false}
                                            onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                          />
                                          Nein
                                        </label>
                                      </div>
                                    </label>
                                  </div>
                                  {!erweiterteEinstellungen[option.name].standardLadung && (
                                    <div className="zeitraum-section">
                                      <h5>Zeiträume</h5>
                                      {erweiterteEinstellungen[option.name].zeitraeume.map((zeitraum, index) => (
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
                                              className="settings-input"
                                              value={zeitraum.dauer}
                                              onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                              min="0"
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
                                        className="settings-input"
                                        value={erweiterteEinstellungen[option.name].nutzung}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                        min="0"
                                        step="1"
                                      />
                                    </label>
                                  </div>
                                  <div className="zeitraum-section">
                                    <h5>Zeiträume</h5>
                                    {erweiterteEinstellungen[option.name].zeitraeume.map((zeitraum, index) => (
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
              <h3 className="summary-title">Zusammenfassung</h3>
              <div className="summary-item">Grundlast Ersparnis: {zusammenfassung.grundlast} €</div>
              <div className="summary-item">Dynamische Ersparnis: {zusammenfassung.dynamisch} €</div>
              <div className="summary-item">Gesamtersparnis: {zusammenfassung.gesamt} €</div>
              <div className="summary-item">Gesamtwattage: {zusammenfassung.totalWattage} W</div>
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
      </div>
    </>
  );
}