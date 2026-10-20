import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width < 1024;
  return {
    width,
    isMobile,
    isTablet,
    isDesktop: !isTablet,
    gutter: isMobile ? 20 : isTablet ? 32 : 48,
    sectionY: isMobile ? 72 : isTablet ? 96 : 128,
  };
}
