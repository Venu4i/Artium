import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.js' // adjust path to your store
import { injectStore } from './api/axios'
import './index.css'
import App from './App.jsx'

injectStore(store); // Link store to axios

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)