
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GenerationOptions } from './components/GenerationOptions';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generatePhotoshoot, generateReel } from './services/geminiService';
import type { GeneratedImage, GeneratedVideo } from './types';

// This is a global declaration for the aistudio object provided by the environment
// Fix: Removed conflicting global declaration for window.aistudio. 
// It is assumed to be provided by the environment's global type definitions.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  // Fix: Add state for image mime type to support different image formats.
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('A model wearing this abaya in a high-fashion editorial photoshoot, set in a minimalist desert landscape during golden hour. Soft, warm lighting.');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImageFile(file);
    setGeneratedImages([]);
    setGeneratedVideo(null);
    setError(null);
    // Fix: Store the mime type of the uploaded file.
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImageBase64(base64String);
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
    }
    reader.readAsDataURL(file);
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after opening dialog to avoid race conditions
      setApiKeySelected(true);
    }
  };

  const handleGenerate = async (type: 'photoshoot' | 'reel') => {
    // Fix: Check for imageMimeType as well before generating.
    if (!imageBase64 || !imageMimeType) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt to describe the scene.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGeneratedVideo(null);

    try {
      if (type === 'photoshoot') {
        setLoadingMessage('Generating professional photoshoot...');
        // Fix: Pass the dynamic mime type to the service function.
        const newImageBase64 = await generatePhotoshoot(imageBase64, imageMimeType, prompt);
        setGeneratedImages([{ id: Date.now().toString(), src: `data:image/png;base64,${newImageBase64}` }]);
      } else if (type === 'reel') {
        if (!apiKeySelected) {
            setError('Please select an API key to generate videos.');
            setIsLoading(false);
            return;
        }
        const onProgress = (message: string) => setLoadingMessage(message);
        // Fix: Pass the dynamic mime type to the service function.
        const videoUrl = await generateReel(imageBase64, imageMimeType, prompt, onProgress);
        setGeneratedVideo({ id: Date.now().toString(), src: videoUrl });
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`Generation failed: ${errorMessage}`);
      
      // Handle specific API key error for Veo
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key validation failed. Please select your API Key again.");
        setApiKeySelected(false);
      }

    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light font-body text-brand-dark flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Controls */}
          <div className="flex flex-col space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-sans font-semibold text-brand-primary mb-4">1. Upload Your Design</h2>
              <ImageUploader onImageUpload={handleImageUpload} uploadedImageFile={uploadedImageFile} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <GenerationOptions
                prompt={prompt}
                onPromptChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isLoading}
                uploadedImageExists={!!uploadedImageFile}
                apiKeySelected={apiKeySelected}
                onSelectApiKey={handleSelectApiKey}
                />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 min-h-[400px] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-sans font-semibold text-brand-primary mb-4 self-start">3. AI Generated Content</h2>
            {error && <div className="text-red-600 bg-red-100 p-4 rounded-md w-full text-center">{error}</div>}
            
            {isLoading ? (
              <LoadingSpinner message={loadingMessage} />
            ) : (
              <ResultsDisplay images={generatedImages} video={generatedVideo} />
            )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini. Create stunning visuals for your business effortlessly.</p>
      </footer>
    </div>
  );
};

export default App;
