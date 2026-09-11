import { useState, useCallback } from 'react';

export interface ShareProductData {
  title: string;
  text?: string;
  url: string;
}

export function useProductShare() {
  const [copied, setCopied] = useState(false);

  const shareProduct = useCallback(async (data: ShareProductData): Promise<'shared' | 'copied' | 'error'> => {
    const fullUrl = data.url.startsWith('http')
      ? data.url
      : `${window.location.origin}${data.url.startsWith('/') ? '' : '/'}${data.url}`;

    // Try Web Share API on mobile devices if supported
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text || `Ficha técnica y cotización institucional: ${data.title} en IZCOR MEDIC`,
          url: fullUrl,
        });
        return 'shared';
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return 'error';
        }
        // Fall back to clipboard copy
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return 'copied';
    } catch {
      // Manual fallback using temporary textarea
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return 'copied';
      } catch {
        return 'error';
      }
    }
  }, []);

  return {
    copied,
    shareProduct,
  };
}
