// src/utils/imagekit.ts

import ImageKit from "imagekit";

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// Fungsi untuk mendapatkan fileId dari URL path-nya
export const getFileIdFromUrl = (url: string): string | null => {
  try {
    // URL dari ImageKit biasanya dalam format:
    // https://ik.imagekit.io/{your_imagekit_id}/folder/filename.ext
    const urlParts = url.split('/');
    // Filename akan berada di akhir URL
    const filename = urlParts[urlParts.length - 1];
    return filename.split('.')[0]; // Mengambil nama file tanpa ekstensi sebagai fileId
  } catch (error) {
    console.error('Error extracting fileId from URL:', error);
    return null;
  }
};

// Fungsi untuk melakukan Basic Auth ke ImageKit API
const getBasicAuthHeader = () => {
  const privateKey = process.env.PRIVATE_KEY!;
  const authString = Buffer.from(`${privateKey}:`).toString('base64');
  return `Basic ${authString}`;
};

export const deleteImageKitFile = async (fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getBasicAuthHeader(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ImageKit delete error:', errorData);
      return false;
    }

    console.log(`Successfully deleted file with ID: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error deleting file from ImageKit:', error);
    return false;
  }
};

// Fungsi untuk menghapus file berdasarkan URL
export const deleteImageKitFileByUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;

  try {
    // Dapatkan nama file dari URL sebagai fileId
    const fileId = getFileIdFromUrl(url);
    if (!fileId) {
      console.error('Could not extract fileId from URL:', url);
      return false;
    }

    return await deleteImageKitFile(fileId);
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return false;
  }
};

export default imageKit;