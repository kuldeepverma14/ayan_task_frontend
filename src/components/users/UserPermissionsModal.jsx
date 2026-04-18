import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import { toast } from 'react-hot-toast';
import {
  X, Save, Loader2, Check,
  Fingerprint, AlertTriangle
} from 'lucide-react';

const UserPermissionsModal = ({ isOpen, onClose, user }) => {
  const [pages, setPages] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserPermissions();
    } else {
      // Reset state when closed
      setPages([]);
      setMatrix({});
    }
  }, [isOpen, user?.id]); // Depend on user.id for stability

  const fetchUserPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.USERS.PERMISSIONS(user.id));
      const { pages, overrides } = res.data.data;

      setPages(pages || []);

      const initialMatrix = {};
      (overrides || []).forEach(o => {
        initialMatrix[o.pageId] = {
          canView: o.canView,
          canCreate: o.canCreate,
          canEdit: o.canEdit,
          canDelete: o.canDelete
        };
      });
      setMatrix(initialMatrix);
    } catch (error) {
      toast.error('Identity registry sync failed');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (pageId, action) => {
    setMatrix(prev => {
      const current = prev[pageId] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      return {
        ...prev,
        [pageId]: { ...current, [action]: !current[action] }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = Object.keys(matrix).map(pageId => ({
        pageId,
        ...matrix[pageId]
      }));

      await api.post(API_ENDPOINTS.USERS.PERMISSIONS(user.id), { permissions });
      toast.success(`${user.firstName}'s Sovereignty Synced!`);
      onClose();
    } catch (error) {
      toast.error('Sovereignty update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Fingerprint size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                Authority Override Matrix
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Subordinate: <span className="text-indigo-600">{user?.firstName} {user?.lastName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Loading State or Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Reading Authority Registry...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Module</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">View</th>
                      {/* <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Create</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Edit</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Delete</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-white transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{page.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 italic">/{page.path.replace(/^\//, '')}</p>
                          </div>
                        </td>
                        {['canView'].map(action => (
                          // {['canView', 'canCreate', 'canEdit', 'canDelete'].map(action => (
                          <td key={action} className="px-6 py-4 text-center">
                            <button
                              onClick={() => togglePermission(page.id, action)}
                              className={`
                                w-8 h-8 rounded-lg transition-all border flex items-center justify-center mx-auto
                                ${matrix[page.id]?.[action]
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-300'
                                  : 'bg-white border-slate-300 text-slate-300 hover:border-slate-300'
                                }
                              `}
                            >
                              {matrix[page.id]?.[action] ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase mb-1">Override Conflict Notice</p>
                  <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                    Manually defined permissions here will take priority over the default Role permissions for this user specifically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex gap-4 bg-slate-50/20 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Sync Authority</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsModal;
