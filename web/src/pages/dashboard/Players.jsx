import { useState, useEffect, useCallback } from 'react';
import { getPlayers, createPlayer, updatePlayer, deletePlayer, syncPlayers } from '../../services/playerService';
import { getClubs } from '../../services/clubService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { firstName: '', lastName: '', position: '', number: '', clubId: '' };

const POSITIONS = [
  { value: 'GOALKEEPER', label: 'Golman', short: 'GK', color: 'bg-yellow-500/10 text-yellow-400' },
  { value: 'DEFENDER', label: 'Branič', short: 'DEF', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'MIDFIELDER', label: 'Vezni', short: 'MID', color: 'bg-purple-500/10 text-purple-400' },
  { value: 'FORWARD', label: 'Napadač', short: 'FWD', color: 'bg-hnl-red/10 text-hnl-red' },
];

const posInfo = (pos) => POSITIONS.find((p) => p.value === pos) ?? null;

function PlayerForm({ value, onChange, clubs }) {
  const inp = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors [&>option]:bg-[#252838] placeholder:text-white/20';
  const lbl = 'block text-[11px] font-medium text-white/35 mb-1.5';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Ime *</label>
          <input autoFocus type="text" placeholder="Luka" value={value.firstName}
            onChange={(e) => onChange({ ...value, firstName: e.target.value })} className={inp} />
        </div>
        <div>
          <label className={lbl}>Prezime *</label>
          <input type="text" placeholder="Modrić" value={value.lastName}
            onChange={(e) => onChange({ ...value, lastName: e.target.value })} className={inp} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Pozicija</label>
          <select value={value.position} onChange={(e) => onChange({ ...value, position: e.target.value })} className={inp}>
            <option value="">Odaberi poziciju</option>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Broj dresa</label>
          <input type="number" min="1" max="99" placeholder="10" value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })} className={inp} />
        </div>
      </div>
      <div>
        <label className={lbl}>Klub *</label>
        <select value={value.clubId} onChange={(e) => onChange({ ...value, clubId: e.target.value })} className={inp}>
          <option value="">Odaberi klub</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}

const syncSpin = <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-spin"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const syncIdle = <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const syncOk = <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [syncState, setSyncState] = useState('idle');

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [p, c] = await Promise.all([getPlayers(), getClubs()]);
      setPlayers(p); setClubs(c);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    if (!form.firstName.trim()) return 'Ime je obavezno.';
    if (!form.lastName.trim()) return 'Prezime je obavezno.';
    if (!form.clubId) return 'Odaberi klub.';
    return null;
  };

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(''); setAddOpen(true); };
  const openEdit = (p) => {
    setForm({ firstName: p.firstName ?? '', lastName: p.lastName ?? '', position: p.position ?? '', number: p.number != null ? String(p.number) : '', clubId: String(p.club?.id ?? '') });
    setFormError(''); setEditTarget(p);
  };

  const toPayload = (f) => ({ ...f, clubId: Number(f.clubId), number: f.number ? Number(f.number) : null });

  const handleAdd = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await createPlayer(toPayload(form)); setAddOpen(false); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await updatePlayer(editTarget.id, toPayload(form)); setEditTarget(null); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deletePlayer(deleteTarget.id); setDeleteTarget(null); fetchAll(); }
    catch (e) { setError(e.message); setDeleteTarget(null); }
    finally { setSaving(false); }
  };

  const handleSync = async () => {
    setSyncState('syncing');
    try { await syncPlayers(); fetchAll(); setSyncState('ok'); }
    catch { setSyncState('error'); }
    finally { setTimeout(() => setSyncState('idle'), 2200); }
  };

  const filtered = players
    .filter((p) => {
      if (clubFilter && String(p.club?.id) !== clubFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${p.firstName} ${p.lastName}`.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`));

  const syncCls = syncState === 'ok' ? 'border-green-500/25 text-green-400 bg-green-500/5' : syncState === 'error' ? 'border-hnl-red/25 text-hnl-red bg-hnl-red/5' : 'border-white/10 text-white/45 hover:text-white/75 hover:border-white/20';
  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const primary = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Igrači</h1>
          {!loading && <span className="text-[13px] text-white/25">{players.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncState === 'syncing'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[13px] font-medium transition-all duration-200 cursor-pointer disabled:cursor-wait ${syncCls}`}>
            {syncState === 'syncing' ? syncSpin : syncState === 'ok' ? syncOk : syncState === 'error' ? <span className="font-bold">✕</span> : syncIdle}
            {syncState === 'syncing' ? 'Sync...' : syncState === 'ok' ? 'Sinkronizirano' : syncState === 'error' ? 'Greška' : 'Sync'}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-semibold transition-colors cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Dodaj igrača
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input type="text" placeholder="Pretraži igrača..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <select value={clubFilter} onChange={(e) => setClubFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors [&>option]:bg-[#252838]">
          <option value="">Svi klubovi</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} igrača</span>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">
            {search || clubFilter ? 'Nema igrača za odabrane filtere.' : <>Nema igrača. <button onClick={openAdd} className="text-hnl-red underline underline-offset-2 cursor-pointer">Dodaj prvog</button> ili pokreni Sync.</>}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3 w-14">#</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Igrač</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Pozicija</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Klub</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={i < 5 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-5 py-3.5"><div className="h-4 w-6 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-36 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5" />
                  </tr>
                ))
              ) : filtered.map((p, i) => {
                const pos = posInfo(p.position);
                return (
                  <tr key={p.id}
                    className={`group ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-white/25 tabular-nums">
                        {p.number != null ? p.number : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[14px] font-semibold text-white">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-4 py-3.5">
                      {pos ? (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pos.color}`}>
                          {pos.label}
                        </span>
                      ) : <span className="text-white/20 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {p.club?.logoUrl && (
                          <img src={p.club.logoUrl} alt={p.club.name} className="w-5 h-5 object-contain shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                        <span className="text-[13px] text-white/45">{p.club?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-md text-white/25 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-md text-white/25 hover:text-hnl-red hover:bg-hnl-red/10 transition-all cursor-pointer" title="Obriši">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {addOpen && (
        <Modal title="Novi igrač" onClose={() => setAddOpen(false)}
          footer={<><button onClick={() => setAddOpen(false)} className={ghost}>Otkaži</button>
            <button onClick={handleAdd} disabled={saving} className={primary}>{saving ? 'Dodavanje...' : 'Dodaj igrača'}</button></>}>
          <PlayerForm value={form} onChange={setForm} clubs={clubs} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {editTarget && (
        <Modal title={`${editTarget.firstName} ${editTarget.lastName}`} onClose={() => setEditTarget(null)}
          footer={<><button onClick={() => setEditTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleEdit} disabled={saving} className={primary}>{saving ? 'Spremanje...' : 'Spremi'}</button></>}>
          <PlayerForm value={form} onChange={setForm} clubs={clubs} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Obriši igrača" onClose={() => setDeleteTarget(null)}
          footer={<><button onClick={() => setDeleteTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleDelete} disabled={saving} className={primary}>{saving ? 'Brisanje...' : 'Obriši'}</button></>}>
          <p className="text-white/55 text-sm">
            Obriši <span className="text-white font-semibold">{deleteTarget.firstName} {deleteTarget.lastName}</span> iz sustava?
          </p>
        </Modal>
      )}
    </div>
  );
}
