import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const seoConfigs: Record<string, SEOConfig> = {
  '/': {
    title: 'Cuadernos X un Mañana | Donación de Útiles Escolares en República Dominicana',
    description: 'Recolectamos, reutilizamos y entregamos cuadernos y útiles escolares a estudiantes de comunidades vulnerables en República Dominicana. Únete como voluntario o centro de acopio.',
    keywords: 'donación útiles escolares, cuadernos República Dominicana, voluntariado educativo RD, centros de acopio, educación solidaria, reciclaje cuadernos',
    ogImage: 'https://d1ykljkzezf4zd.cloudfront.net/cxum.png',
    canonical: 'https://d1ykljkzezf4zd.cloudfront.net/'
  },
  '/Noticias': {
    title: 'Noticias y Actividades | Cuadernos X un Mañana',
    description: 'Conoce las últimas entregas, eventos y actividades de nuestra iniciativa. Historias de impacto real en comunidades de República Dominicana.',
    keywords: 'noticias CXUM, actividades educativas RD, entregas cuadernos, eventos solidarios, impacto social República Dominicana',
    ogImage: 'https://d1ykljkzezf4zd.cloudfront.net/cxum.png',
    canonical: 'https://d1ykljkzezf4zd.cloudfront.net/Noticias'
  },
  '/Voluntarios': {
    title: 'Únete como Voluntario | Cuadernos X un Mañana',
    description: 'Forma parte del cambio. Conviértete en voluntario y ayuda a clasificar, organizar y entregar útiles escolares a estudiantes que lo necesitan en República Dominicana.',
    keywords: 'voluntariado RD, ser voluntario República Dominicana, ayuda social educación, voluntariado jóvenes, trabajo comunitario',
    ogImage: 'https://d1ykljkzezf4zd.cloudfront.net/cxum.png',
    canonical: 'https://d1ykljkzezf4zd.cloudfront.net/Voluntarios'
  },
  '/Contacto': {
    title: 'Contacto y Centros de Acopio | Cuadernos X un Mañana',
    description: 'Contáctanos para donar, ser centro de acopio o colaborar con nuestra iniciativa. Encuentra el punto de recolección más cercano en República Dominicana.',
    keywords: 'contacto CXUM, centros de acopio RD, donar cuadernos, puntos de recolección, ser centro de acopio',
    ogImage: 'https://d1ykljkzezf4zd.cloudfront.net/cxum.png',
    canonical: 'https://d1ykljkzezf4zd.cloudfront.net/Contacto'
  }
};

export function useSEO(customConfig?: Partial<SEOConfig>) {
  const location = useLocation();

  useEffect(() => {
    const config = customConfig || seoConfigs[location.pathname] || seoConfigs['/'];

    // Update title
    if (config.title) {
      document.title = config.title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (config.description) {
      updateMetaTag('description', config.description);
    }
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }

    // Open Graph
    if (config.title) {
      updateMetaTag('og:title', config.title, true);
    }
    if (config.description) {
      updateMetaTag('og:description', config.description, true);
    }
    updateMetaTag('og:url', config.canonical || window.location.href, true);
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, true);
    }

    // Twitter
    if (config.title) {
      updateMetaTag('twitter:title', config.title, true);
    }
    if (config.description) {
      updateMetaTag('twitter:description', config.description, true);
    }
    if (config.ogImage) {
      updateMetaTag('twitter:image', config.ogImage, true);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = config.canonical || window.location.href;

  }, [location.pathname, customConfig]);
}
