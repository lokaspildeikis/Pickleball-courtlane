import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq?: MetaPixelFbq;
    _fbq?: MetaPixelFbq;
  }
}

type MetaPixelFbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: MetaPixelFbq;
};

type PixelParams = Record<string, unknown>;

function track(eventName: string, params?: PixelParams): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (params) {
    window.fbq('track', eventName, params);
    return;
  }
  window.fbq('track', eventName);
}

export function trackViewContent(params: PixelParams): void {
  track('ViewContent', params);
}

export function trackAddToCart(params: PixelParams): void {
  track('AddToCart', params);
}

export function trackInitiateCheckout(params: PixelParams): void {
  track('InitiateCheckout', params);
}

export function trackCustomEvent(eventName: string, params?: PixelParams): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (params) {
    window.fbq('trackCustom', eventName, params);
    return;
  }
  window.fbq('trackCustom', eventName);
}

export function MetaPixel() {
  const location = useLocation();
  const hasTrackedInitialRoute = useRef(false);

  useEffect(() => {
    if (!window.fbq) return;
    if (!hasTrackedInitialRoute.current) {
      hasTrackedInitialRoute.current = true;
      return;
    }
    track('PageView');
  }, [location.pathname, location.search]);

  return null;
}
