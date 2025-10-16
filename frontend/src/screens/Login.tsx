import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const API = import.meta.env.VITE_API_BASE as string;

export default function Login() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Logowanie...');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refresh();                // <- USTAWI isAuthed=true
        setMsg('✅ Zalogowano');
      } else {
        setMsg(`❌ ${data.error || res.statusText}`);
      }
    } catch (err: any) {
      setMsg(`Błąd: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <br />
        <input type="password" placeholder="Hasło" value={password} onChange={e=>setPassword(e.target.value)} required />
        <br />
        <button type="submit">Zaloguj</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}


