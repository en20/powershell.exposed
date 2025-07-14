"use client"
import { useEffect, useState } from "react";
import { logoutUser } from "../../utils/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Tenta buscar o usuário do localStorage (ajuste conforme seu fluxo real)
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, []);

  const handleLogout = async () => {
    setError("");
    try {
      await logoutUser();
      localStorage.removeItem("user");
      window.location.reload();
    } catch (e) {
      setError("Erro ao deslogar");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center space-y-6">
        {loading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : user ? (
          <>
            <div className="text-2xl font-bold text-gray-800">Bem-vindo, {user.username || user.email}!</div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Sair
            </button>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          </>
        ) : (
          <div className="text-xl text-gray-700">Bem-vindo! Faça login ou registre-se.</div>
        )}
      </div>
    </div>
  );
}
