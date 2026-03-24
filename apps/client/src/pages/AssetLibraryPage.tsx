import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Upload, Search, X, Download, Trash2, FolderOpen, Image, Copy, Check } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  url: string;
  category: string;
  brand: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

const CATEGORIES = ['All', 'Logos', 'Hero Images', 'Banners', 'Product Shots', 'Icons'];
const BRANDS = ['All', 'Bud Light', 'Corona', 'Michelob Ultra', 'Stella Artois', 'Goose Island', 'BEES'];

const INITIAL_ASSETS: Asset[] = [
  { id: 'a1', name: 'bud-light-hero-spring.jpg', url: 'https://placehold.co/400x300/DBEAFE/2563EB?text=Bud+Light+Hero', category: 'Hero Images', brand: 'Bud Light', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-03-15', size: '245 KB' },
  { id: 'a2', name: 'corona-logo-white.png', url: 'https://placehold.co/400x300/FEF3C7/92400E?text=Corona+Logo', category: 'Logos', brand: 'Corona', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-03-10', size: '48 KB' },
  { id: 'a3', name: 'michelob-ultra-banner.jpg', url: 'https://placehold.co/400x300/E0E7FF/4338CA?text=Michelob+Ultra', category: 'Banners', brand: 'Michelob Ultra', uploadedBy: 'James Wilson', uploadedAt: '2026-03-08', size: '312 KB' },
  { id: 'a4', name: 'stella-artois-product.jpg', url: 'https://placehold.co/400x300/FEE2E2/991B1B?text=Stella+Artois', category: 'Product Shots', brand: 'Stella Artois', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-03-05', size: '189 KB' },
  { id: 'a5', name: 'goose-island-ipa-hero.jpg', url: 'https://placehold.co/400x300/D1FAE5/065F46?text=Goose+Island+IPA', category: 'Hero Images', brand: 'Goose Island', uploadedBy: 'James Wilson', uploadedAt: '2026-03-01', size: '278 KB' },
  { id: 'a6', name: 'bees-logo-dark.svg', url: 'https://placehold.co/400x300/FEF9C3/854D0E?text=BEES+Logo', category: 'Logos', brand: 'BEES', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-02-20', size: '12 KB' },
  { id: 'a7', name: 'corona-cinco-banner.jpg', url: 'https://placehold.co/400x300/FDE68A/78350F?text=Cinco+de+Mayo', category: 'Banners', brand: 'Corona', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-02-15', size: '356 KB' },
  { id: 'a8', name: 'bud-light-logo.png', url: 'https://placehold.co/400x300/BFDBFE/1E40AF?text=BL+Logo', category: 'Logos', brand: 'Bud Light', uploadedBy: 'James Wilson', uploadedAt: '2026-02-10', size: '34 KB' },
  { id: 'a9', name: 'michelob-product-lineup.jpg', url: 'https://placehold.co/400x300/C7D2FE/3730A3?text=MU+Lineup', category: 'Product Shots', brand: 'Michelob Ultra', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-02-01', size: '420 KB' },
  { id: 'a10', name: 'bees-app-icon.png', url: 'https://placehold.co/400x300/FEF3C7/D97706?text=BEES+Icon', category: 'Icons', brand: 'BEES', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-01-25', size: '8 KB' },
  { id: 'a11', name: 'stella-holiday-banner.jpg', url: 'https://placehold.co/400x300/FECACA/7F1D1D?text=Stella+Holiday', category: 'Banners', brand: 'Stella Artois', uploadedBy: 'James Wilson', uploadedAt: '2026-01-20', size: '298 KB' },
  { id: 'a12', name: 'goose-island-logo.svg', url: 'https://placehold.co/400x300/A7F3D0/047857?text=GI+Logo', category: 'Logos', brand: 'Goose Island', uploadedBy: 'Carmen Rodriguez', uploadedAt: '2026-01-15', size: '18 KB' },
];

export function AssetLibraryPage() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'content_creator' || user?.role === 'dc_manager';
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
    if (brandFilter !== 'All' && a.brand !== brandFilter) return false;
    return true;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newAsset: Asset = {
      id: `upload-${Date.now()}`,
      name: file.name,
      url,
      category: 'Hero Images',
      brand: 'BEES',
      uploadedBy: user?.displayName ?? 'Unknown',
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: `${Math.round(file.size / 1024)} KB`,
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleCopyUrl = (asset: Asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Asset Library</h1>
          <p className="text-sm text-surface-500 mt-1">{filtered.length} asset{filtered.length !== 1 ? 's' : ''} — shared creative resources</p>
        </div>
        {canManage && (
          <>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
              <Upload className="w-4 h-4" /> Upload Asset
            </button>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search by filename..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-auto min-w-[140px]">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="input-field w-auto min-w-[140px]">
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Image className="w-8 h-8 text-surface-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-surface-500">No assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="card overflow-hidden group">
              <div className="relative h-36 bg-surface-100">
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => handleCopyUrl(asset)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-surface-700 hover:bg-surface-100 transition-colors" title="Copy URL">
                    {copiedId === asset.id ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {canManage && (
                    <button onClick={() => handleDelete(asset.id)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-danger-600 hover:bg-danger-50 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-medium text-surface-900 truncate">{asset.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-default text-[9px]">{asset.brand}</span>
                  <span className="badge badge-default text-[9px]">{asset.category}</span>
                </div>
                <div className="text-[10px] text-surface-400 mt-1.5">{asset.uploadedBy} &middot; {asset.size}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
