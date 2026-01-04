"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ScreenshotUploadProps {
  onExtractComplete: (data: ExtractedData) => void;
}

interface ExtractedData {
  title?: string;
  brand?: string;
  code?: string;
  description?: string;
  expiryDate?: string;
  terms?: string;
  category?: string;
}

export function ScreenshotUpload({ onExtractComplete }: ScreenshotUploadProps) {
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setExtracted(false);
      setPreview(URL.createObjectURL(file));
      setExtracting(true);

      try {
        // Send directly to Gemini for extraction
        const formData = new FormData();
        formData.append("screenshot", file);

        const extractRes = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });

        if (!extractRes.ok) {
          throw new Error("Extraction failed");
        }

        const { data } = await extractRes.json();
        onExtractComplete(data);
        setExtracted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Extraction failed");
      } finally {
        setExtracting(false);
      }
    },
    [onExtractComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
          }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded"
            />
            {extracting && (
              <p className="text-blue-600 dark:text-blue-400">Extracting coupon info...</p>
            )}
            {extracted && !extracting && (
              <p className="text-green-600 dark:text-green-400">Coupon info extracted! Review below.</p>
            )}
            {!extracting && !extracted && (
              <p className="text-gray-500 dark:text-gray-400">Click or drop to replace</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-gray-800 dark:text-gray-200">
              {isDragActive
                ? "Drop the screenshot here"
                : "Drag & drop a coupon screenshot, or click to select"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI will extract coupon details automatically</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
