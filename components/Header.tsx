import React from 'react';
import { SparklesIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <SparklesIcon className="h-8 w-8 text-brand-secondary mr-3" />
        <h1 className="text-3xl font-bold font-sans text-brand-primary tracking-tight">
          Abaya Stylist <span className="text-brand-secondary">AI</span>
        </h1>
      </div>
    </header>
  );
};
