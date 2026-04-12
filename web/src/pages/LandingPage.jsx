<<<<<<< Updated upstream
=======
import { useEffect } from 'react';
>>>>>>> Stashed changes
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
<<<<<<< Updated upstream

  return (
    <div className="fixed inset-0 bg-hnl-bg flex flex-col items-center justify-center text-white p-7">
=======
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      navigate('/klubovi', { replace: true });
    }
  }, []);


  return (
    <div className="fixed inset-0 bg-hnl-bg flex flex-col items-center justify-center text-white p-7">

>>>>>>> Stashed changes
      <div className="w-[42px] h-[42px] bg-hnl-red rounded-full mb-6" />

      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-3">
        SuperSport HNL
      </p>

<<<<<<< Updated upstream
      <h1 className="text-5xl font-extrabold tracking-tighter mb-3 text-center leading-tight">
        Dobrodošli<span className="text-hnl-red">.</span>
      </h1>

      <p className="text-[15px] text-white/40 mb-10 text-center">
        Platforma za ocjenjivanje igrača Hrvatske nogometne lige.
      </p>

      <button
        onClick={() => navigate('/login')}
        className="py-[14px] px-9 bg-hnl-red hover:bg-hnl-red-dark rounded-full text-white text-sm font-bold cursor-pointer transition-colors duration-150"
      >
        Prijava →
      </button>
=======
      <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-center leading-tight">
        HNL Rate<span className="text-hnl-red">.</span>
      </h1>

      <p className="text-[15px] text-white/50 mb-3 text-center max-w-sm leading-relaxed">
        Platforma za ocjenjivanje igrača Hrvatske nogometne lige.
      </p>

      <p className="text-[13px] text-white/30 mb-10 text-center max-w-xs leading-relaxed">
        Prati svoje omiljene klubove, ocjenjuj nastupe igrača i usporedi svoja mišljenja s ostalim navijačima.
      </p>

      {!token && (
        <button
          onClick={() => navigate('/login')}
          className="py-[14px] px-9 bg-hnl-red hover:bg-hnl-red-dark rounded-full text-white text-sm font-bold cursor-pointer transition-colors duration-150"
        >
          Prijava →
        </button>
      )}
>>>>>>> Stashed changes
    </div>
  );
}

export default Landing;
