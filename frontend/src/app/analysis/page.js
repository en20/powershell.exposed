"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import { logoutUser } from "../../../utils/auth";

// Regex helpers
function countMatches(str, regex) {
  const m = str.match(regex);
  return m ? m.length : 0;
}

// Signatures: name, regex/keyword, score, severity, description
const SIGNATURES = [
  {
    name: "Highly Obfuscated Command",
    regex: /([\w\d\s]{0,2}[^\w\d\s]){10,}/i,
    score: 90,
    severity: "critical",
    description: "Command contains a high ratio of symbols, likely obfuscated.",
    obfuscation: true,
  },
  {
    name: "Base64 or EncodedCommand",
    regex: /-encodedCommand|[a-zA-Z0-9+/=]{60,}/i,
    score: 40,
    severity: "high",
    description: "Detects use of encodedCommand or long base64 strings.",
  },
  {
    name: "Suspicious Download",
    regex: /DownloadString|WebClient|Invoke-WebRequest|curl\s|iwr\s|Net\.Socket|XmlHttp/i,
    score: 30,
    severity: "high",
    description: "Detects download or web client usage.",
  },
  {
    name: "Invoke-Expression/Obfuscation",
    regex: /Invoke-Expression|iex\s|\[char|fromCharCode|char\[\]|-join|\+|b64|base64|([\d, ]{5,}\))/i,
    score: 50,
    severity: "critical",
    description: "Detects obfuscation, char arrays, or Invoke-Expression.",
  },
  {
    name: "Suspicious Cmdlet",
    regex: /Get-Credential|Get-ADUser|Get-ADGroupMember|Mimikatz|Invoke-Mimikatz/i,
    score: 60,
    severity: "critical",
    description: "Detects credential access or Mimikatz usage.",
  },
  {
    name: "Remote Command Execution",
    regex: /Invoke-Command|Invoke-PSExec|Invoke-WmiCommand|Invoke-ShellCommand|Invoke-RunAs|Invoke-ReflectivePEInjection/i,
    score: 30,
    severity: "high",
    description: "Detects remote or reflective command execution.",
  },
  {
    name: "Service/Task Manipulation",
    regex: /new-service|set-service|ScheduledTask|start-service|get-service/i,
    score: 20,
    severity: "medium",
    description: "Detects manipulation of Windows services or scheduled tasks.",
  },
  {
    name: "Network/Exfiltration",
    regex: /Net\.Socket|ftp:|https?:|exfiltration|Invoke-EgressCheck|Invoke-ARPScan|Invoke-PortScan|Port.?Scan|beacon|ngrok/i,
    score: 20,
    severity: "medium",
    description: "Detects network activity or exfiltration attempts.",
  },
  {
    name: "Informational Cmdlet",
    regex: /Get-Process|Get-LocalUser|Get-WinEvent|Get-NetTCPConnection|Get-WmiObject|Get-CimInstance/i,
    score: 2,
    severity: "info",
    description: "Common informational or admin cmdlets.",
  },
];

const SEVERITY_ORDER = ["info", "medium", "high", "critical"];
const SEVERITY_COLORS = {
  info: "text-green-300 border-green-300 bg-green-900",
  medium: "text-yellow-400 border-yellow-400 bg-yellow-900",
  high: "text-red-400 border-red-400 bg-red-900",
  critical: "text-red-600 border-red-600 bg-red-900",
};

