import React, { useCallback, useState, ChangeEvent, DragEvent } from 'react';
import { UploadIcon } from './IconComponents';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImageFile: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImageFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [onImageUpload]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files ? e.target.files[0] : null);
  };
  
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out text-center cursor-pointer
          ${isDragging ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300 bg-gray-50'}
          ${previewUrl ? 'h-auto' : 'h-48 flex flex-col justify-center items-center'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        {previewUrl ? (
          <img src={previewUrl} alt="Abaya preview" className="max-h-64 mx-auto rounded-md object-contain" />
        ) : (
          <>
            <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">
              <span className="font-semibold text-brand-secondary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
          </>
        )}
      </div>
      {uploadedImageFile && <p className="text-sm text-gray-600 mt-2">File: {uploadedImageFile.name}</p>}
    </div>
  );
};
