import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getRatings, getRefereeRatings, getAtmosphereRatings, getPlayerRatings,
  deleteRating, deleteRefereeRating, deleteAtmosphereRating, deletePlayerRating,
} from '../../services/ratingAdminService';
import Modal from '../../components/Modal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function RatingBadge({ rating }) {
  const color =
    rating >= 7 ? 'bg-green-500/10 text-green-400' :
    rating >= 5 ? 'bg-white/[0.06] text-white/50' :
                  'bg-hnl-red/10 text-hnl-red';
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {rating}/10
    </span>
  );
}

/* ── Match list ─────────────────────────────────────────────────── */

function MatchList({ groups, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = groups.filter((g) =>
    !search || g.matchLabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-2 mb-5">
        <input type="text" placeholder="Pretraži utakmice..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} utakmica</span>
      </div>

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">Nema ocjena za prikaz.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3">Utakmica</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-32">Datum</th>
                <th className="text-center text-[11px] font-semibold text-white/25 px-4 py-3 w-24">Utakmica</th>
                <th className="text-center text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Sudac</th>
                <th className="text-center text-[11px] font-semibold text-white/25 px-4 py-3 w-24">Atmosfera</th>
                <th className="text-center text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Igrači</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr key={g.matchId} onClick={() => onSelect(g.matchId)}
                  className={`cursor-pointer ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.03] transition-colors`}>
                  <td className="px-5 py-3.5">
                    <p className="text-[14px] font-semibold text-white">{g.matchLabel}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-white/40">{fmtDate(g.matchDate)}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-[13px] font-semibold text-white">{g.matchRatings.length}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[13px] font-semibold ${g.refereeRatings.length ? 'text-white' : 'text-white/20'}`}>
                      {g.refereeRatings.length || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[13px] font-semibold ${g.atmosphereRatings.length ? 'text-white' : 'text-white/20'}`}>
                      {g.atmosphereRatings.length || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[13px] font-semibold ${g.playerRatings.length ? 'text-white' : 'text-white/20'}`}>
                      {g.playerRatings.length || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right"><span className="text-white/20 text-sm">→</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ── Rating table ───────────────────────────────────────────────── */

function RatingTable({ ratings, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = ratings.filter((r) =>
    !search || r.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <input type="text" placeholder="Pretraži po korisniku..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} ocjena</span>
      </div>

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-white/25 text-sm">
            {search ? 'Nema ocjena za uneseni filter.' : 'Nema ocjena.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3">Korisnik</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Ocjena</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Komentar</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Datum</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}
                  className={`${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/[0.07] flex items-center justify-center text-[12px] font-bold text-white/50 shrink-0 select-none">
                        {r.username[0].toUpperCase()}
                      </div>
                      <p className="text-[13px] font-semibold text-white">{r.username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><RatingBadge rating={r.rating} /></td>
                  <td className="px-4 py-3.5 max-w-xs">
                    {r.comment
                      ? <p className="text-[13px] text-white/55 line-clamp-2 leading-5">{r.comment}</p>
                      : <span className="text-white/20 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-white/30">{fmtDate(r.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => onDelete(r)}
                      className="text-[12px] font-medium px-3 py-1 rounded-lg border border-white/10 text-white/35 hover:text-hnl-red hover:border-hnl-red/25 hover:bg-hnl-red/5 transition-all cursor-pointer">
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ── Player rating table ────────────────────────────────────────── */

function PlayerRatingTable({ ratings, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = ratings.filter((r) =>
    !search ||
    r.username.toLowerCase().includes(search.toLowerCase()) ||
    r.playerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <input type="text" placeholder="Pretraži po korisniku ili igraču..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} ocjena</span>
      </div>

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-white/25 text-sm">
            {search ? 'Nema ocjena za uneseni filter.' : 'Nema ocjena igrača.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3">Korisnik</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Igrač</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Ocjena</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-24">Oznake</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Komentar</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Datum</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}
                  className={`${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/[0.07] flex items-center justify-center text-[12px] font-bold text-white/50 shrink-0 select-none">
                        {r.username[0].toUpperCase()}
                      </div>
                      <p className="text-[13px] font-semibold text-white">{r.username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] text-white/80">{r.playerName}</p>
                  </td>
                  <td className="px-4 py-3.5"><RatingBadge rating={r.rating} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {r.bestPlayer && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">MVP</span>
                      )}
                      {r.worstPlayer && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-hnl-red/10 text-hnl-red">Najgori</span>
                      )}
                      {!r.bestPlayer && !r.worstPlayer && <span className="text-white/20 text-sm">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    {r.comment
                      ? <p className="text-[13px] text-white/55 line-clamp-2 leading-5">{r.comment}</p>
                      : <span className="text-white/20 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-white/30">{fmtDate(r.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => onDelete(r)}
                      className="text-[12px] font-medium px-3 py-1 rounded-lg border border-white/10 text-white/35 hover:text-hnl-red hover:border-hnl-red/25 hover:bg-hnl-red/5 transition-all cursor-pointer">
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ── Match detail ───────────────────────────────────────────────── */

const TABS = [
  { id: 'match', label: 'Ocjena utakmice' },
  { id: 'referee', label: 'Sudac' },
  { id: 'atmosphere', label: 'Atmosfera' },
  { id: 'players', label: 'Igrači' },
];

function avg(ratings) {
  if (!ratings.length) return null;
  return (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1);
}

function MatchDetail({ group, onBack, onDeleted }) {
  const [activeTab, setActiveTab] = useState('match');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const tabRatings = {
    match: group.matchRatings,
    referee: group.refereeRatings,
    atmosphere: group.atmosphereRatings,
    players: group.playerRatings,
  };

  const deleteFns = {
    match: deleteRating,
    referee: deleteRefereeRating,
    atmosphere: deleteAtmosphereRating,
    players: deletePlayerRating,
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteFns[deleteTarget.type](deleteTarget.rating.id);
      onDeleted(deleteTarget.type, deleteTarget.rating.id);
      setDeleteTarget(null);
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const matchAvg = avg(group.matchRatings);
  const refAvg = avg(group.refereeRatings);
  const atmAvg = avg(group.atmosphereRatings);

  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const danger = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <>
      {/* Back + header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors cursor-pointer">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Sve utakmice
        </button>
        <div className="h-4 w-px bg-white/[0.1]" />
        <div>
          <p className="text-[11px] text-white/30 font-medium">{fmtDate(group.matchDate)}</p>
          <h2 className="text-[18px] font-bold text-white leading-tight">{group.matchLabel}</h2>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-6 mb-5 px-5 py-3.5 bg-hnl-card rounded-xl border border-white/[0.06]">
        {[
          { label: 'Utakmica', count: group.matchRatings.length, value: matchAvg },
          { label: 'Sudac', count: group.refereeRatings.length, value: refAvg },
          { label: 'Atmosfera', count: group.atmosphereRatings.length, value: atmAvg },
          { label: 'Igrači', count: group.playerRatings.length, value: null },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            {i > 0 && <div className="w-px h-8 bg-white/[0.06]" />}
            <div>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-[22px] font-black leading-tight ${s.value >= 7 ? 'text-green-400' : s.value >= 5 ? 'text-white' : s.value ? 'text-hnl-red' : 'text-white/25'}`}>
                  {s.value ?? '—'}
                </p>
                <p className="text-[11px] text-white/25">{s.count} gl.</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {TABS.map((t) => {
          const count = tabRatings[t.id].length;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${active ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'}`}>
              {t.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/[0.12] text-white/70' : 'bg-white/[0.06] text-white/25'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'players' ? (
        <PlayerRatingTable
          key="players"
          ratings={tabRatings.players}
          onDelete={(r) => setDeleteTarget({ type: 'players', rating: r })}
        />
      ) : (
        <RatingTable
          key={activeTab}
          ratings={tabRatings[activeTab]}
          onDelete={(r) => setDeleteTarget({ type: activeTab, rating: r })}
        />
      )}

      {deleteTarget && (
        <Modal title="Ukloni ocjenu" onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button onClick={() => setDeleteTarget(null)} className={ghost}>Otkaži</button>
              <button onClick={handleDelete} disabled={saving} className={danger}>
                {saving ? 'Uklanjanje...' : 'Ukloni'}
              </button>
            </>
          }>
          <p className="text-white/55 text-sm">
            Uklonit ćeš ocjenu{' '}
            <span className="text-white font-semibold">{deleteTarget.rating.rating}/10</span>{' '}
            korisnika <span className="text-white font-semibold">{deleteTarget.rating.username}</span>.
            {deleteTarget.rating.comment && ' Komentar će također biti uklonjen.'}
          </p>
        </Modal>
      )}
    </>
  );
}

/* ── Root ───────────────────────────────────────────────────────── */

export default function Ratings() {
  const [allMatchRatings, setAllMatchRatings] = useState([]);
  const [allRefereeRatings, setAllRefereeRatings] = useState([]);
  const [allAtmosphereRatings, setAllAtmosphereRatings] = useState([]);
  const [allPlayerRatings, setAllPlayerRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mr, rr, ar, pr] = await Promise.all([
        getRatings(), getRefereeRatings(), getAtmosphereRatings(), getPlayerRatings(),
      ]);
      setAllMatchRatings(mr);
      setAllRefereeRatings(rr);
      setAllAtmosphereRatings(ar);
      setAllPlayerRatings(pr);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build groups keyed by matchId — union of all four rating types
  const groups = useMemo(() => {
    const map = {};
    const ensure = (matchId, label, date) => {
      if (!map[matchId]) {
        map[matchId] = { matchId, matchLabel: label, matchDate: date, matchRatings: [], refereeRatings: [], atmosphereRatings: [], playerRatings: [] };
      }
    };
    allMatchRatings.forEach((r) => {
      ensure(r.matchId, r.matchLabel, r.matchDate);
      map[r.matchId].matchRatings.push(r);
    });
    allRefereeRatings.forEach((r) => {
      ensure(r.matchId, r.matchLabel, r.matchDate);
      map[r.matchId].refereeRatings.push(r);
    });
    allAtmosphereRatings.forEach((r) => {
      ensure(r.matchId, r.matchLabel, r.matchDate);
      map[r.matchId].atmosphereRatings.push(r);
    });
    allPlayerRatings.forEach((r) => {
      ensure(r.matchId, r.matchLabel, r.matchDate);
      map[r.matchId].playerRatings.push(r);
    });
    return Object.values(map).sort((a, b) => (b.matchDate ?? '').localeCompare(a.matchDate ?? ''));
  }, [allMatchRatings, allRefereeRatings, allAtmosphereRatings, allPlayerRatings]);

  const selectedGroup = selectedMatchId != null
    ? groups.find((g) => g.matchId === selectedMatchId) ?? null
    : null;

  const handleDeleted = useCallback((type, deletedId) => {
    if (type === 'match') setAllMatchRatings((p) => p.filter((r) => r.id !== deletedId));
    if (type === 'referee') setAllRefereeRatings((p) => p.filter((r) => r.id !== deletedId));
    if (type === 'atmosphere') setAllAtmosphereRatings((p) => p.filter((r) => r.id !== deletedId));
    if (type === 'players') setAllPlayerRatings((p) => p.filter((r) => r.id !== deletedId));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-baseline gap-2.5 mb-7">
        <h1 className="text-xl font-bold font-display text-white">Ocjene utakmica</h1>
        {!loading && !selectedGroup && (
          <span className="text-[13px] text-white/25">{groups.length}</span>
        )}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? 'border-b border-white/[0.04]' : ''}`}>
              <div className="flex-1"><div className="h-4 w-52 rounded bg-white/[0.06] animate-pulse" /></div>
              <div className="h-4 w-20 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-8 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-8 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-8 rounded bg-white/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      ) : selectedGroup ? (
        <MatchDetail
          group={selectedGroup}
          onBack={() => setSelectedMatchId(null)}
          onDeleted={handleDeleted}
        />
      ) : (
        <MatchList groups={groups} onSelect={setSelectedMatchId} />
      )}
    </div>
  );
}
