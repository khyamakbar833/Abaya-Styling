import React from 'react';
import { SparklesIcon, VideoIcon } from './IconComponents';

interface GenerationOptionsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: (type: 'photoshoot' | 'reel') => void;
  isGenerating: boolean;
  uploadedImageExists: boolean;
  apiKeySelected: boolean;
  onSelectApiKey: () => void;
}

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  uploadedImageExists,
  apiKeySelected,
  onSelectApiKey,
}) => {
  const commonButtonClasses = "w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const primaryButtonClasses = `text-white bg-brand-primary hover:bg-brand-dark focus:ring-brand-primary`;
  const secondaryButtonClasses = `text-white bg-brand-secondary hover:bg-amber-600 focus:ring-brand-secondary`;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-primary mb-4">2. Describe Your Vision</h2>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Scene Description Prompt
        </label>
        <textarea
          id="prompt"
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., A model in a luxurious Dubai mall..."
        />
         <p className="mt-2 text-xs text-gray-500">Be descriptive for the best results! Mention location, lighting, and mood.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onGenerate('photoshoot')}
          disabled={isGenerating || !uploadedImageExists}
          className={`${commonButtonClasses} ${primaryButtonClasses}`}
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Generate Photoshoot
        </button>
        
        {!apiKeySelected ? (
            <div className="flex flex-col items-center">
                <button
                onClick={onSelectApiKey}
                disabled={isGenerating}
                className={`${commonButtonClasses} ${secondaryButtonClasses}`}
                >
                    <VideoIcon className="w-5 h-5 mr-2" />
                    Select API Key for Reels
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-gray-500 hover:underline">
                    Video generation requires billing to be enabled.
                </a>
            </div>
        ) : (
            <button
            onClick={() => onGenerate('reel')}
            disabled={isGenerating || !uploadedImageExists}
            className={`${commonButtonClasses} ${secondaryButtonClasses}`}
            >
            <VideoIcon className="w-5 h-5 mr-2" />
            Generate Marketing Reel
            </button>
        )}
      </div>
    </div>
  );
};
