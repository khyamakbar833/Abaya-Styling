import React from 'react';
import type { GeneratedImage, GeneratedVideo } from '../types';

interface ResultsDisplayProps {
  images: GeneratedImage[];
  video: GeneratedVideo | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ images, video }) => {
  const hasContent = images.length > 0 || video;

  return (
    <div className="w-full flex-grow flex items-center justify-center p-4 bg-gray-50 rounded-lg">
      {!hasContent && (
        <div className="text-center text-gray-500">
          <p className="font-semibold">Your generated content will appear here.</p>
          <p className="text-sm">Upload an image and provide a prompt to get started.</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 w-full">
          {images.map((image) => (
            <div key={image.id} className="rounded-lg overflow-hidden shadow-lg animate-fade-in">
              <img src={image.src} alt="AI generated photoshoot" className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      )}

      {video && (
        <div className="w-full aspect-[9/16] max-w-sm mx-auto animate-fade-in">
            <video controls src={video.src} className="w-full h-full rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
};
