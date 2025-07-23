"use client";
import SeverityBadge from './SeverityBadge';

const SEVERITY_DESCRIPTIONS = {
  info: {
    label: "Info",
    description: "Informational: Common or benign PowerShell commands, typically used for administration or diagnostics.",
  },
  medium: {
    label: "Medium", 
    description: "Medium: Potentially suspicious activity, such as service or network manipulation, but not immediately dangerous.",
  },
  high: {
    label: "High",
    description: "High: Strong indicators of malicious intent, such as encoded commands, downloads, or remote execution.",
  },
  critical: {
    label: "Critical",
    description: "Critical: Highly dangerous, obfuscated, or credential-stealing commands. Immediate attention required!",
  },
};

const SEVERITY_COLORS = {
  info: "border-green-400 text-green-400",
  medium: "border-yellow-400 text-yellow-400", 
  high: "border-red-400 text-red-400",
  critical: "border-red-600 text-red-600",
};

export default function SeverityLegend({ className = "" }) {
  return (
    <div className={`w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mb-6 sm:mb-8 ${className}`}>
      <h2 className="text-base sm:text-lg font-mono font-bold mb-3 sm:mb-4 text-center" style={{color: 'var(--accent)'}}>
        Severity Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(SEVERITY_DESCRIPTIONS).map(([key, val]) => (
          <div key={key} className={`border-l-4 pl-3 sm:pl-4 py-2 ${SEVERITY_COLORS[key]}`}>
            <div className="font-mono font-bold text-sm sm:text-base mb-1 capitalize" style={{color: 'var(--foreground)'}}>
              {val.label}
            </div>
            <div className="font-mono text-xs" style={{color: 'var(--foreground)', opacity: 0.8}}>
              {val.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
