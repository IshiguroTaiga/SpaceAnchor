import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Calibrate Axios dynamically for Vercel deployment, unified hosting, or proxy routing
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '' : 'https://herta-spaceanchor.loca.lt');
axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

