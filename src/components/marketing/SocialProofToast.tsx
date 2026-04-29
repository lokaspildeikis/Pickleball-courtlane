import { useEffect, useState } from 'react';

type AddToCartEvent = {
  detail?: {
    title?: string;
    quantity?: number;
  };
};

const PEOPLE = ['Anna', 'Matas', 'Emilia', 'Jonas', 'Lina', 'Paulius', 'Greta', 'Lukas'];
const CITIES = ['Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Panevezys'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const onAdded = (event: Event) => {
      const custom = event as CustomEvent<AddToCartEvent['detail']>;
      const productTitle = custom.detail?.title || 'this item';
      const quantity = custom.detail?.quantity || 1;
      const buyer = randomFrom(PEOPLE);
      const city = randomFrom(CITIES);
      const minutesAgo = Math.floor(Math.random() * 8) + 1;
      const itemLabel = quantity > 1 ? `${quantity}x ${productTitle}` : productTitle;

      setMessage(`${buyer} from ${city} added ${itemLabel} ${minutesAgo} min ago`);
      setIsVisible(true);
    };

    window.addEventListener('courtlane:add-to-cart', onAdded);
    return () => window.removeEventListener('courtlane:add-to-cart', onAdded);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(() => setIsVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[75] max-w-sm rounded-sm border border-teal-200 bg-white p-3 shadow-lg">
      <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">Recent activity</p>
      <p className="mt-1 text-sm text-gray-800">{message}</p>
    </div>
  );
}
