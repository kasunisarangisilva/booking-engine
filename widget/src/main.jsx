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

    // Style Injection: Copy styles to shadow root
    const injectStyles = () => {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        // Only inject if it's not already there
        if (!shadow.querySelector(`[data-origin="${style.tagName}"]`)) {
          const clone = style.cloneNode(true);
          if (clone.tagName === 'LINK') {
            // Ensure absolute URL if needed, but for now just copy
          }
          shadow.appendChild(clone);
        }
      });
    };

    if (import.meta.env.DEV) {
      setTimeout(injectStyles, 100);
    } else {
      // In production, we might need a small delay for the browser to parse injected links
      setTimeout(injectStyles, 50);
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
