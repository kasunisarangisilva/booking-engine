(function () {
    // 1. Find the loader script to get the base URL
    const script = document.currentScript || (function () {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    const scriptUrl = new URL(script.src);
    const baseUrl = scriptUrl.origin + scriptUrl.pathname.replace('loader.js', '');

    // 2. Inject the Main JS (contains inlined Shadow DOM CSS)
    if (!document.getElementById('booking-widget-js')) {
        const js = document.createElement('script');
        js.id = 'booking-widget-js';
        js.src = baseUrl + 'widget.iife.js';
        js.async = true;
        document.body.appendChild(js);
    }
})();

