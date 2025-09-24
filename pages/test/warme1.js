import { useEffect, useState } from 'react';
import Link from 'next/link';

// Navigationskomponente direkt in der Datei
const NavBar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4 text-white">
        <li>
          <Link href="/grundlast">Grundlast</Link>
        </li>
        <li>
          <Link href="/test/warme1">Wärmepumpe</Link>
        </li>
        <li>
          <Link href="/schaltbare-verbraucher">Schaltbare Verbraucher</Link>
        </li>
      </ul>
    </nav>
  );
};

export default function Waermepumpe() {
  // Zustände für Eingabefelder
  const [power, setPower] = useState(12); // kW
  const [jaz, setJaz] = useState(3.4); // Jahresarbeitszahl
  const [heatingHours, setHeatingHours] = useState(2000); // Heizstunden

  // Feste Preise
  const normalTariffPrice = 0.21; // €/kWh für normalen Tarif (21 Cent)
  const prices = {
    Q1: 0.131, // €/kWh
    Q2: 0.075,
    Q3: 0.089,
    Q4: 0.122,
  };

  // Zustand für Berechnungsergebnisse
  const [results, setResults] = useState({
    totalKwh: 0,
    quarterlyCosts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
    totalDynamicCost: 0,
    totalNormalCost: 0,
  });

  // Berechnung bei Änderung der Eingabewerte
  useEffect(() => {
    // Berechnung der Wärmepumpe
    const totalKwh = jaz !== 0 ? (power / jaz) * heatingHours : 0; // Schutz vor Division durch 0

    // Verteilung der kWh auf die Quartale (für dynamischen Tarif)
    const quarterlyKwh = {
      Q1: totalKwh * 0.4, // 40%
      Q2: totalKwh * 0.15, // 15%
      Q3: totalKwh * 0.05, // 5%
      Q4: totalKwh * 0.4, // 40%
    };

    // Berechnung der Kosten pro Quartal (dynamischer Tarif)
    const quarterlyCosts = {
      Q1: quarterlyKwh.Q1 * prices.Q1,
      Q2: quarterlyKwh.Q2 * prices.Q2,
      Q3: quarterlyKwh.Q3 * prices.Q3,
      Q4: quarterlyKwh.Q4 * prices.Q4,
    };

    // Gesamtkosten (dynamischer Tarif)
    const totalDynamicCost = Object.values(quarterlyCosts).reduce((sum, cost) => sum + cost, 0);

    // Gesamtkosten (normaler Tarif)
    const totalNormalCost = totalKwh * normalTariffPrice;

    setResults({
      totalKwh,
      quarterlyCosts,
      totalDynamicCost,
      totalNormalCost,
    });
  }, [power, jaz, heatingHours]);

  // Heizstunden pro Quartal (für die Ausgabe)
  const heatingHoursPerQuarter = {
    Q1: 12,
    Q2: 7,
    Q3: 2,
    Q4: 10,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa', color: '#000000' }}>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Wärmepumpe</h1>

        {/* Eingabefelder */}
        <div className="mb-4">
          <h2 className="text-xl mb-2">Eingabewerte</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block">Leistung (kW):</label>
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 p-2 rounded w-full"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label className="block">JAZ (Jahresarbeitszahl):</label>
              <input
                type="number"
                value={jaz}
                onChange={(e) => setJaz(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 p-2 rounded w-full"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label className="block">Heizstunden:</label>
              <input
                type="number"
                value={heatingHours}
                onChange={(e) => setHeatingHours(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 p-2 rounded w-full"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
        </div>

        {/* Berechnungsergebnisse */}
        <div className="mb-4">
          <h2 className="text-xl">Berechnungsergebnisse</h2>
          <p>Gesamtverbrauch: {results.totalKwh.toFixed(2)} kWh</p>
          <p>Gesamtkosten (dynamischer Tarif): {results.totalDynamicCost.toFixed(2)} €</p>
          <p>Gesamtkosten (normaler Tarif): {results.totalNormalCost.toFixed(2)} €</p>
          <h3 className="mt-2">Kosten pro Quartal (dynamischer Tarif):</h3>
          <ul>
            {Object.entries(results.quarterlyCosts).map(([quarter, cost]) => (
              <li key={quarter}>
                {quarter}: {cost.toFixed(2)} € (Heizstunden: {heatingHoursPerQuarter[quarter]} h)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}