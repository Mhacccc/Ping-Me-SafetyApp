import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css' // Global design system (tokens + base styles)
import App from './App.jsx'
import InteractionGuardian from './components/InteractionGuardian.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <InteractionGuardian>
      <App />
    </InteractionGuardian>
  </BrowserRouter>
)
