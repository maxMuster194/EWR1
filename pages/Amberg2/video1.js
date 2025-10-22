import React from 'react';

const videos = [
  {
    id: 1,
    title: 'Startseite',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Startseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung',
    src: '/videos/Homeseite.mp4', // Absolute path from public/videos
  },
  {
    id: 2,
    title: 'Preiseseite',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Preisseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung.',
    src: '/videos/Preiseseite.mp4', // Absolute path from public/videos
  },
  {
    id: 3,
    title: 'Rechnerseite',
    description: 'In diesem Video erhalten Sie einen kurzen Einblick in die Rechnerseite des Dynasmchen Preis-Tools und die wichtigsten Funktionen der Anwendung.',
    src: '/videos/Rechnerseite.mp4', // Absolute path from public/videos
  },
];

export default function VideosPage() {
  return (
    <>
      <h1 className="text-4xl font-bold bg-gradient-to-b from-[#4372b7] to-[#905fa4] text-transparent bg-clip-text mb-10 text-center">
        Videogalerie
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className="rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl bg-transparent"
          >
            <video
              controls
              className="w-full h-64 object-cover bg-transparent"
            >
              <source src={video.src} type="video/mp4" />
              Dein Browser unterstützt das Video-Tag nicht.
            </video>
            <div className="p-6 bg-transparent">
              <h2 className="text-2xl font-semibold bg-gradient-to-b from-[#4372b7] to-[#905fa4] text-transparent bg-clip-text mb-3">
                {video.title}
              </h2>
              <p className="text-white text-sm">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}