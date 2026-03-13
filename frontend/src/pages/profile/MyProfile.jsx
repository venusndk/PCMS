// pages/profile/MyProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/authService';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, CheckCircle, Camera } from 'lucide-react';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
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
    } catch (e) { setError(e.response?.data?.detail || 'Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const changePassword = async (data) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await authService.changePassword({ old_password: data.old_password, new_password: data.new_password });
      setSuccess('Password changed successfully!');
      resetPass();
    } catch (e) { setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to change password.'); }
    finally { setSaving(false); }
  };

  const statusColor = { Available: 'badge-green', Busy: 'badge-amber', 'Not Available': 'badge-red' };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Profile header card */}
      <div className="card p-6 flex items-center gap-4">
        <div className="relative inline-block cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {avatar ? (
            <img 
              src={avatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="font-display text-2xl font-bold text-primary-700">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="badge badge-purple">{user?.role}</span>
            <span className={`badge ${statusColor[user?.status] || 'badge-slate'}`}>{user?.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[['profile', User, 'Edit Profile'], ['password', Lock, 'Change Password']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => { setTab(key); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {avatarSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <p className="text-sm text-emerald-700">{avatarSuccess}</p>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-800 mb-4">Personal Information</h3>
          <form onSubmit={subProfile(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" {...regProfile('first_name')} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" {...regProfile('last_name')} />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1234567890" {...regProfile('phone')} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...regProfile('status')}>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-800 mb-4">Change Password</h3>
          <form onSubmit={subPass(changePassword)} className="space-y-4">
            <div>
              <label className="label">Current Password *</label>
              <input type="password" className="input" placeholder="Your current password"
                {...regPass('old_password', { required: 'Current password required' })} />
            </div>
            <div>
              <label className="label">New Password *</label>
              <input type="password" className="input" placeholder="Min. 6 characters"
                {...regPass('new_password', { required: 'New password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            </div>
            <div>
              <label className="label">Confirm New Password *</label>
              <input type="password" className="input" placeholder="Repeat new password"
                {...regPass('confirm', {
                  required: 'Please confirm',
                  validate: v => v === watch('new_password') || 'Passwords do not match'
                })} />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                <Lock className="w-4 h-4" />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
