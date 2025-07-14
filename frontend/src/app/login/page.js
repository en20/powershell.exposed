"use client"
import React, { useState } from 'react'
import { loginUser } from '../../../utils/auth'
import { useRouter } from 'next/navigation'

export default function loginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess(false)
        setLoading(true)
        try {
            const data = await loginUser(email, password)
            if (data && data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }
            setSuccess(true)
            router.push('/')
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Entrar</h2>
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                {success && <div className="text-green-600 text-sm text-center">Login realizado com sucesso!</div>}
                <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                <div className="text-center mt-2">
                    <a href="/register" className="text-blue-600 hover:underline">Não tem conta? Registre-se</a>
                </div>
            </form>
        </div>
    )
}