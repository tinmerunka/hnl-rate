import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#1c1f2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
      color: '#fff',
    }}>
      <div style={{
        width: '42px', height: '42px',
        background: '#e63946',
        borderRadius: '50%',
        marginBottom: '24px',
      }} />

      <p style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#e63946', margin: '0 0 12px',
      }}>
        SuperSport HNL
      </p>

      <h1 style={{
        fontSize: '48px', fontWeight: 800,
        letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.1,
        textAlign: 'center',
      }}>
        Dobrodošli<span style={{ color: '#e63946' }}>.</span>
      </h1>

      <p style={{
        fontSize: '15px', color: 'rgba(255,255,255,0.4)',
        margin: '0 0 40px', textAlign: 'center',
      }}>
        Platforma za ocjenjivanje igrača Hrvatske nogometne lige.
      </p>

      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '14px 36px',
          background: '#e63946',
          border: 'none',
          borderRadius: '100px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#c1121f'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#e63946'; }}
      >
        Prijava →
      </button>
    </div>
  );
}

export default Landing;
