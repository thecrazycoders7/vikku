import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear the chunk-error reload guard once this build has mounted successfully,
// so a later deploy can still trigger the ErrorBoundary's auto-reload.
sessionStorage.removeItem('vikku-chunk-reload')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
