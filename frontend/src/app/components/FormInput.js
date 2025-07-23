"use client";

export default function FormInput({ 
  type = "text",
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
  className = ""
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium font-mono" style={{color: 'var(--foreground)'}}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none font-mono"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--foreground)',
          borderColor: 'var(--border-color)'
        }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
