import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Minus, Plus, CreditCard } from 'lucide-react';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/inventory/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert("Not enough stock available!");
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stockQuantity < 1) {
        alert("Out of stock!");
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
      setShowCart(true);
    }
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.product.stockQuantity) {
          alert("Not enough stock!");
          return item;
        }
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    const payload = {
      paymentMethod: "CARD", 
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    fetch('http://localhost:8080/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Checkout failed');
      return res.json();
    })
    .then(() => {
      alert('Thank you for your order! It will be shipped soon.');
      setCart([]);
      setShowCart(false);
      return fetch('http://localhost:8080/api/inventory/products');
    })
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(err => alert(err.message))
    .finally(() => setIsSubmitting(false));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Navigation */}
      <nav className="glass-panel" style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-color)' }}>
          <ShoppingBag /> Acme Store
        </div>
        <button onClick={() => setShowCart(!showCart)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
          <ShoppingCart size={18} /> {cartItemCount} Items (${cartTotal.toFixed(2)})
        </button>
      </nav>

      <div style={{ display: 'flex', padding: '2rem 5%', gap: '2rem' }}>
        
        {/* Product Catalog */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: '600' }}>Latest Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {products.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No products available at the moment.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    [Product Image]
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{product.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>SKU: {product.sku}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-color)' }}>${product.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(product)} disabled={product.stockQuantity < 1} style={{ background: product.stockQuantity < 1 ? 'rgba(255,255,255,0.1)' : 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: product.stockQuantity < 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                      {product.stockQuantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Slide-out Cart */}
        {showCart && (
          <div className="glass-panel" style={{ width: '350px', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Your Cart</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.product.name}</div>
                      <div style={{ color: 'var(--accent-color)', fontSize: '0.875rem' }}>${item.product.price.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => updateCartQuantity(item.product.id, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--accent-color)' }}>${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                style={{ width: '100%', padding: '1rem', background: 'var(--success-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: (cart.length === 0 || isSubmitting) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <CreditCard size={20} /> {isSubmitting ? 'Processing...' : 'Pay Securely'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
