"use strict";

/* ==========================================
TASKFLIX — SERVICE WORKER
Basic offline shell and push event foundation
========================================== */

const TASKFLIX_CACHE_NAME = "taskflix-shell-v1";

const TASKFLIX_APP_FILES = [
"./",
"./index.html",
"./manifest.json"
];

/**

* Install the service worker and cache the basic app shell.
  */
  self.addEventListener("install", (event) => {
  event.waitUntil(
  caches.open(TASKFLIX_CACHE_NAME)
  .then((cache) => cache.addAll(TASKFLIX_APP_FILES))
  .then(() => self.skipWaiting())
  );
  });

/**

* Remove outdated TASKFLIX caches during activation.
  */
  self.addEventListener("activate", (event) => {
  event.waitUntil(
  caches.keys()
  .then((cacheNames) =>
  Promise.all(
  cacheNames
  .filter(
  (cacheName) =>
  cacheName.startsWith("taskflix-shell-") &&
  cacheName !== TASKFLIX_CACHE_NAME
  )
  .map((cacheName) => caches.delete(cacheName))
  )
  )
  .then(() => self.clients.claim())
  );
  });

/**

* Serve cached app-shell files when available.

* Other requests use the network.
  */
  self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  if (
  request.method !== "GET" ||
  new URL(request.url).origin !== self.location.origin
  ) {
  return;
  }
  
  event.respondWith(
  fetch(request)
  .then((response) => {
  if (response && response.ok) {
  const responseCopy = response.clone();
  
               caches.open(TASKFLIX_CACHE_NAME)
                 .then((cache) => cache.put(request, responseCopy))
                 .catch(() => {});
         }

         return response;
     })
     .catch(async () => {
         const cachedResponse = await caches.match(request);

         if (cachedResponse) {
             return cachedResponse;
         }

         if (request.mode === "navigate") {
             const appShell = await caches.match("./index.html");

             if (appShell) {
                 return appShell;
             }
         }

         return new Response("You are offline.", {
             status: 503,
             headers: {
                 "Content-Type": "text/plain; charset=utf-8"
             }
         });
     })
  
  );
  });

/**

* Display a push notification sent by a configured push service.

* A push service and secure server-side sender are still required.
  */
  self.addEventListener("push", (event) => {
  let payload = {};
  
  if (event.data) {
  try {
  payload = event.data.json();
  } catch (error) {
  payload = {
  body: event.data.text()
  };
  }
  }
  
  const title = String(payload.title || "TASKFLIX");
  const options = {
  body: String(payload.body || "You have a task reminder."),
  tag: String(payload.tag || "taskflix-reminder"),
  data: {
  url: "./index.html"
  }
  };
  
  event.waitUntil(
  self.registration.showNotification(title, options)
  );
  });

/**

* Open TASKFLIX when the user clicks a notification.
  */
  self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const targetUrl = new URL(
  event.notification.data?.url || "./index.html",
  self.location.origin
  );
  
  if (targetUrl.origin !== self.location.origin) {
  return;
  }
  
  event.waitUntil(
  self.clients.matchAll({
  type: "window",
  includeUncontrolled: true
  }).then((clientList) => {
  for (const client of clientList) {
  if ("focus" in client) {
  return client.focus();
  }
  }
  
       if (self.clients.openWindow) {
         return self.clients.openWindow(targetUrl.href);
     }

     return undefined;
 })
  
  );
  });
