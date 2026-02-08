"use client";

import { useState, ChangeEvent } from "react";

interface AvatarUploadProps {
  initialAvatar: string;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ initialAvatar, onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState(initialAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpload(base64String);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32">
        {preview ? (
          <img
            src={preview}
            alt="Avatar Preview"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <label className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
        <span>Upload Avatar</span>
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          aria-label="upload avatar"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
