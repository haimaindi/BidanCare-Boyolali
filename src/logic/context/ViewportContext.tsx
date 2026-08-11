import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ViewportState {
  width: number;
  height: number;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isCompact: boolean;
  isWide: boolean;
}

const defaultState: ViewportState = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  height: typeof window !== 'undefined' ? window.innerHeight : 800,
  isDesktop: true,
  isTablet: false,
  isMobile: false,
  isCompact: false,
  isWide: true,
};

const ViewportContext = createContext<ViewportState>(defaultState);

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    if (typeof window === 'undefined') return defaultState;
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      width: w,
      height: h,
      isDesktop: w >= 1024,
      isTablet: w >= 768 && w < 1024,
      isMobile: w < 768,
      isCompact: w < 1024,
      isWide: w >= 1024,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;

    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setViewport({
          width: w,
          height: h,
          isDesktop: w >= 1024,
          isTablet: w >= 768 && w < 1024,
          isMobile: w < 768,
          isCompact: w < 1024,
          isWide: w >= 1024,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = (): ViewportState => {
  return useContext(ViewportContext);
};
