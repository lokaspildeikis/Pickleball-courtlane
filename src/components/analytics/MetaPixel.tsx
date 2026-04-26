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
  const hasTrackedInitialRoute = useRef(false);
  const hasTrackedVisitorType = useRef(false);

  useEffect(() => {
    if (hasTrackedVisitorType.current) return;
    hasTrackedVisitorType.current = true;
    trackVisitorType();
  }, []);

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
