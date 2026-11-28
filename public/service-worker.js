// BridGenta Portfolio — Scoped Service Worker Retirement (DEC-01 Option B)
// Transition-only worker for existing GitHub Pages clients.
// Deletes ONLY BridGenta-owned caches matching OWNED_CACHE_PREFIX,
// reports any cache-deletion failures observably, and unregisters itself.
// Intentionally registers NO fetch handler so all requests go directly to network.

const OWNED_CACHE_PREFIX = "bridgenta-portfolio-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const deletedCaches = [];
      const failedCaches = [];
      let enumerationError = null;

      try {
        const keys = await caches.keys();
        const ownedKeys = keys.filter(
          (key) => typeof key === "string" && key.startsWith(OWNED_CACHE_PREFIX)
        );

        const results = await Promise.allSettled(
          ownedKeys.map(async (key) => {
            const removed = await caches.delete(key);
            if (removed) {
              deletedCaches.push(key);
            } else {
              failedCaches.push({ key, reason: "caches.delete returned false" });
            }
          })
        );

        results.forEach((result, idx) => {
          if (result.status === "rejected") {
            failedCaches.push({
              key: ownedKeys[idx],
              reason: result.reason ? String(result.reason) : "caches.delete rejected",
            });
          }
        });
      } catch (err) {
        enumerationError = err ? String(err) : "caches.keys failed";
      }

      let unregistered = false;
      let unregisterError = null;
      try {
        unregistered = await self.registration.unregister();
      } catch (err) {
        unregisterError = err ? String(err) : "registration.unregister failed";
      }

      const report = {
        type: "BGDE_SW_RETIREMENT_RESULT",
        unregistered,
        unregisterError,
        enumerationError,
        deletedCaches,
        failedCaches,
        cacheCleanupSucceeded:
          enumerationError === null && failedCaches.length === 0,
      };

      if (!report.cacheCleanupSucceeded || !unregistered) {
        console.error("[bgde-sw-retirement] Partial or failed retirement:", report);
      }

      try {
        const windowClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of windowClients) {
          client.postMessage(report);
        }
      } catch {
        // Ignore client notification errors when no clients are attached
      }
    })()
  );
});
