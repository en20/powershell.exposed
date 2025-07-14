"use client"
import { useEffect, useState, useRef } from "react";
import { logoutUser } from "../../utils/auth";
import { useRouter } from "next/navigation";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [command, setCommand] = useState("");
  const [result, setResult] = useState(null); // { type: 'safe'|'malicious', severity: 'leve'|'médio'|'crítico' }
  const router = useRouter();
  const textareaRef = useRef(null);
  // Simulação de trial (poderia vir de contexto/estado global)
  const [trialCount, setTrialCount] = useState(3); // Exemplo: 3 análises restantes
  const [timer, setTimer] = useState(86399); // 23:59:59 em segundos

  useEffect(() => {
    // Tenta buscar o usuário do localStorage (ajuste conforme seu fluxo real)
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [command]);

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

  const handleLogout = async () => {
    setError("");
    try {
      await logoutUser();
      localStorage.removeItem("user");
      setUser(null);
      window.location.reload();
    } catch (e) {
      setError("Erro ao deslogar");
    }
  };

  // Simulação de análise de comando
  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    router.push(`/analysis?cmd=${encodeURIComponent(command)}`);
  };

  // Ícones SVG inline
  const icons = {
    safe: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ),
    malicious: (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    ),
    low: (
      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    medium: (
      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
    critical: (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <span className="text-green-400 font-mono text-xl">Carregando...</span>
      </div>
    );
  }
  if (!user) {
    return null; // Evita flicker
  }

  return (
    <div className="relative min-h-[800px] bg-black overflow-hidden flex flex-col justify-between items-center">
      {/* Background code lines & terminal effect */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="w-full h-full opacity-10 font-mono text-xs text-green-400 whitespace-pre break-words p-4" style={{lineHeight: '1.2'}}>
          {`PS C:\Users\hacker> whoami\nPS C:\Users\hacker> Get-Process\nPS C:\Users\hacker> netstat -ano\nPS C:\Users\hacker> ...`}
        </div>
      </div>
      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />
      {/* Main content */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center w-full pt-8 pb-4 px-4">
        <h1 className="text-3xl md:text-5xl font-mono font-bold text-green-400 text-center mb-6 drop-shadow-glow-green pr-2 animate-typing-cursor-green" style={{whiteSpace: 'nowrap', overflow: 'hidden', borderRight: '4px solid #39FF14'}}>
          powershell.exposed
          <span className="inline-block animate-blink-green ml-5 align-middle text-green-400 text-2xl">█</span>
        </h1>
        <form onSubmit={handleAnalyze} className="w-full max-w-xl flex flex-row items-center gap-4">
          <div className="flex-1 flex items-center bg-black border-2 border-green-700 rounded-lg shadow-lg focus-within:ring-2 focus-within:ring-green-500 transition-all min-w-0">
            <span className="pl-4 text-green-400 font-mono text-lg">PS &gt;</span>
            <textarea
              ref={textareaRef}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="Type a PowerShell command..."
              className="flex-1 min-w-0 bg-transparent outline-none text-green-200 font-mono px-4 py-3 text-lg placeholder-green-700 rounded-lg min-h-[48px] max-h-40 overflow-hidden"
              autoFocus
              rows={1}
            />
          </div>
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-green-700 hover:bg-green-500 text-black font-mono font-semibold rounded-full transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 group relative overflow-hidden">
            <svg className="w-4 h-4 text-green-900 group-hover:text-black transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6-6-6" /><rect x="14" y="17" width="6" height="2" rx="1" fill="currentColor" /></svg>
            <span className="z-10">Analyze</span>
            <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-10 transition-all duration-200 pointer-events-none" />
          </button>
        </form>
        {/* Result area */}
        <div className="mt-8 w-full max-w-xl min-h-[90px] flex flex-col items-center justify-center bg-black bg-opacity-80 rounded-lg shadow-inner border border-green-900">
          {result ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                {icons[result.type === "safe" ? "safe" : "malicious"]}
                <span className={`font-mono text-lg ${result.type === "safe" ? "text-green-400" : "text-red-500"}`}>
                  {result.type === "safe" ? "Safe command" : "Malicious command"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {icons[result.severity === "leve" ? "low" : result.severity === "médio" ? "medium" : "critical"]}
                <span className={`font-mono text-sm ${result.severity === "leve" ? "text-green-400" : result.severity === "médio" ? "text-yellow-400" : "text-red-500"}`}>
                  Severity level: {result.severity === "leve" ? "low" : result.severity === "médio" ? "medium" : "critical"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-green-700 font-mono text-center">Type a command for analysis.</div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
        {/* CTA Subscription */}
        <div className="w-full max-w-xl mx-auto mt-8 flex flex-col items-center justify-center bg-black border border-green-900 rounded-lg p-4">
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
      </main>
     
      {/* Custom styles for green terminal, typing, blink */}
      <style jsx global>{`
        @keyframes blink-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink-green {
          animation: blink-green 1s steps(1) infinite;
        }
        @keyframes typing-cursor-green {
          from { border-right-color: #39FF14; }
          to { border-right-color: transparent; }
        }
        .animate-typing-cursor-green {
          animation: typing-cursor-green 0.8s steps(1) infinite;
        }
        .drop-shadow-glow-green {
          text-shadow: 0 0 8px #39FF14, 0 0 2px #39FF14;
        }
      `}</style>
    </div>
  );
}