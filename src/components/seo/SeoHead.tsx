import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
  schemaObj?: object | object[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  noindex,
  schemaObj
}) => {
  const siteName = "Izcor - Catálogo Médico";
  const defaultDesc = "Equipamiento, mobiliario e instrumental médico para hospitales, clínicas e instituciones.";
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://izcormedic.com';

  const fullCanonical = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`) : undefined;
  const fullOgImage = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`)
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description || defaultDesc} />

      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDesc} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDesc} />
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}

      {/* JSON-LD Structured Data */}
      {schemaObj && (
        <script type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      )}
    </Helmet>
  );
};
