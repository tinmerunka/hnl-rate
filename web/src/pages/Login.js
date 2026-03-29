import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HNL_IMAGE = 'https://hns.family/files/images/_resized/0000046088_914_500_cut_withoutgrow.jpg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError('Pogrešno korisničko ime ili lozinka.');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      navigate('/');
    } catch (err) {
      setError('Greška pri povezivanju s poslužiteljem.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${focused === name ? '#e63946' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px',
    padding: '13px 16px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  });

  return (
    /* ── outer background ── */
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#1c1f2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
      padding: '28px',
      boxSizing: 'border-box',
    }}>

      {/* ── card ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        height: '600px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#252838',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>

        {/* background image — right side only, fades left */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url('${HNL_IMAGE}')`,
          backgroundSize: '135%',
          backgroundPosition: 'right 15%',
        }} />

        {/* image dimmer */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20,22,36,0.72)',
        }} />

        {/* left-to-right fade: solid dark left, image visible right */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to right, #252838 0%, #252838 30%, rgba(37,40,56,0.92) 48%, rgba(37,40,56,0.3) 68%, transparent 100%)',
        }} />

        {/* decorative dashed curve — SVG */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <path
            d="M 480 -10 C 460 150, 520 300, 490 610"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
        </svg>

        {/* ── top nav ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '24px 36px',
          gap: '12px',
          zIndex: 10,
        }}>
          {/* logo */}
          <div style={{
            width: '30px', height: '30px',
            background: '#e63946',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
          }}>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
            HNL Rate<span style={{ color: '#e63946' }}>.</span>
          </span>
        </div>

        {/* ── form content ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: '480px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 48px 48px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#e63946', margin: '0 0 12px',
          }}>
            Admin pristup
          </p>
          <h1 style={{
            fontSize: '34px', fontWeight: 800, color: '#fff',
            letterSpacing: '-0.02em', margin: '0 0 6px', lineHeight: 1.2,
          }}>
            Dobrodošli nazad<span style={{ color: '#e63946' }}>.</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '0 0 32px' }}>
            Ocjenjivanje igrača · Hrvatska nogometna liga
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', marginBottom: '7px',
              }}>
                Korisničko ime
              </label>
              <input
                type="text"
                placeholder="korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
                style={inputStyle('username')}
              />
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label style={{
                display: 'block', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', marginBottom: '7px',
              }}>
                Lozinka
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={inputStyle('password')}
              />
            </div>

            {error && (
              <p style={{ color: '#e63946', fontSize: '12px', margin: '12px 0 0' }}>{error}</p>
            )}

            {/* buttons row */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px',
                  color: 'rgba(255,255,255,0.6)', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                Zaboravili lozinku?
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, padding: '13px',
                  background: loading ? '#a0232b' : '#e63946', border: 'none',
                  borderRadius: '100px',
                  color: '#fff', fontSize: '13px',
                  fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#c1121f'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#e63946'; }}
              >
                {loading ? 'Prijava...' : 'Prijava →'}
              </button>
            </div>
          </form>
        </div>

        {/* bottom-right watermark */}
        <div style={{
          position: 'absolute',
          bottom: '28px', right: '36px',
          color: 'rgba(255,255,255,0.15)',
          fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          zIndex: 10,
        }}>
          SuperSport HNL
        </div>

      </div>
    </div>
  );
}

export default Login;