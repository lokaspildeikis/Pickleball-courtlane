import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MetaPixel } from './components/analytics/MetaPixel';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Shipping } from './pages/Shipping';
import { Returns } from './pages/Returns';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <MetaPixel />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:handle" element={<ProductDetail />} />
            <Route path="our-story" element={<About />} />
            <Route path="about" element={<Navigate to="/our-story" replace />} />
            <Route path="shop/bundles" element={<Navigate to="/shop?filter=bundles" replace />} />
            <Route path="shop/essentials" element={<Navigate to="/shop?filter=essentials" replace />} />
            <Route path="shop/grips" element={<Navigate to="/shop?filter=grips" replace />} />
            <Route path="shop/protection" element={<Navigate to="/shop?filter=protection" replace />} />
            <Route path="shop/backpacks" element={<Navigate to="/shop?filter=backpacks" replace />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="returns" element={<Returns />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}
