// utils/routeParser.ts
import routeData from './routeData.json';

// Explicit mapping ensures 100% accuracy from your UI dropdowns to your JSON slugs
const normalizeLocation = (location: string): string => {
  switch (location) {
    case 'Pune': return 'pune';
    case 'Mumbai': return 'mumbai';
    case 'Nashik': return 'nashik';
    default:
      // Fallback regex to clean unexpected strings (e.g. "Mumbai" -> "mumbai")
      return location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
};

export const getQuoteData = (pickup: string, drop: string) => {
  const pickupSlug = normalizeLocation(pickup);
  const dropSlug = normalizeLocation(drop);
  
  const routeSlug = `${pickupSlug}-to-${dropSlug}`;
  
  // Look up the slug in our JSON database
  const quoteResult = routeData[(routeSlug as keyof typeof routeData)];
  
  if (!quoteResult) {
    return {
      success: false,
      error: `Route not currently serviced: ${pickup} to ${drop}`,
      data: null
    };
  }

  return {
    success: true,
    error: null,
    data: quoteResult
  };
};