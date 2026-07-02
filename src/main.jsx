// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "react-redux";
import { store } from "./app/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(

  // <StrictMode>
  <Provider store={store}>
  <GoogleOAuthProvider clientId="244730379523-cs6l56hj42hs9ak566o8tht0hi6mr692.apps.googleusercontent.com">
    <Toaster
          position="top-right"
          containerStyle={{
            top: 96,
            zIndex: 10050,
          }}
          toastOptions={{
            duration: 4000,
          }}
        />

    <App />
  </GoogleOAuthProvider>
  </Provider>
  // </StrictMode>,
)
