import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/authService';
import { useToast } from '../../context/ToastContext';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, CheckCircle, Camera, Shield, Mail, Phone, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../components/dashboard/StatusBadge';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [tab,     setTab]     = useState('profile');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  
  const [avatar, setAvatar] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState('');
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
      setAvatarSuccess('Profile picture updated!');
      setTimeout(() => setAvatarSuccess(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const { register: regProfile, handleSubmit: subProfile } = useForm({ defaultValues: user });
  const { register: regPass,    handleSubmit: subPass, watch, reset: resetPass } = useForm();

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

  const statusColor = { Available: 'badge-green', Busy: 'badge-amber', 'Not Available': 'badge-red' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Premium Header Card */}
      <div className="relative overflow-hidden glass rounded-[2.5rem] border border-white/40 dark:border-surface-800/50 shadow-premium p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer group" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white dark:ring-surface-900 border border-slate-200 dark:border-surface-800">
              {avatar ? (
                <img 
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                  <span className="font-display text-4xl md:text-5xl font-black text-white tracking-tighter">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              )}
            </div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-surface-800 rounded-xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-surface-700"
            >
              <Camera className="w-5 h-5 text-primary-600" />
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight"
              >
                {user?.first_name} {user?.last_name}
              </motion.h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-surface-900/50 rounded-full border border-white/50 dark:border-surface-800 text-xs font-bold text-slate-500">
                  <Shield size={12} className="text-primary-500" />
                  {user?.role}
                </div>
                <StatusBadge status={user?.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto md:mx-0">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-surface-800 flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-surface-800 flex items-center justify-center">
                  <Phone size={14} />
                </div>
                <span className="text-sm font-medium">{user?.phone || 'No phone set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', icon: User, label: 'Profile Settings', sub: 'Update your personal info' },
            { id: 'password', icon: Lock, label: 'Security', sub: 'Manage your password' }
          ].map((t) => (
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
              <div>
                <p className="font-bold text-sm tracking-tight">{t.label}</p>
                <p className={`text-[10px] uppercase font-black tracking-widest leading-none mt-1 ${tab === t.id ? 'text-primary-100/70' : 'text-slate-400 group-hover:text-slate-500'}`}>
                  {t.id === 'profile' ? 'General' : 'Privacy'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area with AnimatePresence */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-3xl border border-white/40 dark:border-surface-800/50 p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-display text-xl font-black text-slate-800 dark:text-white leading-none">Account Profile</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Public Information</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center text-primary-600">
                    <User size={24} />
                  </div>
                </div>

                <form onSubmit={subProfile(saveProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <input className="input-premium" {...regProfile('first_name')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input className="input-premium" {...regProfile('last_name')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input className="input-premium" placeholder="+250..." {...regProfile('phone')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">System Status</label>
                    <div className="relative">
                      <select className="input-premium appearance-none" {...regProfile('status')}>
                        <option value="Available">🟢 Available</option>
                        <option value="Busy">🟡 Busy</option>
                        <option value="Not Available">🔴 Not Available</option>
                      </select>
                      <Activity className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-surface-800">
                    <div className="space-y-1">
                      {success && <p className="text-xs font-bold text-emerald-500 animate-fade-in">{success}</p>}
                      {error && <p className="text-xs font-bold text-rose-500 animate-fade-in">{error}</p>}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={saving} 
                      className="btn-primary-premium flex items-center gap-2 px-8 py-3 rounded-2xl"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {tab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-3xl border border-white/40 dark:border-surface-800/50 p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-display text-xl font-black text-slate-800 dark:text-white leading-none">Security Center</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Authentication Settings</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600">
                    <Lock size={24} />
                  </div>
                </div>

                <form onSubmit={subPass(changePassword)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input type="password" className="input-premium" placeholder="••••••••"
                      {...regPass('old_password', { required: 'Current password required' })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input type="password" className="input-premium" placeholder="Min. 6 characters"
                        {...regPass('new_password', { required: 'New password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input type="password" className="input-premium" placeholder="Repeat new password"
                        {...regPass('confirm', {
                          required: 'Please confirm',
                          validate: v => v === watch('new_password') || 'Passwords do not match'
                        })} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-surface-800">
                    <div className="space-y-1">
                      {success && <p className="text-xs font-bold text-emerald-500 animate-fade-in">{success}</p>}
                      {error && <p className="text-xs font-bold text-rose-500 animate-fade-in">{error}</p>}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={saving} 
                      className="btn-primary-premium flex items-center gap-2 px-8 py-3 rounded-2xl"
                    >
                      <Lock size={18} />
                      {saving ? 'Updating...' : 'Update Password'}
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
