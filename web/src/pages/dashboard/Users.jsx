import { useState, useEffect, useCallback } from 'react';
import { getUsers, setUserBlocked } from '../../services/userAdminService';
import Modal from '../../components/Modal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [blockTarget, setBlockTarget] = useState(null); // { user, nextBlocked }
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBlockToggle = async () => {
    setSaving(true);
    try {
      await setUserBlocked(blockTarget.user.id, blockTarget.nextBlocked);
      setBlockTarget(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
      setBlockTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const roleBadge = (role) => {
    if (role === 'ADMIN') return 'bg-hnl-red/10 text-hnl-red';
    return 'bg-white/[0.06] text-white/40';
  };

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-hnl-red mb-1">Upravljanje</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Korisnici</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Pretraži po korisničkom imenu ili emailu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 bg-white/[0.05] border border-white/10 focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/10 focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors [&>option]:bg-[#252838]"
        >
          <option value="">Sve uloge</option>
          <option value="USER">Korisnik</option>
          <option value="ADMIN">Admin</option>
        </select>
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} korisnika</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/30 rounded-lg text-hnl-red text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/30 text-sm">Učitavanje...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/25">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 mb-3 opacity-40">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            <p className="text-sm">Nema korisnika.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Korisničko ime', 'Email', 'Uloga', 'Omiljeni klub', 'Status', ''].map((h, i) => (
                  <th key={i} className={`text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3 ${i === 5 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-white">{u.username}</td>
                  <td className="px-5 py-3.5 text-[13px] text-white/50">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Korisnik'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.favoriteClub ? (
                      <div className="flex items-center gap-2">
                        {u.favoriteClub.logoUrl ? (
                          <img src={u.favoriteClub.logoUrl} alt={u.favoriteClub.name}
                            className="w-4 h-4 object-contain shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : null}
                        <span className="text-[13px] text-white/50">{u.favoriteClub.name}</span>
                      </div>
                    ) : (
                      <span className="text-white/20 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.blocked ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-hnl-red/10 text-hnl-red">
                        Blokiran
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        Aktivan
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setBlockTarget({ user: u, nextBlocked: !u.blocked })}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        u.blocked
                          ? 'text-white/35 hover:text-green-400 hover:bg-green-500/10'
                          : 'text-white/35 hover:text-hnl-red hover:bg-hnl-red/10'
                      }`}
                      title={u.blocked ? 'Odblokiraj' : 'Blokiraj'}
                    >
                      {u.blocked ? (
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M11 1a2 2 0 012 2v4a2 2 0 01.44 3.947A2 2 0 0113 12v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 01-.44-1.053A2 2 0 013 7V3a2 2 0 012-2zm0 1H5a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1zM5 12v2h6v-2H5z" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Block/Unblock confirmation */}
      {blockTarget && (
        <Modal
          title={blockTarget.nextBlocked ? 'Blokiraj korisnika' : 'Odblokiraj korisnika'}
          onClose={() => setBlockTarget(null)}
          footer={<>
            <button onClick={() => setBlockTarget(null)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer">
              Otkaži
            </button>
            <button onClick={handleBlockToggle} disabled={saving}
              className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer">
              {saving ? 'Spremanje...' : (blockTarget.nextBlocked ? 'Blokiraj' : 'Odblokiraj')}
            </button>
          </>}>
          <p className="text-white/60 text-sm">
            {blockTarget.nextBlocked
              ? <>Sigurno želiš blokirati korisnika <span className="text-white font-semibold">{blockTarget.user.username}</span>? Korisnik se neće moći prijaviti.</>
              : <>Sigurno želiš odblokirati korisnika <span className="text-white font-semibold">{blockTarget.user.username}</span>?</>
            }
          </p>
        </Modal>
      )}
    </div>
  );
}
