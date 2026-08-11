"use client";

import { useState, ChangeEvent } from "react";
import { ACTION_FOCUS_WITHIN } from "@/lib/control-classes";

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
      
      {/*
        The boundary and the focus indicator both belong here rather than on
        the input: this label is the control anyone can see, and the input it
        wraps is `sr-only`. `border-gray-300` measured 1.41:1 against the
        white it sits on, the same value #196 took off the text fields.

        `forced-colors:border-2` because that is flatly what an action is in
        this app there, and a field is 1px. Not because of what sits nearby: in
        ordinary rendering this control is a 1px zinc-500 rounded edge, which
        is `FIELD_BOUNDARY`'s treatment exactly, so it reads as a field
        normally and as an action in forced colors. The convention carries it;
        the neighbours are on another tab and never share a screen.

        Written out rather than taken from `ACTION_BOUNDARY`, which pairs it
        with `focus-visible` — and the focusable element here is a descendant.
        If a second control ever needs this pairing, the edge wants its own
        constant rather than a second copy of this literal.
      */}
      <label
        className={`cursor-pointer bg-white px-3 py-2 border border-zinc-500 rounded-md shadow-xs text-sm font-medium text-gray-700 hover:bg-gray-50 has-[:focus-visible]:outline-indigo-600 forced-colors:border-2 ${ACTION_FOCUS_WITHIN}`}
      >
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
