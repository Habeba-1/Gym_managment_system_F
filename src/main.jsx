import { StrictMode } from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.jsx';
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from './AuthContext/AuthProvider.jsx';
import { ThemeProvider, useTheme } from './Context/ThemeContext.jsx';
import { Provider } from 'react-redux';
import { Store } from './Service/Store.jsx';
import { LanguageProvider } from './Context/LanguageContext.jsx';
import '@mantine/core/styles.css';

const Root = () => {
  const { isDarkMode } = useTheme();

  return (
    <MantineProvider
      forceColorScheme={isDarkMode ? 'dark' : 'light'}
      theme={{
        fontFamily: 'Inter, sans-serif',
        primaryColor: 'main',
        colors: {
          main: [
            '#f4feea',
            '#cfffab',
            '#c6f486',
            '#95e913',
            '#85f40f',
            '#85f40f',
            '#6cc80a',
            '#549e06',
            '#3d7603',
            '#275001',
          ],
        },
      }}
    >
      <App />
    </MantineProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={Store}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Root />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
