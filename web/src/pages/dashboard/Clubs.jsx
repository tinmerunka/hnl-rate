import { useState, useEffect, useCallback } from 'react';
import { getClubs, createClub, updateClub, deleteClub, syncClubs } from '../../services/clubService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { name: '', city: '', logoUrl: '' };

function ClubForm({ value, onChange }) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
          Ime kluba <span className="text-hnl-red">*</span>
        </label>
        <input
          type="text"
          placeholder="npr. Dinamo Zagreb"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className="w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
          Grad
        </label>
        <input
          type="text"
          placeholder="npr. Zagreb"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className="w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5">
          Logo URL
        </label>
        <input
          type="text"
          placeholder="https://..."
          value={value.logoUrl}
          onChange={(e) => onChange({ ...value, logoUrl: e.target.value })}
          className="w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150"
        />
        {value.logoUrl && (
          <img
            src={value.logoUrl}
            alt="preview"
            className="mt-2 h-10 w-10 object-contain rounded"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>
    </div>
  );
}

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // club object
  const [deleteTarget, setDeleteTarget] = useState(null); // club object

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  // --- Add ---
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setAddOpen(true);
  };
  const handleAdd = async () => {
    if (!form.name.trim()) { setFormError('Ime kluba je obavezno.'); return; }
    setSaving(true);
    setFormError('');
    try {
      await createClub(form);
      setAddOpen(false);
      fetchClubs();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Edit ---
  const openEdit = (club) => {
    setForm({ name: club.name || '', city: club.city || '', logoUrl: club.logoUrl || '' });
    setFormError('');
    setEditTarget(club);
  };
  const handleEdit = async () => {
    if (!form.name.trim()) { setFormError('Ime kluba je obavezno.'); return; }
    setSaving(true);
    setFormError('');
    try {
      await updateClub(editTarget.id, form);
      setEditTarget(null);
      fetchClubs();
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
      await deleteClub(deleteTarget.id);
      setDeleteTarget(null);
      fetchClubs();
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
      await syncClubs();
      setSyncMsg('Sinkronizacija uspješna.');
      fetchClubs();
    } catch (e) {
      setSyncMsg(e.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 4000);
    }
  };

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-hnl-red mb-1">
            Upravljanje
          </p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Klubovi
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && (
            <span className={`text-xs font-medium ${syncMsg.includes('uspješna') ? 'text-green-400' : 'text-hnl-red'}`}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 text-[13px] font-medium transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {syncing ? 'Sinkronizacija...' : 'Sync'}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-bold transition-colors duration-150 cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Dodaj klub
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/30 rounded-lg text-hnl-red text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/30 text-sm">
            Učitavanje...
          </div>
        ) : clubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/25">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 mb-3 opacity-40">
              <path d="M10 2a1 1 0 01.894.553l2.184 4.424 4.883.71a1 1 0 01.554 1.706l-3.534 3.443.834 4.863a1 1 0 01-1.451 1.054L10 16.347l-4.364 2.294a1 1 0 01-1.451-1.054l.834-4.863L1.485 9.393a1 1 0 01.554-1.706l4.883-.71L9.106 2.553A1 1 0 0110 2z" />
            </svg>
            <p className="text-sm">Nema klubova. Dodaj prvi ili pokreni sync.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3 w-12">Logo</th>
                <th className="text-left text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3">Ime</th>
                <th className="text-left text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3">Grad</th>
                <th className="text-right text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club, i) => (
                <tr
                  key={club.id}
                  className={`${i !== clubs.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}
                >
                  <td className="px-5 py-3.5">
                    {club.logoUrl ? (
                      <img
                        src={club.logoUrl}
                        alt={club.name}
                        className="w-8 h-8 object-contain rounded"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white/[0.06] rounded flex items-center justify-center text-white/20 text-[10px] font-bold">
                        {club.name?.[0] ?? '?'}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-white">{club.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-white/45">{club.city || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(club)}
                        className="p-1.5 rounded-md text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all cursor-pointer"
                        title="Uredi"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(club)}
                        className="p-1.5 rounded-md text-white/35 hover:text-hnl-red hover:bg-hnl-red/10 transition-all cursor-pointer"
                        title="Obriši"
                      >
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
        <Modal
          title="Novi klub"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer"
              >
                {saving ? 'Spremanje...' : 'Spremi'}
              </button>
            </>
          }
        >
          <ClubForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal
          title={`Uredi: ${editTarget.name}`}
          onClose={() => setEditTarget(null)}
          footer={
            <>
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleEdit}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer"
              >
                {saving ? 'Spremanje...' : 'Spremi izmjene'}
              </button>
            </>
          }
        >
          <ClubForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          title="Obriši klub"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-[13px] font-medium transition-all cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-60 text-white text-[13px] font-bold transition-colors cursor-pointer"
              >
                {saving ? 'Brisanje...' : 'Obriši'}
              </button>
            </>
          }
        >
          <p className="text-white/60 text-sm">
            Sigurno želiš obrisati klub{' '}
            <span className="text-white font-semibold">{deleteTarget.name}</span>?
            Ova akcija se ne može poništiti.
          </p>
        </Modal>
      )}
    </div>
  );
}
