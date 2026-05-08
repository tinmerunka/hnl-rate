import { useState, useEffect, useCallback } from 'react';
import { getUsers, setUserBlocked } from '../../services/userAdminService';
import Modal from '../../components/Modal';

function Avatar({ name }) {
  const letter = name?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center text-[13px] font-bold text-white/50 shrink-0 select-none">
      {letter}
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockTarget, setBlockTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try { setUsers(await getUsers()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBlockToggle = async () => {
    setSaving(true);
    try { await setUserBlocked(blockTarget.user.id, blockTarget.nextBlocked); setBlockTarget(null); fetchAll(); }
    catch (e) { setError(e.message); setBlockTarget(null); }
    finally { setSaving(false); }
  };

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const primary = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Korisnici</h1>
          {!loading && <span className="text-[13px] text-white/25">{users.length}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input type="text" placeholder="Pretraži po korisničkom imenu ili emailu..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors [&>option]:bg-[#252838]">
          <option value="">Sve uloge</option>
          <option value="USER">Korisnik</option>
          <option value="ADMIN">Admin</option>
        </select>
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} korisnika</span>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">Nema korisnika za odabrane filtere.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="w-14 px-5 py-3" />
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Korisnik</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Uloga</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Omiljeni klub</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-24">Status</th>
                <th className="w-36 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={i < 5 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-5 py-3"><div className="h-8 w-8 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse mb-1.5" />
                      <div className="h-3 w-44 rounded bg-white/[0.06] animate-pulse" />
                    </td>
                    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-14 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : filtered.map((u, i) => (
                <tr key={u.id}
                  className={`group ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3">
                    <Avatar name={u.username} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-semibold text-white">{u.username}</p>
                    <p className="text-[12px] text-white/35 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-hnl-red/10 text-hnl-red' : 'bg-white/[0.06] text-white/35'}`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Korisnik'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.favoriteClub ? (
                      <div className="flex items-center gap-2">
                        {u.favoriteClub.logoUrl && (
                          <img src={u.favoriteClub.logoUrl} alt={u.favoriteClub.name} className="w-4 h-4 object-contain shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                        <span className="text-[13px] text-white/45">{u.favoriteClub.name}</span>
                      </div>
                    ) : <span className="text-white/20 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.blocked ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-hnl-red/10 text-hnl-red">Blokiran</span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Aktivan</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setBlockTarget({ user: u, nextBlocked: !u.blocked })}
                      className={`text-[12px] font-medium px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                        u.blocked
                          ? 'border-white/10 text-white/35 hover:text-white/70 hover:border-white/20'
                          : 'border-white/10 text-white/35 hover:text-hnl-red hover:border-hnl-red/25 hover:bg-hnl-red/5'
                      }`}>
                      {u.blocked ? 'Odblokiraj' : 'Blokiraj'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {blockTarget && (
        <Modal
          title={blockTarget.nextBlocked ? 'Blokiraj korisnika' : 'Odblokiraj korisnika'}
          onClose={() => setBlockTarget(null)}
          footer={<><button onClick={() => setBlockTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleBlockToggle} disabled={saving} className={primary}>
              {saving ? 'Spremanje...' : (blockTarget.nextBlocked ? 'Blokiraj' : 'Odblokiraj')}
            </button></>}>
          <p className="text-white/55 text-sm">
            {blockTarget.nextBlocked
              ? <><span className="text-white font-semibold">{blockTarget.user.username}</span> neće se moći prijaviti dok ga ne odblokirate.</>
              : <>Vraćaš pristup korisniku <span className="text-white font-semibold">{blockTarget.user.username}</span>.</>}
          </p>
        </Modal>
      )}
    </div>
  );
}
