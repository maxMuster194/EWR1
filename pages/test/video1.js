// app/videos/page.tsx
import React from 'react';

const videos = [
  {
    id: 1,
    title: 'Video 1',
    description: 'This is a short description for video 1.',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video URL
  },
  {
    id: 2,
    title: 'Video 2',
    description: 'This is a short description for video 2.',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video URL
  },
  {
    id: 3,
    title: 'Video 3',
    description: 'This is a short description for video 3.',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video URL
  },
  // Add more videos as needed
];

export default function VideosPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Video Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <video controls className="w-full h-48 object-cover">
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
              <p className="text-gray-600">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}