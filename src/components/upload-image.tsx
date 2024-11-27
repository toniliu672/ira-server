// src/components/upload-image.tsx

import React from 'react';
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { X } from "lucide-react";

interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
}

interface UploadError {
  message: string;
}

interface UploadImageProps {
  images: string[];
  onUploadSuccess: (url: string) => void;
  onRemove: (url: string) => void;
}

export function UploadImage({ images, onUploadSuccess, onRemove }: UploadImageProps) {
  const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || '';
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || '';

  const onError = (err: UploadError) => {
    console.error("Error uploading image:", err);
    alert("Gagal mengupload gambar: " + err.message);
  };

  const onSuccess = (response: UploadResponse) => {
    onUploadSuccess(response.url);
  };

  const authenticator = async () => {
    try {
      const response = await fetch('/api/v1/imagekit/auth');
      if (!response.ok) {
        throw new Error('Failed to get auth tokens');
      }
      const data = await response.json();
      return {
        signature: data.signature,
        expire: data.expire,
        token: data.token,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Upload Gambar</Label>
        <ImageKitProvider
          urlEndpoint={urlEndpoint}
          publicKey={publicKey}
          authenticator={authenticator}
        >
          <div className="flex flex-col gap-4">
            <IKUpload
              fileName="submateri-image"
              folder="/submateri"
              tags={["submateri"]}
              useUniqueFileName={true}
              responseFields={["url"]}
              validateFile={(file: File) => {
                if (!file.type.startsWith('image/')) {
                  alert('Hanya file gambar yang diperbolehkan');
                  return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                  alert('Ukuran file maksimal 5MB');
                  return false;
                }
                return true;
              }}
              onError={onError}
              onSuccess={onSuccess}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const input = document.getElementById('image-upload');
                if (input) {
                  input.click();
                }
              }}
            >
              Pilih Gambar
            </Button>
          </div>
        </ImageKitProvider>
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <Image 
                src={url} 
                alt={`Uploaded ${index + 1}`} 
                width={200}
                height={200}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}