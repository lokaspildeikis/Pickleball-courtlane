import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { shopifyFetch } from '../lib/shopify';
import { getMarketingEmail } from '../lib/marketingIdentity';

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  checkoutUrl: string | null;
  createCheckout: () => Promise<void>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const storefrontDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pb_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('pb_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === '1') {
      setIsCartOpen(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const email = getMarketingEmail();
    if (!email || items.length === 0) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const payload = {
        eventType: 'cart_updated',
        email,
        source: 'storefront-cart',
        cartUrl: `${window.location.origin}/?openCart=1`,
        currency: 'USD',
        subtotal: Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
        items: items.slice(0, 8).map((item) => ({
          productId: item.productId,
          title: item.title,
          variantTitle: item.variantTitle,
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.price,
          productUrl: `${window.location.origin}/shop`,
        })),
      };

      fetch('/api/cart-abandonment-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).catch(() => {
        // Best-effort tracking only.
      });
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.variantId === newItem.variantId);
      if (existingItemIndex >= 0) {
        const updated = [...prev];
        updated[existingItemIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, id: Math.random().toString(36).substring(7) }];
    });
    openCart();
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  const createCheckout = async () => {
    if (!items.length || isCheckingOut) return;

    setIsCheckingOut(true);
    const email = getMarketingEmail();
    if (email && typeof window !== 'undefined') {
      fetch('/api/cart-abandonment-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          eventType: 'checkout_started',
          email,
          source: 'storefront-cart',
          cartUrl: `${window.location.origin}/?openCart=1`,
        }),
      }).catch(() => {
        // Best-effort tracking only.
      });
    }
    // Removed custom Meta InitiateCheckout event.
    // Shopify native "Facebook & Instagram" integration sends checkout events.
    try {
      const mutation = `
        mutation cartCreate($input: CartInput) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          buyerIdentity: {
            countryCode: "US",
          },
          lines: items.map((item) => ({
            merchandiseId: item.variantId,
            quantity: item.quantity
          })),
        },
      };

      const response = await shopifyFetch({ query: mutation, variables });
      const payload = response.body?.data?.cartCreate;
      const userErrors = payload?.userErrors || [];
      const webUrl = payload?.cart?.checkoutUrl as string | undefined;

      if (userErrors.length > 0) {
        throw new Error(userErrors.map((e: { message: string }) => e.message).join(', '));
      }

      if (!webUrl) {
        throw new Error('Checkout URL was not returned by Shopify cartCreate.');
      }

      let redirectUrl = webUrl;
      // If Shopify returns checkout on custom domain (mapped to Vercel),
      // force redirect to myshopify domain so checkout path resolves correctly.
      if (storefrontDomain) {
        try {
          const parsed = new URL(webUrl, `https://${storefrontDomain}`);
          parsed.hostname = storefrontDomain;
          parsed.protocol = 'https:';
          redirectUrl = parsed.toString();
        } catch {
          // Keep original URL if parsing fails.
          redirectUrl = `https://${storefrontDomain}${webUrl.startsWith('/') ? '' : '/'}${webUrl}`;
        }
      }

      setCheckoutUrl(redirectUrl);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Checkout creation failed:', error);
      // Fallback: redirect through Shopify cart permalink.
      // This keeps checkout working even when Storefront checkoutCreate fails.
      try {
        if (!storefrontDomain) {
          throw new Error('VITE_SHOPIFY_STORE_DOMAIN is missing.');
        }

        const lineItems = items
          .map((item) => {
            const variantNumericId = item.variantId.split('/').pop();
            if (!variantNumericId) return null;
            return `${variantNumericId}:${item.quantity}`;
          })
          .filter(Boolean)
          .join(',');

        if (!lineItems) {
          throw new Error('No valid variant IDs found for checkout.');
        }

        const fallbackUrl = `https://${storefrontDomain}/cart/${lineItems}`;
        setCheckoutUrl(fallbackUrl);
        window.location.href = fallbackUrl;
        return;
      } catch (fallbackError) {
        console.error('Fallback checkout failed:', fallbackError);
        alert('Could not start checkout. Please verify Shopify env settings and try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider value={{
      isCartOpen,
      openCart,
      closeCart,
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      cartCount,
      checkoutUrl,
      createCheckout,
      isCheckingOut
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
