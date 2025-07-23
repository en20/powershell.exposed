"use client"
import React from 'react'
import { useState } from 'react'
import { registerUser } from '../../../utils/auth'
import FormInput from '../components/FormInput'
import ThemedButton from '../components/ThemedButton'
import { ErrorMessage, SuccessMessage } from '../components/Messages'

export default function registerPage() {
    const [username, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(username === "" || password === "" || email === "") {
            setError("Todos os campos são obrigatórios");
            return;
        }
        
        setLoading(true);
        setError("");
        setSuccess(false);
        
        try {
            await registerUser(email, username, password);
            setSuccess(true);
        } catch (e) {
            if (e.response && e.response.data) {
                setError("Erro ao criar usuário: " + JSON.stringify(e.response.data));
            } else {
                setError("Erro ao criar usuário. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }
   
    return (
        <div className="flex items-center justify-center min-h-screen" style={{backgroundColor: 'var(--background)'}}>
            <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-lg w-full max-w-md space-y-6 border" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                <h2 className="text-2xl font-bold text-center mb-6 font-mono" style={{color: 'var(--accent)'}}>Crie sua conta</h2>
                
                <FormInput
                    type="text"
                    id="username"
                    name="username"
                    label="Usuário"
                    value={username}
                    onChange={e => setUserName(e.target.value)}
                    required
                />
                
                <FormInput
                    type="email"
                    id="email"
                    name="email"
                    label="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                
                <FormInput
                    type="password"
                    id="password"
                    name="password"
                    label="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                
                <ErrorMessage message={error} className="text-center" />
                <SuccessMessage message={success ? "Usuário criado com sucesso!" : ""} className="text-center" />
                
                <ThemedButton 
                    type="submit" 
                    loading={loading}
                    className="w-full"
                >
                    Criar Conta
                </ThemedButton>
                
                <div className="text-center mt-2">
                    <a href="/login" className="font-mono hover:underline" style={{color: 'var(--accent)'}}>Já tem conta? Faça login</a>
                </div>
            </form>
        </div>
    )
}