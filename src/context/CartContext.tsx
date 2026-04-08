import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { shopifyFetch } from '../lib/shopify';

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
    try {
      const mutation = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
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
          lineItems: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      };

      const response = await shopifyFetch({ query: mutation, variables });
      const payload = response.body?.data?.checkoutCreate;
      const userErrors = payload?.userErrors || [];
      const webUrl = payload?.checkout?.webUrl as string | undefined;

      if (userErrors.length > 0) {
        throw new Error(userErrors.map((e: { message: string }) => e.message).join(', '));
      }

      if (!webUrl) {
        throw new Error('Checkout URL was not returned by Shopify.');
      }

      setCheckoutUrl(webUrl);
      window.location.href = webUrl;
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