const SEVERITY_DESCRIPTIONS = {
  info: {
    label: "Info",
    color: "text-green-300 border-green-300 bg-green-900",
    icon: (
      <svg className="w-5 h-5 text-green-300 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    description: "Informational: Common or benign PowerShell commands, typically used for administration or diagnostics.",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-400 border-yellow-400 bg-yellow-900",
    icon: (
      <svg className="w-5 h-5 text-yellow-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    description: "Medium: Potentially suspicious activity, such as service or network manipulation, but not immediately dangerous.",
  },
  high: {
    label: "High",
    color: "text-red-400 border-red-400 bg-red-900",
    icon: (
      <svg className="w-5 h-5 text-red-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    description: "High: Strong indicators of malicious intent, such as encoded commands, downloads, or remote execution.",
  },
  critical: {
    label: "Critical",
    color: "text-red-600 border-red-600 bg-red-900",
    icon: (
      <svg className="w-5 h-5 text-red-600 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    description: "Critical: Highly dangerous, obfuscated, or credential-stealing commands. Immediate attention required!",
  },
};

function analyzeCommand(cmd) {
  const found = [];
  let totalScore = 0;
  let maxSeverity = "info";
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
  for (const sig of SIGNATURES) {
    const match = cmd.match(sig.regex);
    if (match) {
      found.push({
        name: sig.name,
        keyword: match[0],
        score: sig.score,
        severity: sig.severity,
        description: sig.description,
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
  };
}

export default function AnalysisPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [cmd, setCmd] = useState("");
  // Autenticação
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Simulação de trial (poderia vir de contexto/estado global)
  const [trialCount, setTrialCount] = useState(3); // Exemplo: 3 análises restantes
  const [timer, setTimer] = useState(86399); // 23:59:59 em segundos

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("user");
      setUser(null);
      window.location.reload();
    } catch (e) {
      alert("Erro ao deslogar");
    }
  };

  useEffect(() => {
    const command = params.get("cmd") || "";
    setCmd(command);
    setResult(analyzeCommand(command));
  }, [params]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTimer(secs) {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <span className="text-green-400 font-mono text-xl">Carregando...</span>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="w-full max-w-screen-2xl mx-auto bg-black border-2 border-green-700 rounded-xl shadow-lg p-4 md:p-10 flex flex-col items-center">
        {/* Severities legend */}
        <div className="w-full mb-8">
          <h2 className="text-green-400 font-mono text-lg font-bold mb-2 text-center">Severity Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SEVERITY_DESCRIPTIONS).map(([key, val]) => (
              <div key={key} className={`flex items-start gap-3 border-l-4 pl-3 py-2 ${val.color} bg-opacity-30 rounded-md`}>
                <div className="pt-0.5">{val.icon}</div>
                <div>
                  <div className="font-mono font-bold text-base mb-1 capitalize">{val.label}</div>
                  <div className="font-mono text-xs opacity-80 leading-snug">{val.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex flex-col items-center mb-6">
          <span className="text-green-400 font-mono text-lg mb-2">Analysis Result</span>
          <div className="w-full bg-black border border-green-800 rounded p-4 mb-4">
            <span className="text-green-300 font-mono text-xs">PS &gt; </span>
            <span className="text-green-200 font-mono text-xs break-all">{cmd}</span>
          </div>
          {result && (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 border rounded-full font-mono text-xs font-bold uppercase ${SEVERITY_COLORS[result.severity]}`}>{result.severity}</span>
                <span className="text-green-400 font-mono text-sm">Score: <span className="font-bold">{result.score}</span></span>
              </div>
              {result.obfuscationDetails && (
                <div className="mb-4 text-yellow-400 font-mono text-xs">
                  Obfuscation detected: ratio {result.obfuscationDetails.ratio.toFixed(2)}, length {result.obfuscationDetails.ps_len}
                </div>
              )}
              <div className="w-full">
                <h3 className="text-green-300 font-mono text-sm mb-2">Signatures Detected:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-green-900 rounded-lg bg-black">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b border-green-900 text-left font-mono text-xs text-green-400">Category</th>
                        <th className="px-4 py-2 border-b border-green-900 text-left font-mono text-xs text-green-400">Signature Name</th>
                        <th className="px-4 py-2 border-b border-green-900 text-left font-mono text-xs text-green-400">Keyword</th>
                        <th className="px-4 py-2 border-b border-green-900 text-left font-mono text-xs text-green-400">Score</th>
                        <th className="px-4 py-2 border-b border-green-900 text-left font-mono text-xs text-green-400">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.signatures.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-green-700 font-mono text-xs">No signatures detected.</td>
                        </tr>
                      ) : (
                        result.signatures.map((sig, idx) => (
                          <tr key={idx} className="hover:bg-green-950/30 transition">
                            <td className="px-4 py-2 align-middle">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded border ${SEVERITY_COLORS[sig.severity]}`}>{sig.severity}</span>
                            </td>
                            <td className="px-4 py-2 align-middle font-mono text-green-400 text-xs md:text-sm">{sig.name}</td>
                            <td className="px-4 py-2 align-middle font-mono text-green-300 text-xs">{sig.keyword}</td>
                            <td className="px-4 py-2 align-middle font-mono text-green-400 text-xs">{sig.score}</td>
                            <td className="px-4 py-2 align-middle">
                              <Link href={`/analysis/detail?id=${idx}`} className="text-green-400 hover:underline font-mono text-xs">View</Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2 bg-green-700 hover:bg-green-500 text-black font-mono font-semibold rounded-full transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Analyze another command
        </button>
        {/* CTA Subscription */}
        <div className="w-full mt-8 flex flex-col items-center justify-center bg-black border border-green-900 rounded-lg p-4">
          <div className="text-green-300 font-mono text-sm mb-2 text-center">
            Want a more detailed, AI-powered analysis? <span className="text-green-400 font-bold">Subscribe now</span> and unlock advanced threat detection!
          </div>
          <button className="px-6 py-2 bg-green-600 hover:bg-green-400 text-black font-mono font-bold rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 mb-2">
            Subscribe
          </button>
          <div className="text-green-700 font-mono text-xs text-center">
            {trialCount} analysis remaining on your free trial.<br/>
            Analysis quota resets in <span className="text-green-400 font-bold">{formatTimer(timer)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 