import {useLocation} from '@tanstack/react-router';
import {useMemo} from 'react';

// Breadcrumb types
export type BreadcrumbItem = {
  title: string;
  url: string;
}

// Helper function to extract breadcrumb mappings from AppRoute
export const getRouteBreadcrumbMapping = (routes: Record<string, any>): Record<string, BreadcrumbItem[]> => {
  const mapping: Record<string, BreadcrumbItem[]> = {};

  const extractRoutes = (obj: any) => {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        if (value.url && value.breadcrumb) {
          // This is a route with breadcrumb
          mapping[value.url] = value.breadcrumb;
        } else {
          // Continue nested search
          extractRoutes(value);
        }
      }
    }
  };

  extractRoutes(routes);
  return mapping;
};

export function useBreadcrumbs(routes: Record<string, any>) {
  const location = useLocation();
  const pathname = location.pathname;

  return useMemo(() => {
    // Get the centralized route mapping from api.ts
    const routeMapping = getRouteBreadcrumbMapping(routes);

    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname].map(item => ({
        title: item.title,
        link: item.url
      }));
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment: string, index: number) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        link: path
      };
    });
  }, [pathname]);
}