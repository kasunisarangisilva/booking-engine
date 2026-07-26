import React from 'react'
import ReactDOM from 'react-dom/client'
import BookingEngine from './components/BookingEngine/index'
import indexCss from './index.css?inline'

class BookingWidget extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.id = 'booking-widget-container';

    // 1. Inject compiled inline CSS into shadow root (works in DEV and PROD)
    const styleElement = document.createElement('style');
    styleElement.textContent = indexCss;
    shadow.appendChild(styleElement);

    // 2. Inject Google Fonts into document.head if not present
    if (!document.head.querySelector('link[data-widget-fonts]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.setAttribute('data-widget-fonts', 'true');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    }

    shadow.appendChild(container);

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

