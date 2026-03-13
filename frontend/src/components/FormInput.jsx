// components/FormInput.jsx
// Reusable form field used across all forms

export default function FormInput({ label, error, type = 'text', register, required, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      {type === 'select' ? (
        <select className={`input ${error ? 'input-error' : ''}`} {...(register || {})} {...props}>
          {props.children}
        </select>
      ) : type === 'textarea' ? (
        <textarea rows={3} className={`input resize-none ${error ? 'input-error' : ''}`} {...(register || {})} {...props} />
      ) : (
        <input type={type} className={`input ${error ? 'input-error' : ''}`} {...(register || {})} {...props} />
      )}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
