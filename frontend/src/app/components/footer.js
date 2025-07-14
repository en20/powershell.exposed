"use client";
import React from "react";

const footerLinks = [
  {
    title: "Our product",
    links: [
      { label: "How It Works", href: "#" },
      { label: "Get Support", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "ToS", href: "#" },
      { label: "Privacy Notice", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Releases", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Join Community", href: "#" },
      { label: "Vote and Comment", href: "#" },
      { label: "Contributors", href: "#" },
      { label: "Top Users", href: "#" },
      { label: "Community Buzz", href: "#" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "API Scripts", href: "#" },
      { label: "YARA", href: "#" },
      { label: "Desktop Apps", href: "#" },
      { label: "Browser Extensions", href: "#" },
      { label: "Mobile App", href: "#" },
    ],
  },
  {
    title: "Premium Services",
    links: [
      { label: "Get a demo", href: "#" },
      { label: "Intelligence", href: "#" },
      { label: "Hunting", href: "#" },
      { label: "Graph", href: "#" },
      { label: "API v3 | v2", href: "#" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Searching", href: "#" },
      { label: "Reports", href: "#" },
      { label: "API v3 | v2", href: "#" },
      { label: "Use Cases", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black pt-6 pb-2 text-green-400 font-mono select-none border-t border-green-900">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {footerLinks.map(section => (
          <div key={section.title}>
            <h3 className="text-green-400 font-bold mb-3 text-xs uppercase tracking-widest">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-green-300 hover:underline transition-colors text-xs md:text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-1 text-xs text-green-700 border-t border-green-900 pt-2">
        <div>
          &copy; {new Date().getFullYear()} <span className="text-green-400">powershell.exposed</span>
        </div>
        <div>
          created by <span className="text-green-300 font-semibold">avasero engineering team</span> (<a href="https://avasero.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-200">avasero.com</a>)
        </div>
      </div>
    </footer>
  );
}
