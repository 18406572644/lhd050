import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import App from './App';
import './index.css';

const theme = createTheme({
  fontFamily: '"Noto Sans SC", sans-serif',
  headings: {
    fontFamily: '"Noto Serif SC", serif',
  },
  colors: {
    coffee: [
      '#F5F1EB', '#E8E4E0', '#D4CCBC', '#C4A882', '#B8976E',
      '#A8865A', '#8B6F4E', '#6D573D', '#5A3E2B', '#3D2A1A',
    ],
  },
  primaryColor: 'coffee',
  defaultRadius: 'md',
  white: '#F5F1EB',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>,
);
