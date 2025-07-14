"use client"
import React from 'react'
import { useState } from 'react'
import { registerUser } from '../../../utils/auth'

export default function registerPage() {
    const [username, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(username === "" || password === "" || email === "") {
            return;
        }
        try {
            await registerUser(email, username, password);
            alert("It worked! User created!");
        } catch (e) {
            if (e.response && e.response.data) {
                alert("Erro ao criar usuário: " + JSON.stringify(e.response.data));
            } else {
                alert("User Not created!");
            }
        }
    }
   
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crie sua conta</h2>
                <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={username}
                        onChange={e => setUserName(e.target.value)}
                    />
                </div>
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
                <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">Registrar</button>
            </form>
        </div>
    )
}