import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (pass.length < 8 || pass.length > 20) return "Password must be 8-20 characters";
    if (!/[A-Z]/.test(pass)) return "At least 1 Uppercase letter required";
    if (!/[a-z]/.test(pass)) return "At least 1 Lowercase letter required";
    if (!/[0-9]/.test(pass)) return "At least 1 Number required";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "At least 1 Special character required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Apply strict validation at login also
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      const userObj = JSON.parse(localStorage.getItem('user'));
      const roleName = userObj?.role?.name?.replace('_', ' ') || 'User';
      
      toast.success(
        <div>
          <p className="font-bold">Welcome back!</p>
          <p className="text-xs font-medium opacity-80">Logged in as {roleName}</p>
        </div>
      );
      navigate('/');
    } else {
      toast.error(result.message || 'Login failed. Security check failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-200 rotate-6 transform transition-transform hover:rotate-0">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 mt-2 font-medium">Log in to manage your system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-600 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full pl-11 pr-12 py-4 bg-slate-50 border-2 rounded-2xl focus:border-primary-600 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300 ${error ? 'border-rose-400' : 'border-slate-100'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1 uppercase">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all shadow-xl shadow-primary-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Verifying...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 font-bold text-sm">
            Security Standard: 8-20 Characters + AlphaNumeric + Special
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
