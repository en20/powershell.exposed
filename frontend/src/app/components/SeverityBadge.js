"use client";

const SEVERITY_COLORS = {
  info: "border-green-400 text-green-400",
  medium: "border-yellow-400 text-yellow-400", 
  high: "border-red-400 text-red-400",
  critical: "border-red-600 text-red-600",
};

export default function SeverityBadge({ severity, className = "" }) {
  return (
    <span className={`font-mono text-xs px-1 sm:px-2 py-1 rounded border ${SEVERITY_COLORS[severity]} ${className}`}>
      {severity.toUpperCase()}
    </span>
  );
}
