// src/utils/imagekit.ts

import ImageKit from "imagekit";

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// Store fileId when uploading
interface UploadResponse {
  url: string;
  fileId: string;
}

export const uploadFile = async (
  file: Buffer,
  fileName: string,
  folder: string
): Promise<UploadResponse> => {
  try {
    const response = await imageKit.upload({
      file,
      fileName,
      folder,
    });

    return {
      url: response.url,
      fileId: response.fileId
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error uploading file:', error.message);
    }
    throw new Error('Failed to upload file');
  }
};

export const deleteImageKitFile = async (fileId: string): Promise<boolean> => {
  try {
    if (!fileId) {
      console.error('No fileId provided for deletion');
      return false;
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('ImageKit private key not found');
      return false;
    }

    const authString = Buffer.from(`${privateKey}:`).toString('base64');

    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 204) {
      console.log(`Successfully deleted file with ID: ${fileId}`);
      return true;
    }

    console.error('ImageKit delete error:', await response.json());
    return false;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting file from ImageKit:', error.message);
    }
    return false;
  }
};

// Export imagekit instance for other operations if needed
export default imageKit;