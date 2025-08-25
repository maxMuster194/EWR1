import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState(false);

  const [agb, setAgb] = useState(false);
  const [werbung, setWerbung] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  async function requestCode() {
    setMessage('');
    if (!email.includes('@')) { setMessage('Bitte gültige E-Mail eingeben.'); return; }
    if (!agb) { setMessage('Bitte akzeptiere die AGB.'); return; }
    if (cooldown > 0) { setMessage(`Bitte warte noch ${cooldown} Sekunden.`); return; }

    try {
      const res = await fetch('http://46.62.162.37:3000/api/request-code', {
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
    } catch (err) {
      setMessage('Server nicht erreichbar.');
      console.error(err);
    }
  }

  async function verifyCode() {
    setMessage('');
    if (code.length !== 6) { setMessage('Bitte 6-stelligen Code eingeben.'); return; }

    try {
      const res = await fetch('http://46.62.162.37:3000/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setVerified(true);
        setMessage('Verifiziert! Du kannst jetzt herunterladen.');
      } else {
        setMessage(data.error || 'Falscher Code!');
      }
    } catch (err) {
      setMessage('Server nicht erreichbar.');
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Download mit E-Mail-Verifizierung</h1>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Deine E-Mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={agb} onChange={e => setAgb(e.target.checked)} />
                <span className="text-red-500">AGB akzeptieren *</span>
              </label>
            </div>
            <div className="text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={werbung} onChange={e => setWerbung(e.target.checked)} />
                <span className="text-green-500">Einwilligung Werbung (optional)</span>
              </label>
            </div>
            <button onClick={requestCode} disabled={cooldown > 0} className={`w-full py-3 rounded-md ${cooldown>0?'bg-gray-400 cursor-not-allowed':'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {cooldown>0?`Erneut in ${cooldown}s`:'Code anfordern'}
            </button>
          </div>
        )}

        {step === 2 && !verified && (
          <div className="space-y-4">
            <p>Code an <strong>{email}</strong> gesendet:</p>
            <input type="text" placeholder="6-stelliger Code" value={code} onChange={e => setCode(e.target.value)} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button onClick={verifyCode} className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">Code prüfen</button>
            {cooldown>0 && <p className="text-sm text-gray-500 text-center">Du kannst den Code in {cooldown} Sekunden erneut anfordern.</p>}
          </div>
        )}

        {verified && (
          <a href="/bilder/downloads/affe.jpg" download className="block mt-6 bg-green-600 text-white py-3 rounded-md text-center hover:bg-green-700">Download starten</a>
        )}

        {message && <p className={`mt-4 text-center ${message.includes('Fehler') || message.includes('Falscher') || message.includes('Bitte') ? 'text-red-500':'text-green-500'}`}>{message}</p>}
      </div>
    </div>
  );
}
