import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('Starting application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element');
} else {
  try {
    console.log('Mounting React application...');
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('React application mounted successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = '<div class="p-4">Failed to load application. Check console for details.</div>';
  }
}