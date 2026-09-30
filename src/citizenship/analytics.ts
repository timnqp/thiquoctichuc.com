type CitEventParams = Record<string, string | number | boolean>;

function canSend(): boolean {
  return (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    typeof window.gtag === 'function'
  );
}

export function trackCitEvent(name: string, params?: CitEventParams) {
  if (!canSend() || !window.gtag) return;
  window.gtag('event', name, params);
}
