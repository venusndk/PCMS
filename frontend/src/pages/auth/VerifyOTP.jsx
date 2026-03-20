import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../api/authService';
import { Hash, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email, otp: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await authService.verifyOTP(data.email, data.otp);
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}&otp=${data.otp}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-display text-3xl font-800 text-slate-900">Verify OTP</h1>
          <p className="text-slate-500 text-sm mt-2">Enter the 6-digit code sent to <b>{email}</b></p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="label">OTP Code</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  className="input-premium pl-10 text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  {...register('otp', { 
                    required: 'OTP is required',
                    pattern: { value: /^[0-9]{6}$/, message: 'Must be 6 digits' }
                  })}
                />
              </div>
              {errors.otp && <p className="error-msg">{errors.otp.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Didn't receive the code?{' '}
              <button 
                onClick={() => navigate('/forgot-password')}
                className="text-primary-600 hover:underline font-medium"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
