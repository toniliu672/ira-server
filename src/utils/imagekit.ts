// src/utils/imagekit.ts

import ImageKit from "imagekit";

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export const getFileIdFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    // Extract fileId from path
    // Example URL: https://ik.imagekit.io/your_imagekit_id/folder/fileId/filename.ext
    const pathParts = parsedUrl.pathname.split('/');
    return pathParts[pathParts.length - 2] || null;
  } catch {
    return null;
  }
};

export const deleteImageKitFile = async (fileId: string): Promise<boolean> => {
  try {
    await imageKit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file from ImageKit:', error);
    return false;
  }
};

export default imageKit;