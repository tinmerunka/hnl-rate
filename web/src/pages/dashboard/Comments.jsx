import { useState, useEffect, useCallback } from 'react';
import { getComments, deleteComment } from '../../services/commentService';
import Modal from '../../components/Modal';

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

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try { setComments(await getComments()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteComment(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = comments.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.username.toLowerCase().includes(q) ||
      c.comment.toLowerCase().includes(q) ||
      c.matchLabel.toLowerCase().includes(q)
    );
  });

  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const danger = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Komentari</h1>
          {!loading && <span className="text-[13px] text-white/25">{comments.length}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input
          type="text"
          placeholder="Pretraži po korisniku, utakmici ili tekstu komentara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20"
        />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} komentara</span>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">
          {error}
        </div>
      )}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">
            {search ? 'Nema komentara za odabrane filtere.' : 'Nema komentara.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3">Korisnik</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Utakmica</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-20">Ocjena</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Komentar</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3 w-28">Datum</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={i < 4 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-5 py-3"><div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-12 rounded-full bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-56 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`group ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}
                >
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-semibold text-white">{c.username}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-white/70">{c.matchLabel}</p>
                    {c.matchDate && (
                      <p className="text-[11px] text-white/30 mt-0.5">
                        {new Date(c.matchDate).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RatingBadge rating={c.rating} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-[13px] text-white/55 line-clamp-2 leading-5">{c.comment}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-white/30">
                      {new Date(c.createdAt).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="text-[12px] font-medium px-3 py-1 rounded-lg border border-white/10 text-white/35 hover:text-hnl-red hover:border-hnl-red/25 hover:bg-hnl-red/5 transition-all cursor-pointer"
                    >
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <Modal
          title="Ukloni komentar"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button onClick={() => setDeleteTarget(null)} className={ghost}>Otkaži</button>
              <button onClick={handleDelete} disabled={saving} className={danger}>
                {saving ? 'Uklanjanje...' : 'Ukloni'}
              </button>
            </>
          }
        >
          <p className="text-white/55 text-sm">
            Uklonit ćeš komentar korisnika{' '}
            <span className="text-white font-semibold">{deleteTarget.username}</span>.
            Ocjena utakmice će biti sačuvana.
          </p>
          <div className="mt-3 p-3 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <p className="text-[13px] text-white/40 italic">"{deleteTarget.comment}"</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
