import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.name, form.password, form.phone);
      onClose();
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="auth-modal__backdrop" role="presentation" onMouseDown={onClose}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="auth-modal__close" onClick={onClose} aria-label="Close account dialog">×</button>
      <p className="eyebrow">FARMING TECH SHOP</p>
      <h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : 'Create your farm account.'}</h2>
      <p className="auth-modal__lede">Sign in to sync your cart and keep agricultural supplies ready across devices.</p>
      <div className="auth-modal__tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>
      <form onSubmit={submit}>
        {mode === 'register' && <label>FULL NAME<input name="name" value={form.name} onChange={change} required minLength="3" /></label>}
        <label>EMAIL<input name="email" type="email" value={form.email} onChange={change} required /></label>
        {mode === 'register' && <label>PHONE <span>(optional)</span><input name="phone" value={form.phone} onChange={change} /></label>}
        <label>PASSWORD<input name="password" type="password" value={form.password} onChange={change} required minLength="6" /></label>
        {error && <p className="auth-modal__error" role="alert">{error}</p>}
        <button className="auth-modal__submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in & sync cart' : 'Create account & sync cart'}</button>
      </form>
    </section>
  </div>;
}
