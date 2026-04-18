import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-hot-toast';
import {
  Puzzle, Plus, Edit2, Layout,
  ExternalLink, Info, Loader2, Save, X, Box, FolderPlus,
  ShieldCheck, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Modules = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name?.toUpperCase() === 'SUPER_ADMIN';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isParentModalOpen, setParentModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ name: '', path: '', moduleId: '', description: '' });
  const [parentData, setParentData] = useState({ name: '', icon: 'Box' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.MODULES.BASE);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to load system architecture');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPageModal = (page = null, parentId = null) => {
    if (!isSuperAdmin) return;
    if (page) {
      setEditingPage(page);
      setFormData({
        name: page.name,
        path: page.path,
        moduleId: page.moduleId,
        description: page.description || ''
      });
    } else {
      setEditingPage(null);
      setFormData({ name: '', path: '', moduleId: parentId || '', description: '' });
    }
    setModalOpen(true);
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      if (editingPage) {
        await api.patch(API_ENDPOINTS.MODULES.UPDATE_PAGE(editingPage.id), formData);
        toast.success('Architecture record reconfigured');
      } else {
        await api.post(API_ENDPOINTS.MODULES.CREATE_PAGE, formData);
        toast.success('New page registered in registry');
      }
      fetchData();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Provisioning rejected');
    } finally {
      setSaving(false);
    }
  };

  const handleParentSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      await api.post(API_ENDPOINTS.MODULES.CREATE_PARENT, parentData);
      toast.success('Structural Parent Group established');
      fetchData();
      setParentModalOpen(false);
      setParentData({ name: '', icon: 'Box' });
    } catch (error) {
      toast.error('Governance rejection: Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-xs font-black uppercase tracking-[0.2em] italic">Accessing Architecture Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight uppercase">
            <Puzzle className="text-indigo-600" size={28} />
            Architecture Registry
          </h1>
          <p className="text-slate-500 text-sm">Synchronized mapping of core modules and administrative paths</p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setParentModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50"
            >
              <FolderPlus size={18} />
              <span>Create Group</span>
            </button>
            <button
              onClick={() => handleOpenPageModal()}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
            >
              <Plus size={18} />
              <span>Register Page</span>
            </button>
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex items-center gap-4 text-indigo-800 shadow-sm">
          <Lock size={20} className="shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-[0.05em]">
            Governance Lockdown: New module provisioning and page registrations are restricted to Super Admins only.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {data.map(module => (
          <div key={module.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Box size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{module.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{module.pages.length} Pages registered</p>
                </div>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => handleOpenPageModal(null, module.id)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Provision Page
                </button>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {module.pages.map(page => (
                <div key={page.id} className="p-6 rounded-[2rem] border border-slate-50 bg-slate-100/10 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group relative border-2 border-dashed">
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleOpenPageModal(page)}
                      className="absolute top-4 right-4 p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    {page.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                    <ExternalLink size={12} />
                    <code className="lowercase tracking-tighter">{page.path}</code>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed italic truncate">{page.path}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Page Modal */}
      {isSuperAdmin && isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registry Provisioning</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handlePageSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Parent Module Registry</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-600 focus:bg-white text-sm font-bold transition-all"
                  value={formData.moduleId}
                  onChange={e => setFormData({ ...formData, moduleId: e.target.value })}
                >
                  <option value="">Select a Group...</option>
                  {data.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Architectural Page Name</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-600 focus:bg-white text-sm font-bold text-indigo-700"
                  placeholder="e.g. Identity Audit"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Virtual Registry Path</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-600 focus:bg-white text-sm font-bold lowercase"
                  placeholder="/audit-trails"
                  value={formData.path}
                  onChange={e => setFormData({ ...formData, path: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 p-2 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Abort</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center p-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span className="ml-2">Commit Registry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent Modal */}
      {isSuperAdmin && isParentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Module Group</h3>
              <button onClick={() => setParentModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleParentSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity of Group</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-600 focus:bg-white text-sm font-bold uppercase"
                  placeholder="e.g. Analytics Core"
                  value={parentData.name}
                  onChange={e => setParentData({ ...parentData, name: e.target.value })}
                />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 px-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100">
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Establish Core Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
