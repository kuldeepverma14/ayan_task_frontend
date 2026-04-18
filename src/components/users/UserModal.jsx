import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: ''
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (initialData) {
        setFormData({
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          email: initialData.email || '',
          password: '',
          roleId: initialData.roleId || ''
        });
      } else {
        setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/users/roles');
      setRoles(res.data.data);
    } catch (error) {
      toast.error('Failed to load system roles');
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

    const password = formData.password;
    if (!isEdit && !password) {
      newErrors.password = 'Password is required';
    } else if (password) {
      if (password.length < 8 || password.length > 20) {
        newErrors.password = 'Length must be 8-20 characters';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'At least 1 Uppercase letter required';
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = 'At least 1 Lowercase letter required';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'At least 1 Number required';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = 'At least 1 Special character required';
      }
    }

    if (!formData.roleId) newErrors.roleId = 'Please assign a role';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        // Don't send email in update payload as it's immutable
        delete payload.email;
        
        await api.patch(`/users/${initialData.id}`, payload);
        toast.success('User profile updated successfully!');
      } else {
        await api.post('/users', formData);
        toast.success('System user created successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
      if (msg.includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isEdit ? `Update ${formData.firstName}'s Profile` : 'Provision System User'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin Authority Required</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 overflow-y-auto custom-scrollbar">
          <form id="addUserForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.firstName ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-primary-600'}`} size={18} />
                  <input
                    type="text"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm font-bold ${errors.firstName ? 'border-rose-100 focus:border-rose-400' : 'border-slate-50 focus:border-primary-600 focus:bg-white'}`}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                {errors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.lastName ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-primary-600'}`} size={18} />
                  <input
                    type="text"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm font-bold ${errors.lastName ? 'border-rose-100 focus:border-rose-400' : 'border-slate-50 focus:border-primary-600 focus:bg-white'}`}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                {errors.lastName && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address (Permanent)</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEdit ? 'text-slate-300' : errors.email ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-primary-600'}`} size={18} />
                <input
                  type="email"
                  disabled={isEdit}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all text-sm font-bold ${isEdit ? 'bg-slate-50 border-slate-50 text-slate-400 cursor-not-allowed' : errors.email ? 'bg-slate-50 border-rose-100 focus:border-rose-400' : 'bg-slate-50 border-slate-50 focus:border-primary-600 focus:bg-white'}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {isEdit ? 'Reset Credentials (Leave empty to keep current)' : 'System Access Password'}
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-primary-600'}`} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm font-bold ${errors.password ? 'border-rose-100 focus:border-rose-400' : 'border-slate-50 focus:border-primary-600 focus:bg-white'}`}
                  placeholder={isEdit ? "Set new security key..." : "8-20 chars (A-Z, a-z, 0-9, @#)"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase leading-tight">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Authority Role</label>
              <div className="relative group">
                <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.roleId ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-primary-600'}`} size={18} />
                <select
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm font-bold appearance-none ${errors.roleId ? 'border-rose-100 focus:border-rose-400' : 'border-slate-50 focus:border-primary-600 focus:bg-white'}`}
                  value={formData.roleId}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                >
                  <option value="">Select a system role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name} - {role.description}</option>
                  ))}
                </select>
              </div>
              {errors.roleId && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">{errors.roleId}</p>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex gap-4 bg-slate-50/30 sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 uppercase tracking-widest hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            form="addUserForm"
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : isEdit ? 'Update Details' : 'Initialize User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
