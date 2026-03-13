// pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-elevated mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-800 text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Register as Administrator or Technician</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className={`input ${errors.first_name ? 'input-error' : ''}`} placeholder="John"
                  {...register('first_name', { required: 'Required' })} />
                {errors.first_name && <p className="error-msg">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className={`input ${errors.last_name ? 'input-error' : ''}`} placeholder="Doe"
                  {...register('last_name', { required: 'Required' })} />
                {errors.last_name && <p className="error-msg">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1234567890" {...register('phone')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role *</label>
                <select className="input" {...register('role', { required: 'Required' })}>
                  <option value="Administrator">Administrator</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} placeholder="Min. 6 characters"
                {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input type="password" className={`input ${errors.confirm_password ? 'input-error' : ''}`} placeholder="Repeat password"
                {...register('confirm_password', {
                  required: 'Please confirm password',
                  validate: v => v === watch('password') || 'Passwords do not match'
                })} />
              {errors.confirm_password && <p className="error-msg">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
