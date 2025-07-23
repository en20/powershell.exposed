"use client";
import SeverityBadge from './SeverityBadge';

export default function IndicatorTable({ signatures = [] }) {
  return (
    <div className="border rounded-lg overflow-hidden mb-6 sm:mb-8" style={{borderColor: 'var(--border-color)'}}>
      <div className="p-3 sm:p-4 border-b" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
        <h3 className="font-mono text-base sm:text-lg font-bold" style={{color: 'var(--accent)'}}>
          Scored Indicators ({signatures.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{backgroundColor: 'var(--card-bg)'}}>
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-mono text-xs sm:text-sm border-b" style={{color: 'var(--accent)', borderColor: 'var(--border-color)'}}>
                Severity
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-mono text-xs sm:text-sm border-b" style={{color: 'var(--accent)', borderColor: 'var(--border-color)'}}>
                Indicator Name
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-mono text-xs sm:text-sm border-b hidden sm:table-cell" style={{color: 'var(--accent)', borderColor: 'var(--border-color)'}}>
                Matched Pattern
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-mono text-xs sm:text-sm border-b" style={{color: 'var(--accent)', borderColor: 'var(--border-color)'}}>
                Score
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-mono text-xs sm:text-sm border-b hidden md:table-cell" style={{color: 'var(--accent)', borderColor: 'var(--border-color)'}}>
                Description
              </th>
            </tr>
          </thead>
          <tbody style={{backgroundColor: 'var(--card-bg)'}}>
            {signatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 sm:px-4 py-4 sm:py-6 text-center font-mono text-xs sm:text-sm" style={{color: 'var(--accent)'}}>
                  No indicators detected. This command appears to be safe.
                </td>
              </tr>
            ) : (
              signatures.map((sig, idx) => (
                <tr key={idx} className="border-b" style={{borderColor: 'var(--border-color)'}}>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <SeverityBadge severity={sig.severity} />
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm font-bold" style={{color: 'var(--foreground)'}}>
                    {sig.name}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs hidden sm:table-cell" style={{color: 'var(--accent)', backgroundColor: 'rgba(156, 254, 65, 0.1)'}}>
                    <div className="max-w-xs truncate" title={sig.keyword}>
                      {sig.keyword}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm font-bold" style={{color: 'var(--foreground)'}}>
                    +{sig.score}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs hidden md:table-cell" style={{color: 'var(--foreground)', opacity: 0.8}}>
                    <div className="max-w-sm">
                      {sig.description}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
