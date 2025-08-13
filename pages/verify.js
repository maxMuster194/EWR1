import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState(false);

  const [agb, setAgb] = useState(false); // Pflichtfeld
  const [werbung, setWerbung] = useState(false); // Optional

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

    const res = await fetch('/api/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, werbung }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Code wurde an deine E-Mail gesendet.');
      setStep(2);
    } else {
      setMessage(data.error || 'Fehler beim Senden des Codes.');
    }
  }

  async function verifyCode() {
    setMessage('');
    if (code.length !== 6) {
      setMessage('Bitte 6-stelligen Code eingeben.');
      return;
    }
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, werbung }),
    });
    const data = await res.json();
    if (res.ok && data.verified) {
      setVerified(true);
      setMessage('Verifiziert! Du kannst jetzt herunterladen.');
    } else {
      setMessage('Falscher Code!');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Download mit E-Mail-Verifizierung
        </h1>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Deine E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
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
                <span className="text-green-500" >Einwilligung zur Verwendung für Werbung (optional)</span>
              </label>
            </div>
            <button
              onClick={requestCode}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Code anfordern
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
          </div>
        )}

        {verified && (
          <a
            href="/bilder/downloads/affe.jpg"
            download
            className="block mt-6 bg-green-600 text-white py-3 px-4 rounded-md text-center hover:bg-green-700 transition-colors"
          >
            Download starten
          </a>
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
  );
}