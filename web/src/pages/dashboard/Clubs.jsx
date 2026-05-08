import { useState, useEffect, useCallback } from 'react';
import { getClubs, createClub, updateClub, deleteClub, syncClubs } from '../../services/clubService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { name: '', city: '', logoUrl: '' };

const ic = {
  pencil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  sync: (s) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${s ? 'animate-spin' : ''}`}>
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
};

function ClubForm({ value, onChange }) {
  const inp = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20';
  const lbl = 'block text-[11px] font-medium text-white/35 mb-1.5';
  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>Ime kluba *</label>
        <input autoFocus type="text" placeholder="Dinamo Zagreb" value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })} className={inp} />
      </div>
      <div>
        <label className={lbl}>Grad</label>
        <input type="text" placeholder="Zagreb" value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })} className={inp} />
      </div>
      <div>
        <label className={lbl}>Logo URL</label>
        <input type="text" placeholder="https://..." value={value.logoUrl}
          onChange={(e) => onChange({ ...value, logoUrl: e.target.value })} className={inp} />
        {value.logoUrl && (
          <div className="mt-2 flex items-center gap-2.5">
            <img src={value.logoUrl} alt="preview" className="h-8 w-8 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xs text-white/25">Pregled loga</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [syncState, setSyncState] = useState('idle');

  const fetchClubs = useCallback(async () => {
    setLoading(true); setError('');
    try { setClubs(await getClubs()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(''); setAddOpen(true); };
  const openEdit = (c) => { setForm({ name: c.name || '', city: c.city || '', logoUrl: c.logoUrl || '' }); setFormError(''); setEditTarget(c); };

  const handleAdd = async () => {
    if (!form.name.trim()) { setFormError('Ime kluba je obavezno.'); return; }
    setSaving(true); setFormError('');
    try { await createClub(form); setAddOpen(false); fetchClubs(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!form.name.trim()) { setFormError('Ime kluba je obavezno.'); return; }
    setSaving(true); setFormError('');
    try { await updateClub(editTarget.id, form); setEditTarget(null); fetchClubs(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteClub(deleteTarget.id); setDeleteTarget(null); fetchClubs(); }
    catch (e) { setError(e.message); setDeleteTarget(null); }
    finally { setSaving(false); }
  };

  const handleSync = async () => {
    setSyncState('syncing');
    try { await syncClubs(); fetchClubs(); setSyncState('ok'); }
    catch { setSyncState('error'); }
    finally { setTimeout(() => setSyncState('idle'), 2200); }
  };

  const syncCls = syncState === 'ok'
    ? 'border-green-500/25 text-green-400 bg-green-500/5'
    : syncState === 'error'
    ? 'border-hnl-red/25 text-hnl-red bg-hnl-red/5'
    : 'border-white/10 text-white/45 hover:text-white/75 hover:border-white/20';

  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const primary = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Klubovi</h1>
          {!loading && <span className="text-[13px] text-white/25">{clubs.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncState === 'syncing'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[13px] font-medium transition-all duration-200 cursor-pointer disabled:cursor-wait ${syncCls}`}>
            {syncState === 'syncing' ? ic.sync(true) : syncState === 'ok' ? ic.check : syncState === 'error' ? <span className="text-sm leading-none font-bold">✕</span> : ic.sync(false)}
            {syncState === 'syncing' ? 'Sync...' : syncState === 'ok' ? 'Sinkronizirano' : syncState === 'error' ? 'Greška' : 'Sync'}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-semibold transition-colors cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Dodaj klub
          </button>
        </div>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && clubs.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">
            Nema klubova. <button onClick={openAdd} className="text-hnl-red hover:text-hnl-red-dark cursor-pointer underline underline-offset-2">Dodaj prvi</button> ili pokreni Sync.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="w-16 px-5 py-3" />
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Klub</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Grad</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={i < 5 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-5 py-3"><div className="h-9 w-9 rounded-lg bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : clubs.map((club, i) => (
                <tr key={club.id}
                  className={`group ${i !== clubs.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt={club.name} className="w-9 h-9 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center text-white/20 text-sm font-bold">
                        {club.name?.[0] ?? '?'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[14px] font-semibold text-white">{club.name}</td>
                  <td className="px-4 py-3 text-[13px] text-white/40">{club.city || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(club)}
                        className="p-1.5 rounded-md text-white/25 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                        {ic.pencil}
                      </button>
                      <button onClick={() => setDeleteTarget(club)}
                        className="p-1.5 rounded-md text-white/25 hover:text-hnl-red hover:bg-hnl-red/10 transition-all cursor-pointer" title="Obriši">
                        {ic.trash}
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
        <Modal title="Novi klub" onClose={() => setAddOpen(false)}
          footer={<><button onClick={() => setAddOpen(false)} className={ghost}>Otkaži</button>
            <button onClick={handleAdd} disabled={saving} className={primary}>{saving ? 'Dodavanje...' : 'Dodaj klub'}</button></>}>
          <ClubForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {editTarget && (
        <Modal title={editTarget.name} onClose={() => setEditTarget(null)}
          footer={<><button onClick={() => setEditTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleEdit} disabled={saving} className={primary}>{saving ? 'Spremanje...' : 'Spremi'}</button></>}>
          <ClubForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Obriši klub" onClose={() => setDeleteTarget(null)}
          footer={<><button onClick={() => setDeleteTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleDelete} disabled={saving} className={primary}>{saving ? 'Brisanje...' : 'Obriši'}</button></>}>
          <p className="text-white/55 text-sm">
            Obriši <span className="text-white font-semibold">{deleteTarget.name}</span> iz sustava?
          </p>
        </Modal>
      )}
    </div>
  );
}
