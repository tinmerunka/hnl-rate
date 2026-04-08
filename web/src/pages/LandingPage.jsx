import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-hnl-bg flex flex-col items-center justify-center text-white p-7">
      <div className="w-[42px] h-[42px] bg-hnl-red rounded-full mb-6" />

      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-3">
        SuperSport HNL
      </p>

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
    </div>
  );
}

export default Landing;
