import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../api/authService';
import { useForm } from 'react-hook-form';
import { 
  User, Lock, Save, Camera, Shield, Mail, Phone, 
  Activity, Palette, Moon, Sun, ChevronRight, Settings as SettingsIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../components/dashboard/StatusBadge';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [tab, setTab] = useState('appearance');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem('pcm_avatar_' + user.id);
      if (saved) setAvatar(saved);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large. Please select an image under 2MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatar(base64);
      localStorage.setItem('pcm_avatar_' + user.id, base64);
      setSuccess('Profile picture updated!');
      setTimeout(() => setSuccess(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const { register: regProfile, handleSubmit: subProfile } = useForm({ defaultValues: user });
  const { register: regPass, handleSubmit: subPass, watch, reset: resetPass } = useForm();

  const saveProfile = async (data) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await authService.updateMe(data);
      updateUser(res.data.user || res.data);
      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!');
    } catch (e) { 
      const msg = e.response?.data?.detail || 'Failed to update profile.';
      setError(msg);
      showToast(msg, 'error');
    }
    finally { setSaving(false); }
  };

  const changePassword = async (data) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await authService.changePassword({ old_password: data.old_password, new_password: data.new_password });
      setSuccess('Password changed successfully!');
      showToast('Password changed successfully!');
      resetPass();
    } catch (e) { 
      const msg = e.response?.data?.error || e.response?.data?.detail || 'Failed to change password.';
      setError(msg); 
      showToast(msg, 'error');
    }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'appearance', icon: Palette, label: 'Appearance', sub: 'Theme and UI settings' },
    { id: 'profile', icon: User, label: 'Profile', sub: 'Personal information' },
    { id: 'security', icon: Lock, label: 'Security', sub: 'Password and access' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-72 space-y-2">
          <div className="px-4 mb-6">
            <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <SettingsIcon size={24} className="text-primary-600" />
              Settings
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Configuration Center</p>
          </div>

          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group
                ${tab === t.id 
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-2' 
                  : 'bg-white dark:bg-surface-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-surface-800/50 border border-transparent hover:border-slate-100 dark:hover:border-surface-800'}
              `}
            >
              <div className={`p-2 rounded-xl scale-110 ${tab === t.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-surface-800'}`}>
                <t.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm tracking-tight">{t.label}</p>
                <p className={`text-[10px] font-bold truncate ${tab === t.id ? 'text-primary-100/70' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                  {t.sub}
                </p>
              </div>
              <ChevronRight size={14} className={`transition-transform ${tab === t.id ? 'rotate-90 opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {tab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-[2rem] border border-white/40 dark:border-surface-800/50 p-8 shadow-premium"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-surface-800">
                  <div>
                    <h3 className="font-display text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">System Appearance</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Personalize your view</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Palette size={24} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50/50 dark:bg-surface-900/50 rounded-[1.5rem] border border-slate-100 dark:border-surface-800/50">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-white">Color Theme</p>
                      <p className="text-xs text-slate-500 font-medium tracking-tight">Choose between light, dark or follow system</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white dark:bg-surface-950 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-surface-800">
                      {[
                        { id: 'light', icon: Sun, label: 'Light' },
                        { id: 'dark', icon: Moon, label: 'Dark' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            if (theme !== mode.id) {
                              toggleTheme();
                              showToast(`Theme switched to ${mode.label} Mode`, 'info');
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
                            ${theme === mode.id 
                              ? 'bg-primary-600 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                          `}
                        >
                          <mode.icon size={14} className={theme === mode.id ? 'fill-current' : ''} />
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                   
                </div>
              </motion.div>
            )}

            {tab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Header/Avatar Section */}
                <div className="glass rounded-[2rem] border border-white/40 dark:border-surface-800/50 p-8 shadow-premium">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-2xl ring-4 ring-white dark:ring-surface-900 border border-slate-200 dark:border-surface-800">
                        {avatar ? (
                          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-2xl font-black text-white">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Camera size={14} />
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                    
                    <div className="text-center sm:text-left flex-1">
                      <h4 className="font-display text-2xl font-black text-slate-800 dark:text-white leading-tight">
                        {user?.first_name} {user?.last_name}
                      </h4>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                        <StatusBadge status={user?.status} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">{user?.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="glass rounded-[2rem] border border-white/40 dark:border-surface-800/50 p-8 shadow-premium">
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="font-display text-lg font-black text-slate-700 dark:text-slate-200">Personal Details</h5>
                    <User className="text-primary-500" size={20} />
                  </div>

                  <form onSubmit={subProfile(saveProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <input className="input-premium h-12" {...regProfile('first_name')} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input className="input-premium h-12" {...regProfile('last_name')} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input className="input-premium h-12" {...regProfile('phone')} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">System Status</label>
                        <div className="relative">
                          <select className="input-premium appearance-none h-12" {...regProfile('status')}>
                            <option value="Available">🟢 Available</option>
                            <option value="Busy">🟡 Busy</option>
                            <option value="Not Available">🔴 Not Available</option>
                          </select>
                          <Activity className="absolute right-4 top-12 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-surface-800">
                      <div className="min-h-[20px]">
                        {success && tab === 'profile' && <p className="text-xs font-bold text-emerald-500 flex items-center gap-2"><CheckCircle size={14} /> {success}</p>}
                        {error && tab === 'profile' && <p className="text-xs font-bold text-rose-500">{error}</p>}
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={saving} 
                        className="btn-primary py-3 px-8 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-primary-500/20"
                      >
                        {saving ? 'Saving...' : 'Update Profile'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {tab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-[2rem] border border-white/40 dark:border-surface-800/50 p-8 shadow-premium"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-surface-800">
                  <div>
                    <h3 className="font-display text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">Access & Security</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Secure your account</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600">
                    <Lock size={24} />
                  </div>
                </div>

                <form onSubmit={subPass(changePassword)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input type="password" className="input-premium h-12" placeholder="••••••••"
                      {...regPass('old_password', { required: 'Current password is required' })} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input type="password" className="input-premium h-12" placeholder="Min. 6 characters"
                        {...regPass('new_password', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Repeat Password</label>
                      <input type="password" className="input-premium h-12" placeholder="Repeat new password"
                        {...regPass('confirm', {
                          required: 'Please confirm',
                          validate: v => v === watch('new_password') || 'Passwords do not match'
                        })} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-surface-800">
                    <div className="min-h-[20px]">
                      {success && tab === 'security' && <p className="text-xs font-bold text-emerald-500 flex items-center gap-2"><CheckCircle size={14} /> {success}</p>}
                      {error && tab === 'security' && <p className="text-xs font-bold text-rose-500">{error}</p>}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={saving} 
                      className="btn-primary py-3 px-8 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-primary-500/20"
                    >
                      {saving ? 'Updating...' : 'Change Password'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
