import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HNL_IMAGE = 'https://hns.family/files/images/_resized/0000046088_914_500_cut_withoutgrow.jpg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
<<<<<<< Updated upstream
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      navigate('/');
=======
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('username', payload.sub);

      navigate('/klubovi');
>>>>>>> Stashed changes
    } catch (err) {
      setError('Greška pri povezivanju s poslužiteljem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-hnl-bg flex items-center justify-center p-7">

      {/* card */}
      <div className="relative w-full max-w-[1000px] h-[600px] rounded-[20px] overflow-hidden bg-hnl-card shadow-[0_40px_80px_rgba(0,0,0,0.5)]">

        {/* background image */}
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url('${HNL_IMAGE}')`,
            backgroundSize: '135%',
            backgroundPosition: 'right 15%',
          }}
        />

        {/* image dimmer */}
        <div className="absolute inset-0 bg-[rgba(20,22,36,0.72)]" />

        {/* left-to-right fade */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #252838 0%, #252838 30%, rgba(37,40,56,0.92) 48%, rgba(37,40,56,0.3) 68%, transparent 100%)' }}
        />

        {/* decorative dashed curve */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
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

        {/* top nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-9 py-6 gap-3 z-10">
          <div className="w-[30px] h-[30px] bg-hnl-red rounded-full shrink-0" />
          <span className="text-white font-bold text-[15px] tracking-tight">
            HNL Rate<span className="text-hnl-red">.</span>
          </span>
        </div>

        {/* form panel */}
        <div className="absolute top-0 left-0 bottom-0 w-[480px] flex flex-col justify-center px-12 pt-20 pb-12 z-10">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-3">
            Admin pristup
          </p>
          <h1 className="text-[34px] font-extrabold text-white tracking-tight leading-tight mb-1.5">
            Dobrodošli nazad<span className="text-hnl-red">.</span>
          </h1>
          <p className="text-[13px] text-white/35 mb-8">
            Ocjenjivanje igrača · Hrvatska nogometna liga
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-3.5">
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
                Korisničko ime
              </label>
              <input
                type="text"
                placeholder="korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.07] border border-white/10 focus:border-hnl-red rounded-[10px] px-4 py-[13px] text-sm text-white outline-none font-[inherit] transition-colors duration-150"
              />
            </div>

            <div className="mb-1.5">
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
                Lozinka
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.07] border border-white/10 focus:border-hnl-red rounded-[10px] px-4 py-[13px] text-sm text-white outline-none font-[inherit] transition-colors duration-150"
              />
            </div>

            {error && (
              <p className="text-hnl-red text-xs mt-3">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="flex-1 py-[13px] bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-full text-white/60 hover:text-white text-[13px] font-semibold cursor-pointer font-[inherit] transition-all duration-150"
              >
                Zaboravili lozinku?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-[13px] bg-hnl-red hover:bg-hnl-red-dark disabled:bg-hnl-red/60 disabled:cursor-not-allowed rounded-full text-white text-[13px] font-bold cursor-pointer font-[inherit] transition-colors duration-150"
              >
                {loading ? 'Prijava...' : 'Prijava →'}
              </button>
            </div>
          </form>
        </div>

        {/* watermark */}
        <div className="absolute bottom-7 right-9 text-white/15 text-[11px] font-bold tracking-[0.12em] uppercase z-10">
          SuperSport HNL
        </div>

      </div>
    </div>
  );
}

export default Login;
