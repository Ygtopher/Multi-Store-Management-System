import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

export default function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      
      setToken(data.token);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top left, #1e293b, #0f172a)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', margin: '1rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '100px', height: '100px', background: 'var(--primary-color)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '100px', height: '100px', background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.5 }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ color: '#94a3b8' }}>{isLogin ? 'Sign in to access your dashboard' : 'Join to manage your stores'}</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input required type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input required type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@store.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input required type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
