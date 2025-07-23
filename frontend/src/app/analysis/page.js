"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import SeverityLegend from "../components/SeverityLegend";
import AnalysisCard from "../components/AnalysisCard";
import SeverityBadge from "../components/SeverityBadge";
import IndicatorTable from "../components/IndicatorTable";
import ThemedButton from "../components/ThemedButton";

// Regex helpers
function countMatches(str, regex) {
  const m = str.match(regex);
  return m ? m.length : 0;
}

const SEVERITY_ORDER = ["info", "medium", "high", "critical"];
const SEVERITY_COLORS = {
  info: "border-green-400 text-green-400",
  medium: "border-yellow-400 text-yellow-400", 
  high: "border-red-400 text-red-400",
  critical: "border-red-600 text-red-600",
};

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

// Function to decode Base64 PowerShell commands
function decodeBase64Command(cmd) {
  try {
    // Check if command contains -EncodedCommand or similar
    const encodedMatch = cmd.match(/(-EncodedCommand|-enc|-e\s+)([A-Za-z0-9+/=]+)/i);
    if (encodedMatch && encodedMatch[2]) {
      const base64String = encodedMatch[2];
      
      try {
        // First try to decode as UTF-16LE (PowerShell default)
        const decoded = atob(base64String);
        let result = '';
        
        // Convert from UTF-16LE (PowerShell encoding) to readable text
        for (let i = 0; i < decoded.length; i += 2) {
          if (i + 1 < decoded.length) {
            const charCode = decoded.charCodeAt(i) + (decoded.charCodeAt(i + 1) << 8);
            if (charCode !== 0) { // Skip null characters
              result += String.fromCharCode(charCode);
            }
          }
        }
        
        // If result looks valid, return it
        if (result && result.length > 0 && /[a-zA-Z]/.test(result)) {
          return result;
        }
        
        // Fallback: try direct UTF-8 decoding
        return atob(base64String);
        
      } catch (decodeError) {
        console.log('Base64 decode error:', decodeError);
        return null;
      }
    }
  } catch (error) {
    console.log('Error decoding Base64:', error);
  }
  return null;
}

