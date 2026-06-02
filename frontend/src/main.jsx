import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.js' // adjust path to your store
import { injectStore } from './api/axios'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // Import this
import { GoogleOAuthProvider } from '@react-oauth/google'

injectStore(store); // Link store to axios

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)