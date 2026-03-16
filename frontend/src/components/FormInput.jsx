// components/FormInput.jsx
// Reusable form field used across all forms

export default function FormInput({ label, error, type = 'text', register, required, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select 
          className={`input-premium appearance-none ${error ? 'border-rose-500 shadow-rose-100/10' : ''}`} 
          {...(register || {})} 
          {...props}
        >
          {props.children}
        </select>
      ) : type === 'textarea' ? (
        <textarea 
          rows={3} 
          className={`input-premium resize-none py-3 ${error ? 'border-rose-500 shadow-rose-100/10' : ''}`} 
          {...(register || {})} 
          {...props} 
        />
      ) : (
        <input 
          type={type} 
          className={`input-premium ${error ? 'border-rose-500 shadow-rose-100/10' : ''}`} 
          {...(register || {})} 
          {...props} 
        />
      )}
      
      {error && (
        <p className="text-[10px] font-black text-rose-500 mt-1 uppercase tracking-widest animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
