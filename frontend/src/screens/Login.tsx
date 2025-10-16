import { useState } from 'react';

const API = import.meta.env.VITE_API_BASE;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, seatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('Logowanie...');
const url = `${import.meta.env.VITE_API_BASE}/api/auth/login`;
console.log('LOGIN URL ->', url);

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
        setMessage('✅ Zalogowano pomyślnie!');
      } else {
        setMessage(`❌ ${data.error || res.statusText}`);
      }
    } catch (err: any) {
      setMessage(`Błąd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={{ padding: 20 }}>
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => seatPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}


