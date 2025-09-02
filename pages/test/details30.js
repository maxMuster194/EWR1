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
  Kühlschrank: 120,
  Gefrierschrank: 200,
  Aquarium: 50,
  Waschmaschine: 1200,
  Geschirrspüler: 600,
  Trockner: 3500,
  Herd: 700,
  Multimedia: 350,
  Licht: 175,
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
];

// Neue Struktur für Verbrauchertypen (grundlast, week, day, auto)
const verbraucherTypes = {
  Kühlschrank: 'grundlast',
  Gefrierschrank: 'grundlast',
  Aquarium: 'grundlast',
  Waschmaschine: 'week',
  Geschirrspüler: 'week',
  Trockner: 'week',
  Herd: 'day',
  Multimedia: 'day',
  Licht: 'day',
  EAuto: 'auto',
  ZweitesEAuto: 'auto',
};

// Functions
const getRegionPreis = (selectedRegion) => {
  if (selectedRegion === 'KF') return 0.10;
  if (selectedRegion === 'MN') return 0.17;
  if (selectedRegion === 'MOD') return 0.20;
  return 0;
};

const getPreisDifferenz = (strompreis, selectedRegion) => {
  const regionPreis = getRegionPreis(selectedRegion);
  return (strompreis - regionPreis).toFixed(2);
};

