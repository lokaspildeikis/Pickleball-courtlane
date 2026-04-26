type PixelParams = Record<string, unknown>;

export function trackViewContent(params: PixelParams): void {
  // Removed custom Meta ViewContent tracking implementation.
  // Shopify native integration handles this event.
  void params;
}

export function trackAddToCart(params: PixelParams): void {
  // Removed custom Meta AddToCart tracking implementation.
  // Shopify native integration handles this event.
  void params;
}

export function trackInitiateCheckout(params: PixelParams): void {
  // Removed custom Meta InitiateCheckout tracking implementation.
  // Shopify native integration handles this event.
  void params;
}

export function trackCustomEvent(eventName: string, params?: PixelParams): void {
  // Removed all custom Meta custom-event tracking implementation.
  // Shopify native integration handles tracking events.
  void eventName;
  void params;
}

export function MetaPixel() {
  // Removed custom Meta Pixel runtime component.
  // Intentionally no-op because Shopify native integration is the source of truth.
  return null;
}
