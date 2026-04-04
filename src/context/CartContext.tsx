import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

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
    // In a real Shopify implementation, this would call the Storefront API
    // to create a checkout with the current line items and return the webUrl.
    // For this demo, we'll just simulate a delay and redirect to a mock URL.
    
    // Example Shopify API call:
    // const mutation = `mutation checkoutCreate($input: CheckoutCreateInput!) { ... }`
    // const variables = { input: { lineItems: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })) } }
    // const response = await shopifyFetch(mutation, variables);
    // window.location.href = response.data.checkoutCreate.checkout.webUrl;

    console.log("Creating Shopify checkout with items:", items);
    
    // Mock checkout process
    setTimeout(() => {
      alert("In a real implementation, you would be redirected to Shopify Checkout now.\n\nItems: " + items.map(i => `${i.quantity}x ${i.title}`).join(', '));
    }, 500);
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
      createCheckout
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
