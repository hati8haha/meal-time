import BASE_URL from "../constants/apiurl";

const BACKEND_COLD_START_EVENT = "backend-cold-start-change";
const SLOW_REQUEST_THRESHOLD = 3000;

let isMonitoring = false;
let originalFetch = null;
let pendingBackendRequests = 0;
let slowBackendRequests = 0;

const isBackendRequest = (resource) => {
  const url = typeof resource === "string" ? resource : resource && resource.url;
  return Boolean(url && BASE_URL && url.indexOf(BASE_URL) === 0);
};

const emitColdStartState = () => {
  window.dispatchEvent(
    new CustomEvent(BACKEND_COLD_START_EVENT, {
      detail: {
        pendingBackendRequests,
        slowBackendRequests,
        isColdStarting: slowBackendRequests > 0,
      },
    })
  );
};

export const startBackendColdStartMonitor = () => {
  if (typeof window === "undefined" || isMonitoring) return;

  originalFetch = window.fetch.bind(window);
  isMonitoring = true;

  window.fetch = (resource, init) => {
    if (!isBackendRequest(resource)) {
      return originalFetch(resource, init);
    }

    let isSlow = false;
    pendingBackendRequests += 1;

    const slowTimer = window.setTimeout(() => {
      isSlow = true;
      slowBackendRequests += 1;
      emitColdStartState();
    }, SLOW_REQUEST_THRESHOLD);

    return originalFetch(resource, init).finally(() => {
      window.clearTimeout(slowTimer);
      pendingBackendRequests = Math.max(0, pendingBackendRequests - 1);

      if (isSlow) {
        slowBackendRequests = Math.max(0, slowBackendRequests - 1);
      }

      emitColdStartState();
    });
  };
};

export const subscribeBackendColdStart = (listener) => {
  window.addEventListener(BACKEND_COLD_START_EVENT, listener);
  return () => window.removeEventListener(BACKEND_COLD_START_EVENT, listener);
};
