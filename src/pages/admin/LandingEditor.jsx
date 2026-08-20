import { useEffect, useState } from 'react';
import { Check, Image, Pencil, RefreshCw, Upload } from '../../components/MaterialIcon';
import { landingApi } from '../../api/customers.js';
import { useAuth } from '../../context/AuthContext';

const DEFAULTS = [
  ['hero1', 'Hero look 1', 'Main hero carousel image'],
  ['hero2', 'Hero look 2', 'Main hero carousel image'],
  ['hero3', 'Hero look 3', 'Main hero carousel image'],
  ['hero4', 'Hero look 4', 'Main hero carousel image'],
  ['hero5', 'Hero look 5', 'Main hero carousel image'],
  ['category_clothing', 'Clothing category', 'Shop by Style'],
  ['category_bags', 'Bags category', 'Shop by Style'],
  ['category_jewelry', 'Jewelry category', 'Shop by Style'],
  ['category_accessories', 'Accessories category', 'Shop by Style'],
  ['story', 'Our story image', 'Our Heritage'],
  ['story_detail', 'Story detail image', 'Our Heritage'],
];

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 1600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LandingEditor() {
  const { isAuthenticated } = useAuth();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    landingApi.get().then(setValues).catch(() => setMessage('Could not load landing page images.')).finally(() => setLoading(false));
  }, []);

  const save = async (key) => {
    const item = values[key];
    if (!item?.value) return;
    setSaving(key); setMessage('');
    try {
      const saved = await landingApi.update(key, item);
      setValues((current) => ({ ...current, [key]: saved }));
      setMessage(`${key} updated.`);
    } catch (e) { setMessage(e.message || 'Could not save image.'); }
    finally { setSaving(''); }
  };

  const upload = async (key, file) => {
    if (!file) return;
    try {
      const value = await resizeImage(file);
      setValues((current) => ({ ...current, [key]: { ...(current[key] || {}), value } }));
    } catch { setMessage('Could not process that image.'); }
  };

  if (!isAuthenticated) return null;
  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div><p className="text-xs uppercase tracking-[0.25em] text-orange-500 font-semibold">Website</p><h1 className="font-serif text-3xl font-bold text-zinc-900 mt-1">Landing Page Images</h1><p className="text-sm text-zinc-500 mt-2">Replace the homepage hero, category, and story photography without changing code.</p></div>
        <button onClick={() => { setLoading(true); landingApi.get().then(setValues).finally(() => setLoading(false)); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold hover:bg-zinc-50"><RefreshCw size={15}/> Refresh</button>
      </div>
      {message && <div className="mb-6 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">{message}</div>}
      {loading ? <div className="py-20 text-center text-zinc-400">Loading editor…</div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEFAULTS.map(([key, label, group]) => {
          const item = values[key] || { value: '', alt: '' };
          return <div key={key} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-zinc-100 relative">
              {item.value ? <img src={item.value} alt={item.alt || label} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-zinc-300"><Image size={42}/></div>}
              <label className="absolute right-3 bottom-3 cursor-pointer inline-flex items-center gap-1.5 bg-white/95 px-3 py-2 rounded-xl text-xs font-bold shadow"><Upload size={14}/> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => upload(key, e.target.files?.[0])}/></label>
            </div>
            <div className="p-4 space-y-3">
              <div><p className="text-[10px] uppercase tracking-widest text-zinc-400">{group}</p><h2 className="font-semibold text-zinc-900 mt-1">{label}</h2></div>
              <input value={item.value || ''} onChange={(e) => setValues((v) => ({ ...v, [key]: { ...item, value: e.target.value } }))} placeholder="Paste image URL or upload above" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400" />
              <input value={item.alt || ''} onChange={(e) => setValues((v) => ({ ...v, [key]: { ...item, alt: e.target.value } }))} placeholder="Alt text" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400" />
              <button onClick={() => save(key)} disabled={saving === key || !item.value} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-zinc-950 text-white py-2.5 text-sm font-semibold disabled:opacity-40">{saving === key ? 'Saving…' : <><Check size={15}/> Save image</>}</button>
            </div>
          </div>;
        })}
      </div>}
    </div>
  );
}
