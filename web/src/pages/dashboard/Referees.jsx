import { useState, useEffect, useCallback } from 'react';
import { getReferees, createReferee, updateReferee, deleteReferee } from '../../services/refereeService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { firstName: '', lastName: '' };

function RefereeForm({ value, onChange }) {
  const inputCls = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150';
  const labelCls = 'block text-[10px] font-semibold tracking-[0.12em] uppercase text-white/35 mb-1.5';

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ime <span className="text-hnl-red">*</span></label>
          <input
            type="text"
            placeholder="npr. Ivan"
            value={value.firstName}
            onChange={(e) => onChange({ ...value, firstName: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Prezime <span className="text-hnl-red">*</span></label>
          <input
            type="text"
            placeholder="npr. Bebek"
            value={value.lastName}
            onChange={(e) => onChange({ ...value, lastName: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

export default function Referees() {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReferees();
      setReferees(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validateForm = () => {
    if (!form.firstName.trim()) return 'Ime je obavezno.';
    if (!form.lastName.trim()) return 'Prezime je obavezno.';
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
      await createReferee(form);
      setAddOpen(false);
      fetchAll();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Edit ---
  const openEdit = (referee) => {
    setForm({
      firstName: referee.firstName ?? '',
      lastName: referee.lastName ?? '',
    });
    setFormError('');
    setEditTarget(referee);
  };
  const handleEdit = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError('');
    try {
      await updateReferee(editTarget.id, form);
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
      await deleteReferee(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // --- Filter ---
  const filtered = referees.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${r.firstName} ${r.lastName}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-hnl-red mb-1">Upravljanje</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Suci</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-bold transition-colors duration-150 cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Dodaj suca
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Pretraži po imenu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 bg-white/[0.05] border border-white/10 focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors"
        />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} sudaca</span>
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
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Nema sudaca. Dodaj prvog ili pokreni sync.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Ime', 'Prezime', ''].map((h, i) => (
                  <th key={i} className={`text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 px-5 py-3 ${i === 2 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-white">{r.firstName}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-white">{r.lastName}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(r)}
                        className="p-1.5 rounded-md text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(r)}
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
        <Modal title="Novi sudac" onClose={() => setAddOpen(false)}
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
          <RefereeForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title={`Uredi: ${editTarget.firstName} ${editTarget.lastName}`} onClose={() => setEditTarget(null)}
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
          <RefereeForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-xs">{formError}</p>}
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal title="Obriši suca" onClose={() => setDeleteTarget(null)}
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
            Sigurno želiš obrisati suca{' '}
            <span className="text-white font-semibold">{deleteTarget.firstName} {deleteTarget.lastName}</span>?
            Ova akcija se ne može poništiti.
          </p>
        </Modal>
      )}
    </div>
  );
}
