import { useState, useEffect, useCallback } from 'react';
import { getMatches, createMatch, updateMatch, deleteMatch, syncMatches } from '../../services/matchService';
import { getClubs } from '../../services/clubService';
import { getReferees } from '../../services/refereeService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { homeClubId: '', awayClubId: '', refereeId: '', round: '', date: '', result: '', finished: false };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const buildPayload = (f) => ({
  homeClubId: f.homeClubId ? Number(f.homeClubId) : null,
  awayClubId: f.awayClubId ? Number(f.awayClubId) : null,
  refereeId: f.refereeId ? Number(f.refereeId) : null,
  round: f.round ? Number(f.round) : null,
  date: f.date || null,
  result: f.result || null,
  finished: f.finished,
});

function ClubLogo({ club }) {
  if (!club) return null;
  return club.logoUrl
    ? <img src={club.logoUrl} alt={club.name} className="w-6 h-6 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
    : <div className="w-6 h-6 bg-white/[0.06] rounded flex items-center justify-center text-white/20 text-[9px] font-bold shrink-0">{club.name?.[0] ?? '?'}</div>;
}

function MatchForm({ value, onChange, clubs, referees }) {
  const inp = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors [&>option]:bg-[#252838] placeholder:text-white/20';
  const lbl = 'block text-[11px] font-medium text-white/35 mb-1.5';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Domaćin *</label>
          <select value={value.homeClubId} onChange={(e) => onChange({ ...value, homeClubId: e.target.value })} className={inp}>
            <option value="">Odaberi klub</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Gost *</label>
          <select value={value.awayClubId} onChange={(e) => onChange({ ...value, awayClubId: e.target.value })} className={inp}>
            <option value="">Odaberi klub</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Sudac</label>
          <select value={value.refereeId} onChange={(e) => onChange({ ...value, refereeId: e.target.value })} className={inp}>
            <option value="">Bez suca</option>
            {referees.map((r) => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Kolo *</label>
          <input type="number" min="1" placeholder="npr. 5" value={value.round}
            onChange={(e) => onChange({ ...value, round: e.target.value })} className={inp} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Datum</label>
          <input type="date" value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })} className={`${inp} [color-scheme:dark]`} />
        </div>
        <div>
          <label className={lbl}>Rezultat <span className="text-white/20 font-normal">(npr. 2:1)</span></label>
          <input type="text" placeholder="2:1" value={value.result}
            onChange={(e) => onChange({ ...value, result: e.target.value })} className={inp} />
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={() => onChange({ ...value, finished: !value.finished })}
          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${value.finished ? 'bg-hnl-red' : 'bg-white/10'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${value.finished ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-[13px] text-white/50 select-none">Utakmica je odigrana</span>
      </label>
    </div>
  );
}

const syncIdle = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);
const syncSpin = <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-spin"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const syncOk = <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roundFilter, setRoundFilter] = useState('');
  const [finishedFilter, setFinishedFilter] = useState('all');
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
      const [m, c, r] = await Promise.all([getMatches(), getClubs(), getReferees()]);
      setMatches(m); setClubs(c); setReferees(r);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    if (!form.homeClubId) return 'Odaberi domaćina.';
    if (!form.awayClubId) return 'Odaberi gosta.';
    if (form.homeClubId === form.awayClubId) return 'Domaćin i gost ne mogu biti isti.';
    if (!form.round) return 'Kolo je obavezno.';
    return null;
  };

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(''); setAddOpen(true); };
  const openEdit = (m) => {
    setForm({ homeClubId: String(m.homeClub?.id ?? ''), awayClubId: String(m.awayClub?.id ?? ''), refereeId: String(m.referee?.id ?? ''), round: String(m.round ?? ''), date: m.date ?? '', result: m.result ?? '', finished: m.finished ?? false });
    setFormError(''); setEditTarget(m);
  };

  const handleAdd = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await createMatch(buildPayload(form)); setAddOpen(false); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await updateMatch(editTarget.id, buildPayload(form)); setEditTarget(null); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteMatch(deleteTarget.id); setDeleteTarget(null); fetchAll(); }
    catch (e) { setError(e.message); setDeleteTarget(null); }
    finally { setSaving(false); }
  };

  const handleSync = async () => {
    setSyncState('syncing');
    try { await syncMatches(); fetchAll(); setSyncState('ok'); }
    catch { setSyncState('error'); }
    finally { setTimeout(() => setSyncState('idle'), 2200); }
  };

  const filtered = matches
    .filter((m) => {
      if (roundFilter && String(m.round) !== roundFilter) return false;
      if (finishedFilter === 'finished' && !m.finished) return false;
      if (finishedFilter === 'upcoming' && m.finished) return false;
      return true;
    })
    .sort((a, b) => (b.round ?? 0) - (a.round ?? 0));

  const pill = (active) =>
    `px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${active ? 'bg-hnl-red/15 text-hnl-red border border-hnl-red/25' : 'text-white/40 border border-white/[0.08] hover:text-white/65'}`;

  const syncCls = syncState === 'ok' ? 'border-green-500/25 text-green-400 bg-green-500/5' : syncState === 'error' ? 'border-hnl-red/25 text-hnl-red bg-hnl-red/5' : 'border-white/10 text-white/45 hover:text-white/75 hover:border-white/20';
  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const primary = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Utakmice</h1>
          {!loading && <span className="text-[13px] text-white/25">{matches.length}</span>}
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
            Dodaj utakmicu
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input type="number" min="1" placeholder="Kolo" value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="w-24 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <button onClick={() => setFinishedFilter('all')} className={pill(finishedFilter === 'all')}>Sve</button>
        <button onClick={() => setFinishedFilter('upcoming')} className={pill(finishedFilter === 'upcoming')}>Zakazane</button>
        <button onClick={() => setFinishedFilter('finished')} className={pill(finishedFilter === 'finished')}>Odigrane</button>
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} utakmica</span>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">Nema utakmica za odabrane filtere.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Kolo</th>
                <th className="text-right text-[11px] font-semibold text-white/25 px-4 py-3">Domaćin</th>
                <th className="text-center text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Rezultat</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Gost</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Datum</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-24">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={i < 5 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-4 py-3.5"><div className="h-5 w-10 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5 text-right"><div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse ml-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 w-14 rounded bg-white/[0.06] animate-pulse mx-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-20 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5" />
                  </tr>
                ))
              ) : filtered.map((m, i) => (
                <tr key={m.id}
                  className={`group ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] font-semibold text-white/35 bg-white/[0.05] px-2 py-0.5 rounded tabular-nums">
                      {m.round ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[13px] font-semibold text-white">{m.homeClub?.name ?? '—'}</span>
                      <ClubLogo club={m.homeClub} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {m.result ? (
                      <span className="text-[15px] font-black text-white tabular-nums tracking-tight">{m.result}</span>
                    ) : (
                      <span className="text-[11px] text-white/20 font-medium tracking-widest">vs</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <ClubLogo club={m.awayClub} />
                      <span className="text-[13px] font-semibold text-white">{m.awayClub?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-white/35 whitespace-nowrap">{fmtDate(m.date)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.finished ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/30'}`}>
                      {m.finished ? 'Odigrana' : 'Zakazana'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)}
                        className="p-1.5 rounded-md text-white/25 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded-md text-white/25 hover:text-hnl-red hover:bg-hnl-red/10 transition-all cursor-pointer" title="Obriši">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {addOpen && (
        <Modal title="Nova utakmica" onClose={() => setAddOpen(false)}
          footer={<><button onClick={() => setAddOpen(false)} className={ghost}>Otkaži</button>
            <button onClick={handleAdd} disabled={saving} className={primary}>{saving ? 'Dodavanje...' : 'Dodaj utakmicu'}</button></>}>
          <MatchForm value={form} onChange={setForm} clubs={clubs} referees={referees} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {editTarget && (
        <Modal title={`${editTarget.homeClub?.name ?? '?'} vs ${editTarget.awayClub?.name ?? '?'}`} onClose={() => setEditTarget(null)}
          footer={<><button onClick={() => setEditTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleEdit} disabled={saving} className={primary}>{saving ? 'Spremanje...' : 'Spremi'}</button></>}>
          <MatchForm value={form} onChange={setForm} clubs={clubs} referees={referees} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Obriši utakmicu" onClose={() => setDeleteTarget(null)}
          footer={<><button onClick={() => setDeleteTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleDelete} disabled={saving} className={primary}>{saving ? 'Brisanje...' : 'Obriši'}</button></>}>
          <p className="text-white/55 text-sm">
            Obriši <span className="text-white font-semibold">{deleteTarget.homeClub?.name} — {deleteTarget.awayClub?.name}</span> (kolo {deleteTarget.round})?
          </p>
        </Modal>
      )}
    </div>
  );
}
