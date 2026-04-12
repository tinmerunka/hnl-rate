import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:8080/api/clubs', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setClubs(data))
      .catch(() => setError('Greška pri dohvaćanju klubova.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-hnl-bg text-white">

      {/* header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-[28px] h-[28px] bg-hnl-red rounded-full" />
          <span className="font-bold text-[15px] tracking-tight">
            HNL Rate<span className="text-hnl-red">.</span>
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <span className="text-[13px] font-semibold text-white border-b border-hnl-red pb-0.5">
            Klubovi
          </span>
          <button
            onClick={handleLogout}
            className="text-[13px] text-white/40 hover:text-white transition-colors duration-150 cursor-pointer"
          >
            Odjava
          </button>
        </nav>
      </header>

      {/* main */}
      <main className="px-10 py-10">

        {/* page title */}
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-2">
            Admin panel
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Klubovi<span className="text-hnl-red">.</span>
          </h1>
        </div>

        {/* states */}
        {loading && (
          <p className="text-white/40 text-sm">Učitavanje...</p>
        )}

        {error && (
          <p className="text-hnl-red text-sm">{error}</p>
        )}

        {/* grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-hnl-card rounded-[16px] p-5 flex flex-col items-center gap-3 border border-white/[0.05] hover:border-white/[0.12] transition-colors duration-150"
              >
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="w-16 h-16 object-contain"
                />
                <div className="text-center">
                  <p className="text-[13px] font-bold leading-tight">{club.name}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{club.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Clubs;
