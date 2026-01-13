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

    // Style Injection: Copy specific widget styles to shadow root
    const injectStyles = () => {
      // 1. Check for the specific CSS variable passed by loader
      const cssUrl = window.__BOOKING_WIDGET_CSS__;

      if (cssUrl && !shadow.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        shadow.appendChild(link);
      }

      // 2. In DEV mode, we still need to find Vite's injected styles
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
      injectStyles(); // In production, we can run it immediately if loader set the var
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
