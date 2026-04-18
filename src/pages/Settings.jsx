import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-hot-toast';
import { 
  Settings as SettingsIcon, Layout, ChevronUp, ChevronDown, 
  Trash2, Save, Loader2, Info, GripVertical,
  Layers, Package, Monitor, ShieldAlert
} from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name?.toUpperCase() === 'SUPER_ADMIN';

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Confirmation State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    message: ''
  });

  const fetchArchitecture = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.MODULES.BASE);
      setModules(res.data.data || []);
    } catch (error) {
      toast.error('Failed to sync system architecture');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitecture();
  }, []);

  const moveModule = (index, direction) => {
    if (!isSuperAdmin) return;
    const newModules = [...modules];
    const target = index + direction;
    if (target < 0 || target >= newModules.length) return;
    [newModules[index], newModules[target]] = [newModules[target], newModules[index]];
    setModules(newModules);
  };

  const movePage = (moduleIndex, pageIndex, direction) => {
    if (!isSuperAdmin) return;
    const newModules = [...modules];
    const module = newModules[moduleIndex];
    const pages = [...module.pages];
    const target = pageIndex + direction;
    if (target < 0 || target >= pages.length) return;
    [pages[pageIndex], pages[target]] = [pages[target], pages[pageIndex]];
    module.pages = pages;
    setModules(newModules);
  };

  const saveOrder = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const moduleOrders = modules.map((m, idx) => ({ id: m.id, sortOrder: idx }));
      const pageOrders = [];
      modules.forEach(m => {
        m.pages.forEach((p, idx) => { pageOrders.push({ id: p.id, sortOrder: idx }); });
      });

      await Promise.all([
        api.patch(API_ENDPOINTS.MODULES.REORDER, { orders: moduleOrders }),
        api.patch(API_ENDPOINTS.MODULES.REORDER_PAGES, { orders: pageOrders })
      ]);

      toast.success('Architecture Sequence Synchronized!');
      fetchArchitecture();
    } catch (error) {
      toast.error('Sequence update failed');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModuleConfirm = (id, name) => {
    if (!isSuperAdmin) return;
    setConfirmState({
      isOpen: true,
      type: 'module',
      id,
      title: 'Terminate Parent Module',
      message: `Are you sure you want to delete "${name}"? This will terminate all nested pages and revoke all associated permissions. This action is irreversible.`
    });
  };

  const openDeletePageConfirm = (id, name) => {
    if (!isSuperAdmin) return;
    setConfirmState({
      isOpen: true,
      type: 'page',
      id,
      title: 'Delete Architecture Page',
      message: `Are you sure you want to remove "${name}" from the registry? Users will instantly lose access to this path.`
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = confirmState;
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    const toastId = toast.loading('Terminating architecture component...');
    try {
      if (type === 'module') {
        await api.delete(API_ENDPOINTS.MODULES.DELETE(id));
      } else {
        await api.delete(API_ENDPOINTS.MODULES.DELETE_PAGE(id));
      }
      toast.success('Architecture Registry Updated', { id: toastId });
      fetchArchitecture();
    } catch (error) {
      toast.error('Termination rejected by server', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-400">Loading Sovereignty Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={confirmState.title}
        message={confirmState.message}
        variant="danger"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight uppercase">
             <SettingsIcon className="text-indigo-600" size={28} />
             Architecture Console
          </h1>
          <p className="text-slate-500 text-sm">{isSuperAdmin ? 'Full control over the administrative navigation hierarchy' : 'Viewing global system architecture registry'}</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Synchronize Architecture</span>
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-center gap-4 text-amber-800">
          <ShieldAlert size={24} className="shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">
            Read-Only Mode: You have viewing rights to the registry, but structural modifications are restricted to Super Admins only.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {modules.map((module, mIdx) => (
          <div key={module.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isSuperAdmin && (
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveModule(mIdx, -1)} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronUp size={20} /></button>
                    <button onClick={() => moveModule(mIdx, 1)} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronDown size={20} /></button>
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                   <Package size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{module.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{module.pages.length} Pages Nested</p>
                </div>
              </div>
              {isSuperAdmin && (
                <button 
                  onClick={() => openDeleteModuleConfirm(module.id, module.name)}
                  className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Module Group"
                >
                  <Trash2 size={22} />
                </button>
              )}
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {module.pages.map((page, pIdx) => (
                  <div key={page.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                    {isSuperAdmin && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => movePage(mIdx, pIdx, -1)} className="p-0.5 text-slate-400 hover:text-indigo-600"><ChevronUp size={18} /></button>
                        <GripVertical size={16} className="text-slate-200" />
                        <button onClick={() => movePage(mIdx, pIdx, 1)} className="p-0.5 text-slate-400 hover:text-indigo-600"><ChevronDown size={18} /></button>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 uppercase truncate">{page.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5 font-mono italic">{page.path}</p>
                    </div>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => openDeletePageConfirm(page.id, page.name)}
                        className="p-2 text-slate-300 hover:text-rose-600 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isSuperAdmin && (
        <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex gap-6">
          <Info className="text-indigo-500 shrink-0" size={24} />
          <div>
            <h4 className="text-xs font-black text-indigo-900 uppercase mb-2">Architectural Logic Notice</h4>
            <p className="text-[11px] font-medium text-indigo-700 leading-relaxed uppercase tracking-tight">
              Sidebar reordering is global. Click "Synchronize Architecture" to commit your layout designs to the core database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
