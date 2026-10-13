"use strict";

/* ==========================================
TASKFLIX — SERVICE WORKER REGISTRATION
Register the root-level service worker
========================================== */

async function registerTaskflixServiceWorker() {
if (!("serviceWorker" in navigator)) {
console.info(
"TASKFLIX: Service workers are not supported in this browser."
);
return null;
}

/*
 * Service workers require HTTPS or localhost.
 * GitHub Pages supports HTTPS.
 */
const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

if (window.location.protocol !== "https:" && !isLocalhost) {
    console.warn(
        "TASKFLIX: HTTPS is required to register the service worker."
    );
    return null;
}

try {
    const registration = await navigator.serviceWorker.register(
        "./service-worker.js",
        {
            scope: "./"
        }
    );

    console.info("TASKFLIX: Service worker registered successfully.");

    return registration;
} catch (error) {
    console.error(
        "TASKFLIX: Service worker registration failed.",
        error
    );

    return null;
}

}

document.addEventListener("DOMContentLoaded", () => {
registerTaskflixServiceWorker();
});
