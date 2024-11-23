// src/lib/csrf.ts

export function getCSRFToken(): string {
    // Coba ambil dari cookie terlebih dahulu
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
      ?.split('=')[1];
  
    if (csrfToken) {
      return csrfToken;
    }
  
    // Jika tidak ada di cookie, coba ambil dari meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') || '' : '';
  }