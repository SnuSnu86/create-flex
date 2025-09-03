import { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: string;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark-pro' });

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  theme: string;
}

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  useEffect(() => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '');
    
    switch (theme) {
      case 'light':
        root.classList.add('theme-light');
        break;
      case 'brutalist':
        root.classList.add('theme-brutalist');
        break;
      case 'luxury':
        root.classList.add('theme-luxury');
        break;
      default:
        // dark-pro is the default
        break;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};