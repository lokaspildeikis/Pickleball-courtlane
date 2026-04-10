import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:handle" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
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
