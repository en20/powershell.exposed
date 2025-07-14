"use client";
import React from "react";
import Link from "next/link";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="w-full flex flex-row items-center justify-between px-6 py-3 bg-black bg-opacity-95 border-b border-green-700 shadow-lg fixed top-0 left-0 z-50 overflow-x-hidden">
      <div className="flex items-center min-w-0">
        <Link href="/" className="text-green-400 font-mono text-2xl tracking-widest select-none truncate hover:underline focus:outline-none">
          powershell.exposed
        </Link>
        <span className="ml-2 text-green-300 font-mono text-xs tracking-tight opacity-70 whitespace-nowrap">by avasero</span>
      </div>
      <div className="flex items-center space-x-4 min-w-0">
        {user && (
          <span className="text-green-200 font-mono text-sm opacity-80 truncate max-w-[160px] md:max-w-xs lg:max-w-sm">
            {user.username || user.email}
          </span>
        )}
        {user && (
          <button
            onClick={onLogout}
            className="py-1 px-4 bg-green-700 hover:bg-green-500 text-black font-mono font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-150 border border-green-800"
            style={{ marginLeft: user ? '0.5rem' : 0 }}
          >
            Logout
          </button>
        )}
        <button
          className="py-1 px-5 bg-green-600 hover:bg-green-400 text-black font-mono font-bold rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-150 border-2 border-green-700 ml-2"
        >
          Subscribe
        </button>
      </div>
    </nav>
  );
}
