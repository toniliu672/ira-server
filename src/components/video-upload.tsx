// src/components/video-upload.tsx

import React from 'react';
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { Button } from "@/components/ui/button";

interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
}

interface UploadError {
  message: string;
}

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void;
  accept: string;
  id: string;
  currentUrl?: string;
}

export function VideoUpload({ onUploadSuccess, accept, id, currentUrl }: VideoUploadProps) {
  const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || '';
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || '';

  const onError = (err: UploadError) => {
    console.error("Error uploading file:", err);
    alert("Gagal mengupload file: " + err.message);
  };

  const onSuccess = (response: UploadResponse) => {
    onUploadSuccess(response.url);
  };

  return (
    <div className="grid gap-2">
      <ImageKitProvider
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={() => {
          return fetch('/api/v1/imagekit/auth')
            .then(res => res.json())
            .then(data => ({
              signature: data.signature,
              expire: data.expire,
              token: data.token,
            }));
        }}
      >
        <IKUpload
          fileName={`${id}-${Date.now()}`}
          folder={accept.includes('video') ? "/videos" : "/thumbnails"}
          tags={[accept.includes('video') ? "video" : "thumbnail"]}
          useUniqueFileName={true}
          responseFields={["url"]}
          validateFile={(file: File) => {
            if (!file.type.startsWith(accept.split('/')[0] + '/')) {
              alert(`Hanya file ${accept.split('/')[0]} yang diperbolehkan`);
              return false;
            }
            // 100MB untuk video, 5MB untuk thumbnail
            const maxSize = accept.includes('video') ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
            if (file.size > maxSize) {
              alert(`Ukuran file maksimal ${maxSize / (1024 * 1024)}MB`);
              return false;
            }
            return true;
          }}
          onError={onError}
          onSuccess={onSuccess}
          style={{ display: 'none' }}
          id={id}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            document.getElementById(id)?.click();
          }}
        >
          Pilih File
        </Button>
        {currentUrl && (
          <div className="text-sm text-gray-500 mt-1">
            File saat ini: {currentUrl}
          </div>
        )}
      </ImageKitProvider>
    </div>
  );
}