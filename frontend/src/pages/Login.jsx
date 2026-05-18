import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, User, Mail, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        login(data);
        navigate('/'); // Take user to the landing page
      } else {
        const res = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        // Auto-login after register
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          login(loginData);
          navigate('/'); // Take user to the landing page
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink-0)'
    }}>
      <div className="animate-fade-1" style={{
        width: '100%', maxWidth: '400px', padding: '2rem',
        background: 'var(--ink-1)', border: '1px solid var(--border-1)',
        borderRadius: 'var(--r-xl)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--r-md)', margin: '0 auto 1rem',
            background: 'var(--blue-glow-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--blue-400)'
          }}>
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            FinSmart<span style={{ color: 'var(--emerald)' }}>AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to get started.'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem', marginBottom: '1rem', borderRadius: 'var(--r-md)',
            background: 'var(--red-glow-soft)', color: 'var(--red-400)',
            fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" className="input-control" required
                  placeholder="John Doe"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email" className="input-control" required
                placeholder="name@example.com"
                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password" className="input-control" required
                placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (isLogin ? <><LogIn size={16}/> Sign In</> : <><UserPlus size={16}/> Create Account</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--blue-400)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
