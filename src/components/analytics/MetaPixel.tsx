import { useEffect } from 'react';
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

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '3880541648922362';

let pixelInitDone = false;

function ensureFbq(): void {
  if (typeof window === 'undefined' || window.fbq) return;

  const fbq = function (this: unknown, ...args: unknown[]) {
    const self = fbq as MetaPixelFbq;
    self.callMethod
      ? self.callMethod.apply(self, args)
      : self.queue.push(args);
  } as MetaPixelFbq;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode!.insertBefore(script, firstScript);
}

type PixelParams = Record<string, unknown>;

function track(eventName: string, params?: PixelParams): void {
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
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

export function MetaPixel() {
  const location = useLocation();

  useEffect(() => {
    if (!PIXEL_ID || pixelInitDone) return;
    ensureFbq();
    window.fbq!('init', PIXEL_ID);
    pixelInitDone = true;
  }, []);

  useEffect(() => {
    if (!PIXEL_ID || !window.fbq) return;
    track('PageView');
  }, [location.pathname, location.search]);

  return null;
}
