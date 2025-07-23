"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center border-t font-mono text-sm" style={{backgroundColor: 'var(--primary-black)', borderColor: 'var(--primary-green)', color: 'var(--primary-white)'}}>
      <div>
        &copy; {new Date().getFullYear()} <span style={{color: 'var(--primary-green)'}}>powershell.exposed</span>
      </div>
    </footer>
  );
}
