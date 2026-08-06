import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "./index.scss" //this scss style is what modify or control any output that must go through this raectdom app majorly how any file looks like as it renders it
import { AuthContextProvider } from './context/AuthContext.jsx'
//the authcontextprovider as used to wrapp the app enhance data to be shared around the full website
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
       <App />
    </AuthContextProvider> 
  </React.StrictMode>,
)
