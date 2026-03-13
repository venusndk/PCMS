// pages/requests/CreateRequest.jsx — Public page, no login needed
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestService } from '../../api/requestService';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const REQUEST_TYPES = [
  'Internet cable installation', 'OS repair', 'Antivirus installation',
  'Hardware repair', 'Software installation', 'Network troubleshooting',
  'Data recovery', 'Other ICT services',
];

export default function CreateRequest() {
  const [success, setSuccess] = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const res = await requestService.create(data);
      setSuccess(res.data);
      reset();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/20 to-surface-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-elevated mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-800 text-slate-900">ICT Support Request</h1>
          <p className="text-slate-500 text-sm mt-1">Submit a support request — no login required</p>
        </div>

        {success ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
            <p className="text-sm text-slate-500 mb-2">{success.message}</p>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2 inline-block">
              Your Request ID: <strong className="text-primary-600 font-mono">#{success.request_id}</strong>
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setSuccess(null)} className="btn-primary">Submit Another Request</button>
              <Link to="/login" className="btn-secondary">Staff Login</Link>
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slate-800">Your Information</h2>
              <Link to="/login" className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Staff Login
              </Link>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input className={`input ${errors.first_name ? 'input-error' : ''}`} placeholder="Alice"
                    {...register('first_name', { required: 'Required' })} />
                  {errors.first_name && <p className="error-msg">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input className={`input ${errors.last_name ? 'input-error' : ''}`} placeholder="Johnson"
                    {...register('last_name', { required: 'Required' })} />
                  {errors.last_name && <p className="error-msg">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="alice@company.com"
                    {...register('email', { required: 'Email required' })} />
                  {errors.email && <p className="error-msg">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Telephone *</label>
                  <input className={`input ${errors.telephone ? 'input-error' : ''}`} placeholder="+1234567890"
                    {...register('telephone', { required: 'Phone required' })} />
                  {errors.telephone && <p className="error-msg">{errors.telephone.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Department / Unit *</label>
                <input className={`input ${errors.unit ? 'input-error' : ''}`} placeholder="Finance Department, IT Office..."
                  {...register('unit', { required: 'Unit/Department required' })} />
                {errors.unit && <p className="error-msg">{errors.unit.message}</p>}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display text-sm font-bold text-slate-700 mb-3">Request Details</h3>
                <div>
                  <label className="label">Request Type *</label>
                  <select className="input" {...register('request_type', { required: true })}>
                    <option value="">Select request type...</option>
                    {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.request_type && <p className="error-msg">Please select a request type</p>}
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea rows={4} className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe your issue in detail. What happened? When did it start? What have you tried so far?"
                  {...register('description', { required: 'Please describe the issue', minLength: { value: 20, message: 'Please provide more detail (min. 20 characters)' } })} />
                {errors.description && <p className="error-msg">{errors.description.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting request...
                  </span>
                ) : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
