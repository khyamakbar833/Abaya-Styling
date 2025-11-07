import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-brand-primary font-semibold">{message}</p>
      <p className="text-sm text-gray-500 mt-2">AI magic is happening. Please wait...</p>
    </div>
  );
};
