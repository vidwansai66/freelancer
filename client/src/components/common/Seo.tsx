import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const CANONICAL_ORIGIN = 'https://freelancer-one-woad.vercel.app';

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export function Seo({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    const studio = settings.studioName || 'Teja Web Studio';
    const metadata = settings.pageSeo?.[pathname];

    // Compute title
    let resolvedTitle = title || metadata?.title;
    if (!resolvedTitle) {
      resolvedTitle =
        pathname === '/'
          ? `${studio} — Simple, Affordable Websites for Small Businesses`
          : `${pathname
              .split('/')
              .filter(Boolean)
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' · ')} | ${studio}`;
    } else if (!resolvedTitle.includes(studio)) {
      resolvedTitle = `${resolvedTitle} | ${studio}`;
    }
    document.title = resolvedTitle;

    // Helper for meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Description
    const resolvedDesc =
      description ||
      metadata?.description ||
      settings.tagline ||
      'High-performance, modern, and affordable websites for businesses and startups. Launched in days, not months.';
    setMeta('description', resolvedDesc);

    // Canonical link
    const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const resolvedCanonical = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${CANONICAL_ORIGIN}${canonical}`
      : `${CANONICAL_ORIGIN}${cleanPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', resolvedCanonical);

    // Robots meta tag
    const isPrivate = noindex || /^\/(admin|track|manage-booking)/.test(pathname);
    setMeta('robots', isPrivate ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    const resolvedImage = ogImage || `${CANONICAL_ORIGIN}/favicon.svg`;
    setMeta('og:site_name', studio, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', resolvedCanonical, true);
    setMeta('og:title', resolvedTitle, true);
    setMeta('og:description', resolvedDesc, true);
    setMeta('og:image', resolvedImage, true);

    // Twitter
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', resolvedTitle);
    setMeta('twitter:description', resolvedDesc);
    setMeta('twitter:image', resolvedImage);

    // JSON-LD structured data injection
    let jsonLdScript = document.getElementById('route-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'route-jsonld';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [pathname, title, description, canonical, ogImage, ogType, noindex, jsonLd, settings]);

  return null;
}

