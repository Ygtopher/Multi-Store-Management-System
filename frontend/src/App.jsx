import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Package, LayoutDashboard, ShoppingCart, X, LogOut, Plus, Minus, CreditCard } from 'lucide-react';
import Login from './Login';
import Storefront from './Storefront';

function Dashboard({ setToken }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'pos'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', price: '', stockQuantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // POS State
  const [cart, setCart] = useState([]);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:8080/api/inventory/products', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          throw new Error('Unauthorized. Please log in again.');
        }
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    fetch('http://localhost:8080/api/inventory/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
        stockQuantity: parseInt(newProduct.stockQuantity, 10) || 0
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    })
    .then(data => {
      setProducts([...products, data]);
      setShowModal(false);
      setNewProduct({ sku: '', name: '', price: '', stockQuantity: '' });
    })
    .catch(err => alert(err.message))
    .finally(() => setIsSubmitting(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // POS Functions
  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert("Not enough stock!");
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stockQuantity < 1) {
        alert("Out of stock!");
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    const payload = {
      paymentMethod: "CASH",
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    fetch('http://localhost:8080/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Checkout failed');
      return res.json();
    })
    .then(() => {
      alert('Order placed successfully! Stock has been deducted.');
      setCart([]);
      fetchProducts(); // Refresh inventory
    })
    .catch(err => alert(err.message))
    .finally(() => setIsSubmitting(false));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', margin: '1rem', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>StoreAdmin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => setActiveTab('inventory')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: activeTab === 'inventory' ? 'white' : '#94a3b8', textDecoration: 'none', background: activeTab === 'inventory' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}>
            <Package size={20} /> Inventory
          </button>
          <button onClick={() => setActiveTab('pos')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: activeTab === 'pos' ? 'white' : '#94a3b8', textDecoration: 'none', background: activeTab === 'pos' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}>
            <ShoppingCart size={20} /> Point of Sale
          </button>
          
          <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '1rem 2rem 1rem 0', display: 'flex', flexDirection: 'column' }}>
        
        {activeTab === 'inventory' && (
          <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '600' }}>Inventory Overview</h1>
              <button 
                onClick={() => setShowModal(true)}
                style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                + Add Product
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading inventory data...</p>
            ) : error ? (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                Error fetching products: {error}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No products found in inventory.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Add Product" to create one.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>SKU</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Product Name</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Price</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{product.sku}</td>
                      <td style={{ padding: '1rem' }}>{product.name}</td>
                      <td style={{ padding: '1rem' }}>${product.price.toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', background: product.stockQuantity > 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: product.stockQuantity > 10 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                          {product.stockQuantity} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
            {/* POS Products Grid */}
            <div className="glass-panel" style={{ flex: 2, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1.5rem' }}>Point of Sale</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', overflowY: 'auto' }}>
                {products.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{product.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>SKU: {product.sku}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
                      <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>${product.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.8rem', color: product.stockQuantity > 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {product.stockQuantity} Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POS Cart Sidebar */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={24} /> Current Order
              </h2>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>Cart is empty</div>
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
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-color)' }}>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isSubmitting}
                  style={{ width: '100%', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: (cart.length === 0 || isSubmitting) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CreditCard size={20} /> {isSubmitting ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Add New Product</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>SKU</label>
                <input required type="text" className="form-input" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. PRD-001" />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input required type="text" className="form-input" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Mechanical Keyboard" />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" className="form-input" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Stock</label>
                  <input required type="number" className="form-input" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} placeholder="0" />
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/store" element={<Storefront />} />
        <Route 
          path="/login" 
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