const updateKosten = (watt, verbraucher, strompreis, selectedRegion, setVerbraucherDaten, erweiterteEinstellungen) => {
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
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
      kosten = (batterieKapazitaet * nutzung * 52) / 1000 * preisDifferenz;
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
  const preisDifferenz = parseFloat(getPreisDifferenz(strompreis, selectedRegion));
  const einstellung = erweiterteEinstellungen[verbraucher] || {};
  if (!einstellung.zeitraeume || einstellung.zeitraeume.length === 0 || watt === 0) return 0;
  let totalDauer = einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  if (totalDauer === 0) return 0;
  let kosten = 0;
  const batterieKapazitaet = einstellung.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung.wallboxLeistung || watt;
  const standardLadung = einstellung.standardLadung || false;
  const type = verbraucherTypes[verbraucher] || 'grundlast';

  if (type === 'week') {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
  } else if (type === 'auto') {
    if (standardLadung) {
      kosten = (batterieKapazitaet * einstellung.nutzung * 52) / 1000 * preisDifferenz;
    } else {
      kosten = (wallboxLeistung * totalDauer * einstellung.nutzung * 52) / 1000 * preisDifferenz;
    }
  } else if (type === 'day') {
    kosten = (watt * totalDauer * einstellung.nutzung * 365) / 1000 * preisDifferenz;
  }

  return kosten < 0 ? 0 : kosten;
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
    const einstellung = erweiterteEinstellungen[verbraucher] || {};
    const type = verbraucherTypes[verbraucher] || 'grundlast';
    const watt = (type === 'auto' && einstellung.standardLadung)
      ? (einstellung.batterieKapazitaet || 0) / (einstellung.zeitraeume?.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 1)
      : verbraucherDaten[verbraucher]?.watt || 0;
    if (watt <= 0) return;
    const isGrundlast = type === 'grundlast';
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i].total += watt / 1000;
        stunden[i].verbraucher.push(verbraucher);
      }
    } else {
      einstellung.zeitraeume?.forEach(zeitraum => {
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
export default function StromverbrauchRechnerMobile(){
  const [strompreis, setStrompreis] = useState(0.31);
  const [selectedRegion, setSelectedRegion] = useState(null);
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

  // Temporäres Speichern in localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setVerbraucherDaten(parsed.verbraucherDaten || verbraucherDaten);
      setErweiterteEinstellungen(parsed.erweiterteEinstellungen || erweiterteEinstellungen);
      Object.assign(verbraucherTypes, parsed.verbraucherTypes || {});
      Object.assign(standardVerbrauch, parsed.standardVerbrauch || {});
      Object.assign(verbraucherBeschreibungen, parsed.verbraucherBeschreibungen || {});
      updateZusammenfassung(parsed.verbraucherDaten || verbraucherDaten, setZusammenfassung);
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
    setVerbraucherDaten((prev) => {
      const watt = checked ? standardVerbrauch[verbraucher] || 0 : 0;
      const type = verbraucherTypes[verbraucher] || 'grundlast';
      let kosten = 0;

      if (checked) {
        if (type !== 'grundlast') {
          kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        } else {
          kosten = (watt * parseFloat(getPreisDifferenz(strompreis, selectedRegion)) * 24 * 365) / 1000;
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
        if (type !== 'grundlast') {
          kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, selectedRegion, erweiterteEinstellungen);
        } else {
          kosten = (watt * parseFloat(getPreisDifferenz(strompreis, selectedRegion)) * 24 * 365) / 1000;
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
      const zeitraum = erweiterteEinstellungen[verbraucher]?.zeitraeume.find(z => z.id === zeitraumId);
      const period = timePeriods.find(p => p.startzeit === zeitraum?.startzeit && p.endzeit === zeitraum?.endzeit);
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
    const newStrompreis = parseFloat(value) || 0.31;
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
    doc.text(`Strompreis: ${strompreis} €/kWh`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Region: ${selectedRegion || 'Keine ausgewählt'}`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Berechneter Preis: ${getPreisDifferenz(strompreis, selectedRegion)} €/kWh`, 15, yPosition);
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
    doc.text(`Grundlast Ersparnis: ${zusammenfassung.grundlast} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Dynamische Ersparnis: ${zusammenfassung.dynamisch} €`, 15, yPosition);
    yPosition += lineHeight;
    addNewPageIfNeeded();
    doc.text(`Gesamtersparnis: ${zusammenfassung.gesamt} €`, 15, yPosition);
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
    typeof entry.value === 'number' ? entry.value * 0.1 / 100 : parseFloat(entry.value) * 0.1 / 100 || strompreis
  );

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Verbrauch (kW)',
        data: hourlyData.map(d => d.total),
        fill: false,
        borderColor: '#2ecc71',
        backgroundColor: '#2ecc71',
        tension: 0.1,
        yAxisID: 'y',
        pointRadius: 1.5,
        borderWidth: 1.5
      },
      {
        label: `Preis am ${selectedDate || 'N/A'} (€/kWh)`,
        data: chartConvertedValues,
        fill: false,
        borderColor: '#1a3c34',
        backgroundColor: '#1a3c34',
        tension: 0.1,
        yAxisID: 'y1',
        pointRadius: 1.5,
        borderWidth: 1.5
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: { size: 8 },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Verbrauch & Preis',
        color: '#333',
        font: { size: 10 }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        bodyFont: { size: 8 },
        titleFont: { size: 9 },
        padding: 6,
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            if (context.dataset.label.includes('Preis')) {
              return `Preis: ${context.raw.toFixed(2)} €/kWh`;
            }
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `Verbrauch: ${context.raw.toFixed(2)} kW\nVerbraucher: ${verbraucherList || 'Keine'}`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad'
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kW',
          color: '#333',
          font: { size: 8 }
        },
        ticks: {
          color: '#333',
          font: { size: 7 },
          stepSize: 0.5
        },
        position: 'left',
        grid: { lineWidth: 0.5 }
      },
      y1: {
        beginAtZero: true,
        title: {
          display: true,
          text: '€/kWh',
          color: '#333',
          font: { size: 8 }
        },
        ticks: {
          color: '#333',
          font: { size: 7 },
          stepSize: 0.1
        },
        position: 'right',
        grid: { drawOnChartArea: false }
      },
      x: {
        title: {
          display: true,
          text: 'Uhrzeit',
          color: '#333',
          font: { size: 8 }
        },
        ticks: {
          color: '#333',
          font: { size: 7 },
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 12
        },
        grid: { lineWidth: 0.5 }
      }
    }
  };



  const chartDataKosten = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: `Ersparnis (Dynamischer Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((_, index) => {
          const price = chartConvertedValues[index] != null ? chartConvertedValues[index] : parseFloat(getPreisDifferenz(strompreis, selectedRegion));
          return (hourlyData[index].total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#062316',
        backgroundColor: '#062316',
        tension: 0.1,
      },
      {
        label: `Ersparnis (Fester Tarif) am ${selectedDate || 'N/A'} (€)`,
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
        font: { size: 11.2 } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const datasetLabel = context.dataset.label;
            const isDynamic = datasetLabel.includes('Dynamischer Tarif');
            const price = isDynamic ? (chartConvertedValues[index] != null ? chartConvertedValues[index] : parseFloat(getPreisDifferenz(strompreis, selectedRegion))) : parseFloat(getPreisDifferenz(strompreis, selectedRegion));
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
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Container für die gesamte App */
  .app-container {
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    min-height: 100vh;
  }
  
  /* Fixierter Chart-Bereich */
  .fixed-chart {
    position: sticky;
    top: 95px;
    z-index: 10;
    background: #ffffff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  
  /* Chart-Container */
  .chart-container {
    height: 250px;
  }
  
  /* Container für die Zeitraumauswahl */
  .date-picker-container {
    background: #ffffff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  
  /* Container für den Rechenbericht */
  .calculation-report {
    background: #ffffff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex: 1;
  }
  
  /* Titel des Rechenberichts */
  .report-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #409966;
  }
  
  /* Inhalt des Rechenberichts */
  .report-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  /* Eingabefelder */
  .input-container-html {
    display: flex;
    flex-direction: column;
  }
  
  .input-container-html label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .input-container-html input,
  .input-container-html select {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    width: 100%;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .input-container-html input:focus,
  .input-container-html select:focus {
    outline: none;
    border-color: #409966;
    box-shadow: 0 0 0 2px rgba(64, 153, 102, 0.3);
  }
  
  /* Region-Buttons */
  .region-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
    padding: 6px;
  }
  
  .region-switch-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 60px;
  }
  
  .region-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 4px;
    transition: color 0.2s ease;
  }
  
  .discount-switch-container {
    position: relative;
    width: 36px;
    height: 20px;
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
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.2s ease;
  }
  
  .discount-switch-slider:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
  }
  
  .discount-switch-input:checked + .discount-switch-slider {
    background-color: #047857;
  }
  
  .discount-switch-input:checked + .discount-switch-slider:before {
    transform: translateX(16px);
  }
  
  .discount-switch-input:focus + .discount-switch-slider {
    box-shadow: 0 0 0 2px rgba(4, 120, 87, 0.2);
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
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  
  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    background: linear-gradient(90deg, #062316, #409966);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: #ffffff;
  }
  
  .menu-header span {
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .triangle {
    transition: transform 0.3s ease;
  }
  
  .triangle.open {
    transform: rotate(180deg);
  }
  
  .menu-content {
    padding: 10px;
    background: #ffffff;
    border-radius: 0 0 8px 8px;
  }
  
  /* Checkbox-Gruppe */
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .checkbox-group-header {
    display: grid;
    grid-template-columns: 40px 2fr 60px 80px 80px 40px; /* Icon, Info, Aktiv, Leistung, Ersparnis, Löschen */
    gap: 8px;
    font-weight: 600;
    font-size: 0.75rem;
    color: #409966;
    padding: 8px 0;
    background: #f0f4f8;
    border-radius: 4px;
    text-align: center;
  }
  
  .checkbox-group li {
    display: grid;
    grid-template-columns: 40px 2fr 60px 80px 80px 40px; /* Passend zur neuen Header-Anordnung */
    gap: 8px;
    align-items: center;
    padding: 8px 0;
    background: #ffffff;
    border-radius: 4px;
    font-size: 0.75rem;
    position: relative;
  }
  
  .checkbox-group li:hover {
    background: #f9fafb;
  }
  
  .icon-field {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .icon-field img {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .info-field {
    position: relative;
    display: flex;
    justify-content: left;
    align-items: center;
    font-weight: 500;
  }
  
  .info-field .tooltip {
    display: inline-block;
    font-size: 0.75rem;
    color: #1f2937;
  }
  
  .info-field .tooltip-text {
    visibility: hidden;
    position: absolute;
    background: #409966;
    color: #ffffff;
    font-size: 0.7rem;
    padding: 3px 5px;
    border-radius: 3px;
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
    width: 14px;
    height: 14px;
    accent-color: #409966;
    cursor: pointer;
  }
  
  .input-group {
    display: flex;
    justify-content: center;
  }
  
  .input-group input.watt-input {
    padding: 4px 6px;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    font-size: 0.75rem;
    width: 100%;
    text-align: center;
  }
  
  .input-group input.watt-input:focus {
    outline: none;
    border-color: #409966;
    box-shadow: 0 0 0 2px rgba(64, 153, 102, 0.2);
  }
  
  .price-display {
    font-size: 0.75rem;
    font-weight: 500;
    color: #1f2937;
    text-align: center;
  }
  
  .delete-option-button {
    background: #dc2626;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    transition: background-color 0.2s ease;
  }
  
  .delete-option-button:hover {
    background: #b91c1c;
  }
  
  .delete-option-button i {
    font-size: 0.75rem;
  }
  
  .confirm-dialog {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #fef9c3, #fef08a);
    padding: 6px;
    border-radius: 4px;
    margin-top: 4px;
    display: flex;
    gap: 6px;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    padding: 3px 6px;
    border-radius: 3px;
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
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    border: none;
    cursor: pointer;
  }
  
  .cancel-button:hover {
    background: linear-gradient(90deg, #6b7280, #9ca3af);
  }
  
  .settings-container {
    grid-column: 1 / -1;
    background: #ffffff;
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .settings-container h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #409966;
  }
  
  .settings-container h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #409966;
    margin-bottom: 8px;
  }
  
  .settings-container .grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .settings-container label {
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .settings-container select {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.75rem;
    width: 100%;
  }
  
  .settings-container select:focus {
    outline: none;
    border-color: #409966;
    box-shadow: 0 0 0 2px rgba(64, 153, 102, 0.2);
  }
  
  .radio-group-settings {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  
  .radio-group-settings label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .radio-group-settings input {
    width: 14px;
    height: 14px;
    accent-color: #409966;
    cursor: pointer;
  }
  
  .zeitraum-section {
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
    margin-top: 8px;
  }
  
  .add-option-button {
    background: linear-gradient(90deg, #062316, #409966);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    margin-top: 8px;
  }
  
  .add-option-button:hover {
    background: linear-gradient(90deg, #062316, #4caf50);
  }
  
  .new-option-container {
    margin-top: 8px;
    padding: 10px;
    background: linear-gradient(135deg, #f9fafb, #e5e7eb);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .new-option-input,
  .new-option-watt {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.75rem;
    width: 100%;
  }
  
  .new-option-input:focus,
  .new-option-watt:focus {
    outline: none;
    border-color: #062316;
    box-shadow: 0 0 0 2px rgba(64, 153, 102, 0.2);
  }
  
  .save-option-button {
    background: linear-gradient(90deg, #062316, #409966);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .modal-content {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }
  
  .close-modal-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #1f2937;
  }
  
  .close-modal-button:hover {
    color: #dc2626;
  }
  
  .modal-content h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #409966;
  }
  
  .modal-content p {
    font-size: 0.875rem;
    color: #1f2937;
  }
  
  .modal-content input {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    width: 100%;
  }
  
  .modal-content input:focus {
    outline: none;
    border-color: #409966;
    box-shadow: 0 0 0 2px rgba(64, 153, 102, 0.2);
  }
  
  .modal-content label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: #1f2937;
  }
  
  .modal-content input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: #409966;
  }
  
  /* Neues Layout für dynamische Verbraucher */
  .dynamic-consumer-layout {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  
  .dynamic-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
    background: #f0f4f8;
  }
  
  .bar-label {
    font-weight: 600;
    color: #1f2937;
    min-width: 100px;
  }
  
  .bar-input {
    flex: 1;
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }
  
  .bar-color-black {
    background: #000000;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .bar-color-gray {
    background: #808080;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .bar-color-blue {
    background: #0000ff;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .bar-color-red {
    background: #ff0000;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .bar-color-green {
    background: #008000;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  /* Eingaben-Wrapper für Strompreis und Datum */
  .inputs-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  @media (min-width: 769px) {
    .inputs-wrapper {
      flex-direction: row;
      gap: 16px;
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
  
  
  
  
  /* Bestehende Stile bleiben unverändert, nur die Media Query wird angepasst */
  @media (max-width: 768px) {
    html {
      font-size: 9px; /* Kleinere Basis-Schriftgröße für Handydisplays */
    }
  
    .app-container {
      padding: 4px; /* Kleineres Padding */
      gap: 4px; /* Kleinerer Abstand zwischen Elementen */
    }
  
    .fixed-chart {
      position: sticky; /* Sticky bleibt aktiv, um den Chart oben zu halten */
      top: 0;
      padding: 4px; /* Kleineres Padding */
      margin-bottom: 4px;
      z-index: 10;
    }
  
    .chart-container {
      height: 150px; /* Kleinere Chart-Höhe */
    }
  
    /* Region-Buttons direkt unter dem Chart */
    .region-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px; /* Etwas größere Lücke für bessere Optik */
      justify-content: center;
      align-items: center;
      margin: 4px 0; /* Kleinerer Margin */
      padding: 4px;
      background: #ffffff; /* Wie Desktop, für Konsistenz */
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); /* Leichter Schatten wie Desktop */
    }
  
    .region-switch-wrapper {
      min-width: 40px; /* Etwas größer für bessere Bedienbarkeit */
    }
  
    .region-label {
      font-size: 0.7rem; /* Etwas größere Schrift für Lesbarkeit */
    }
  
    .discount-switch-container {
      width: 28px; /* Etwas größer für bessere Bedienbarkeit */
      height: 14px;
    }
  
    .discount-switch-slider:before {
      height: 10px;
      width: 10px;
      left: 2px;
      bottom: 2px;
    }
  
    .discount-switch-input:checked + .discount-switch-slider:before {
      transform: translateX(14px);
    }
  
    /* Hover-Effekt wie in der Desktop-Ansicht */
    .region-switch-wrapper:hover .region-label {
      color: #047857;
    }
  
    .discount-switch-slider:hover {
      background-color: #9ca3af;
    }
  
    .discount-switch-input:checked + .discount-switch-slider:hover {
      background-color: #065f46;
    }
  
    /* Kompakte Datums-Box */
    .date-picker-container {
      padding: 0; /* Kleineres Padding für kompaktere Box */
      margin-bottom: 0;
      box-shadow: none; /* Leichterer Schatten */
      max-width: none; /* Begrenzte Breite, damit es nicht die ganze Seite einnimmt */
      margin-left: 0;
      margin-right: 0; /* Zentriert die Box */
      background: transparent;
    }
  
    .date-picker-container input,
    .date-picker-container select {
      padding: 4px; /* Kompakteres Padding */
      font-size: 0.65rem; /* Etwas größere Schrift für Lesbarkeit */
      width: 100%; /* Passt sich der Container-Breite an */
      max-width: none; /* Maximale Breite für das Eingabefeld */
    }
  
    /* Kompakte Strompreis-Box */
    .input-container-html {
      max-width: none; /* Begrenzte Breite, damit es nicht die ganze Seite einnimmt */
      margin-left: 0;
      margin-right: 0; /* Zentriert die Box */
      padding: 0; /* Kleineres Padding */
    }
  
    .input-container-html label {
      font-size: 0.65rem; /* Etwas größere Schrift für Lesbarkeit */
      margin-bottom: 2px;
    }
  
    .input-container-html input,
    .input-container-html select {
      padding: 4px; /* Kompakteres Padding */
      font-size: 0.65rem;
      width: 100%; /* Passt sich der Container-Breite an */
      max-width: none;
      border-radius: 3px;
    }
  
    /* Eingaben-Wrapper für Mobile: Neben- statt untereinander */
    .inputs-wrapper {
      display: flex;
      flex-direction: row;
      gap: 8px;
      justify-content: space-between;
      align-items: stretch;
      background: #ffffff;
      padding: 6px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 4px;
    }
  
    .inputs-wrapper > div {
      flex: 1;
    }
  
    /* Menüs mit etwas größerer Schrift */
    .menu {
      margin-bottom: 4px;
    }
  
    .menu-header {
      padding: 6px; /* Etwas mehr Padding für bessere Optik */
    }
  
    .menu-header span {
      font-size: 0.75rem; /* Etwas größere Schrift */
    }
  
    .menu-content {
      padding: 6px;
      font-size: 0.7rem; /* Etwas größere Schrift für Lesbarkeit */
    }
  
    /* Checkbox-Gruppe */
    .checkbox-group {
      gap: 4px;
    }
  
    .checkbox-group-header {
      font-size: 0.65rem; /* Etwas größere Schrift */
      padding: 4px 0;
      gap: 4px;
      grid-template-columns: 25px 1fr 40px 50px 50px 25px;
    }
  
    .checkbox-group li {
      font-size: 0.65rem;
      padding: 4px 0;
      gap: 4px;
      grid-template-columns: 25px 1fr 40px 50px 50px 25px;
    }
  
    .icon-field img {
      width: 16px;
      height: 16px;
    }
  
    .info-field .tooltip {
      font-size: 0.65rem;
    }
  
    .info-field .tooltip-text {
      font-size: 0.6rem;
      padding: 2px 3px;
    }
  
    .checkbox-group-label input {
      width: 10px;
      height: 10px;
    }
  
    .input-group input.watt-input {
      padding: 3px 4px;
      font-size: 0.65rem;
    }
  
    .price-display {
      font-size: 0.65rem;
    }
  
    .delete-option-button {
      width: 16px;
      height: 16px;
      padding: 3px;
    }
  
    .delete-option-button i {
      font-size: 0.65rem;
    }
  
    /* Dynamische Verbraucher */
    .dynamic-consumer-layout {
      gap: 4px;
      margin-top: 6px;
    }
  
    .dynamic-bar {
      padding: 4px;
      gap: 4px;
    }
  
    .bar-label {
      min-width: 60px;
      font-size: 0.65rem;
    }
  
    .bar-input {
      padding: 4px;
      font-size: 0.65rem;
    }
  
    .bar-color-black,
    .bar-color-gray,
    .bar-color-blue,
    .bar-color-red,
    .bar-color-green {
      padding: 3px 6px;
      font-size: 0.65rem;
    }
  
    /* Weitere Elemente */
    .confirm-dialog {
      font-size: 0.65rem;
      padding: 3px;
      gap: 3px;
    }
  
    .confirm-button,
    .cancel-button {
      padding: 3px 4px;
      font-size: 0.65rem;
    }
  
    .settings-container {
      padding: 6px;
      margin-top: 4px;
      gap: 6px;
    }
  
    .settings-container h4 {
      font-size: 0.75rem;
    }
  
    .settings-container h5 {
      font-size: 0.65rem;
    }
  
    .settings-container label {
      font-size: 0.65rem;
    }
  
    .settings-container select,
    .new-option-input,
    .new-option-watt {
      padding: 4px;
      font-size: 0.65rem;
    }
  
    .add-option-button,
    .save-option-button {
      padding: 3px 6px;
      font-size: 0.65rem;
    }
  
    .modal-content {
      padding: 10px;
      max-width: 280px; /* Etwas größere Modal-Größe für bessere Lesbarkeit */
    }
  
    .modal-content h2 {
      font-size: 0.85rem;
    }
  
    .modal-content p,
    .modal-content input,
    .modal-content label {
      font-size: 0.65rem;
    }
  
    .modal-content input[type="checkbox"] {
      width: 10px;
      height: 10px;
    }
  
    .close-modal-button {
      font-size: 0.95rem;
    }
  
    .dark-mode-toggle {
      padding: 4px 8px;
      font-size: 0.65rem;
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
                  <label htmlFor="date-picker">Datum für dynamische Preise</label>
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
    <div key={menu.id} className="menu">
      <div className="menu-header" onClick={() => toggleMenu(menu.id)}>
        <span>{menu.label}</span>
        <span className={`triangle ${openMenus[menu.id] ? 'open' : ''}`}>&#9660;</span>
      </div>
      {openMenus[menu.id] && (
        <div className="menu-content">
          <ul className="checkbox-group">
            <li className="checkbox-group-header">
              <span>Icon</span>
              <span>Info</span>
              <span>Aktiv</span>
              <span>Leistung (W)</span>
              <span>Kosten (€)</span>
              <span>Löschen</span>
            </li>
            {menu.options.map((option) => (
              <li key={option.name}>
                <div className="icon-field">
                  <img
                    src="/bilder/logo.png" // Platzhalterbild, ersetze durch deinen Bildpfad
                    alt={`${option.name} icon`}
                    style={{ width: '30px', height: '30px' }}
                  />
                </div>
                <div className="info-field">
                  <span className="tooltip">
                    {option.name}
                    <span className="tooltip-text">{verbraucherBeschreibungen[option.name]}</span>
                  </span>
                </div>
                <div className="checkbox-group-label">
                  <input
                    type="checkbox"
                    checked={verbraucherDaten[option.name]?.checked || false}
                    onChange={(e) => onCheckboxChange(option.name, e.target.checked)}
                  />
                </div>
                <div className="input-group">
                  <input
                    className="watt-input"
                    type="number"
                    value={verbraucherDaten[option.name]?.watt || ''}
                    onChange={(e) => handleWattChange(option.name, e.target.value)}
                    disabled={!verbraucherDaten[option.name]?.checked}
                  />
                </div>
                <span className="price-display">{verbraucherDaten[option.name]?.kosten || '0.00'}</span>
                {(menu.id === 'grundlastverbraucher' || menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                  <button
                    className="delete-option-button"
                    onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                  >
                    <i className="fas fa-times">x</i>
                  </button>
                )}
                {deleteConfirmOption?.menuId === menu.id &&
                  deleteConfirmOption?.optionName === option.name && (
                    <div className="confirm-dialog">
                      <span>{`"${option.name}" löschen?`}</span>
                      <button
                        className="confirm-button"
                        onClick={() => confirmDeleteOption(menu.id, option.name)}
                      >
                        Ja
                      </button>
                      <button className="cancel-button" onClick={cancelDeleteOption}>
                        Nein
                      </button>
                    </div>
                  )}
                {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                  <div className="settings-container">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Einstellungen für {option.name}</h4>
                    <div className="combined-settings grid grid-cols-1 gap-4 p-4 bg-white rounded-lg shadow-sm">
                      {menu.id === 'dynamischeverbraucher' && (
                        <div className="dynamic-consumer-layout">
                          <div className="dynamic-bar flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                            <span className="bar-label text-sm font-medium text-gray-700">Nutzung pro Woche</span>
                            <input
                              className="bar-input w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              type="number"
                              value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(
                                  option.name,
                                  'nutzung',
                                  e.target.value,
                                  null
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                      {menu.id === 'eauto' && (
                        <>
                          <label className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Batteriekapazität (kWh)</span>
                            <input
                              type="number"
                              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              value={erweiterteEinstellungen[option.name]?.batterieKapazitaet || ''}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(
                                  option.name,
                                  'batterieKapazitaet',
                                  e.target.value,
                                  null
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Wallbox-Leistung (W)</span>
                            <input
                              type="number"
                              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              value={erweiterteEinstellungen[option.name]?.wallboxLeistung || ''}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(
                                  option.name,
                                  'wallboxLeistung',
                                  e.target.value,
                                  null
                                )
                              }
                            />
                          </label>
                          <div className="radio-group-settings flex flex-col gap-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`ladung-${option.name}`}
                                value="true"
                                checked={erweiterteEinstellungen[option.name]?.standardLadung === true}
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(
                                    option.name,
                                    'standardLadung',
                                    e.target.value,
                                    null
                                  )
                                }
                              />
                              <span className="text-sm text-gray-700">Standardladung</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`ladung-${option.name}`}
                                value="false"
                                checked={erweiterteEinstellungen[option.name]?.standardLadung === false}
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(
                                    option.name,
                                    'standardLadung',
                                    e.target.value,
                                    null
                                  )
                                }
                              />
                              <span className="text-sm text-gray-700">Wallbox-Ladung</span>
                            </label>
                          </div>
                          <label className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Ladehäufigkeit (pro Woche)</span>
                            <input
                              type="number"
                              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              value={erweiterteEinstellungen[option.name]?.nutzung || ''}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(
                                  option.name,
                                  'nutzung',
                                  e.target.value,
                                  null
                                )
                              }
                            />
                          </label>
                        </>
                      )}
                      {/* Zeiträume direkt im gleichen Container ohne separate Überschrift */}
                      {erweiterteEinstellungen[option.name]?.zeitraeume?.map((zeitraum) => (
                        <div
                          key={zeitraum.id}
                          className="zeitraum-section flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <label className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-gray-700">Zeitraum</span>
                            <select
                              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              value={timePeriods.find(
                                (p) => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit
                              )?.label || ''}
                              onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                            >
                              <option value="">Zeitraum wählen</option>
                              {timePeriods.map((period) => (
                                <option key={period.label} value={period.label}>
                                  {period.label} ({period.startzeit} - {period.endzeit})
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-gray-700">Dauer (Stunden)</span>
                            <input
                              type="number"
                              step="0.1"
                              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                              value={zeitraum.dauer || ''}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(
                                  option.name,
                                  'dauer',
                                  e.target.value,
                                  zeitraum.id
                                )
                              }
                            />
                          </label>
                          <button
                            className="delete-option-button mt-2 sm:mt-0 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                            onClick={() => removeZeitraum(option.name, zeitraum.id)}
                          >
                            Zeitraum löschen
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-option-button bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                        onClick={() => addZeitraum(option.name)}
                      >
                        Zeitraum hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {(menu.id === 'grundlastverbraucher' ||
            menu.id === 'dynamischeverbraucher' ||
            menu.id === 'eauto' ||
            menu.id === 'stromerzeuger' ||
            menu.id === 'strompeicher') && (
            <>
              <button
                className="add-option-button"
                onClick={() => toggleNewOptionForm(menu.id)}
              >
                {showNewOptionForm[menu.id]
                  ? 'Formular schließen'
                  : 'Neue Option hinzufügen'}
              </button>
              {showNewOptionForm[menu.id] && (
                <div className="new-option-container">
                  <label className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Name</span>
                    <input
                      className="new-option-input mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={newOptionNames[menu.id] || ''}
                      onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col mt-2">
                    <span className="text-sm font-medium text-gray-700">Leistung (W)</span>
                    <input
                      className="new-option-watt mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      type="number"
                      value={newOptionWatt[menu.id] || ''}
                      onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                    />
                  </label>
                  {(menu.id === 'dynamischeverbraucher') && (
                    <label className="flex flex-col mt-2">
                      <span className="text-sm font-medium text-gray-700">Typ</span>
                      <select
                        className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newOptionTypes[menu.id] || 'week'}
                        onChange={(e) => handleNewOptionType(menu.id, e.target.value)}
                      >
                        <option value="week">Wöchentlich</option>
                        <option value="day">Täglich</option>
                      </select>
                    </label>
                  )}
                  <button
                    className="save-option-button mt-3"
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
              <h2 className="report-title">Zusammenfassung</h2>
              <p>Grundlast Ersparnis: {zusammenfassung.grundlast} €</p>
              <p>Dynamische Ersparnis: {zusammenfassung.dynamisch} €</p>
              <p>Gesamtersparnis: {zusammenfassung.gesamt} €</p>
              <p>Gesamtwattage: {zusammenfassung.totalWattage} W</p>
            </div>
  
            {/* Download-Button */}
            <button className="add-option-button" onClick={handleDownloadClick}>
              Rechenbericht herunterladen
            </button>
  
            {/* Modal für Verifizierung */}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}