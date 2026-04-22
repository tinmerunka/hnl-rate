import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const HNL_IMAGE = 'https://hns.family/files/images/_resized/0000046088_914_500_cut_withoutgrow.jpg';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Lozinke se ne podudaraju!');
      return;
    }
    if (newPassword.length < 6) {
      setError('Lozinka mora imati najmanje 6 znakova.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Token je nevažeći ili je istekao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-hnl-bg flex items-center justify-center p-7">
      <div className="relative w-full max-w-[1000px] h-[600px] rounded-[20px] overflow-hidden bg-hnl-card shadow-[0_40px_80px_rgba(0,0,0,0.5)]">

        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url('${HNL_IMAGE}')`,
            backgroundSize: '135%',
            backgroundPosition: 'right 15%',
          }}
        />
        <div className="absolute inset-0 bg-[rgba(20,22,36,0.72)]" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #252838 0%, #252838 30%, rgba(37,40,56,0.92) 48%, rgba(37,40,56,0.3) 68%, transparent 100%)' }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path d="M 480 -10 C 460 150, 520 300, 490 610" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="6 8" />
        </svg>

        <div className="absolute top-0 left-0 right-0 flex items-center px-9 py-6 gap-3 z-10">
          <div className="w-[30px] h-[30px] bg-hnl-red rounded-full shrink-0" />
          <span className="text-white font-bold text-[15px] tracking-tight">
            HNL Rate<span className="text-hnl-red">.</span>
          </span>
        </div>

        <div className="absolute top-0 left-0 bottom-0 w-[480px] flex flex-col justify-center px-12 pt-20 pb-12 z-10">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-3">
            Nova lozinka
          </p>
          <h1 className="text-[34px] font-extrabold text-white tracking-tight leading-tight mb-1.5">
            Postavi lozinku<span className="text-hnl-red">.</span>
          </h1>
          <p className="text-[13px] text-white/35 mb-8">
            Unesite novu lozinku za vaš HNL Rate account.
          </p>

          {done ? (
            <div>
              <p className="text-white/70 text-sm mb-6">
                Lozinka je uspješno promijenjena. Možete se prijaviti s novom lozinkom.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-[13px] bg-hnl-red hover:bg-hnl-red-dark rounded-full text-white text-[13px] font-bold cursor-pointer font-[inherit] transition-colors duration-150"
              >
                Prijava →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
                  Nova lozinka
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.07] border border-white/10 focus:border-hnl-red rounded-[10px] px-4 py-[13px] text-sm text-white outline-none font-[inherit] transition-colors duration-150"
                />
              </div>

              <div className="mb-1.5">
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
                  Potvrdi lozinku
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.07] border border-white/10 focus:border-hnl-red rounded-[10px] px-4 py-[13px] text-sm text-white outline-none font-[inherit] transition-colors duration-150"
                />
              </div>

              {error && <p className="text-hnl-red text-xs mt-3">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-[13px] bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-full text-white/60 hover:text-white text-[13px] font-semibold cursor-pointer font-[inherit] transition-all duration-150"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-[13px] bg-hnl-red hover:bg-hnl-red-dark disabled:bg-hnl-red/60 disabled:cursor-not-allowed rounded-full text-white text-[13px] font-bold cursor-pointer font-[inherit] transition-colors duration-150"
                >
                  {loading ? 'Spremanje...' : 'Spremi lozinku →'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="absolute bottom-7 right-9 text-white/15 text-[11px] font-bold tracking-[0.12em] uppercase z-10">
          SuperSport HNL
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
