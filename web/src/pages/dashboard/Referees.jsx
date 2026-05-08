import { useState, useEffect, useCallback } from 'react';
import { getReferees, createReferee, updateReferee, deleteReferee } from '../../services/refereeService';
import Modal from '../../components/Modal';

const EMPTY_FORM = { firstName: '', lastName: '' };

function RefereeForm({ value, onChange }) {
  const inp = 'w-full bg-white/[0.06] border border-white/10 focus:border-hnl-red rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20';
  const lbl = 'block text-[11px] font-medium text-white/35 mb-1.5';
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={lbl}>Ime *</label>
        <input autoFocus type="text" placeholder="Ivan" value={value.firstName}
          onChange={(e) => onChange({ ...value, firstName: e.target.value })} className={inp} />
      </div>
      <div>
        <label className={lbl}>Prezime *</label>
        <input type="text" placeholder="Bebek" value={value.lastName}
          onChange={(e) => onChange({ ...value, lastName: e.target.value })} className={inp} />
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
    setLoading(true); setError('');
    try { setReferees(await getReferees()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    if (!form.firstName.trim()) return 'Ime je obavezno.';
    if (!form.lastName.trim()) return 'Prezime je obavezno.';
    return null;
  };

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(''); setAddOpen(true); };
  const openEdit = (r) => { setForm({ firstName: r.firstName ?? '', lastName: r.lastName ?? '' }); setFormError(''); setEditTarget(r); };

  const handleAdd = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await createReferee(form); setAddOpen(false); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    try { await updateReferee(editTarget.id, form); setEditTarget(null); fetchAll(); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteReferee(deleteTarget.id); setDeleteTarget(null); fetchAll(); }
    catch (e) { setError(e.message); setDeleteTarget(null); }
    finally { setSaving(false); }
  };

  const filtered = referees
    .filter((r) => !search || `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const ghost = 'px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer';
  const primary = 'px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl font-bold font-display text-white">Suci</h1>
          {!loading && <span className="text-[13px] text-white/25">{referees.length}</span>}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hnl-red hover:bg-hnl-red-dark text-white text-[13px] font-semibold transition-colors cursor-pointer">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Dodaj suca
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input type="text" placeholder="Pretraži suca..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 bg-white/[0.05] border border-white/[0.08] focus:border-hnl-red rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/20" />
        <span className="ml-auto text-[12px] text-white/25">{filtered.length} sudaca</span>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-hnl-red/10 border border-hnl-red/25 rounded-lg text-hnl-red text-sm">{error}</div>}

      <div className="bg-hnl-card rounded-xl border border-white/[0.06] overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">
            {search ? 'Nema sudaca za uneseni upit.' : <>Nema sudaca. <button onClick={openAdd} className="text-hnl-red underline underline-offset-2 cursor-pointer">Dodaj prvog.</button></>}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-white/25 px-5 py-3">Prezime</th>
                <th className="text-left text-[11px] font-semibold text-white/25 px-4 py-3">Ime</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={i < 5 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="px-5 py-3.5"><div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                    <td className="px-4 py-3.5" />
                  </tr>
                ))
              ) : filtered.map((r, i) => (
                <tr key={r.id}
                  className={`group ${i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-white">{r.lastName}</td>
                  <td className="px-4 py-3.5 text-[13px] text-white/55">{r.firstName}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(r)}
                        className="p-1.5 rounded-md text-white/25 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer" title="Uredi">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(r)}
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
        <Modal title="Novi sudac" onClose={() => setAddOpen(false)}
          footer={<><button onClick={() => setAddOpen(false)} className={ghost}>Otkaži</button>
            <button onClick={handleAdd} disabled={saving} className={primary}>{saving ? 'Dodavanje...' : 'Dodaj suca'}</button></>}>
          <RefereeForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {editTarget && (
        <Modal title={`${editTarget.firstName} ${editTarget.lastName}`} onClose={() => setEditTarget(null)}
          footer={<><button onClick={() => setEditTarget(null)} className={ghost}>Otkaži</button>
            <button onClick={handleEdit} disabled={saving} className={primary}>{saving ? 'Spremanje...' : 'Spremi'}</button></>}>
          <RefereeForm value={form} onChange={setForm} />
          {formError && <p className="mt-3 text-hnl-red text-sm">{formError}</p>}
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Obriši suca" onClose={() => setDeleteTarget(null)}
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
