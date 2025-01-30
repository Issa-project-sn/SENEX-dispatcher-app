import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeSuperAdmin } from './services/adminService';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Initialiser le super admin au démarrage de l'application
initializeSuperAdmin()
  .catch(error => {
    console.error('Erreur lors de l\'initialisation du super admin:', error);
  });

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);