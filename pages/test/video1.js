
// app/videos/page.tsx
import React from 'react';

const videos = [
  {
    id: 1,
    title: 'Startseite',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Startseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung',
    src: '../videos/Homeseite.mp4', // Pfad relativ zum public-Ordner
  },
  {
    id: 2,
    title: 'Preiseseite',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Preisseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung.',
    src: '../videos/Preiseseite.mp4', // Pfad relativ zum public-Ordner
  },
  {
    id: 3,
    title: 'Rechnerseite ',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Rechnerseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung.',
    src: '../videos/Rechnerseite.mp4', // Pfad relativ zum public-Ordner
  },
];

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#063d37] mb-10 text-center">
           Videogalerie
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <video
                controls
                className="w-full h-64 object-cover"
                style={{ backgroundColor: '#063d37' }}
              >
                <source src={video.src} type="video/mp4" />
                Dein Browser unterstützt das Video-Tag nicht.
              </video>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-[#063d37] mb-3">
                  {video.title}
                </h2>
                <p className="text-gray-600 text-sm">{video.description}</p>
               
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
