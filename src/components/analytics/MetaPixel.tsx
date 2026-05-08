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
const VISITOR_STATE_KEY = 'pb_visitor_state_v1';
const PURCHASE_TRACKED_PREFIX = 'pb_purchase_tracked_';

type VisitorState = {
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
};

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

export function trackPurchase(params: PixelParams): void {
  track('Purchase', params);
}

function extractPurchaseValue(searchParams: URLSearchParams): number | null {
  const valueCandidates = ['value', 'amount', 'total', 'order_total', 'total_price'];
  for (const key of valueCandidates) {
    const raw = searchParams.get(key);
    if (!raw) continue;
    const normalized = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isFinite(normalized) && normalized > 0) {
      return normalized;
    }
  }
  return null;
}

function maybeTrackPurchase(pathname: string, search: string): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  const normalizedPath = pathname.toLowerCase();
  const isThankYouRoute =
    normalizedPath.includes('thank-you') ||
    normalizedPath.includes('thank_you') ||
    normalizedPath.includes('order-confirmation') ||
    normalizedPath.includes('order_confirmation') ||
    normalizedPath.includes('order-received') ||
    normalizedPath.includes('order_received');

  if (!isThankYouRoute) return;

  const searchParams = new URLSearchParams(search);
  const orderId =
    searchParams.get('order_id') ||
    searchParams.get('orderId') ||
    searchParams.get('order') ||
    searchParams.get('checkout_id') ||
    `${pathname}${search}`;
  const trackerKey = `${PURCHASE_TRACKED_PREFIX}${orderId}`;

  if (window.sessionStorage.getItem(trackerKey) === '1') return;

  const value = extractPurchaseValue(searchParams);
  trackPurchase({
    value: value ?? 0,
    currency: 'EUR',
  });
  window.sessionStorage.setItem(trackerKey, '1');
}

function trackVisitorType(): void {
  if (typeof window === 'undefined') return;

  const nowIso = new Date().toISOString();
  let priorState: VisitorState | null = null;

  try {
    const raw = window.localStorage.getItem(VISITOR_STATE_KEY);
    if (raw) {
      priorState = JSON.parse(raw) as VisitorState;
    }
  } catch {
    priorState = null;
  }

  const isReturningVisitor = Boolean(priorState?.visitCount && priorState.visitCount > 0);
  const nextState: VisitorState = {
    firstSeenAt: priorState?.firstSeenAt || nowIso,
    lastSeenAt: nowIso,
    visitCount: (priorState?.visitCount || 0) + 1,
  };

  try {
    window.localStorage.setItem(VISITOR_STATE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage failures and still emit event below.
  }

  trackCustomEvent('VisitorTypeDetected', {
    visitor_type: isReturningVisitor ? 'returning' : 'new',
    visit_count: nextState.visitCount,
    first_seen_at: nextState.firstSeenAt,
    last_seen_at: nextState.lastSeenAt,
  });
}

export function MetaPixel() {
  const location = useLocation();
  const hasTrackedVisitorType = useRef(false);
  const lastProcessedRouteRef = useRef<string>('');

  useEffect(() => {
    if (hasTrackedVisitorType.current) return;
    hasTrackedVisitorType.current = true;
    trackVisitorType();
  }, []);

  useEffect(() => {
    const routeKey = `${location.pathname}${location.search}`;
    if (lastProcessedRouteRef.current === routeKey) return;

    const processRouteEvents = () => {
      if (!window.fbq) return false;
      maybeTrackPurchase(location.pathname, location.search);
      lastProcessedRouteRef.current = routeKey;
      return true;
    };

    if (processRouteEvents()) return;

    let attempts = 0;
    const maxAttempts = 20;
    const retryInterval = window.setInterval(() => {
      attempts += 1;
      if (processRouteEvents() || attempts >= maxAttempts) {
        window.clearInterval(retryInterval);
      }
    }, 250);

    return () => window.clearInterval(retryInterval);
  }, [location.pathname, location.search]);

  return null;
}