function analyzeCommand(cmd, signatures = []) {
  const found = [];
  let totalScore = 0;
  let maxSeverity = "info";
  let decodedCommand = null;
  
  // Try to decode Base64 command if it's encoded
  const decoded = decodeBase64Command(cmd);
  if (decoded) {
    decodedCommand = decoded;
    // Analyze both original and decoded command
    cmd = cmd + ' ' + decoded; // Combine both for analysis
  }
  
  // Obfuscation ratio
  const symbolCount = countMatches(cmd, /['@%^,;:=&+"(){}\]`!*./?_\[\]|<>~$]/g);
  const nonSymbolCount = countMatches(cmd, /[^'@%^,;:=&+"(){}\]`!*./?_\[\]|<>~$\s]/g);
  const ps_len = cmd.length;
  const ratio = symbolCount > 0 ? (nonSymbolCount / symbolCount) : 99;
  let obfuscationDetails = null;
  if (ps_len > 100 && ratio < 3) {
    found.push({
      name: "Highly Obfuscated Command (ratio)",
      keyword: `ratio: ${ratio.toFixed(2)}, len: ${ps_len}`,
      score: 90,
      severity: "critical",
      description: "Command contains a high ratio of symbols, likely obfuscated.",
      obfuscation: true,
    });
    totalScore += 90;
    maxSeverity = "critical";
    obfuscationDetails = { ratio, ps_len };
  }
  for (const sig of signatures) {
    // Convert JSON regex string to RegExp object
    const regex = new RegExp(sig.regex, sig.flags || 'i');
    const match = cmd.match(regex);
    if (match) {
      found.push({
        name: sig.name,
        keyword: match[0],
        score: sig.score,
        severity: sig.severity,
        description: sig.description,
        category: sig.category,
      });
      totalScore += sig.score;
      if (
        SEVERITY_ORDER.indexOf(sig.severity) >
        SEVERITY_ORDER.indexOf(maxSeverity)
      ) {
        maxSeverity = sig.severity;
      }
    }
  }
  return {
    severity: maxSeverity,
    score: totalScore,
    signatures: found,
    obfuscationDetails,
    decodedCommand,
  };
}

export default function AnalysisPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [cmd, setCmd] = useState("");
  const [signatures, setSignatures] = useState([]);
  // Autenticação
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Carregar signatures do arquivo JSON
  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const response = await fetch('/signatures.json');
        const signaturesData = await response.json();
        setSignatures(signaturesData);
      } catch (error) {
        console.error('Erro ao carregar signatures:', error);
      }
    };
    loadSignatures();
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const command = params.get("cmd") || "";
    setCmd(command);
    if (signatures.length > 0) {
      setResult(analyzeCommand(command, signatures));
    }
  }, [params, signatures]);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold mb-6 sm:mb-8 text-center" style={{color: 'var(--accent)'}}>
        Analysis Result
      </h1>

      {/* Command Display */}
      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mb-6 sm:mb-8 border rounded-lg p-3 sm:p-4" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
        <div className="font-mono text-xs sm:text-sm mb-2" style={{color: 'var(--accent)'}}>Command analyzed:</div>
        <div className="flex items-start">
          <span className="font-mono mr-2 text-sm" style={{color: 'var(--accent)'}}>PS &gt;</span>
          <span className="font-mono text-xs sm:text-sm break-all" style={{color: 'var(--foreground)'}}>{cmd}</span>
        </div>
      </div>

      {/* Severity Legend */}
      <SeverityLegend />

      {/* Results */}
      {result && (
        <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mb-6 sm:mb-8">
          {/* Session Severity & Risk Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="border rounded-lg p-4 sm:p-6 text-center" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
              <h3 className="font-mono text-base sm:text-lg font-bold mb-2" style={{color: 'var(--accent)'}}>
                Session Severity
              </h3>
              <span className={`px-3 sm:px-4 py-2 border rounded font-mono text-base sm:text-lg font-bold uppercase ${SEVERITY_COLORS[result.severity]}`}>
                {result.severity}
              </span>
            </div>
            <div className="border rounded-lg p-4 sm:p-6 text-center" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
              <h3 className="font-mono text-base sm:text-lg font-bold mb-2" style={{color: 'var(--accent)'}}>
                Risk Score
              </h3>
              <span className="font-mono text-xl sm:text-2xl font-bold" style={{color: 'var(--foreground)'}}>
                {result.score}
              </span>
              <span className="font-mono text-xs block mt-1" style={{color: 'var(--accent)', opacity: 0.7}}>
                Cumulative score from all indicators
              </span>
            </div>
          </div>

          {result.obfuscationDetails && (
            <AnalysisCard title="Obfuscation Analysis" variant="warning">
              Obfuscation detected: ratio {result.obfuscationDetails.ratio.toFixed(2)}, length {result.obfuscationDetails.ps_len}
            </AnalysisCard>
          )}

          {/* Scored Indicators */}
          <IndicatorTable signatures={result.signatures} />

          {/* Notes Section */}
          <AnalysisCard title="Analysis Notes" variant="warning">
            <div className="space-y-2 sm:space-y-3">
              {result.severity === 'info' && (
                <div>
                  • This command contains common PowerShell cmdlets typically used for system administration and diagnostics.
                </div>
              )}
              {result.severity === 'medium' && (
                <div>
                  • This command shows potentially suspicious activity. While not immediately dangerous, it should be reviewed in context.
                </div>
              )}
              {result.severity === 'high' && (
                <div>
                  • This command contains strong indicators of malicious intent. Review the execution context and source carefully.
                </div>
              )}
              {result.severity === 'critical' && (
                <div>
                  • This command is highly dangerous and likely malicious. Immediate investigation and containment may be required.
                </div>
              )}
              
              {result.score > 50 && (
                <div>
                  • High risk score ({result.score}) indicates multiple suspicious patterns detected.
                </div>
              )}
              
              {result.obfuscationDetails && (
                <div>
                  • Command shows signs of obfuscation, which is commonly used to evade detection.
                </div>
              )}
              
              <div>
                • Analysis completed with {signatures.length} detection signatures.
              </div>
            </div>
          </AnalysisCard>
        </div>
      )}

      {/* Back Button */}
      <ThemedButton
        onClick={() => router.push("/")}
        className="mb-6 sm:mb-8"
      >
        Analyze another command
      </ThemedButton>
    </div>
  );
} 