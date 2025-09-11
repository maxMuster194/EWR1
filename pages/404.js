import Head from 'next/head';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 flex items-center justify-center">
      <Head>
        <title>404 - Seite nicht gefunden</title>
        <meta name="description" content="Die gesuchte Seite wurde nicht gefunden." />
      </Head>
      <div className="text-center">
        <div className="relative w-80 h-[480px] mx-auto perspective-1000">
          <div className="card w-full h-full bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 rounded-xl shadow-2xl flex flex-col items-center justify-center transform transition-transform duration-3000 ease-in-out animate-spin-card">
            <div className="absolute inset-2 bg-gray-800 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-6xl font-bold text-white mb-4">404</h1>
              <p className="text-xl text-white mb-4">Seite nicht gefunden!</p>
              <p className="text-lg text-gray-300">Es sieht so aus, als hättest du dich verlaufen. Diese Seite existiert nicht (mehr).</p>
              <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                Zurück zur Startseite
              </a>
            </div>
          </div>
        </div>
        <p className="mt-8 text-gray-400"></p>
      </div>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .card {
          transform-style: preserve-3d;
        }
        @keyframes spin-card {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-spin-card {
          animation: spin-card 6s infinite linear;
        }
      `}</style>
    </div>
  );
}