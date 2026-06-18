import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Assumindo que os estilos globais existem
// import './assets/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
