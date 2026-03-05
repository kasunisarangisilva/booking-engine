import React from 'react'
import ReactDOM from 'react-dom/client'
import BookingEngine from './components/BookingEngine/index'
import './index.css'

class BookingWidget extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.id = 'booking-widget-container';
    shadow.appendChild(container);

    // Style Injection: Copy widget styles to shadow root
    const injectStyles = () => {
      // 1. Production: CSS url passed by loader
      const cssUrl = window.__BOOKING_WIDGET_CSS__;
      if (cssUrl && !shadow.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        shadow.appendChild(link);
      }

      // 2. DEV mode: copy Vite injected styles
      if (import.meta.env.DEV) {
        const styles = document.querySelectorAll('style[data-vite-dev-id]');
        styles.forEach(style => {
          if (!shadow.querySelector(`style[data-origin="${style.getAttribute('data-vite-dev-id')}"]`)) {
            const clone = style.cloneNode(true);
            clone.setAttribute('data-origin', style.getAttribute('data-vite-dev-id'));
            shadow.appendChild(clone);
          }
        });
      }
    };

    if (import.meta.env.DEV) {
      setTimeout(injectStyles, 100);
    } else {
      injectStyles();
    }

    // Inject Google Fonts into the parent document head (not shadow DOM)
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    if (!document.head.querySelector('link[data-widget-fonts]')) {
      fontLink.setAttribute('data-widget-fonts', 'true');
      document.head.appendChild(fontLink);
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <BookingEngine />
      </React.StrictMode>
    );
    this._root = root;
  }

  disconnectedCallback() {
    if (this._root) {
      this._root.unmount();
    }
  }
}

if (!customElements.get('booking-engine')) {
  customElements.define('booking-engine', BookingWidget);
}
