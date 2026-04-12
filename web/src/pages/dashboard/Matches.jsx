import { useState, useEffect, useCallback } from 'react';
import { getMatches, createMatch, updateMatch, deleteMatch, syncMatches } from '../../services/matchService';
import { getClubs } from '../../services/clubService';
import { getReferees } from '../../services/refereeService';
import Modal from '../../components/Modal';

// MatchDTO fields: id, homeClub, awayClub, referee, round, date (YYYY-MM-DD), result (string e.g. "2:1"), finished
// MatchRequest fields: homeClubId, awayClubId, refereeId, round, date (YYYY-MM-DD), result (string), finished

const EMPTY_FORM = {
  homeClubId: '',
  awayClubId: '',
  refereeId: '',
  round: '',
  date: '',
  result: '',
  finished: false,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('hr-HR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const buildPayload = (form) => ({
  homeClubId: form.homeClubId ? Number(form.homeClubId) : null,
  awayClubId: form.awayClubId ? Number(form.awayClubId) : null,
  refereeId: form.refereeId ? Number(form.refereeId) : null,
  round: form.round ? Number(form.round) : null,
  date: form.date || null,
  result: form.result || null,
  finished: form.finished,
});

function MatchForm({ value, onChange, clubs, referees }) {
  const inputCls = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150';
  const selectCls = `${inputCls} [&>option]:bg-[#252838]`;
  const labelCls = 'block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5';

  return (
    <div className="space-y-3.5">
      {/* Home / Away */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Domaćin <span className="text-hnl-red">*</span></label>
          <select value={value.homeClubId} onChange={(e) => onChange({ ...value, homeClubId: e.target.value })} className={selectCls}>
            <option value="">Odaberi klub</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Gost <span className="text-hnl-red">*</span></label>
          <select value={value.awayClubId} onChange={(e) => onChange({ ...value, awayClubId: e.target.value })} className={selectCls}>
            <option value="">Odaberi klub</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Referee / Round */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Sudac</label>
          <select value={value.refereeId} onChange={(e) => onChange({ ...value, refereeId: e.target.value })} className={selectCls}>
            <option value="">Bez suca</option>
            {referees.map((r) => (
              <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Kolo <span className="text-hnl-red">*</span></label>
          <input
            type="number" min="1" placeholder="npr. 5"
            value={value.round}
            onChange={(e) => onChange({ ...value, round: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className={labelCls}>Datum</label>
        <input
          type="date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          className={`${inputCls} [color-scheme:dark]`}
        />
      </div>

      {/* Result */}
      <div>
        <label className={labelCls}>Rezultat <span className="text-white/20 normal-case tracking-normal font-normal">(npr. 2:1)</span></label>
        <input
          type="text" placeholder="npr. 2:1"
          value={value.result}
          onChange={(e) => onChange({ ...value, result: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Finished toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => onChange({ ...value, finished: !value.finished })}
          className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 shrink-0 ${value.finished ? 'bg-hnl-red' : 'bg-white/10'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value.finished ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors select-none">
          Utakmica je odigrana
        </span>
      </label>
    </div>
  );
}

function TeamCell({ club }) {
  if (!club) return <span className="text-white/25">—</span>;
  return (
    <div className="flex items-center gap-2">
      {club.logoUrl ? (
        <img src={club.logoUrl} alt={club.name} className="w-6 h-6 object-contain shrink-0"
          onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="w-6 h-6 bg-white/[0.06] rounded flex items-center justify-center text-white/20 text-[9px] font-bold shrink-0">
          {club.name?.[0] ?? '?'}
        </div>
      )}
      <span className="text-[13px] font-semibold text-white">{club.name}</span>
    </div>
  );
}

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

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [matchData, clubData, refereeData] = await Promise.all([
        getMatches(),
        getClubs(),
        getReferees(),
      ]);
      setMatches(matchData);
      setClubs(clubData);
      setReferees(refereeData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validateForm = () => {
    if (!form.homeClubId) return 'Odaberi domaćina.';
    if (!form.awayClubId) return 'Odaberi gosta.';
    if (form.homeClubId === form.awayClubId) return 'Domaćin i gost ne mogu biti isti klub.';
    if (!form.round) return 'Kolo je obavezno.';
    return null;
  };

  // --- Add ---
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setAddOpen(true);
  };
  const handleAdd = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError('');
    try {
      await createMatch(buildPayload(form));
      setAddOpen(false);
      fetchAll();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Edit ---
  const openEdit = (match) => {
    setForm({
      homeClubId: String(match.homeClub?.id ?? ''),
      awayClubId: String(match.awayClub?.id ?? ''),
      refereeId: String(match.referee?.id ?? ''),
      round: String(match.round ?? ''),
      date: match.date ?? '',
      result: match.result ?? '',
      finished: match.finished ?? false,
    });
    setFormError('');
    setEditTarget(match);
  };
  const handleEdit = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError('');
    try {
      await updateMatch(editTarget.id, buildPayload(form));
      setEditTarget(null);
      fetchAll();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteMatch(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // --- Sync ---
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await syncMatches();
      setSyncMsg('Sinkronizacija uspješna.');
      fetchAll();
    } catch (e) {
      setSyncMsg(e.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 4000);
    }
  };

  // --- Filter ---
  const filtered = matches.filter((m) => {
    if (roundFilter && String(m.round) !== roundFilter) return false;
    if (finishedFilter === 'finished' && !m.finished) return false;
    if (finishedFilter === 'upcoming' && m.finished) return false;
    return true;
  });

  const filterBtnCls = (active) =>
    `px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-hnl-red/15 text-hnl-red border border-hnl-red/30'
        : 'text-white/40 border border-white/10 hover:text-white/70 hover:border-white/20'
    }`;

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-hnl-red mb-1">Upravljanje</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Utakmice</h1>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && (
            <span className={`text-xs font-medium ${syncMsg.includes('uspješna') ? 'text-green-400' : 'text-hnl-red'}`}>
              {syncMsg}
            </span>
          )}
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 text-[13px] font-medium transition-all duration-150 cursor-pointer disabled:opacity-40">
            <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {syncing ? 'Sinkronizacija...' : 'Sync'}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-bold transition-colors duration-150 cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Dodaj utakmicu
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="number" min="1" placeholder="Kolo..."
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="w-28 bg-white/[0.05] border border-white/10 focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors"
        />
        <button onClick={() => setFinishedFilter('all')} className={filterBtnCls(finishedFilter === 'all')}>Sve</button>
        <button onClick={() => setFinishedFilter('upcoming')} className={filterBtnCls(finishedFilter === 'upcoming')}>Zakazane</button>
        <button onClick={() => setFinishedFilter('finished')} className={filterBtnCls(finishedFilter === 'finished')}>Odigrane</button>
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} utakmica</span>
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Nema utakmica.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Kolo', 'Domaćin', 'Rezultat', 'Gost', 'Datum', 'Status', ''].map((h, i) => (
                  <th key={i} className={`text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-4 py-3 ${i === 6 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className={`${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] font-bold text-white/40 bg-white/[0.05] px-2 py-0.5 rounded">
                      {m.round ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><TeamCell club={m.homeClub} /></td>
                  <td className="px-4 py-3.5 text-center">
                    {m.result ? (
                      <span className="text-[14px] font-bold text-white tabular-nums">{m.result}</span>
                    ) : (
                      <span className="text-[12px] text-white/20 font-medium">vs</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><TeamCell club={m.awayClub} /></td>
                  <td className="px-4 py-3.5 text-[12px] text-white/40 whitespace-nowrap">{formatDate(m.date)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.finished ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.06] text-white/35'}`}>
                      {m.finished ? 'Odigrana' : 'Zakazana'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(m)}
                        className="p-1.5 rounded-md text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded-md text-white/35 hover:text-hnl-red hover:bg-hnl-red/10 transition-all cursor-pointer" title="Obriši">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      {addOpen && (
        <Modal title="Nova utakmica" onClose={() => setAddOpen(false)}
          footer={<>
            <button onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer">
              Otkaži
            </button>
            <button onClick={handleAdd} disabled={saving}
              className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer">
              {saving ? 'Spremanje...' : 'Spremi'}
            </button>
          </>}>
          <MatchForm value={form} onChange={setForm} clubs={clubs} referees={referees} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal
          title={`Uredi: ${editTarget.homeClub?.name ?? '?'} vs ${editTarget.awayClub?.name ?? '?'}`}
          onClose={() => setEditTarget(null)}
          footer={<>
            <button onClick={() => setEditTarget(null)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer">
              Otkaži
            </button>
            <button onClick={handleEdit} disabled={saving}
              className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer">
              {saving ? 'Spremanje...' : 'Spremi izmjene'}
            </button>
          </>}>
          <MatchForm value={form} onChange={setForm} clubs={clubs} referees={referees} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal title="Obriši utakmicu" onClose={() => setDeleteTarget(null)}
          footer={<>
            <button onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer">
              Otkaži
            </button>
            <button onClick={handleDelete} disabled={saving}
              className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer">
              {saving ? 'Brisanje...' : 'Obriši'}
            </button>
          </>}>
          <p className="text-white/60 text-sm">
            Sigurno želiš obrisati utakmicu{' '}
            <span className="text-white font-semibold">
              {deleteTarget.homeClub?.name} vs {deleteTarget.awayClub?.name}
            </span>{' '}
            (kolo {deleteTarget.round})?
          </p>
        </Modal>
      )}
    </div>
  );
}
