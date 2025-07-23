"use client";

export default function AnalysisCard({ 
  title, 
  children, 
  variant = "default",
  className = "" 
}) {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)'
    },
    info: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--primary-blue)'
    },
    warning: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--secondary)'
    }
  };

  const variantTitleColors = {
    default: 'var(--accent)',
    info: 'var(--primary-blue)',
    warning: 'var(--secondary)'
  };

  return (
    <div 
      className={`border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ${className}`} 
      style={variantStyles[variant]}
    >
      {title && (
        <h4 className="font-mono font-bold mb-2 text-sm sm:text-base" style={{color: variantTitleColors[variant]}}>
          {title}
        </h4>
      )}
      <div className="font-mono text-xs sm:text-sm" style={{color: 'var(--foreground)'}}>
        {children}
      </div>
    </div>
  );
}
