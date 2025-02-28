import CookieConsent from "react-cookie-consent";
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        cookieName="eth0_cookie_consent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ 
          background: "#3B82F6",
          color: "white", 
          fontSize: "13px",
          borderRadius: "6px",
          padding: "8px 16px"
        }}
        expires={150}
        onAccept={() => {
          // Initialize GTM only after consent
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
        }}
      >
        This website uses cookies to enhance the user experience. See our{" "}
        <a 
          href="/privacy-policy" 
          style={{ color: "#3B82F6" }}
        >
          Privacy Policy
        </a>
      </CookieConsent>
    </>
  )
} 